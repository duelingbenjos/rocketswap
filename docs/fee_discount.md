### What Rocketswap fees apply?

Rocketswap fees are set at 0.5% of the token cost for the trade.  This can be offset by a number of mechanisms to reduce fees through using and/or staking the Rocketswap token, RSWP. These actions are cumulative and can result in significant savings for market participants. Below are some typical scenarios that cover the fees and benefits of using RSWP:

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

Paying fees in RSWP automatically attracts a 25% discount.  This results in fees reducing to 0.375% of the tokens traded charged as the transaction fee.  Again, 20% of the RSWP is sent to the Lamden burn address. The remaining 80% is added to the liquidity pool.  

#### Scenario 3 - Fees paid in RSWP and staking RSWP

|Action|Description|Fee Paid in|
|:---:|:---:|:---:|
|Buy|TAU ➡ TOKEN| RSWP|
|Sell|TOKEN ➡ TAU| RSWP|

As above, paying fees in RSWP automatically attracts a 25% discount.  However with additional staking, bonus **Trade Fee Discounts** apply based on the formula below.  There is a theoretical upper limit to discounts set at 99% within the contract however in practice this is not achievable.

#### log<sub>e</sub>({RSWP Stake}) * 0.07 - 0.505

NOTE: *Based on this formula, the minimum staking amount is 1361 RSWP.*
<img src="./static/Fee_RSWPfeeformula.png" height=341 width=857></img>

Using the scenarios above, the resultant fees are visualised below compared to the baseline:

|Scenario|Description|Visualised Fee|
|:---:|:---:|:---|
|1|Baseline|<img src="./static/Fee_Scenario1.png" height=30 width=295></img> |
|2|Fees in RSWP|<img src="./static/Fee_Scenario2.png" height=30 width=220></img> |
|3|3700 RSWP Staked|<img src="./static/Fee_Scenario3.png" height=30 width=200></img> |
|3|34500 RSWP Staked|<img src="./static/Fee_Scenario4.png" height=30 width=170></img> |
|3|100k RSWP Staked|<img src="./static/Fee_Scenario5.png" height=30 width=155></img> |

A Lamden transaction fee to perform the necessary contract actions is also charged, generally around 65 Stamps (1 TAU) however is based on network traffic at the time the transaction is processed.
