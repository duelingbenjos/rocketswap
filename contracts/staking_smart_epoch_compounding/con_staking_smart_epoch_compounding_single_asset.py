# Imports

import con_basic_token

I = importlib

# Setup Tokens

STAKING_TOKEN = con_basic_token
YIELD_TOKEN = con_basic_token

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
decimal_converter_var = Variable()
TimeRampValues = Variable()
UseTimeRamp = Variable()
TrustedImporters = Variable()

# Vtoken
balances = Hash(default_value=0)


@construct
def seed():
    Owner.set(ctx.caller)
    DevRewardWallet.set(ctx.caller)
    CurrentEpochIndex.set(0)
    StakedBalance.set(0)
    WithdrawnBalance.set(0)
    EpochMaxRatioIncrease.set(1 / 2)
    EpochMinTime.set(0)
    UseTimeRamp.set(False)
    TimeRampValues.set(
        [
            {"lower": 0, "upper": 11, "multiplier": 0.1},
            {"lower": 11, "upper": 21, "multiplier": 0.2},
            {"lower": 21, "upper": 31, "multiplier": 0.3},
            {"lower": 31, "upper": 41, "multiplier": 0.4},
            {"lower": 41, "upper": 51, "multiplier": 0.5},
            {"lower": 51, "upper": 61, "multiplier": 0.6},
            {"lower": 61, "upper": 71, "multiplier": 0.7},
            {"lower": 71, "upper": 81, "multiplier": 0.8},
            {"lower": 81, "upper": 91, "multiplier": 0.9},
            {"lower": 91, "upper": 101, "multiplier": 1},
        ]
    )

    Epochs[0] = {"time": now, "staked": 0, "amt_per_hr": 3000}

    meta["version"] = "0.0.1"
    meta[
        "type"
    ] = "staking_smart_epoch_compounding_timeramp"  # staking || lp_farming || etcetera ...
    meta["STAKING_TOKEN"] = "con_basic_token"
    meta["YIELD_TOKEN"] = "con_basic_token"

    EmissionRatePerHour.set(3000)  # 1200000 RSWP per year = 10% of supply
    DevRewardPct.set(1 / 10)

    # The datetime from which you want to allow staking.
    StartTime.set(datetime.datetime(year=2018, month=1, day=1, hour=0))
    # The datetime at which you want staking to finish.
    EndTime.set(datetime.datetime(year=2022, month=3, day=4, hour=0))

    OpenForBusiness.set(True)


@export
def addStakingTokens(amount: float):
    user = ctx.caller
    deposit = Deposits[user]

    if deposit is False:
        return createNewDeposit(amount=amount, user_ctx="caller", from_contract=False)
    else:
        return increaseDeposit(amount=amount, user_ctx="caller", from_contract=False)


# This is called FROM the contract to which the yields will be staked.
# This contract name will need to be added to the "TrustedImporters" list on the foreign contract.
@export
def stakeFromContractProfits(contract: str):
    # import staking contract
    yield_contract = I.import_module(contract)
    # call withdraw function to this contract, take return value
    amount = yield_contract.exportYieldToForeignContract()
    # stake this value
    user = ctx.signer

    deposit = Deposits[user]

    if deposit is False:
        return createNewDeposit(amount=amount, user_ctx="caller", from_contract=True)
    else:
        return increaseDeposit(amount=amount, user_ctx="caller", from_contract=True)
        

def createNewDeposit(
    amount: float, user_ctx: str, from_contract: bool
):  # user_ctx will either be "caller" or "signer"
    assert OpenForBusiness.get() == True, "This staking pool is not open right now."
    assert amount > 0, "You must stake something."

    user = ctx.caller

    # Take the staking tokens from the user's wallet if the user has called this function via addStakingTokens
    if from_contract is False: 
        STAKING_TOKEN.transfer_from(amount=amount, to=ctx.this, main_account=user)

    # Update the Staked amount
    staked = StakedBalance.get()
    new_staked_amount = staked + amount
    StakedBalance.set(new_staked_amount)

    # Update the Epoch
    epoch_index = decideIncrementEpoch(new_staked_amount=new_staked_amount)

    # Create a record of the user's deposit

    Deposits[user] = {"starting_epoch": epoch_index, "time": now, "amount": amount}

    # mint vtoken equal to the deposit.
    mintVToken(amount=amount)
    return Deposits[user]


@export
def increaseDeposit(
    amount: float, user_ctx: str, from_contract: bool
):  # user_ctx will either be "caller" or "signer"

    user = ctx.caller if user_ctx is "caller" else "signer"
    assert OpenForBusiness.get() == True, "This staking pool is not open right now."
    assert amount >= 0, "You cannot stake a negative balance."

    deposit = Deposits[user]

    assert deposit is not False, "This user has no deposit to add to."

    # Take the staking tokens from the user's wallet
    if amount > 0 and from_contract is False:
        STAKING_TOKEN.transfer_from(amount=amount, to=ctx.this, main_account=user)

    withdrawn_yield = Withdrawals[user]
    yield_to_harvest = 0
    existing_stake = 0
    user_yield_share = 0
    start_time = False

    yield_to_harvest += calculateYield(deposit=deposit)
    start_time = deposit["time"]
    existing_stake = deposit["amount"]

    yield_to_harvest -= withdrawn_yield

    if yield_to_harvest > 0:

        # Take % of Yield Tokens, send it to dev fund
        dev_share = yield_to_harvest * DevRewardPct.get()
        if dev_share > 0:
            YIELD_TOKEN.transfer(to=DevRewardWallet.get(), amount=dev_share)

        # Send remanding Yield Tokens to user
        user_yield_share = yield_to_harvest - dev_share

    total_deposit_amount = user_yield_share + existing_stake + amount
    global_amount_staked = StakedBalance.get()
    new_global_staked = global_amount_staked + user_yield_share + amount
    StakedBalance.set(new_global_staked)
    WithdrawnBalance.set(WithdrawnBalance.get() + yield_to_harvest)

    mintVToken(amount=user_yield_share + amount)

    Withdrawals[user] = 0
    Deposits[user] = {
        "starting_epoch": decideIncrementEpoch(new_staked_amount=new_global_staked),
        "time": start_time,
        "amount": total_deposit_amount,
        "step_offset": now - start_time,
    }

    return Deposits[user]


def sendYieldToTarget(amount: float, target: str, user: str):

    deposit = Deposits[user]
    assert deposit is not False, "You have no deposit to withdraw yield from."

    # Calculate how much yield is due per deposit account
    withdrawn_yield = Withdrawals[user]
    harvestable_yield = 0

    harvestable_yield += calculateYield(deposit=deposit)

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
    YIELD_TOKEN.transfer(to=target, amount=user_share)

    Withdrawals[user] = withdrawn_yield + yield_to_harvest

    new_withdrawn_amount = WithdrawnBalance.get() + yield_to_harvest
    WithdrawnBalance.set(new_withdrawn_amount)

    return user_share


@export
def withdrawYield(amount: float):
    assert amount > 0, "You cannot harvest a negative balance"

    user = ctx.caller
    return sendYieldToTarget(amount=amount, target=user, user=user)


@export
def withdrawTokensAndYield():
    user = ctx.caller
    deposit = Deposits[user]

    assert deposit is not False, "You have no deposit to withdraw"

    # Calculate how much yield is due per deposit account
    withdrawn_yield = Withdrawals[user]
    stake_to_return = 0
    yield_to_harvest = 0
    user_share = 0

    yield_to_harvest += calculateYield(deposit=deposit)
    stake_to_return += deposit["amount"]

    # Send Staking Tokens to user
    STAKING_TOKEN.transfer(to=user, amount=stake_to_return)
    returnAndBurnVToken(amount=stake_to_return)

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

    return user_share


# This runs over each of the items in the user's Deposit
def calculateYield(deposit):
    starting_epoch_index = deposit.get("starting_epoch")
    deposit_start_time = deposit.get("time")
    amount = deposit.get("amount")
    step_offset = deposit.get("step_offset")

    if step_offset is not None:
        deposit_start_time = deposit_start_time + step_offset
    else:
        step_offset = now - now  # now - now // 0 delta

    current_epoch_index = getCurrentEpochIndex()
    this_epoch_index = starting_epoch_index

    y = 0
    time_step_multiplier = 1

    while this_epoch_index <= current_epoch_index:
        this_epoch = Epochs[this_epoch_index]
        next_epoch = Epochs[this_epoch_index + 1]

        if UseTimeRamp.get():
            time_ramp_delta = (
                fitTimeToRange(now) - fitTimeToRange(this_epoch["time"]) + step_offset
            )
            time_step_multiplier = findTimeRampStep(time_ramp_delta.days)

        delta = 0

        if starting_epoch_index == current_epoch_index:
            delta = fitTimeToRange(now) - fitTimeToRange(deposit_start_time)
        elif this_epoch_index == starting_epoch_index:
            delta = fitTimeToRange(next_epoch["time"]) - fitTimeToRange(
                deposit_start_time
            )
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
        decimal_converter_var.set(pct_share_of_stake)
        pct_share_of_stake = decimal_converter_var.get()
        deposit_yield_this_epoch = (
            global_yield_this_epoch * pct_share_of_stake * time_step_multiplier
        )
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
    epoch_index = getCurrentEpochIndex()
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
    smaller = (
        new_staked_amount
        if new_staked_amount <= this_epoch_staked
        else this_epoch_staked
    )
    bigger = (
        new_staked_amount
        if new_staked_amount >= this_epoch_staked
        else this_epoch_staked
    )
    dif = bigger - smaller
    if this_epoch_staked is 0 :
        return true
    return (dif) / this_epoch_staked >= EpochMaxRatioIncrease.get()


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
    current_epoch = getCurrentEpochIndex()
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
    assert amount > 0, "Yield token amount must be greater than 0"
    staked_balance = StakedBalance.get()
    yield_balances = ForeignHash(
        foreign_contract=meta["YIELD_TOKEN"], foreign_name="balances"
    )
    total_in_contract = yield_balances[ctx.this]
    total_available = total_in_contract - staked_balance
    amount_to_recover = amount if amount <= total_available else total_available
    YIELD_TOKEN.transfer(amount=amount_to_recover, to=Owner.get())


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
    deposit = Deposits[user]

    assert Deposits[user] is not False, "This account has no deposits to return."

    stake_to_return = 0

    stake_to_return += deposit["amount"]

    STAKING_TOKEN.transfer(to=user, amount=stake_to_return)
    returnAndBurnVToken(amount=stake_to_return)
    Deposits[user] = False
    Withdrawals[user] = 0

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)
    decideIncrementEpoch(new_staked_amount=new_staked_amount)


@export
def toggleTimeRamp(on: bool):
    assertOwner()
    UseTimeRamp.set(on)


def findTimeRampStep(days: int):
    time_ramps = TimeRampValues.get()
    step = None
    for s in time_ramps:
        if s["lower"] <= days and s["upper"] > days:
            step = s
    if step is None:
        return time_ramps[len(time_ramps) - 1]["multiplier"]
    return step["multiplier"]


@export
def setTimeRampValues(data: list):
    assertOwner()
    TimeRampValues.set(data)


# VTOKEN METHODS
@export
def transfer(amount: float, to: str):
    assert amount > 0, "Cannot send negative balances!"
    assert balances[ctx.caller] >= amount, "Not enough VTOKENS to send!"
    balances[ctx.caller] -= amount
    balances[to] += amount


@export
def approve(amount: float, to: str):
    assert amount > 0, "Cannot send negative balances!"
    balances[ctx.caller, to] += amount


@export
def transfer_from(amount: float, to: str, main_account: str):
    assert amount > 0, "Cannot send negative balances!"

    assert (
        balances[main_account, ctx.caller] >= amount
    ), "Not enough coins approved to send! You have {} and are trying to spend {}".format(
        balances[main_account, ctx.caller], amount
    )
    assert balances[main_account] >= amount, "Not enough coins to send!"
    balances[main_account, ctx.caller] -= amount
    balances[main_account] -= amount
    balances[to] += amount


def returnAndBurnVToken(amount: float):
    user = ctx.caller
    assert (
        balances[user] >= amount
    ), "Your VTOKEN balance is too low to unstake, recover your VTOKENS and try again."
    balances[user] -= amount


def mintVToken(amount: float):
    user = ctx.signer
    balances[user] += amount