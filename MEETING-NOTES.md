# Topics

- High level overview of code.
 
## Step through user flow for each action

### Trading

* Approving a token
Are we approving a token pair ?
- I believe this would be developed @ Frontend/wallet level

* Performing a swap
- dex_pairs.py @ dex_pairs.swap(tau_contract, token_contract, tau_out, token_out, to_address)
- Stu wanted as an MVP that we have tau vs. token swaps
- I spoke against this, but this was the requirement
- I think we should get it up and running w/ what's there, and start working on 1:1 UniV2 implementation.

* Adding a token to the interface, by pasting the contract ID
- I believe this would be developed @ Frontend
- Maybe a json file in git that people can send a PR to?

* Getting a quote for a trade.  
What invalidates this quote ?
- Maybe when you successfully trade, the token is "dirtied" in the db and needs to be refreshed?

Any clue why this function was commented out ?
- Because it's not an official function from UniV2.
- I had added it originally as part of the PoC (v1 of what I delivered)

* Routing through tokens if pair doesn't exist
- Routing functionality was not added.
- It's just Tau vs. Token

eg. I want to swap `x for z`, but there is no liquidity there, so instead it swaps `x for z for y`



### Liquidity Provider

* Add liquidity

## Q's

`This low-level function should be called from a contract which performs important safety checks`

- what's the thinking here ?

- These comment comes from UniV2 and it's on a few of the UniswapV2Pair.sol functions.
- I believe it's there so you will do all the correct things to provide the right liquidity, before you call the function.
- I.e. Having an interface/contract do the right checks, before performing transactions/liquidity operations that could cause users to lose money or get it stuck.
