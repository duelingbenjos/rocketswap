# Submit Contract basetoken.py args
```
{"s_name": "HRRRMMCOIN", "s_symbol":"HRM", "vk":"f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def","vk_amount":100000000}
```

# API / Frontend Integration Notes

## Contract Functions

#### dex_pairs.py

##### Exported Functions 

```
@export
def pair(tau_contract: str, token_contract: str):
    return pairs[tau_contract, token_contract]

```

```
@export
def pair(tau_contract: str, token_contract: str):
    return pairs[tau_contract, token_contract]
```

```
@export
# Number of pairs created
def length_pairs():
    return pairs['count']

```

```
@export
def pair_address(tau_contract: str, token_contract: str):
    assert not pairs[tau_contract, token_contract] is None, 'Invalid pair'
    return pairs[tau_contract, token_contract, 'pair_address']

```

```
@export
def total_supply(tau_contract:str, token_contract:str):
    assert not pairs[tau_contract, token_contract] is None, 'Invalid pair'
    return pairs[tau_contract, token_contract, 'lp_token_supply']
```

```
@export
def initialize(tau_contract:str, token_contract:str):
    assert tau_contract != token_contract
    assert ctx.caller == owner.get(), 'LamDexPairs: FORBIDDEN'

    # Pair Balances
    pairs[tau_contract, token_contract] = ['pair_address', 'tau_reserve', 'token_reserve', 'lp_token_supply', 'kLast', 'lp_token_balance']

    pair_address = hashlib.sha256(tau_contract + token_contract)
    pairs[tau_contract, token_contract, 'pair_address'] = pair_address
    pairs[tau_contract, token_contract, 'tau_reserve'] = 0
    pairs[tau_contract, token_contract, 'token_reserve'] = 0
    pairs[tau_contract, token_contract, 'lp_token_supply'] = 0
    pairs[tau_contract, token_contract, 'lp_token_balance'] = {}
    pairs[tau_contract, token_contract, 'kLast'] = 0
    pairs['count'] += 1

    # Token Balances
    tau, token = get_token_interface(tau_contract, token_contract)

    if pairs[tau_contract, 'balance'] is None :
        pairs[tau_contract, 'balance'] = tau.balance_of(ctx.this)

    if pairs[token_contract, 'balance'] is None :
        pairs[token_contract, 'balance'] = token.balance_of(ctx.this)

```

```
@export
def balance_of(tau_contract:str, token_contract:str, account:str):
    assert not pairs[tau_contract, token_contract] is None, 'Invalid pair'
    return pairs[tau_contract, token_contract, 'lp_token_balance', account]
```

```
@export
def transfer(tau_contract:str, token_contract:str, amount:int, to:str):
    assert not pairs[tau_contract, token_contract] is None, 'Invalid pair'
    assert amount > 0, 'Cannot send negative balances!'

    sender = ctx.caller
    assert not pairs[tau_contract, token_contract, 'lp_token_balance', sender] is None, 'Invalid sender'
    assert pairs[tau_contract, token_contract, 'lp_token_balance', sender] >= amount, 'Not enough coins to send!'

    pairs[tau_contract, token_contract, 'lp_token_balance', sender] -= amount

    to_amount = pairs[tau_contract, token_contract, 'lp_token_balance', to]
    pairs[tau_contract, token_contract, 'lp_token_balance', to] = amount + to_amount if not to_amount is None else amount
```

```
@export
def mint_liquidity(dex_contract:str, tau_contract:str, token_contract: str, to_address: str):
    # Make sure that what is imported is actually a valid token
    tau, token = get_token_interface(tau_contract, token_contract)
    assert tau_contract != token_contract

    dex = get_dex_interface(dex_contract)
    assert not dex is None, 'Dex needs to be valid'

    # 1 - Last pair reserves
    tau_reserve, token_reserve = get_pair_reserves(tau_contract=tau_contract,token_contract=token_contract) # "gas savings"

    # 2 - Last total balances
    last_total_tau_balance = pairs[tau_contract, 'balance']
    last_total_token_balance = pairs[token_contract, 'balance']

    # New total balances - token.balance()
    new_total_tau_balance = tau.balance_of(ctx.this)
    new_total_token_balance = token.balance_of(ctx.this)

    # Amount delta
    tau_amount = new_total_tau_balance - last_total_tau_balance
    token_amount = new_total_token_balance - last_total_token_balance

    assert tau_amount > 0 and token_amount > 0, 'Invalid token amount'

    # TODO - fee_on
    liquidity = None
    fee_on = mint_fee(dex, tau, token, tau_reserve, token_reserve)
    lp_token_supply = pairs[tau.token_name(), token.token_name(), 'lp_token_supply'] # "gas savings"
    if(lp_token_supply == 0 ) :
        # TODO - A4 - Migrator logic
        # Initial liquidity = SeedLiquidity - MinimumLiquidity
        liquidity = sqrt(tau_amount * token_amount) - expand_to_token_decimals(MINIMUM_LIQUIDITY)
        # permanently lock the first MINIMUM_LIQUIDITY tokens
        mint_lp_tokens(tau, token, zero_address(), expand_to_token_decimals(MINIMUM_LIQUIDITY))
    else :
        # Get new liquidity
        liquidity = min(
            ( tau_amount * lp_token_supply ) / tau_reserve,
            ( token_amount * lp_token_supply ) / token_reserve
        )

    # Assign LP Tokens to provider
    assert liquidity > 0, 'Insufficient liquidity minted'
    mint_lp_tokens(tau, token, to_address, liquidity)

    new_tau_reserve = tau_reserve + tau_amount
    new_token_reserve = token_reserve + token_amount
    # Update Pair internal state
    update(
        tau,
        token,
        new_tau_reserve,
        new_token_reserve
    )

    if(fee_on) :
        # Update kLast to calculate fees
        pairs[tau_contract, token_contract, 'kLast'] = new_tau_reserve * new_token_reserve

    #emit Mint(ctx.signer, tau_amount, token_amount)
    return to_address, tau_amount, token_amount
```

```
# This low-level function should be called from a contract which performs important safety checks
@export
def burn_liquidity(dex_contract: str, tau_contract: str, token_contract: str, to_address: str):
    # Make sure that what is imported is actually a valid token
    tau, token = get_token_interface(tau_contract, token_contract)
    assert tau_contract != token_contract

    dex = get_dex_interface(dex_contract)
    assert not dex is None, 'Dex needs to be valid'

    tau_reserve, token_reserve = get_pair_reserves(tau_contract=tau_contract,token_contract=token_contract) # "gas savings"

    # 2 - Get Pair's balance
    last_total_tau_balance = pairs[tau_contract, 'balance']
    last_total_token_balance = pairs[token_contract, 'balance']

    # new total balances (new)
    current_total_tau_balance = tau.balance_of(ctx.this)
    current_total_token_balance = token.balance_of(ctx.this)

    pair_tau_balance = tau_reserve + (current_total_tau_balance - last_total_tau_balance)
    pair_token_balance = token_reserve + (current_total_token_balance - last_total_token_balance)

    lp_token_liquidity = balance_of(tau.token_name(), token.token_name(), ctx.this)

    # We update how to handle fees, before updating liquidity
    fee_on = mint_fee(dex, tau, token, tau_reserve, token_reserve)
    lp_token_supply = pairs[tau.token_name(), token.token_name(), 'lp_token_supply']

    tau_amount = (lp_token_liquidity * pair_tau_balance) / lp_token_supply # using balances ensures pro-rata distribution
    token_amount = (lp_token_liquidity * pair_token_balance) / lp_token_supply # using balances ensures pro-rata distribution
    assert tau_amount > 0 and token_amount > 0, 'Insufficient liquidity burned'

    # destroy lp tokens + return tokens
    burn_lp_tokens(tau, token, ctx.this, lp_token_liquidity)
    tau.transfer(tau_amount, to_address) # safe_transfer
    token.transfer(token_amount, to_address) # safe_transfer

    # Get new Dex balance
    current_total_tau_balance = tau.balance_of(ctx.this)
    current_total_token_balance = token.balance_of(ctx.this)

    pair_tau_balance = tau_reserve + (current_total_tau_balance - last_total_tau_balance)
    pair_token_balance = token_reserve + (current_total_token_balance - last_total_token_balance)

    # Update Pair internal state
    update(tau, token, pair_tau_balance, pair_token_balance)
    if(fee_on):
        # Update kLast to calculate fees
        pairs[tau.token_name(), token.token_name(), 'kLast'] = pair_tau_balance * pair_token_balance

    #emit Burn(ctx.signer, tau_amount, token_amount, to_address)
    return tau_amount, token_amount
```

```
# This low-level function should be called from a contract which performs important safety checks
@export
def swap(tau_contract:str,  token_contract:str, tau_out:float, token_out:float, to_address:str):
    assert not (tau_out > 0 and token_out > 0), 'Only one Coin Out allowed'
    assert tau_out > 0 or token_out > 0, 'Insufficient Ouput Amount'

    # Make sure that what is imported is actually a valid token
    tau, token = get_token_interface(tau_contract, token_contract)
    assert tau_contract != token_contract

    tau_reserve, token_reserve = get_pair_reserves(
        tau_contract=tau_contract,
        token_contract=token_contract
    )
    assert tau_reserve > tau_out and token_reserve > token_out, 'UniswapV2: Insuficient Liquidity and Reserves'

    # optimistic transfer...
    if tau_out > 0 :
        tau.transfer(tau_out, to_address)
    if token_out > 0 :
        token.transfer(token_out, to_address)

    # Get new pair balances
    last_total_tau_balance = pairs[tau_contract, 'balance']
    last_total_token_balance = pairs[token_contract, 'balance']

    current_total_tau_balance = tau.balance_of(ctx.this)
    current_total_token_balance = token.balance_of(ctx.this)

    new_pair_tau_balance = tau_reserve + (current_total_tau_balance - last_total_tau_balance)
    new_pair_token_balance = token_reserve + (current_total_token_balance - last_total_token_balance)

    # TODO - B1 - Identify this call from UniV2
    # if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);

    # Calculate pair tau_in or token_in based on last/new balances
    tau_in = new_pair_tau_balance - (tau_reserve - tau_out) if new_pair_tau_balance > tau_reserve else 0
    token_in = new_pair_token_balance - (token_reserve - token_out) if new_pair_token_balance > token_reserve else 0
    assert tau_in > 0 or token_in > 0, 'UniswapV2: Insufficient Input Amount tau_in: {} token_in: {}'.format(tau_in, token_in)

    # # TODO - A1/A2 - Break down / understand Balance Adjusted K exception
    # tau_balance_adjusted = (tau_balance*1000)-(tau_in*3)
    # token_balance_adjusted = (token_balance*1000)-(token_in*3)
    # assert tau_balance_adjusted * token_balance_adjusted >= (tau_reserve * token_reserve) * (1000^2), 'UniswapV2: Exception: K'

    update(
        tau,
        token,
        new_pair_tau_balance,
        new_pair_token_balance
    )
```