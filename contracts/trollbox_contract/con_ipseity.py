# import currency

name_to_key = Hash(default_value='')
key_to_name = Hash(default_value='')
auth_codes = Hash(default_value='')
Owner = Variable()

@construct
def seed():
    Owner.set(ctx.signer)

@export
def setName(name: str):
    assert len(name) > 0 and len(name) < 20, 'Chosen name length must be more than 1 and less than 20 characters long.'

    key = ctx.signer
    # 1 ) Get previous name
    previous_name = key_to_name[key]
    # 2 ) Assert new name is available
    name_taken = name_to_key[name]
    assert name_taken is '', 'This name has been taken.'
    # 3 ) Unset previous name
    if previous_name is not '':
        name_to_key[previous_name] = ''
    # 4 ) Set new name, using key_to_name and name_to_key
    key_to_name[key] = name
    name_to_key[name] = key

@export 
def auth(secret: str):
    auth_codes[secret] = 1