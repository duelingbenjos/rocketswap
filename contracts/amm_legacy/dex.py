# DONE - Requesting Audit - A1 - Liquidity pools - mint / burn
# DONE - Requesting Audit - A2 - KLast
# DONE - Requesting Audit - A2 - Fee functionality
# TODO - A3 - Migrator Functionality

# Public interface
# Illegal use of a builtin
# import time
# TODO - A4 - Price oracle
I = importlib

# Enforceable interface
token_interface = [
    I.Func('transfer', args=('amount', 'to')),
    I.Func('balance_of', args=('account',))
]

pair_token_interface = [
    I.Func('transfer', args=('amount', 'to')),
    I.Func('balance_of', args=('account',))
]

dex_pairs_interface = [
    I.Func('get_length_pairs', args=())
]

# Contract management variables
fee_to = Variable()
fee_to_setter = Variable()

def zero_address():
    return '0'

def get_dex_pairs_interface(dex_pairs_contract):
    dex_pairs = I.import_module(dex_pairs_contract)
    # assert I.enforce_interface(dex_pairs, dex_pairs_interface), 'Dex pairs contract does not meet the required interface'

    return dex_pairs

# Get token modules, validate & return
def get_token_interface(tau_contract, token_contract):
    # Make sure that what is imported is actually a valid token
    tau = I.import_module(tau_contract)
    assert I.enforce_interface(tau, token_interface), 'Tau contract does not meet the required interface'

    token = I.import_module(token_contract)
    assert I.enforce_interface(token, token_interface), 'Token contract does not meet the required interface'

    return tau, token

# UniswapV2Library.sol => quote
# given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
def quote(a_amount, a_reserve, b_reserve):
    assert a_amount > 0, 'Insufficient amount!'
    assert a_reserve > 0 and b_reserve > 0, 'Insufficient liquidity'
    b_amount = (a_amount * b_reserve) / a_reserve

    return b_amount

@construct
def seed(fee_to_setter_address:str):
    fee_to.set(zero_address())
    fee_to_setter.set(fee_to_setter_address)

@export
# Number of pairs created
def length_pairs():
    return pairs['count']

@export
def fee_to():
    return fee_to.get()

@export
def set_fee_to(account:str):
    assert ctx.caller == fee_to_setter.get()
    fee_to.set(account)

@export
def fee_to_setter():
    return fee_to_setter.get()

# Create pair before doing anything else
@export
def create_pair(dex_pairs: str, tau_contract: str, token_contract: str):
    # Make sure that what is imported is actually a valid token
    assert tau_contract != token_contract

    pairs = get_dex_pairs_interface(dex_pairs)
    assert pairs.pair(tau_contract, token_contract) is None, 'Market already exists!'

    # 1 - Create the pair
    # TODO - A4 - Make pair lookup, work vice/versa
    pairs.initialize(tau_contract, token_contract)

    # TODO - B1 - Support new functionality
    # 2 - Adds liquidity if provided
    # if (not tau_in is None and tau_in > 0) and (not token_in is None and token_in > 0) :
    #     add_liquidity(
    #         dex_pairs=dex_pairs,
    #         tau_contract=tau_contract,
    #         token_contract=token_contract,
    #         tau_in=tau_in,
    #         token_in=token_in)

# DONE - A1 - Add liquidity needs to implement add_liquidity + mint_liquidity
# DONE - A1 - Add liquidity needs to implement remove_liquidity + burn_liquidity
# Route01 Fn
# Pair must exist before liquidity can be added
@export
def add_liquidity(dex_pairs: str, tau_contract: str, token_contract: str, tau_in: int, token_in: int):
    assert token_in > 0
    assert tau_in > 0

    # Make sure that what is imported is actually a valid token
    tau, token = get_token_interface(tau_contract, token_contract)
    assert tau_contract != token_contract

    pairs = get_dex_pairs_interface(dex_pairs)
    assert not pairs.pair(tau_contract, token_contract) is None, 'Market does not exist!'

    # 1 - This contract will own all amounts sent to it
    tau.transfer(tau_in, ctx.this)
    token.transfer(token_in, ctx.this)

    # Track liquidity provided by signer
    # TODO - If we care about "% pool" This needs to remain updated as market swings along X,Y
    if pairs[tau_contract, token_contract, ctx.signer] is None :
        pairs[tau_contract, token_contract, 'tau_liquidity', ctx.signer] = tau_in
        pairs[tau_contract, token_contract, 'token_liquidity', ctx.signer] = token_in
    else :
        pairs[tau_contract, token_contract, 'tau_liquidity', ctx.signer] += tau_in
        pairs[tau_contract, token_contract, 'token_liquidity', ctx.signer] += token_in

    # I'm assuming registry of [ctx.this,ctx.investor,amount] is done via LP
    update(
        tau,
        token,
        tau.balance_of(ctx.this),
        token.balance_of(ctx.this),
        pairs[tau.token_name(), token.token_name(), 'tau_reserve'],
        pairs[tau.token_name(), token.token_name(), 'token_reserve']
    )
