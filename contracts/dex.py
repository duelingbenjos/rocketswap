import currency
I = importlib

# Enforceable interface
token_interface = [
    I.Func('transfer', args=('amount', 'to')),
    I.Func('approve', args=('amount', 'to')),
    I.Func('transfer_from', args=('amount', 'to', 'main_account'))
]

pairs = Hash()
prices = Hash(default_value=0)

lp_points = Hash(default_value=0)
reserves = Hash(default_value=[0, 0])

staked_amount = Hash(default_value=0)
discount = Hash(default_value=1)

state = Hash()

@construct
def seed(): #These are supposed to be constants, but they are changable
    state["FEE_PERCENTAGE"] = 0.3 / 100
    state["TOKEN_CONTRACT"] = "con_amm"
    state["TOKEN_DISCOUNT"] = 0.75
    state["BURN_PERCENTAGE"] = 0.8
    state["BURN_ADDRESS"] = "0x0" #Change this
    state["LOG_ACCURACY"] = 1000000000.0 #The stamp difference for a higher number should be unnoticable
    state["MULTIPLIER"] = 0.05
    state["DISCOUNT_FLOOR"] = 0.0
    
    state["OWNER"] = ctx.caller 

@export
def create_market(contract: str, currency_amount: float=0, token_amount: float=0):
    assert pairs[contract] is None, 'Market already exists!'
    assert currency_amount > 0 and token_amount > 0, 'Must provide currency amount and token amount!'

    token = I.import_module(contract)

    assert I.enforce_interface(token, token_interface), 'Invalid token interface!'

    currency.transfer_from(amount=currency_amount, to=ctx.this, main_account=ctx.caller)
    token.transfer_from(amount=token_amount, to=ctx.this, main_account=ctx.caller)

    prices[contract] = currency_amount / token_amount

    pairs[contract] = True

    # Mint 100 liquidity points
    lp_points[contract, ctx.caller] = 100
    lp_points[contract] = 100

    reserves[contract] = [currency_amount, token_amount]
    
    return True

@export
def liquidity_balance_of(contract: str, account: str):
    return lp_points[contract, account]

@export
def add_liquidity(contract: str, currency_amount: float=0):
    assert pairs[contract] is True, 'Market does not exist!'

    assert currency_amount > 0

    token = I.import_module(contract)

    assert I.enforce_interface(token, token_interface), 'Invalid token interface!'

    # Determine the number of tokens required
    token_amount = currency_amount / prices[contract]

    # Transfer both tokens
    currency.transfer_from(amount=currency_amount, to=ctx.this, main_account=ctx.caller)
    token.transfer_from(amount=token_amount, to=ctx.this, main_account=ctx.caller)

    # Calculate the LP points to mint
    total_lp_points = lp_points[contract]
    currency_reserve, token_reserve = reserves[contract]

    points_per_currency = total_lp_points / currency_reserve
    lp_to_mint = points_per_currency * currency_amount

    # Update the LP points
    lp_points[contract, ctx.caller] += lp_to_mint
    lp_points[contract] += lp_to_mint

    # Update the reserves
    reserves[contract] = [currency_reserve + currency_amount, token_reserve + token_amount]
    
    #Return amount of LP minted
    return lp_to_mint

@export
def remove_liquidity(contract: str, amount: float=0):
    assert pairs[contract] is True, 'Market does not exist!'

    assert amount > 0, 'Must be a positive LP point amount!'
    assert lp_points[contract, ctx.caller] >= amount, 'Not enough LP points to remove!'

    token = I.import_module(contract)

    assert I.enforce_interface(token, token_interface), 'Invalid token interface!'

    lp_percentage = amount / lp_points[contract]

    currency_reserve, token_reserve = reserves[contract]

    currency_amount = currency_reserve * (lp_percentage)
    token_amount = token_reserve * (lp_percentage)

    currency.transfer(to=ctx.caller, amount=currency_amount)
    token.transfer(to=ctx.caller, amount=token_amount)

    lp_points[contract, ctx.caller] -= amount
    lp_points[contract] -= amount

    assert lp_points[contract] > 1, 'Not enough remaining liquidity!'

    new_currency_reserve = currency_reserve - currency_amount
    new_token_reserve = token_reserve - token_amount

    assert new_currency_reserve > 0 and new_token_reserve > 0, 'Not enough remaining liquidity!'

    reserves[contract] = [new_currency_reserve, new_token_reserve]
    
    return currency_amount, token_amount

@export
def transfer_liquidity(contract: str, to: str, amount: float):
    assert amount > 0, 'Must be a positive LP point amount!'
    assert lp_points[contract, ctx.caller] >= amount, 'Not enough LP points to transfer!'

    lp_points[contract, ctx.caller] -= amount
    lp_points[contract, to] += amount

@export
def approve_liquidity(contract: str, to: str, amount: float):
    assert amount > 0, 'Cannot send negative balances!'
    lp_points[contract, ctx.caller, to] += amount

@export
def transfer_liquidity_from(contract: str, to: str, main_account: str, amount: float):
    assert amount > 0, 'Cannot send negative balances!'

    assert lp_points[contract, main_account, ctx.caller] >= amount, 'Not enough coins approved to send! You have ' \
                                '{} and are trying to spend {}'.format(lp_points[main_account, ctx.caller], amount)

    assert lp_points[contract, main_account] >= amount, 'Not enough coins to send!'

    lp_points[contract, main_account, ctx.caller] -= amount
    lp_points[contract, main_account] -= amount

    lp_points[contract, to] += amount

# Buy takes fee from the crypto being transferred in
@export
def buy(contract: str, currency_amount: float, minimum_received: float=0, token_fees: bool=False):
    assert pairs[contract] is True, 'Market does not exist!'
    assert currency_amount > 0, 'Must provide currency amount!'

    token = I.import_module(contract)
    amm_token = I.import_module(state["TOKEN_CONTRACT"])

    assert I.enforce_interface(token, token_interface), 'Invalid token interface!'

    if contract == state["TOKEN_CONTRACT"]:
        currency.transfer_from(amount=currency_amount, to=ctx.this, main_account=ctx.caller)
        tokens_purchased = internal_buy(contract=state["TOKEN_CONTRACT"], currency_amount=currency_amount)
        token.transfer(amount=tokens_purchased, to=ctx.caller)
        
        return tokens_purchased
    
    currency_reserve, token_reserve = reserves[contract]
    k = currency_reserve * token_reserve

    new_currency_reserve = currency_reserve + currency_amount
    new_token_reserve = k / new_currency_reserve

    tokens_purchased = token_reserve - new_token_reserve
    
    fee_percent = state["FEE_PERCENTAGE"] * discount[ctx.caller] #Discount is applied here
    fee = tokens_purchased * fee_percent
    
    if token_fees is True:
        fee = fee * state["TOKEN_DISCOUNT"]
        
        rswp_k = currency_reserve * token_reserve

        rswp_new_token_reserve = token_reserve + fee
        rswp_new_currency_reserve = rswp_k / rswp_new_token_reserve

        rswp_currency_purchased = currency_reserve - rswp_new_currency_reserve # MINUS FEE
        rswp_currency_purchased += rswp_currency_purchased * fee_percent
        
        
        rswp_currency_reserve_2, rswp_token_reserve_2 = reserves[state["TOKEN_CONTRACT"]] #This converts fees in TAU to fees in RSWP
        rswp_k_2 = rswp_currency_reserve_2 * rswp_token_reserve_2

        rswp_new_currency_reserve_2 = rswp_currency_reserve_2 + rswp_currency_purchased
        rswp_new_currency_reserve_2 += rswp_currency_purchased * fee_percent #Not 100% accurate, uses output currency instead of input currency
        rswp_new_token_reserve_2 = rswp_k_2 / rswp_new_currency_reserve_2
        
        sell_amount = rswp_token_reserve_2 - rswp_new_token_reserve_2 #SEMI-VOODOO MATH, PLEASE DOUBLE CHECK
        sell_amount_with_fee = sell_amount * state["BURN_PERCENTAGE"]
        
        amm_token.transfer_from(amount=sell_amount, to=ctx.this, main_account=ctx.caller)
        
        currency_received = internal_sell(contract=state["TOKEN_CONTRACT"], token_amount=sell_amount_with_fee)
        amm_token.transfer(amount=sell_amount - sell_amount_with_fee, to=state["BURN_ADDRESS"])
        
        token_received = internal_buy(contract=contract, currency_amount=currency_received)
        
        new_currency_reserve += reserves[contract][0] - currency_reserve
        new_token_reserve += reserves[contract][1] - token_reserve
    
        new_token_reserve = (new_token_reserve) + token_received #This can probably be removed during production
    
    else:
        tokens_purchased = (tokens_purchased) - fee
        burn_amount = internal_buy(contract=state["TOKEN_CONTRACT"], currency_amount=internal_sell(contract=contract, token_amount=fee - fee * state["BURN_PERCENTAGE"]))
        
        new_currency_reserve += reserves[contract][0] - currency_reserve
        new_token_reserve += reserves[contract][1] - token_reserve
    
        new_token_reserve = (new_token_reserve) + fee * state["BURN_PERCENTAGE"]
        amm_token.transfer(amount=burn_amount, to=state["BURN_ADDRESS"]) #Burn here

    if minimum_received != None:
        assert tokens_purchased >= minimum_received, "Only {} tokens can be purchased, which is less than your minimum, which is {} tokens.".format(tokens_purchased, minimum_received)
        
    assert tokens_purchased > 0, 'Token reserve error!'

    currency.transfer_from(amount=currency_amount, to=ctx.this, main_account=ctx.caller)
    token.transfer(amount=tokens_purchased, to=ctx.caller)

    reserves[contract] = [new_currency_reserve, new_token_reserve]
    prices[contract] = new_currency_reserve / new_token_reserve
    
    return tokens_purchased

# Sell takes fee from crypto being transferred out
@export
def sell(contract: str, token_amount: float, minimum_received: float=0, token_fees: bool=False):
    assert pairs[contract] is True, 'Market does not exist!'
    assert token_amount > 0, 'Must provide currency amount and token amount!'

    token = I.import_module(contract)
    amm_token = I.import_module(state["TOKEN_CONTRACT"])

    assert I.enforce_interface(token, token_interface), 'Invalid token interface!'

    if contract == state["TOKEN_CONTRACT"]:
        token.transfer_from(amount=token_amount, to=ctx.this, main_account=ctx.caller)
        currency_purchased = internal_sell(contract=state["TOKEN_CONTRACT"], token_amount=token_amount)
        currency.transfer(amount=currency_purchased, to=ctx.caller)
        
        return currency_purchased
    
    currency_reserve, token_reserve = reserves[contract]
    k = currency_reserve * token_reserve

    new_token_reserve = token_reserve + token_amount

    new_currency_reserve = k / new_token_reserve

    currency_purchased = currency_reserve - new_currency_reserve # MINUS FEE

    fee_percent = state["FEE_PERCENTAGE"] * discount[ctx.caller] #Discount is applied here
    fee = currency_purchased * fee_percent
    
    if token_fees is True:
        fee = fee * state["TOKEN_DISCOUNT"]
        rswp_currency_reserve, rswp_token_reserve = reserves[state["TOKEN_CONTRACT"]]
        rswp_k = rswp_currency_reserve * rswp_token_reserve

        rswp_new_currency_reserve = rswp_currency_reserve + fee
        rswp_new_currency_reserve += fee * fee_percent #Not 100% accurate, uses output currency instead of input currency
        rswp_new_token_reserve = rswp_k / rswp_new_currency_reserve
        
        sell_amount = rswp_token_reserve - rswp_new_token_reserve #SEMI-VOODOO MATH, PLEASE DOUBLE CHECK
        sell_amount_with_fee = sell_amount * state["BURN_PERCENTAGE"]
        
        amm_token.transfer_from(amount=sell_amount, to=ctx.this, main_account=ctx.caller)
        
        currency_received = internal_sell(contract=state["TOKEN_CONTRACT"], token_amount=sell_amount_with_fee)
        amm_token.transfer(amount=sell_amount - sell_amount_with_fee, to=state["BURN_ADDRESS"])
        
        new_currency_reserve = (new_currency_reserve) + currency_received
        
    else:
        currency_purchased = (currency_purchased) - fee
        burn_amount = fee - fee * state["BURN_PERCENTAGE"]
        
        new_currency_reserve = (new_currency_reserve) + fee * state["BURN_PERCENTAGE"]
        token_received = internal_buy(contract=state["TOKEN_CONTRACT"], currency_amount=burn_amount)
        amm_token.transfer(amount=token_received, to=state["BURN_ADDRESS"]) #Buy and burn here

    if minimum_received != None: #!= because the type is not exact
        assert currency_purchased >= minimum_received, "Only {} TAU can be purchased, which is less than your minimum, which is {} TAU.".format(currency_purchased, minimum_received)
        
    assert currency_purchased > 0, 'Token reserve error!'

    token.transfer_from(amount=token_amount, to=ctx.this, main_account=ctx.caller)
    currency.transfer(amount=currency_purchased, to=ctx.caller)

    reserves[contract] = [new_currency_reserve, new_token_reserve]
    prices[contract] = new_currency_reserve / new_token_reserve
    
    return currency_purchased

@export
def stake(amount: float, token_contract: str=None):
    assert amount >= 0, 'Must be a positive stake amount!'
    if token_contract == None:
        token_contract = state["TOKEN_CONTRACT"]
    amm_token = I.import_module(token_contract)
    
    current_balance = staked_amount[ctx.caller, token_contract]
    
    if amount < current_balance: 
        amm_token.transfer(current_balance - amount, ctx.caller)
        staked_amount[ctx.caller, token_contract] = amount #Rest of this can be abstracted in another function
        discount_amount = state["LOG_ACCURACY"] * (staked_amount[ctx.caller, state["TOKEN_CONTRACT"]] ** (1 / state["LOG_ACCURACY"]) - 1) * state["MULTIPLIER"] - state["DISCOUNT_FLOOR"] #Calculates discount percentage
        if discount_amount > 0.99: #Probably unnecessary, but added to prevent floating point and division by zero issues
            discount_amount = 0.99
        if discount_amount < 0:
            discount_amount = 0
        discount[ctx.caller] = 1 - discount_amount
        
        return discount_amount
    
    elif amount > current_balance: #Can replace with else, but this probably closes up a few edge cases like `if amount == current_balance`
        amm_token.transfer_from(amount - current_balance, ctx.this, ctx.caller)
        staked_amount[ctx.caller, token_contract] = amount
        discount_amount = state["LOG_ACCURACY"] * (staked_amount[ctx.caller, state["TOKEN_CONTRACT"]] ** (1 / state["LOG_ACCURACY"]) - 1) * state["MULTIPLIER"] - state["DISCOUNT_FLOOR"]
        if discount_amount > 0.99:
            discount_amount = 0.99
        if discount_amount < 0:
            discount_amount = 0
        discount[ctx.caller] = 1 - discount_amount
        
        return discount_amount
    
@export
def change_state(key: str, new_value: str, convert_to_decimal: bool=False):
    assert state["OWNER"] == ctx.caller, "Not the owner!"
    if convert_to_decimal:
        new_value = decimal(new_value)
    state[key] = new_value
    
    return new_value

@export
def change_state_float(key: str, new_value: float, convert_to_int: bool=False):
    assert state["OWNER"] == ctx.caller, "Not the owner!"
    
    if convert_to_int:
        new_value = int(new_value)
    state[key] = new_value
    
    return new_value
    
@export
def sync_reserves(contract: str):
    assert state["SYNC_ENABLED"] is True, "Sync is not enabled!"

    token = I.import_module(contract)

    new_balance = token.balance_of(ctx.this)
    assert new_balance > 0, "Cannot be a negative balance!"
    reserves[contract][1] = new_balance 

    return new_balance
# Internal use only
def internal_buy(contract: str, currency_amount: float):
    assert pairs[contract] is True, 'RSWP Market does not exist!'

    if currency_amount <= 0:
        return 0

    token = I.import_module(contract)

    assert I.enforce_interface(token, token_interface), 'Invalid token interface!'

    currency_reserve, token_reserve = reserves[contract]
    k = currency_reserve * token_reserve

    new_currency_reserve = currency_reserve + currency_amount
    new_token_reserve = k / new_currency_reserve

    tokens_purchased = token_reserve - new_token_reserve

    fee = tokens_purchased * state["FEE_PERCENTAGE"]

    tokens_purchased -= fee
    new_token_reserve += fee

    assert tokens_purchased > 0, 'Token reserve error!'

    reserves[contract] = [new_currency_reserve, new_token_reserve]
    prices[contract] = new_currency_reserve / new_token_reserve
    
    return tokens_purchased

# Internal use only
def internal_sell(contract: str, token_amount: float):
    assert pairs[contract] is True, 'RSWP Market does not exist!'
    if token_amount <= 0:
        return 0

    token = I.import_module(contract)

    assert I.enforce_interface(token, token_interface), 'Invalid token interface!'

    currency_reserve, token_reserve = reserves[contract]
    k = currency_reserve * token_reserve

    new_token_reserve = token_reserve + token_amount

    new_currency_reserve = k / new_token_reserve

    currency_purchased = currency_reserve - new_currency_reserve # MINUS FEE

    fee = currency_purchased * state["FEE_PERCENTAGE"]

    currency_purchased -= fee
    new_currency_reserve += fee

    assert currency_purchased > 0, 'Token reserve error!'

    reserves[contract] = [new_currency_reserve, new_token_reserve]
    prices[contract] = new_currency_reserve / new_token_reserve
    
    return currency_purchased