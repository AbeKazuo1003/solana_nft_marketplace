import * as anchor from "@project-serum/anchor";
import * as fs from "fs";

export function loadWallet(path: string): anchor.web3.Keypair {
  if (!path || path == "") {
    throw new Error("Keypair is required!");
  }
  let pairFile = fs.readFileSync(path, "utf-8");
  let pairData = JSON.parse(pairFile);
  return anchor.web3.Keypair.fromSecretKey(new Uint8Array(pairData));
}
