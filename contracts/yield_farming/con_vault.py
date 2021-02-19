## Imports

import currency
import con_basic_token

## State Variables

Owner = Variable()
DevRewardWallet = Variable()
EmissionRatePerHour = Variable()
DevRewardPct = Variable()

## State

Deposits = Hash(default_value = False)
Withdrawals = Hash(default_value = 0)
CurrentEpochIndex = Variable()
Epochs = Hash(default_value = False)
StakedBalance = Variable() # The total amount of farming token in the vault.
Active = Variable() # 

@construct
def seed():
    Owner.set(ctx.caller)
    DevRewardWallet.set(ctx.caller)
    CurrentEpochIndex.set(0)
    StakedBalance.set(0)
    Epochs[0] = {
        "time": now,
        "staked": 0
    }

    EmissionRatePerHour.set(3000)
    DevRewardPct.set(0.1)

@export
def addStakingTokens(amount: float):
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
def withdrawYield(amount: float):
    assert amount > 0, 'You cannot harvest a negative balance'

    user = ctx.caller
    deposits = Deposits[user]

    assert deposits is not False, "You have no deposit to withdraw yield from."

    # Calculate how much yield is due per deposit account
    withdrawn_yield = Withdrawals[user]
    harvestable_yield = 0

    for d in deposits:
        harvestable_yield += calculateYield(starting_epoch_index=d['starting_epoch'], start_time=d['time'], amount=d['amount'])

    # Determine maximum amount of yield user can withdraw
    harvestable_yield -= withdrawn_yield

    yield_to_harvest = amount if amount < harvestable_yield else harvestable_yield

    assert yield_to_harvest > 0, 'There is no yield to harvest right now :('

    # Take % of Yield Tokens, send it to dev fund
    dev_share = yield_to_harvest * DevRewardPct.get()
    con_basic_token.transfer(to = DevRewardWallet.get(), amount = dev_share)

    # Send remanding Yield Tokens to user
    user_share = yield_to_harvest-dev_share
    con_basic_token.transfer(to=user, amount = user_share)

    Withdrawals[user] = withdrawn_yield + yield_to_harvest

@export
def withdrawTokensAndYield():
    user = ctx.caller
    deposits = Deposits[user]

    assert deposits is not False, "You have no deposit to withdraw"

    # Calculate how much yield is due per deposit account
    withdrawn_yield = Withdrawals[user]
    stake_to_return = 0
    yield_to_harvest = 0

    for d in deposits:
        yield_to_harvest += calculateYield(starting_epoch_index=d['starting_epoch'], start_time=d['time'], amount=d['amount'])
        stake_to_return += d['amount']

    # assert Yield.get() > yield_to_harvest, 'The contract does not have sufficient supplies to fufill your claim.'

    # Send Staking Tokens to user
    currency.transfer(to=user, amount=stake_to_return)
    
    # check that the user has yield left to harvest (this should never be negative, but let's check here just in case)
    yield_to_harvest -= withdrawn_yield
    if yield_to_harvest > 0:

        # Take % of Yield Tokens, send it to dev fund
        dev_share = yield_to_harvest * DevRewardPct.get()
        if dev_share > 0:
            con_basic_token.transfer(to = DevRewardWallet.get(), amount = dev_share)

        # Send remanding Yield Tokens to user
        user_share = yield_to_harvest-dev_share
        con_basic_token.transfer(to=user, amount = user_share)

    # Reset User's Deposits
    Deposits[user] = False

    # Reset User's Withdrawal
    Withdrawals[user] = 0

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)

    # Increment Epoch
    incrementEpoch(new_staked_amount = new_staked_amount)


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
        ## These two lines below were causing some problems, until I used the decimal method. get a python expert to review.
        global_yield_this_epoch = delta.seconds * getEmissionRatePerSecond()
        deposit_yield_this_epoch = decimal(global_yield_this_epoch) * pct_share_of_stake
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

@export
def getEmissionRatePerSecond():
    emission_rate_per_hour = EmissionRatePerHour.get()
    emission_rate_per_minute = emission_rate_per_hour / 60
    emission_rate_per_second = emission_rate_per_minute / 60
    return emission_rate_per_second

@export
def setOwner(vk:str):
    assertOwner()
    Owner.set(vk)

@export
def setDevWallet(vk: str):
    assertOwner()
    DevRewardWallet.set(vk)

@export
def setDevRewardPct(amount: float):
    assertOwner()
    assert amount <= 1 and amount >= 0, 'Amount must be a value between 0 and 1'
    DevRewardPct.set(amount)

@export
def setEmissionRatePerHour(amount: float):
    assertOwner()
    EmissionRatePerHour.set(amount)

def assertOwner():
    assert Owner.get() == ctx.caller, 'You must be the owner to call this contract.'
