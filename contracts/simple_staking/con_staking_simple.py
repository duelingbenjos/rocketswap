# Imports

import currency
import con_basic_token

# Setup Tokens

STAKING_TOKEN = currency
YIELD_TOKEN = con_basic_token


# State

Owner = Variable()
DevRewardWallet = Variable()
EmissionRatePerHour = Variable()
DevRewardPct = Variable()
StartTime = Variable()
EndTime = Variable()
OpenForBusiness = Variable()  # If false, users will be unable to join the pool

Users = Hash(default_value=False)
Deposits = Hash(default_value=False)
Withdrawals = Hash(default_value=0)
CurrentEpochIndex = Variable()
Epochs = Hash(default_value=False)
StakedBalance = Variable()  # The total amount of farming token in the vault.
meta = Hash(default_value=False)
# How much TAU is emitted per year per TAU staked
EmissionRatePerTauYearly = Variable()
EmissionRatePerSecond = Variable()


@construct
def seed():
    Owner.set(ctx.caller)
    DevRewardWallet.set(ctx.caller)
    CurrentEpochIndex.set(0)
    StakedBalance.set(0)
    EmissionRatePerTauYearly.set(5)

    Epochs[0] = {
        "time": now,
        "emission_rate_per_tau": EmissionRatePerTauYearly.get()
    }
    EmissionRatePerSecond.set(
        getEmissionRatePerSecond(EmissionRatePerTauYearly.get()))

    meta['version'] = '0.0.1'
    meta['type'] = 'staking_simple'  # staking || lp_farming
    meta['STAKING_TOKEN'] = 'currency'
    meta['YIELD_TOKEN'] = 'con_basic_token'

    DevRewardPct.set(0.1)

    # The datetime from which you want to allow staking.
    StartTime.set(datetime.datetime(year=2018, month=1, day=1, hour=0))
    # The datetime at which you want staking to finish.
    # Participants will stop accruing interest after this time.
    EndTime.set(datetime.datetime(year=2022, month=3, day=4, hour=0))

    OpenForBusiness.set(True)


@export
def addStakingTokens(amount: float):
    assert OpenForBusiness.get() == True, 'This staking pool is not open right now.'
    assert amount > 0, 'You cannot stake a negative balance.'

    user = ctx.caller

    # Take the staking tokens from the user's wallet
    STAKING_TOKEN.transfer_from(amount=amount, to=ctx.this, main_account=user)

    # Update the Staked amount
    staked = StakedBalance.get()
    new_staked_amount = staked + amount
    StakedBalance.set(new_staked_amount)

    if Deposits[user] is False:
        Deposits[user] = []

    # Create a record of the user's deposit

    deposits = Deposits[user]

    deposits.append({
        'starting_epoch': CurrentEpochIndex.get(),
        'time': now,
        'amount': amount
    })

    Deposits[user] = deposits


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
        harvestable_yield += calculateYield(
            starting_epoch_index=d['starting_epoch'], start_time=d['time'], amount=d['amount'])

    # Determine maximum amount of yield user can withdraw
    harvestable_yield -= withdrawn_yield

    yield_to_harvest = amount if amount < harvestable_yield else harvestable_yield

    assert yield_to_harvest > 0, 'There is no yield to harvest right now :('

    # Take % of Yield Tokens, send it to dev fund
    dev_share = yield_to_harvest * DevRewardPct.get()

    if dev_share > 0:
        YIELD_TOKEN.transfer(to=DevRewardWallet.get(), amount=dev_share)

    # Send remanding Yield Tokens to user
    user_share = yield_to_harvest-dev_share
    YIELD_TOKEN.transfer(to=user, amount=user_share)

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
        yield_to_harvest += calculateYield(
            starting_epoch_index=d['starting_epoch'], start_time=d['time'], amount=d['amount'])
        stake_to_return += d['amount']

    # Send Staking Tokens to user
    STAKING_TOKEN.transfer(to=user, amount=stake_to_return)

    # check that the user has yield left to harvest (this should never be negative, but let's check here just in case)
    yield_to_harvest -= withdrawn_yield
    if yield_to_harvest > 0:

        # Take % of Yield Tokens, send it to dev fund
        dev_share = yield_to_harvest * DevRewardPct.get()
        if dev_share > 0:
            YIELD_TOKEN.transfer(to=DevRewardWallet.get(), amount=dev_share)

        # Send remanding Yield Tokens to user
        user_share = yield_to_harvest-dev_share
        YIELD_TOKEN.transfer(to=user, amount=user_share)

    # Reset User's Deposits
    Deposits[user] = False

    # Reset User's Withdrawal
    Withdrawals[user] = 0

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)


# This runs over each of the items in the user's Deposit
def calculateYield(starting_epoch_index: int, start_time, amount: float):
    current_epoch_index = getCurrentEpochIndex()
    this_epoch_index = starting_epoch_index
    y = 0
    while this_epoch_index <= current_epoch_index:
        this_epoch = Epochs[this_epoch_index]
        next_epoch = Epochs[this_epoch_index+1]

        delta = 0

        if starting_epoch_index == current_epoch_index:
            delta = fitTimeToRange(now) - fitTimeToRange(start_time)
        elif this_epoch_index == starting_epoch_index:
            delta = fitTimeToRange(
                next_epoch['time']) - fitTimeToRange(start_time)
        elif this_epoch_index == current_epoch_index:
            delta = fitTimeToRange(now) - fitTimeToRange(this_epoch['time'])
        else:
            delta = fitTimeToRange(
                next_epoch['time']) - fitTimeToRange(this_epoch['time'])

        rswp_per_tau_per_second = getEmissionRatePerSecond(
            this_epoch['emission_rate_per_tau'])

        y += rswp_per_tau_per_second * amount * delta.seconds

        this_epoch_index += 1

    return y

# This is only to be called in emergencies - the user will forgo their yield when calling this FN.

@export
def emergencyReturnStake():

    user = ctx.caller
    deposits = Deposits[user]

    assert Deposits[user] is not False, "This account has no deposits to return."

    stake_to_return = 0

    for d in deposits:
        stake_to_return += d['amount']

    STAKING_TOKEN.transfer(to=user, amount=stake_to_return)
    Deposits[user] = False
    Withdrawals[user] = 0

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)



def fitTimeToRange(time: Any):
    if time < StartTime.get():
        time = StartTime.get()
    elif time > EndTime.get():
        time = EndTime.get()
    return time


@export
def getEmissionRatePerSecond(emission_rate_per_tau: float):
    value = emission_rate_per_tau / 365 / 24 / 60 / 60
    return value


@export
def getCurrentEpochIndex():
    current_epoch_index = CurrentEpochIndex.get()
    return current_epoch_index


@export
def incrementEpoch(emission_rate_per_tau: float):
    assertOwner()
    assert emission_rate_per_tau > 0
    current_epoch = CurrentEpochIndex.get()
    new_epoch_idx = current_epoch + 1
    CurrentEpochIndex.set(new_epoch_idx)
    EmissionRatePerTauYearly.set(emission_rate_per_tau)
    EmissionRatePerSecond.set(
        getEmissionRatePerSecond(EmissionRatePerTauYearly.get()))
    Epochs[new_epoch_idx] = {
        "time": now,
        "emission_rate_per_tau": emission_rate_per_tau
    }
    return new_epoch_idx


@export
def setOwner(vk: str):
    assertOwner()
    Owner.set(vk)


@export
def setDevWallet(vk: str):
    assertOwner()
    DevRewardWallet.set(vk)


@export
def setDevRewardPct(amount: float):
    assertOwner()
    assert amount < 1 and amount >= 0, 'Amount must be a value between 0 and 1'
    DevRewardPct.set(amount)


@export
def recoverYieldToken(amount: float):
    assertOwner()
    YIELD_TOKEN.transfer(amount=amount, to=Owner.get())


@export
def allowStaking(is_open: bool):
    assertOwner()
    OpenForBusiness.set(is_open)


@export
def setStartTime(year: int, month: int, day: int, hour: int):
    assertOwner()
    time = datetime.datetime(year, month, day, hour)
    StartTime.set(time)


@export
def setEndTime(year: int, month: int, day: int, hour: int):
    assertOwner()
    time = datetime.datetime(year, month, day, hour)
    EndTime.set(time)


@export
def updateMeta(field: str, value: str):
    assertOwner()
    meta[field] = value


def assertOwner():
    assert Owner.get() == ctx.caller, 'You must be the owner to call this function.'
