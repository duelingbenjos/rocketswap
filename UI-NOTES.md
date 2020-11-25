# Uniswap functionality.

## Views


##### /swap
* current eth balance in header / footer
* selected token 1 & 2 balance
* display wallet key

No Wallet ? 

Display 'connect wallet' button.

Wallet ?

Display 'Swap'

Switch Currency Position Button

* Api Calls
On Load : gets list of all tokens

```
// Uniswap v2 schema

{
    keywords: ["defi"],
    logoURI: "https://www.coingecko.com/assets/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png",
    name: "CoinGecko",
    timestamp: "2020-11-22T18:01:23.133+00:00",
    tokens: [
        {    
        "chainId":1,
        "address":"0xc962ad021a69d457564e985738c719ae3f79b707",
        "name":"IFX24",
        "symbol":"IFX24",
        "decimals":18,
        "logoURI":"https://assets.coingecko.com/coins/images/10444/thumb/lpFSaoD.png?1579475634",
    ],
    version: {
        major: 61, minor: 17, patch: 0
    }
}
```
 
* How to approach token transfers ?
* How to display tokens being held in the wallet ?
* Does the wallet need a modification to support custom tokens ?

