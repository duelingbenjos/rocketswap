# Fields to add as meta_standards

``` typescript

// meta fields :
// * : required for listing as a verified coin on rocketswap.
 twitter* : string
 reddit : string
 telegram* : string
 git : string[]
 announcements : string // medium link
 chat: string[] // any misc chat links can go in here, discord, IRC, etc etc.
 website* : string
 categories* : string[] // defi, Lending, Farming, Vaults etc // perhaps this could be a list of dropdowns ? need to talk to saren about this, so we conform to their standard.
 name* : string // long form name eg : "Rocketswap"
 description* : string // This is the overview for your token. What it does, the vision, etc, etc 1 - 5 paragraphs should do it. \n 
 // eg. "We aim to build decentralised tools for the cryptocurrency community that are more engaging than the current apps, leveraging XYZ technologies."
 // use \n for line breaks
```

``` typescript

// market metrics :
price : number // Eth or USD ?
marketCap : number // Eth or USD ?
volume : number // ?
totalSupply: number
change :{
    '1h' : number
    '24h' : number
    '7d' : number
    '14d' : number
    '30d' : number
    '60d' : number
    '200d' : number
    '1y' : number
}  // (pct I'm assuming.)
timestamp: string // eg - "2021-04-20T03:15:01.395Z"
```

``` typescript
// computed :

 platform : string // Lamden
 contract_address : string // con_rswp_lst001
 symbol : string // RSWP

 logos : {
    thumb : string,
    small : string,
    large : string
}


// other fields (to be filled by api)
 genesisDate: string // "2021-03-30"
 blockchain: string[] // link to TauHQ contract info

  
```



original schema
```json
{
    "_id": "0xbd4a858139b155219e2c8d10135003fdef720b6b",
    "community": {
      "facebook": {
        "likes": null
      },
      "twitter": {
        "url": "saren_io"
      },
      "reddit": {
        "url": "",
        "posts48h": null,
        "comments48h": null,
        "subscribers": null,
        "activeAccounts": null
      },
      "telegram": {
        "url": "sarencommunity"
      },
      "git": {
        "urls": [
          "https://github.com/saren-io"
        ]
      },
      "publicInterest": {
        "alexaRank": null,
        "bingMatches": null
      },
      "announcements": [
        "https://blog.saren.io/"
      ],
      "forums": [],
      "chat": [
        "https://discord.gg/e9qtVrtukg",
        "https://www.linkedin.com/company/saren-io"
      ]
    },
    "links": {
      "website": [
        "https://saren.io/"
      ],
      "blockchain": [
        "https://etherscan.io/token/0xbd4a858139b155219e2c8d10135003fdef720b6b",
        "https://ethplorer.io/address/0xbd4a858139b155219e2c8d10135003fdef720b6b"
      ]
    },
    "market": {
      "price": 0.062413407143500244,
      "marketCap": {
        "saren": 1872402.2143050074
      },
      "volume": 232842.8670028827,
      "circulatingSupply": {
        "saren": 30000000
      },
      "totalSupply": 1000000000,
      "change": {
        "1h": -10.896983363760828,
        "24h": -10.896983363760828,
        "7d": 30.967203022429896,
        "14d": 15.998108619968704,
        "30d": 3755.4431729337352,
        "60d": 3755.4431729337352,
        "200d": 3755.4431729337352,
        "1y": 3755.4431729337352
      },
      "timestamp": "2021-04-20T03:15:01.395Z"
    },
    "categories": [
      "Infrastructure",
      "Social Media",
      "Decentralized Finance (DeFi)"
    ],
    "name": "Saren",
    "platform": "ethereum",
    "contractAddress": "0xbd4a858139b155219e2c8d10135003fdef720b6b",
    "symbol": "SAR",
    "description": "We aim to build decentralised tools for the cryptocurrency community that are more engaging than the current apps.",
    "logos": {
      "thumb": "https://saren.io/assets/icon.png",
      "small": "https://saren.io/assets/icon.png",
      "large": "https://saren.io/assets/icon.png"
    },
    "genesisDate": "2021-03-30"
  }

```