# Imports

import currency
import con_basic_token

## State

Owner = Variable()
DevRewardWallet = Variable()
Deposits = Hash(default_value = False)
Withdrawals = Hash(default_value = False)
CurrentEpochIndex = Variable()
Epochs = Hash(default_value = False)
StakedBalance = Variable() # The total amount of farming token in the vault.
YieldReserves = Variable() # The total amount of yield token left in the vault

## Constants

EMISSION_RATE_HOURLY = 3000 # Per Hour
EMISSION_RATE_PER_MIN = EMISSION_RATE_HOURLY / 60 # Per Minute
EMISSION_RATE_PER_SEC = EMISSION_RATE_PER_MIN / 60 # Per Second
DEV_REWARD = 0.1 # 10%

@construct
def seed():
    Owner.set(ctx.caller)
    DevRewardWallet.set(ctx.caller)
    CurrentEpochIndex.set(0)
    StakedBalance.set(0)
    YieldReserves.set(0)
    Epochs[0] = {
        "time": now,
        "staked": 0
    }

@export
def addFarmingTokens(amount: float):
    assert amount > 0, 'You cannot stake a negative balance.'

    user = ctx.caller
    
    # Take the staking tokens from the user's wallet
    currency.transfer_from(amount=amount, to=ctx.this, main_account=user)

    # Update the Staked amount
    staked = StakedBalance.get()
    new_staked_amount = staked + amount
    StakedBalance.set(new_staked_amount)

    # Update the Epoch
    new_epoch_idx = incrementEpoch(new_staked_amount=new_staked_amount)

    if Deposits[user] is False:
        Deposits[user] = []

    # Create a record of the user's deposit

    Deposits[user].append({
        'starting_epoch': new_epoch_idx,
        'time': now,
        'amount': amount
    })

@export
def withdrawTokensAndYield():
    user = ctx.caller
    deposits = Deposits[user]

    assert deposits is not False, "You have no deposit to withdraw"

    # Calculate how much yield is due per deposit account
    stake_to_return = 0
    yield_to_harvest = 0

    for d in deposits:
        yield_to_harvest += calculateYield(starting_epoch_index=d['starting_epoch'], start_time=d['time'], amount=d['amount'])
        stake_to_return += d['amount']

    # assert Yield.get() > yield_to_harvest, 'The contract does not have sufficient supplies to fufill your claim.'

    # Send Farming Tokens to user
    currency.transfer(to=user, amount=stake_to_return)
    
    # Take % of Yield Tokens, send it to dev fund
    dev_share = yield_to_harvest * DEV_REWARD
    con_basic_token.transfer(to="dev_wallet", amount=dev_share)

    # Send remanding Yield Tokens to user
    user_share = yield_to_harvest-dev_share
    con_basic_token.transfer(to=user, amount = user_share)

    # Reset User's Deposits
    Deposits[user] = False

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)

    # Remove withdrawn yield from Yield
    new_yield_amount = YieldReserves.get() - yield_to_harvest
    YieldReserves.set(new_yield_amount)

    # Increment Epoch
    incrementEpoch(new_staked_amount = new_yield_amount)


def calculateYield(starting_epoch_index:int, start_time, amount:float):
    current_epoch_index = getCurrentEpochIndex()
    this_epoch_index = starting_epoch_index
    y = 0
    while this_epoch_index <= current_epoch_index:
        this_epoch = Epochs[this_epoch_index]
        next_epoch = Epochs[this_epoch_index+1]

        delta = 0

        if starting_epoch_index == current_epoch_index:
            delta = now - start_time
        elif this_epoch_index == starting_epoch_index:
            delta = next_epoch['time'] - start_time
        elif this_epoch_index == current_epoch_index:
            delta = now - this_epoch['time']
        else:
            delta = next_epoch['time'] - this_epoch['time']

        pct_share_of_stake = amount / this_epoch['staked']
        global_yield_this_epoch = delta.seconds * EMISSION_RATE_PER_SEC
        deposit_yield_this_epoch = global_yield_this_epoch * pct_share_of_stake
        y += deposit_yield_this_epoch

        this_epoch_index += 1
        
    return y

@export
def getCurrentEpochIndex():
    current_epoch_index = CurrentEpochIndex.get()
    return current_epoch_index

def incrementEpoch(new_staked_amount: float):
    current_epoch = CurrentEpochIndex.get()
    new_epoch_idx = current_epoch + 1
    CurrentEpochIndex.set(new_epoch_idx)
    Epochs[new_epoch_idx] = {
        "time" : now,
        "staked" : new_staked_amount
    }
    return new_epoch_idx
