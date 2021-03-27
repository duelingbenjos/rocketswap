<img src="RS_Logo.png" height=400 width=400></img>


## About Rocketswap

### What is Rocketswap ?

[Rocketswap](https://rocketswap.exchange) is a community developed AMM (Automated Market Maker) which resides on the [Lamden Blockchain](https://www.lamden.io).

The Rocketswap application can be found here @ https://rocketswap.exchange

### What is an Automated Market Maker ?

An Automated Market Maker is a system for exchanging assets which was popularized first by Uniswap and differs from traditional exchange systems in a few fundamental ways.

AMM's have two types of users :

#### Liquidity Providers
Liquidity Providers (LP's) earn fees by depositing liquidity (both assets of a trading pair in equal value) to a pair's liquidity pool.

#### Market Participants
Market Participants buy and sell assets in the market, their experience is identical to that of a traditional exchange user.

### The Team

We are a small team of engineers, with 40+ years of experience, committed to pushing the envelope of what is possible in the blockchain space, delivering value to the ecosystem as a whole and to our users.
We built Rocketswap to strengthen and foster a growing Lamden ecosystem. 

Rocketswap will achieve this goal by creating positive feedback loops across projects, allowing all Lamden assets to find fair market value.

#### How can I contact the Team ?

Contact us on [Telegram](https://t.me/rocketswap)

### What is Lamden ?

Lamden is a Web 3.0 application platform, more info @ www.lamden.io

### RSWP Token Information

* **Supply:** 1,200,000,000
* **Price:** To be set by market
* **Distribution:** TAU Staking & market LP Staking
* **Emission Rate:** % of total on a yearly basis. 30, 20, 15, 10, 7, 5, 4, 3, 2, 2, 1, 1.
* **Dev Reward:** 10% of emissions
* **Deflationary Mechanisms:** Burn on payment of RSWP transaction fee.

### How can I get RSWP?
RSWP will be distributed by staking Mainnet TAU on Launch Date (23th March 2021). This staking pool will be live indefinitely.

Shortly afterwards, the RSWP/TAU LP farming pool will be opened, providing a higher RSWP reward to compensate for the unfortunate realities of impermanent loss.

### How can I get Mainnet TAU?
Mainnet TAU is available at Txbit

## Using the Application

### What do I need to use Rocketswap ?

To use [Rocketswap](www.rswp.io) you will need :
* The Lamden Wallet browser extension, available [here](https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim)
* Some Mainnet TAU tokens (see the above section for more info)

### How do I use Rocketswap?

We have created a number of walk-throughs for first time users of Rocketswap that explain step-by-step how to perform all the basic site transactions:
1. [Getting Started](https://clay99.medium.com/a-step-by-step-for-first-time-users-on-how-to-get-setup-on-rocketswap-rswp-io-def31dfac41b)
2. [Adding TAU to Rocketswap](https://clay99.medium.com/rocketswap-guides-adding-funds-rswp-io-417ebd82da4)
3. [Staking](https://clay99.medium.com/rocketswap-guides-staking-rswp-io-910718b65109)
4. [Liquidity Pools](https://clay99.medium.com/rocketswap-guides-liquidity-pools-fd0feae6a15a)
5. [Performing Swaps](https://clay99.medium.com/rocketswap-guides-swaps-rocketswap-exchange-42004d354bac)

### What Rocketswap fees apply?

Rocketswap fees are set at 0.5% of the token cost for the trade.  This can be offset by a number of mechanisms to reduce fees through using and/or staking the Rocketswap token, RSWP. These actions are 

cumulative and can result in significant savings for market participants.

Below are some scenarios to explain the benefits:
#### Scenario 1 - The baseline, 0.5% transaction cost

|Action|Description|Fee Paid in|
|:---:|:---:|:---:|
|Buy|TAU ➡ TOKEN| TOKEN|
|Sell|TOKEN ➡ TAU| TAU|

0.5% of the tokens traded are charged as the transaction fee. This fee, has 20% internally converted to RSWP and sent to the Lamden burn address.  The remaining 80% is added to the liquidity pool.  

#### Scenario 2 - Fees paid in RSWP

|Action|Description|Fee Paid in|
|:---:|:---:|:---:|
|Buy|TAU ➡ TOKEN| RSWP|
|Sell|TOKEN ➡ TAU| RSWP|

Paying fees in RSWP automatically attracts a 25% discount.  This results in fees reducing to 0.375% of the tokens traded charged as the transaction fee.  Again, 20% of the RSWP is sent to the Lamden burn address. 

 The remaining 80% is added to the liquidity pool.  

#### Scenario 3 - Fees paid in RSWP and staking RSWP

|Action|Description|Fee Paid in|
|:---:|:---:|:---:|
|Buy|TAU ➡ TOKEN| RSWP|
|Sell|TOKEN ➡ TAU| RSWP|

As above, paying fees in RSWP automatically attracts a 25% discount.  However with additional staking, bonus **Trade Fee Discounts** apply based on the formula below.  There is a theoretical upper limit to 

discounts set at 99% within the contract however in practice this is not achievable.

#### log<sub>e</sub>({RSWP Stake}) * 0.07 - 0.505

NOTE: *Based on this formula, the minimum staking amount is 1361 RSWP.*
<img src="RSWPfeeformula.png" height=341 width=857></img>

Using the scenarios above, the resultant fees are visualised below compared to the baseline:

|Scenario|Description|Visualised Fee|
|:---:|:---:|:---|
|1|Baseline|<img src="Scenario1.png" height=30 width=295></img> |
|2|Fees in RSWP|<img src="Scenario2.png" height=30 width=220></img> |
|3|3700 RSWP Staked|<img src="Scenario3.png" height=30 width=200></img> |
|3|34500 RSWP Staked|<img src="Scenario4.png" height=30 width=170></img> |
|3|100k RSWP Staked|<img src="Scenario5.png" height=30 width=155></img> |

A Lamden transaction fee to perform the necessary contract actions is also charged, generally around 65 Stamps (1 TAU) however is based on network traffic.


### How do I create a token?

1. Use the following code to create an LST-001 Lamden Standard Token.

```python
# LST001
balances = Hash(default_value=0)

# LST002
metadata = Hash()

@construct
def seed():
    # LST001 - MINT SUPPLY to wallet that submits the contract
    balances[ctx.caller] = 1_000_000

    # LST002
    metadata['token_name'] = "MY TOKEN NAME"
    metadata['token_symbol'] = "TKN"
    metadata['operator'] = ctx.caller

# LST002
@export
def change_metadata(key: str, value: Any):
    assert ctx.caller == metadata['operator'], 'Only operator can set metadata!'
    metadata[key] = value

# LST001
@export
def transfer(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[ctx.caller] >= amount, 'Not enough coins to send!'

    balances[ctx.caller] -= amount
    balances[to] += amount

# LST001
@export
def approve(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'
    balances[ctx.caller, to] += amount

# LST001
@export
def transfer_from(amount: float, to: str, main_account: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[main_account, ctx.caller] >= amount, 'Not enough coins approved to send! You have {} and are trying to spend {}'\
        .format(balances[main_account, ctx.caller], amount)
    assert balances[main_account] >= amount, 'Not enough coins to send!'

    balances[main_account, ctx.caller] -= amount
    balances[main_account] -= amount
    balances[to] += amount

```

2. In the `seed` method make the following changes:
    - change `metadata['token_name']` to the name of your token (keep it short)
    - change `metadata['token_symbol']` to the SYMBOL of your token

3. Upload the smart contract to the Lamden Mainnet using the [Instructions Found here](https://docs.lamden.io/docs/wallet/ide_submit_smartcontract). 
4. Next you can set the logo for your token in the following ways
    - `url logo`: [Call the `change_metadata` method](https://docs.lamden.io/docs/wallet/ide_run_smartcontracts) on your new token contract and set the key `token_logo_url` to the url value (include http(s)://)
    - `picture logos`: You use `png` or `svg` files to set your token logo (max file size 32kb)
        - `svg logo`
            1. [Visit this site](https://base64.guru/converter/encode/image/svg) upload your file and convert it to a base64 string
            2. Copy the base64 string
            3. [Call the `change_metadata` method](https://docs.lamden.io/docs/wallet/ide_run_smartcontracts) on your new token contract and set the key `token_logo_base64_svg` to the base64 string
        - `png logo`
            1. [Visit this site](https://base64.guru/converter/encode/image/png) upload your file and convert it to a base64 string
            2. Copy the base64 string
            3. [Call the `change_metadata` method](https://docs.lamden.io/docs/wallet/ide_run_smartcontracts) on your new token contract and set the key `token_logo_base64_png` to the base64 string
5. The last thing to do is to head over to [Rocketswap and Create Liquidity](https://rocketswap.exchange/#/pool-create/).

### How do I see my tokens in the Lamden Wallet?
All tokens must be manually added to the Lamden Wallet.  To do so follow these simple steps:
1. [Download](https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim) the Lamden Wallet into Chrome if you don't have it already. And follow the step-by step-instructions to create a wallet.
2. From the main `accounts` page click the `ACCOUNTS & TOKENS` button
3. From the `What to add` dropdown click `Token`
4. Enter the Tokens Contract Name in the `Contract Name` input box.  If you don't know the contract name you can find it by visiting the token's Swap page on [Rocketswap](https://rocketswap.exchange).  You'll find the contract name in the address bar (contract names always begin with "con_") `https://rocketswap.exchange/#/con_rswp_lst001`
