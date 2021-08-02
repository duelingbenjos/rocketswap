# Imports

# import currency
import con_basic_token
import dex

# Setup Tokens

DEX = dex
LIQUIDITY_TOKEN = "con_rswp"
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
    TrustedImporters.set([])

    Epochs[0] = {"time": now, "staked": 0, "amt_per_hr": 3000}
    EmissionRatePerHour.set(3000)  # 1200000 RSWP per year = 10% of supply

    meta["version"] = "0.5"
    meta["type"] = "liquidity_mining_smart_epoch"  # staking || lp_farming
    meta["STAKING_TOKEN"] = "con_rswp_lp"
    meta["YIELD_TOKEN"] = "con_basic_token"

    DevRewardPct.set(1 / 10)

    StartTime.set(datetime.datetime(year=2018, month=1, day=1, hour=0))
    EndTime.set(datetime.datetime(year=2022, month=3, day=4, hour=0))

    OpenForBusiness.set(True)


@export
def addStakingTokens(amount: float):
    user = ctx.caller
    deposit = Deposits[user]

    if deposit is False:
        return createNewDeposit(amount=amount)
    else:
        return increaseDeposit(amount=amount)


def createNewDeposit(
    amount: float
):
    assert OpenForBusiness.get() == True, "This staking pool is not open right now."
    assert amount > 0, "You must stake something."

    user = ctx.caller

    # Take the staking tokens from the user's wallet
    DEX.transfer_liquidity_from(
        contract=LIQUIDITY_TOKEN, to=ctx.this, main_account=user, amount=amount
    )

    # Update the Staked amount
    staked = StakedBalance.get()
    new_staked_amount = staked + amount
    StakedBalance.set(new_staked_amount)

    # Update the Epoch
    epoch_index = decideIncrementEpoch(new_staked_amount=new_staked_amount)

    # Create a record of the user's deposit

    Deposits[user] = {
        "starting_epoch": epoch_index,
        "time": now,
        "amount": amount,
        "user_yield": 0,
    }

    # mint vtoken equal to the deposit.
    mintVToken(amount=amount)
    return Deposits[user]


@export
def increaseDeposit(
    amount: float
):

    user = ctx.caller
    assert OpenForBusiness.get() == True, "This staking pool is not open right now."
    assert amount > 0, "You cannot stake a negative balance."

    deposit = Deposits[user]

    assert deposit is not False, "This user has no deposit to add to."

    # Take the staking tokens from the user's wallet
    DEX.transfer_liquidity_from(
        contract=LIQUIDITY_TOKEN, to=ctx.this, main_account=user, amount=amount
    )

    withdrawn_yield = Withdrawals[user]
    user_yield = deposit["user_yield"]
    existing_stake = deposit["amount"]
    start_time = False

    user_yield += calculateYield(deposit=deposit)
    start_time = deposit["time"]
    existing_stake = deposit["amount"]

    total_deposit_amount = existing_stake + amount
    global_amount_staked = StakedBalance.get()
    new_global_staked = global_amount_staked + amount
    StakedBalance.set(new_global_staked)

    mintVToken(amount=amount)

    Deposits[user] = {
        "starting_epoch": decideIncrementEpoch(new_staked_amount=new_global_staked),
        "time": now,
        "amount": total_deposit_amount,
        "user_yield": user_yield,
    }

    return Deposits[user]


@export
def withdrawYield(amount: float):
    assert amount > 0, "You cannot harvest a negative balance"

    user = ctx.caller
    deposit = Deposits[user]

    assert deposit is not False, "You have no deposit to withdraw yield from."

    # Calculate how much yield is due per deposit account
    withdrawn_yield = Withdrawals[user]
    harvestable_yield = deposit["user_yield"]

    harvestable_yield += calculateYield(deposit=deposit)

    # Determine maximum amount of yield user can withdraw
    harvestable_yield -= withdrawn_yield

    yield_to_harvest = amount if amount < harvestable_yield else harvestable_yield

    assert yield_to_harvest > 0, "There is no yield to harvest right now :("

    # Take % of Yield Tokens, send it to dev fund
    dev_share = yield_to_harvest * DevRewardPct.get()

    if dev_share > 0:
        YIELD_TOKEN.transfer(to=DevRewardWallet.get(), amount=dev_share)
        # DEX.transfer_liquidity(contract=LIQUIDITY_TOKEN, to=user, amount=amount)

    # Send remanding Yield Tokens to user
    user_share = yield_to_harvest - dev_share
    YIELD_TOKEN.transfer(to=user, amount=user_share)

    Withdrawals[user] = withdrawn_yield + yield_to_harvest

    new_withdrawn_amount = WithdrawnBalance.get() + yield_to_harvest
    WithdrawnBalance.set(new_withdrawn_amount)


@export
def withdrawTokensAndYield():
    user = ctx.caller
    deposit = Deposits[user]

    assert deposit is not False, "You have no deposit to withdraw"

    # Calculate how much yield is due per deposit account
    withdrawn_yield = Withdrawals[user]
    stake_to_return = deposit["amount"]
    yield_to_harvest = deposit["user_yield"]

    yield_to_harvest += calculateYield(deposit=deposit)

    # Send Staking Tokens to user
    DEX.transfer_liquidity(contract=LIQUIDITY_TOKEN, to=user, amount=stake_to_return)

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
    returnAndBurnVToken(amount=stake_to_return)
    StakedBalance.set(new_staked_amount)
    new_withdrawn_amount = WithdrawnBalance.get() + yield_to_harvest
    WithdrawnBalance.set(new_withdrawn_amount)

    # Increment Epoch
    decideIncrementEpoch(new_staked_amount=new_staked_amount)


# This runs over each of the items in the user's Deposit
def calculateYield(deposit):
    starting_epoch_index = deposit.get("starting_epoch")
    start_time = deposit.get("time")
    amount = deposit.get("amount")

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
        decimal_converter_var.set(pct_share_of_stake)
        pct_share_of_stake = decimal_converter_var.get()
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
    if this_epoch_staked < 0.0001 :
        return true
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
    return (dif) / this_epoch_staked >= EpochMaxRatioIncrease.get()


def incrementEpoch(new_staked_amount: float):
    current_epoch = getCurrentEpochIndex()
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


@export
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
    deposit = Deposits[user]

    assert Deposits[user] is not False, "This account has no deposits to return."

    stake_to_return = deposit["amount"]

    DEX.transfer_liquidity(contract=LIQUIDITY_TOKEN, to=user, amount=stake_to_return)
    returnAndBurnVToken(amount=stake_to_return)
    Deposits[user] = False
    Withdrawals[user] = 0

    # Remove token amount from Staked
    new_staked_amount = StakedBalance.get() - stake_to_return
    StakedBalance.set(new_staked_amount)
    decideIncrementEpoch(new_staked_amount=new_staked_amount)


@export
def exportYieldToForeignContract():
    calling_contract = ctx.caller
    user = ctx.signer
    withdrawn_yield = Withdrawals[user]

    # verify that the contract is calling it is trusted.
    assert (
        calling_contract in TrustedImporters.get()
    ), "The calling contract is not in the trusted importers list."

    transferred = sendYieldToTarget(
        amount=999999999999,
        target=calling_contract,
        user=user,  # big number - transfers all yield.
    )
    return transferred


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
def addToTrustedImporters(contract: str):
    assertOwner()
    trusted_importers = TrustedImporters.get()
    trusted_importers.append(contract)
    TrustedImporters.set(trusted_importers)


@export
def removeFromTrustedImporters(contract: str):
    assertOwner()
    trusted_importers = TrustedImporters.get()
    trusted_importers.remove(contract)
    TrustedImporters.set(trusted_importers)


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
    user = ctx.caller
    balances[user] += amount