# CGC NFT Marketplace Program

## About

The NFT marketplace program which allow a user to do the following:

- List an NFT for sale
- Sell now at current bid price (accept offer)
- Cancel listing
- Buy (bid) on a NFT
    - User must also be able to change a previous buy (bid) price, provided the transaction has not gone through
- Buy a NFT now for the listed price
- Buy more than one multiple NFT for the listed price

## Usage
### Configuration
### Install packages

```
$ yarn install
```
### Build Program
```
$ yarn compile
```
### Test Program (Unit tests)
```
$ yarn test
```

### Deploy Program
#### Step 1: Switch Network to mainnet
```
solana config set --url mainnet-beta
```

#### Step 2: Set Wallet Path

Provide the path to its keypair on `wallet` option of the `Anchor.toml` configuration file for mainnet.

#### Step 3: Build Program
```
$ yarn compile
```
#### Step 4: Deploy to mainnet
Make sure that you have enough SOL in your wallet before you deploy the program. 
```
$ yarn deploy
```
#### Step 5: Setting config file for marketplace

- Copy `config/live.json` file named `YOUR COLLECTION NAME.json`

    For example, if the marketplace support `SOLCHICKS`, named `solchicks.json`
    
    `Collection Name` must same `cgc_core_db`'s `collection` table's slug.
- Replace `nft_type` option named `Collection Name`
- Replace `fee_rate` option. That is service fee by percent.
- DO NOT EDIT OTHER OPTIONS.

#### Step 6: Open Market
Run Script to Open Market

`yarn open_market`

You have to provide three options.

``-k, --keypair `` wallet path(should be as same as deploy wallet)

``-c, --config `` provide config file path

``-e, --env `` provide environment type (For mainnet, set `mainnet-beta`)

For example:

`yarn open_market -k /home/alex/blockchain/Keys/alex.json --config /home/alex/blockchain/cgc-solana-contracts/nft_marketplace/config/dev.json -e mainnet-beta`


------------------------------------------
### For Developer Comment
#### - devnet
`yarn open_market -k /home/alex/blockchain/Keys/alex.json --config /home/alex/blockchain/cgc-solana-contracts/nft_marketplace/config/dev.json`