# TODO - Update basetoken to whatever the first TRC_20 currency standard is
balances = Hash(default_value=0)
token_name = Variable()
token_symbol = Variable()

# Cannot set breakpoint in @construct
@construct
def seed(s_name:str, s_symbol: str, vk: str, vk_amount: int):
    # Overloading this to mint tokens
    token_name.set(s_name)
    token_symbol.set(s_symbol)
    balances[vk] = vk_amount

@export
def token_name():
    return token_name.get()

@export
def token_symbol():
    return token_symbol.get()

@export
def transfer(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'
    sender = ctx.caller

    assert balances[sender] >= amount, 'Not enough coins to send!'

    balances[sender] -= amount
    balances[to] += amount

@export
def balance_of(account: str):
    return balances[account]

@export
def main_balance_of(main_account: str, account: str):
    return balances[main_account, account]

@export
def allowance(owner: str, spender: str):
    return balances[owner, spender]

@export
def approve(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'

    sender = ctx.caller
    balances[sender, to] += amount
    return balances[sender, to]

@export
def transfer_from(amount: float, from_address: str, to_address: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[from_address] > amount, 'Cannot send amount greater than balance!'

    # TODO - A1 - Trying to understand this currency.py vs. function in general...
    balances[from_address] -= amount
    balances[to_address] += amount

