# Rocketswap API

## REST API Docs (Swagger Dashboard)

Check out the interactive REST API dashboard :

[Rocketswap Staging](https://staging.rocketswap.exchange:2053/api_docs/)
[Rocketswap Production](https://rocketswap.exchange:2053/api_docs/)

## Websocket Gateway Docs

***Coming soon ...***

For more extensive info & source code please see [Rocketswap API Github](https://github.com/cloakdkiller/rocketswap)

# Smart Contracts

## Rocketswap AMM Contract
Below is a list of functions present in the Rocketswap v1 smart contract.
For more extensive information & source code, see [Rocketswap AMM Github](https://github.com/throwaway-lamden/amm/)

## Functions
### seed
**Cannot be called**

Sets the constants to their default value. As of now, you cannot pass arguments, and you have to manually modify the code.

The default values are as follows:
```python
state["FEE_PERCENTAGE"] = 0.3 / 100
state["TOKEN_CONTRACT"] = "con_amm"
state["TOKEN_DISCOUNT"] = 0.75
state["BURN_PERCENTAGE"] = 0.8
state["BURN_ADDRESS"] = "0x0" #Will be changed
state["LOG_ACCURACY"] = 1000000000.0
state["MULTIPLIER"] = 0.05
state["OWNER"] = ctx.caller 
```

### create_market
Takes `contract: str, currency_amount: float=0, token_amount: float=0` 

Creates a liquidity market for a specified token. There must not be an existing market for the specified token. This mints 100 tokens.

Returns `True` on a success.

### liquidity_balance_of
Takes `contract: str, account: str`

Returns liquidity balance of the account calling this function.

### add_liquidity
Takes `contract: str, currency_amount: float=0`

Adds an amount of liquidity with `TAU` value equal to `currency_amount`, and a token amount equal to `currency_amount / prices[contract]`. Mints an amount of LP tokens equivalent to `total_lp_points / currency_reserve * currency_amount` 

Returns the amount of LP tokens minted.

### remove_liquidity
Takes `contract: str, amount: float=0`

Removes an amount of liquidity equal to `reserves * amount / lp_points[contract]`.

Returns tuple of `(currency_amount, token_amount)`.

### transfer_liquidity
Takes `contract: str, to: str, amount: float`

Transfers liquidity tokens from caller. Analogous to `transfer` in LST-0001.

### approve_liquidity
Takes `contract: str, to: str, amount: float`

Approves liquidity tokens for transfer from caller. Analogous to `approve` in LST-0001.

### transfer_liquidity_from
Takes `contract: str, to: str, main_account: str, amount: float`

Transfers liquidity tokens from `main_account`. Requires prior approval equal or greater than `amount`. Analogous to `transfer_from` in LST-0001.

### buy
Takes `contract: str, currency_amount: float, minimum_received: float=0, token_fees: bool=False`

Transfers `currency_amount` from caller to liquidity pool, and transfers `tokens_purchased` from liquidity pool to caller. Throws `AssertionError` if `tokens_purchased` is less than `minimum_received`.
```python
#Logic of buy function
currency_reserve, token_reserve = reserves[contract]
k = currency_reserve * token_reserve

new_currency_reserve = currency_reserve + currency_amount
new_token_reserve = k / new_currency_reserve

tokens_purchased = token_reserve - new_token_reserve
```
If token fees are not set to true, `tokens_purchased * fee` (0.3% * discount from staked tokens) is removed from `tokens_purchased`. 80% of this gets sent to the liquidity pool, and 20% buys `RSWP` and transfers the `RSWP` to `state["BURN_ADDRESS"]`.

If token fees are set to true, `tokens_purchased * fee * state["TOKEN_DISCOUNT"]` (0.225% * discount from staked tokens) in `RSWP` is transferred from the caller. 80% of the transferred `RSWP` is sold for TAU which is then used to buy the token being purchased. 20% is transferred to `state["BURN_ADDRESS"]`.

Returns `tokens_purchased`

### sell
Takes `contract: str, token_amount: float, minimum_received: float=0, token_fees: bool=False`

Transfers `token_amount` from caller to liquidity pool, and transfers `currency_purchased` from liquidity pool to caller. Throws `AssertionError` if `currency_purchased` is less than `minimum_received`.
```python
#Logic of sell function
currency_reserve, token_reserve = reserves[contract]
k = currency_reserve * token_reserve

new_token_reserve = token_reserve + token_amount

new_currency_reserve = k / new_token_reserve

currency_purchased = currency_reserve - new_currency_reserve
```
If token fees are not set to true, `currency_purchased * fee` (0.3% * discount from staked tokens) is removed from `currency_purchased`. 80% of this gets sent to the liquidity pool, and 20% buys `RSWP` and transfers the `RSWP` to `state["BURN_ADDRESS"]`.

If token fees are set to true, `currency_purchased * fee * state["TOKEN_DISCOUNT"]` (0.225% * discount from staked tokens) in `RSWP` is transferred from the caller. 80% of the transferred `RSWP` is sold for TAU and is added to the liquidity pool. 20% is transferred to `state["BURN_ADDRESS"]`.

Returns `currency_purchased`

### stake
Takes `amount: float, token_contract: str=None`

Transfers `RSWP` from caller to the AMM contract if `amount > staked_amount[ctx.caller, token_contract]` and transfer `RSWP` from the contract to the caller if `amount < staked_amount[ctx.caller, token_contract]`. Does nothing if `amount == staked_amount[ctx.caller, token_contract]`.

Sets a discount percentage equal to log<sub>e</sub>(`amount`) * 0.05. Any arbitrary token can be staked, but only `RSWP` will provide a discount.

Returns `discount` (discount percentage).

### change_state
Takes `key: str, new_value: str, convert_to_decimal: bool=False`

Checks if you are `state["OWNER"]`. If you are, it executes `state[key] = new_value` if `convert_to_decimal` is `False`, and `state[key] = decimal(new_value)` if `convert_to_decimal` is `True`.

Returns `new_value` on a success.