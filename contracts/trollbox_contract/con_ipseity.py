import currency

name_to_key = Hash(default_value=False)
key_to_name = Hash(default_value=False)
auth_codes = Hash(default_value=False)
Owner = Variable()


@construct
def seed():
    Owner.set(ctx.signer)

@export
def setName(name: str):
    # TO DO make fee dynamic
    currency.transfer_from(amount=5, to = ctx.this, main_account = ctx.signer)

    assert len(name) > 0 and len(name) < 20, 'Chosen name length must be more than 1 and less than 20 characters long.'
    key = ctx.signer
    # 1 ) Get previous name
    previous_name = key_to_name[key]
    # 2 ) Assert new name is available
    name_taken = name_to_key[name]
    assert name_taken is False, 'This name has been taken.'
    # 3 ) Unset previous name
    if previous_name is not False:
        name_to_key[previous_name] = False
    # 4 ) Set new name, using key_to_name and name_to_key
    key_to_name[key] = name
    name_to_key[name] = key


@export 
def auth(secret: str):
    auth_codes[secret] = True

@export
def withdraw(amount: float):
    assert ctx.signer == Owner.get(), 'You must be the owner of this contract to withdraw funds.'
    currency.transfer(amount=amount, to=to)
