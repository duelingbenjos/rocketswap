balances = Hash(default_value=0) # Required

custodial = Hash(default_value=False)

# use token_owner if you want to change logo, name or symbol after submission
token_owner = Variable() # Optional

# Token Meta (Name, Symbol, Logo Image). Set values in the "seed" method
## the below metadata will be available to any app using the Lamden Token standard
token_name = Variable() # Optional
token_symbol = Variable() # Optional

## Token Logo (base64 svg/png image or url).
# ** A base64 value that is too long will cause the smart contract to fail on submission.
# ** It is recommended that you submit your contract with an owner and then after the contract is submitted 
# ** use the "set_logo" method to set the base64 value of either token_base64_svg or token_base64_png.
# ** URLs are generally short enough that you can sit it in the seed method to provide it on submission.
token_base64_svg = Variable() # Optional
token_base64_png = Variable() # Optional
token_logo_url = Variable()  # Optional

@construct
def seed():
    # Create a token with the information from fixtures/tokenInfo
    token_name.set("")
    token_symbol.set("")

    balances[ctx.caller] = 1000000
    token_owner.set(ctx.caller)

# set_logo, set_name, set_symbol and assert_owner are only needed if you set an owner. Otherwise they can be removed

token_base64_svg = Variable() # Optional
token_base64_png = Variable() # Optional
token_logo_url = Variable()  # Optional

@export 
def set_logo(type: str, new_value: str):
    assert_owner()

    if type == 'url':
    	token_logo_url.set(new_value)
    else:
    	token_logo_url.set(None)
    if type == 'svg':
    	token_base64_svg.set(new_value)
    else:
    	token_base64_svg.set(None)
    if type == 'png':
    	token_base64_png.set(new_value)
    else:
    	token_base64_png.set(None)


@export 
def set_name(new_value: str):
    assert_owner()
    token_name.set(new_value)

@export 
def set_symbol(new_value: str):
    assert_owner()
    token_symbol.set(new_value)

def assert_owner():
    assert ctx.caller == token_owner.get(), 'Only the owner can change contract meta'

# ALL methods below here are REQUIRED and should not be altered. This includes method names, argument names and arguement types
## Changing any information below this comment could cause your token to be incompatible with apps using the Lamden Token Standard.
@export
def transfer(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[ctx.caller] >= amount, 'Not enough coins to send!'

    balances[ctx.caller] -= amount
    balances[to] += amount

@export
def balance_of(account: str):
    return balances[account]

@export
def allowance(owner: str, spender: str):
    return balances[owner, spender]

@export
def approve(amount: float, to: str):
    assert amount >= 0, 'Cannot send negative balances!'
    balances[ctx.caller, to] = amount
    return balances[ctx.caller, to]

@export
def always_approve(to: str):
		custodial[ctx.caller, to] = True

@export
def revoke_always_approve(to: str):
		custodial[ctx.caller, to] = False

@export
def transfer_from(amount: float, to: str, main_account: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[main_account] >= amount, 'Cannot send amount greater than balance!'

    if custodial[main_account, ctx.caller] == True:
    	balances[main_account] -= amount
    	balances[to] += amount
    if balances[main_account,ctx.caller] >= amount:
    	balances[main_account] -= amount
    	balances[to] += amount
    	balances[main_account,ctx.caller] -= amount
