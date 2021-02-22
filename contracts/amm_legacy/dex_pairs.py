I = importlib

# Enforceable interface
token_interface = [
    I.Func('transfer', args=('amount', 'to')),
    I.Func('balance_of', args=('account',))
]

dex_interface = [
    I.Func('fee_to', args=())
]

# LP Balance
# balance = balance(tau_contract: str, token_contract: str, address: str)
# Pair - Rserves
# tau_reserve = pairs[tau_contract: str, token-contract: str, 'tau_reserve']
# token_reserve = pairs[tau_contract: str, token-contract: str, 'token_reserve']

# LP TOKENS STATE
# LP Token totalSupply
# lp_token_supply = pairs[tau_contract: str, token_contract: str, 'lp_token_supply']
# LP Token kLast
# lp_token_klast = pairs[tau_contract: str, token_contract: str, 'klast']
# LP Token balance
# lp_token_balance = pairs[tau_contract: str, token_contract: str, 'lp_token_balance', address:str]_
owner = Variable()
pairs = Hash()

# TODO - Verifiy minimum liquidity
MINIMUM_LIQUIDITY = pow(10,3)
TOKEN_DECIMALS = 18

# returns ContractingDecimal
def expand_to_token_decimals(amount):
    return (amount / pow(10,TOKEN_DECIMALS)) * 1.0 # turn it into contracting decimal

# babylonian method(https://en.wikipedia.org/wiki/Methods_of_computing_square_roots)
# Basic validation against sqrt of: 2,4,6,9
def sqrt(y) :
    z = None
    if (y > 3) :
        z = y
        x = y / 2 + 1
        while (x < z):
            z = x
            x = (y / x + x) / 2
    elif (y != 0) :
        z = 1

    return z * 1.0 # turn it into contracting decimal

def get_dex_interface(dex_contract):
    dex = I.import_module(dex_contract)
    # assert I.enforce_interface(dex, dex_interface), 'Dex contract does not meet the required interface'

    return dex

# Get token modules, validate & return
def get_token_interface(tau_contract, token_contract):
    # Make sure that what is imported is actually a valid token
    tau = I.import_module(tau_contract)
    assert I.enforce_interface(tau, token_interface), 'Tau contract does not meet the required interface'

    token = I.import_module(token_contract)
    assert I.enforce_interface(token, token_interface), 'Token contract does not meet the required interface'

    return tau, token

# TODO - A2 - Implement Jeff's "Valid Hex Address"
# Get zero address
def zero_address():
    return '0'

# def calculate_trade_details(tau_contract, token_contract, tau_in, token_in):
#     # First we need to get tau + token reserve
#     tau_reserve = pairs[tau_contract, token_contract, 'tau_reserve']
#     token_reserve = pairs[tau_contract, token_contract, 'token_reserve']
#
#     lp_total = tau_reserve * token_reserve
#
#     # Calculate new reserve based on what was passed in
#     tau_reserve_new = tau_reserve + tau_in if tau_in > 0 else 0
#     token_reserve_new = token_reserve + token_in if token_in > 0 else 0
#
#     # Calculate remaining reserve
#     tau_reserve_new = lp_total / token_reserve_new if token_in > 0 else tau_reserve_new
#     token_reserve_new = lp_total / tau_reserve_new if tau_in > 0 else token_reserve_new
#
#     # Calculate how much will be removed
#     tau_out = tau_reserve - tau_reserve_new if token_in > 0 else 0
#     token_out = token_reserve - token_reserve_new if tau_in > 0  else 0
#
#     # Finally, calculate the slippage incurred
#     tau_slippage = (tau_reserve / tau_reserve_new) -1 if token_in > 0 else 0
#     token_slippage = (token_reserve / token_reserve_new) -1 if tau_in > 0 else 0
#
#     return tau_out, token_out, tau_slippage, token_slippage

# From UniV2Pair.sol
def update(tau, token, pair_tau_balance, pair_token_balance):
    pairs[tau.token_name(), 'balance'] = tau.balance_of(ctx.this)
    pairs[token.token_name(), 'balance'] = token.balance_of(ctx.this)

    pairs[tau.token_name(), token.token_name(), 'tau_reserve'] = pair_tau_balance
    pairs[tau.token_name(), token.token_name(), 'token_reserve'] = pair_token_balance

# TODO - A1 - VALIDATE IMPLEMENTATION
# Currency/Pair Fn - Internal Interface
def mint_lp_tokens(tau, token, to_address, amount) :
    assert not to_address is None, 'Invalid Address {}'.format(to_address)
    assert isinstance(to_address, str), 'Invalid type {}'.format(to_address)

    # Increase LP Token supply
    pairs[tau.token_name(), token.token_name(), 'lp_token_supply'] += amount

    # Increase Acct LP Token balance
    lp_token_balance = pairs[tau.token_name(), token.token_name(), 'lp_token_balance', to_address]
    pairs[tau.token_name(), token.token_name(), 'lp_token_balance', to_address] = lp_token_balance + amount if not lp_token_balance is None else amount

    # return new supply, and balance
    #emit Transfer(address_zero(), to, amount)
    return zero_address(), to_address, amount

# TODO - A1 - VALIDATE IMPLEMENTATION/SECURITY
# Currency/Pair Fn - Internal Interface
def burn_lp_tokens(tau, token, from_address, amount) :
    # Decrease LP Token supply
    pairs[tau.token_name(), token.token_name(), 'lp_token_supply'] -= amount

    # Decrease Acct LP Token balance
    lp_token_balance = pairs[tau.token_name(), token.token_name(), 'lp_token_balance', from_address]
    pairs[tau.token_name(), token.token_name(), 'lp_token_balance', from_address] = lp_token_balance - amount

    # return new supply, and balance
    # emit Transfer(address_zero(), to, amount)
    return pairs[tau.token_name(), token.token_name(), 'lp_token_supply'], pairs[tau.token_name(), token.token_name(), 'lp_token_balance', from_address]

# TODO - A1 - VALIDATE IMPLEMENTATION/SECURITY
# DONE - PORTED + REVIEWED
# UniswapV2Pai.sol => _mintFee()
def mint_fee(dex, tau, token, tau_reserve, token_reserve):
    lp_token_supply = pairs[tau.token_name(), token.token_name(), 'lp_token_supply']

    fee_to = dex.fee_to()
    fee_on = fee_to != zero_address() # make sure we're not burning the fee?
    kLast = pairs[tau.token_name(), token.token_name(), 'kLast'] # "gas savings"
    if(fee_on) :
        if(kLast != 0) :
            rootK = sqrt(tau_reserve * token_reserve)
            rootKLast = sqrt(kLast)
            if(rootK > rootKLast) :
                numerator = lp_token_supply * (rootK - rootKLast)
                denominator = (rootK * 5) + rootKLast
                liquidity = numerator / denominator
                if(liquidity > 0):
                    mint_lp_tokens(tau, token, fee_to, liquidity)
    elif(kLast != 0) :
        pairs[tau.token_name(), token.token_name(), 'kLast'] = 0

    return fee_on, fee_to

@construct
def seed(owner_address: str):
    owner.set(owner_address)
    pairs['count'] = 0

@export
def pair(tau_contract: str, token_contract: str):
    return pairs[tau_contract, token_contract]

@export
# Number of pairs created
def length_pairs():
    return pairs['count']

@export
def total_supply(tau_contract:str, token_contract:str):
    assert not pairs[tau_contract, token_contract] is None, 'Invalid pair'
    return pairs[tau_contract, token_contract, 'lp_token_supply']

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

@export
def pair_address(tau_contract:str, token_contract:str):
    assert not pairs[tau_contract, token_contract] is None, 'Invalid pair'
    return pairs[tau_contract, token_contract, 'pair_address']

@export
# Returns the total reserves from each tau/token
def get_pair_reserves(tau_contract:str, token_contract:str):
    return pairs[tau_contract, token_contract, 'tau_reserve'], \
            pairs[tau_contract, token_contract, 'token_reserve']

@export
def balance_of(tau_contract:str, token_contract:str, account:str):
    assert not pairs[tau_contract, token_contract] is None, 'Invalid pair'
    return pairs[tau_contract, token_contract, 'lp_token_balance', account]

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

# @export
# # Pass contracts + tokens_in, get: tokens_out, slippage
# def get_trade_details(tau_contract: str, token_contract: str, tau_in: int, token_in: int):
#     return calculate_trade_details(tau_contract, token_contract, tau_in, token_in)

# TODO - A1 - VALIDATE IMPLEMENTATION
# UniswapV2Pair.sol => mint()
# This low-level function should be called from a contract which performs important safety checks
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


# TODO - A1 - Finish Implementation + Validate
# UniswapV2Pai.sol => burn()
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

# TODO - B1/A5 - CallData / Emit Events
# UniswapV2Pair.sol => swap()
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

    # TODO - B2 - Event Emitters?
    # emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
