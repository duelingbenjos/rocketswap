import currency


Owner = Variable()
Deposits = Hash(default_value = False)
Withdrawals = Hash(default_value = False)


@construct
def seed():
    Owner.set(ctx.signer)

def calcFarmed(pair: str) :
    user = ctx.caller
    farmed = 0
    withdrawn = Withdrawals[pair][user]
    pair_arr = Deposits[pair][user]
    for p in pair_arr:
        delta = p.time - now()