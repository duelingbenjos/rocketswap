# State

registry = Hash(default_value=False)
operator = Variable()


@construct
def seed():
    operator.set(ctx.caller)


@export
def addContract(contract_name: str):
    assertOperator()
    registry[contract_name] = True


@export
def removeContract(contract_name: str):
    assertOperator()
    registry[contract_name] = False


def assertOperator():
    assert ctx.caller == operator.get(), 'You must be the operator to call this function.'
