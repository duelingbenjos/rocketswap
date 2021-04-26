# Imports

import con_rswp_lst001

# Setup Tokens

STAKING_TOKEN = con_rswp_lst001
YIELD_TOKEN = con_rswp_lst001

# State

Owner = Variable()
DevRewardWallet = Variable()
EmissionRatePerHour = Variable()
DevRewardPct = Variable()
StartTime = Variable()
EndTime = Variable()
OpenForBusiness = Variable()  # If false, users will be unable to join the pool

Deposits = Hash(default_value=False)
Withdrawals = Hash(default_value=0)
CurrentEpochIndex = Variable()
Epochs = Hash(default_value=False)
StakedBalance = Variable()  # The total amount of farming token in the vault.
WithdrawnBalance = Variable()
EpochMinTime = Variable()  # The minimum amount of seconds in Epoch
EpochMaxRatioIncrease = (
    Variable()
)  # The maximum ratio which the Epoch can increase by since last Epoch before incrementing.
meta = Hash(default_value=False)


@construct
def seed():
    Owner.set(ctx.caller)
    DevRewardWallet.set(ctx.caller)
    CurrentEpochIndex.set(0)
    StakedBalance.set(0)
    WithdrawnBalance.set(0)
    EpochMaxRatioIncrease.set(10)
    EpochMinTime.set(30*60) # 30 mins

    Epochs[0] = {"time": now, "staked": 0, "amt_per_hr": 3000}

    meta["version"] = "0.0.1"
    meta["type"] = "staking_smart_epoch"  # staking || lp_farming
    meta["STAKING_TOKEN"] = "con_rswp_lst001"
    meta["YIELD_TOKEN"] = "con_rswp_lst001"

    EmissionRatePerHour.set(3000)  # 1200000 RSWP per year = 10% of supply
    DevRewardPct.set(1/10)

    # The datetime from which you want to allow staking.
    StartTime.set(datetime.datetime(year=2018, month=1, day=1, hour=0))
    # The datetime at which you want staking to finish.
    EndTime.set(datetime.datetime(year=2022, month=3, day=4, hour=0))

    OpenForBusiness.set(True)


@export
def addStakingTokens(amount: float):
    assert OpenForBusiness.get() == True, "This staking pool is not open right now."
    assert amount > 0, "You cannot stake a negative balance."

    user = ctx.caller

    # Take the staking tokens from the user's wallet
    STAKING_TOKEN.transfer_from(amount=amount, to=ctx.this, main_account=user)

    # Update the Staked amount
    staked = StakedBalance.get()
    new_staked_amount = staked + amount
    StakedBalance.set(new_staked_amount)

    # Update the Epoch
    epoch_index = decideIncrementEpoch(new_staked_amount=new_staked_amount)

    if Deposits[user] is False:
        Deposits[user] = []

    # Create a record of the user's deposit

    deposits = Deposits[user]

    deposits.append({"starting_epoch": epoch_index, "time": now, "amount": amount})

    Deposits[user] = deposits


@export
def withdrawYield(amount: float):
    assert amount > 0, "You cannot harvest a negative balance"

    user = ctx.caller
    deposits = Deposits[user]

    assert deposits is not False, "You have no deposit to withdraw yield from."

    # Calculate how much yield is due per deposit account
    withdrawn_yield = Withdrawals[user]
    harvestable_yield = 0

    for d in deposits:
        harvestable_yield += calculateYield(
            starting_epoch_index=d["starting_epoch"],
            start_time=d["time"],
            amount=d["amount"],
        )

    # Determine maximum amount of yield user can withdraw
    harvestable_yield -= withdrawn_yield

    yield_to_harvest = amount if amount < harvestable_yield else harvestable_yield

    assert yield_to_harvest > 0, "There is no yield to harvest right now :("

    # Take % of Yield Tokens, send it to dev fund
    dev_share = yield_to_harvest * DevRewardPct.get()

    if dev_share > 0:
        YIELD_TOKEN.transfer(to=DevRewardWallet.get(), amount=dev_share)

    # Send remanding Yield Tokens to user
    user_share = yield_to_harvest - dev_share
    YIELD_TOKEN.transfer(to=user, amount=user_share)

    Withdrawals[user] = withdrawn_yield + yield_to_harvest

    new_withdrawn_amount = WithdrawnBalance.get() + yield_to_harvest
    WithdrawnBalance.set(new_withdrawn_amount)


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
            starting_epoch_index=d["starting_epoch"],
            start_time=d["time"],
            amount=d["amount"],
        )
        stake_to_return += d["amount"]

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
        user_share = yield_to_harvest - dev_share
        YIELD_TOKEN.transfer(to=user, amount=user_share)

    # Reset User's Deposits
    Deposits[user] = False

    # Reset User's Withdrawal
    Withdrawals[user] = 0

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)
    new_withdrawn_amount = WithdrawnBalance.get() + yield_to_harvest
    WithdrawnBalance.set(new_withdrawn_amount)

    # Increment Epoch
    decideIncrementEpoch(new_staked_amount=new_staked_amount)


# This runs over each of the items in the user's Deposit
def calculateYield(starting_epoch_index, start_time, amount):
    current_epoch_index = getCurrentEpochIndex()
    this_epoch_index = starting_epoch_index
    y = 0
    while this_epoch_index <= current_epoch_index:
        this_epoch = Epochs[this_epoch_index]
        next_epoch = Epochs[this_epoch_index + 1]

        delta = 0

        if starting_epoch_index == current_epoch_index:
            delta = fitTimeToRange(now) - fitTimeToRange(start_time)
        elif this_epoch_index == starting_epoch_index:
            delta = fitTimeToRange(next_epoch["time"]) - fitTimeToRange(start_time)
        elif this_epoch_index == current_epoch_index:
            delta = fitTimeToRange(now) - fitTimeToRange(this_epoch["time"])
        else:
            delta = fitTimeToRange(next_epoch["time"]) - fitTimeToRange(
                this_epoch["time"]
            )

        pct_share_of_stake = 0
        if amount is not 0 and this_epoch["staked"] is not 0:
            pct_share_of_stake = amount / this_epoch["staked"]

        # These two lines below were causing some problems, until I used the decimal method. get a python expert to review.
        emission_rate_per_hour = this_epoch["amt_per_hr"]
        global_yield_this_epoch = delta.seconds * getEmissionRatePerSecond(
            emission_rate_per_hour
        )
        deposit_yield_this_epoch = global_yield_this_epoch * pct_share_of_stake
        y += deposit_yield_this_epoch

        this_epoch_index += 1

    return y


def fitTimeToRange(time: Any):
    if time < StartTime.get():
        time = StartTime.get()
    elif time > EndTime.get():
        time = EndTime.get()
    return time


def getCurrentEpochIndex():
    current_epoch_index = CurrentEpochIndex.get()
    return current_epoch_index


def decideIncrementEpoch(new_staked_amount: float):
    epoch_index = CurrentEpochIndex.get()
    this_epoch = Epochs[epoch_index]
    this_epoch_staked = this_epoch["staked"]
    delta = now - this_epoch["time"]
    delta_seconds = delta.seconds if delta.seconds > 0 else 0
    if (
        delta_seconds >= EpochMinTime.get()
        or this_epoch_staked is 0
        or maxStakedChangeRatioExceeded(
            new_staked_amount=new_staked_amount, this_epoch_staked=this_epoch_staked
        )
    ):
        epoch_index = incrementEpoch(new_staked_amount)
    return epoch_index


def maxStakedChangeRatioExceeded(new_staked_amount: float, this_epoch_staked: float):
    smaller = new_staked_amount if new_staked_amount <= this_epoch_staked else this_epoch_staked
    bigger = new_staked_amount if new_staked_amount >= this_epoch_staked else this_epoch_staked
    dif = bigger - smaller
    return (
        dif
    ) / this_epoch_staked >= EpochMaxRatioIncrease.get()


def incrementEpoch(new_staked_amount: float):
    current_epoch = CurrentEpochIndex.get()
    new_epoch_idx = current_epoch + 1
    CurrentEpochIndex.set(new_epoch_idx)
    Epochs[new_epoch_idx] = {
        "time": now,
        "staked": new_staked_amount,
        "amt_per_hr": Epochs[current_epoch]["amt_per_hr"],
    }
    return new_epoch_idx


@export
def changeAmountPerHour(amount_per_hour: float):
    assertOwner()
    current_epoch = CurrentEpochIndex.get()
    new_epoch_idx = current_epoch + 1
    CurrentEpochIndex.set(new_epoch_idx)
    setEmissionRatePerHour(amount=amount_per_hour)

    Epochs[new_epoch_idx] = {
        "time": now,
        "staked": StakedBalance.get(),
        "amt_per_hr": amount_per_hour,
    }


@export
def setEpochMinTime(min_seconds: float):
    assertOwner()
    assert min_seconds >= 0, "you must choose a positive value."
    EpochMinTime.set(min_seconds)


@export
def setEpochMaxRatioIncrease(ratio: float):
    assertOwner()
    assert ratio > 0, "must be a positive value"
    EpochMaxRatioIncrease.set(ratio)


def getEmissionRatePerSecond(emission_rate_per_hour: float):
    emission_rate_per_minute = emission_rate_per_hour / 60
    emission_rate_per_second = emission_rate_per_minute / 60
    return emission_rate_per_second


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
    assert amount < 1 and amount >= 0, "Amount must be a value between 0 and 1"
    DevRewardPct.set(amount)


def setEmissionRatePerHour(amount: float):
    assertOwner()
    EmissionRatePerHour.set(amount)


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


def assertOwner():
    assert Owner.get() == ctx.caller, "You must be the owner to call this function."


# This is only to be called in emergencies - the user will forgo their yield when calling this FN.


@export
def emergencyReturnStake():

    user = ctx.caller
    deposits = Deposits[user]

    assert Deposits[user] is not False, "This account has no deposits to return."

    stake_to_return = 0

    for d in deposits:
        stake_to_return += d["amount"]

    STAKING_TOKEN.transfer(to=user, amount=stake_to_return)
    Deposits[user] = False
    Withdrawals[user] = 0

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)
    decideIncrementEpoch(new_staked_amount=new_staked_amount)

