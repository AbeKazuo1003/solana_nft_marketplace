import * as anchor from "@project-serum/anchor";
import { program } from "commander";
import { loadWallet } from "./utils";
import * as fs from "fs";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL, NftMarketplace } from "../target/types/nft_marketplace";

program.version("0.0.1");

program
  .command("open_market")
  .requiredOption("-k, --keypair <path>", `Solana Wallet Location`)
  .requiredOption("-c, --config <path>", "Market Config Location")
  .option(
    "-e, --env <string>",
    `Solana cluster env name. One of: mainnet-beta, testnet, devnet`,
    "devnet"
  )

  .action(async (_directory: any, cmd: any) => {
    const { keypair, config, env } = cmd.opts();
    const CONFIG_PDA_SEED = "config";
    const TOKEN_CONFIG_PDA_SEED = "token_config";
    const TOKEN_VAULT_PDA_SEED = "token_vault";
    console.log("Step 1: Load Program Owner");
    const serviceKeyPair = loadWallet(keypair);
    console.log("Step 2: Load Config");
    let configFile = fs.readFileSync(config, "utf-8");
    const setting = JSON.parse(configFile);
    console.log("Step 3: Prepare");
    const nft_type = setting["nft_type"];
    const fee_rate = new anchor.BN(setting["fee_rate"]);
    const provideOptions = AnchorProvider.defaultOptions();
    const connection = new Connection(
      clusterApiUrl(env),
      provideOptions.commitment
    );
    const walletWrapper = new anchor.Wallet(serviceKeyPair);
    const provider = new AnchorProvider(connection, walletWrapper, {
      preflightCommitment: "confirmed",
    });
    const programId = new anchor.web3.PublicKey(setting["program"]);
    const program = new Program<NftMarketplace>(IDL, programId, provider);
    console.log("Step 4: Set UP");
    let [configPDA, configPDABump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(CONFIG_PDA_SEED), Buffer.from(nft_type)],
        program.programId
      );
    await program.methods
      .setup(nft_type, configPDABump, fee_rate)
      .accounts({
        owner: serviceKeyPair.publicKey,
        config: configPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([serviceKeyPair])
      .rpc();
    console.log("Step 5: Token Setup");
    for (let i = 0; i < setting["tokens"].length; i++) {
      let tokenSetting = setting["tokens"][i];
      let token_type = tokenSetting["token_type"];
      let tokenMint = new anchor.web3.PublicKey(tokenSetting["token_mint"]);
      let need_init = tokenSetting["need_init"];
      let index: number = Number(tokenSetting["index"]);
      let decimals: number = Number(tokenSetting["decimals"]);
      let [token_config_pda, token_config_pda_bump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(TOKEN_CONFIG_PDA_SEED),
            Buffer.from(nft_type),
            Buffer.from(token_type),
          ],
          program.programId
        );
      let [token_vault, token_vault_bump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(TOKEN_VAULT_PDA_SEED),
            Buffer.from(nft_type),
            Buffer.from(token_type),
          ],
          program.programId
        );
      if (need_init) {
        await program.methods
          .initTokenAccount(nft_type, token_type)
          .accounts({
            owner: serviceKeyPair.publicKey,
            config: configPDA,
            tokenMint: tokenMint,
            tokenVault: token_vault,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([serviceKeyPair])
          .rpc();
      }
      await program.methods
        .tokenSetup(
          nft_type,
          token_type,
          token_config_pda_bump,
          index,
          decimals
        )
        .accounts({
          owner: serviceKeyPair.publicKey,
          config: configPDA,
          tokenMint: tokenMint,
          tokenVault: token_vault,
          tokenConfig: token_config_pda,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([serviceKeyPair])
        .rpc();
    }
  });
program.parse(process.argv);
