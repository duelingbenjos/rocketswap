## State

Owner = Variable()
Deposits = Hash(default_value = False)
Withdrawals = Hash(default_value = False)
CurrentEpochIndex = Variable()
Epochs = Hash(default_value = False)
Stash = Variable() # The total amount of token in the vault.

## Constants

EPOCH_LENGTH = 60 # Length of Epoch in minutes
EMISSION_RATE_HOURLY = 3000 # Per Hour
EMISSION_RATE_PER_MIN = EMISSION_RATE_HOURLY / 60 # Per Minute
EMISSION_RATE_PER_SEC = EMISSION_RATE_PER_MIN / 60 # Per Second


@construct
def seed():
    Owner.set(ctx.signer)
    CurrentEpochIndex.set(0)
    Stash.set(0)
    Epochs[0] = {
        "time": now,
        "stash": 0
    }

@export
def getCurrentEpochIndex():
    current_epoch_index = CurrentEpochIndex.get()
    return current_epoch_index

@export
def getEpochDetails(index: int):
    epoch_info = Epochs[index]
    return epoch_info

@export 
def getCurrentEpochDetails():
    index = getCurrentEpochIndex()
    current_epoch = Epochs[index]
    return current_epoch

def incrementEpoch():
    current_epoch = CurrentEpochIndex.get()
    CurrentEpochIndex.set(current_epoch + 1)

def addTokensToEpochTally(amount: float):
    epoch_index = getCurrentEpochIndex()
    Epochs[epoch_index]['stash'] += amount

def addTokensToNextEpochTally(amount: float):
    epoch_index = getCurrentEpochIndex()
    Epochs[epoch_index+1]['stash'] += amount

@export
def addTokens(amount: float):
    user = ctx.caller
    # Get time delta between now and last epoch
    # If delta is greater then the minutes constant, begin the next epoch

    current_epoch = getCurrentEpochDetails()
    time_delta = now - current_epoch['time']

    if time_delta.minutes >= EPOCH_LENGTH:
        incrementEpoch()

    if Deposits[user] is False:
        Deposits[user] = []

    # Create a record of the user's deposit
    Deposits[user].append({
        'starting_epoch': current_epoch,
        'time': now,
        'amount': amount
    })

    # Update the current epoch with the token amount

    addTokensToNextEpochTally(amount=amount)

    # Update the Stash

    stash = Stash.get()
    Stash.set(stash + amount)

@export
def withdrawTokensAndYield():
    user = ctx.caller
    deposits = Deposits[user]
    assert deposits is not False, "You have no deposit to withdraw"
    # Calculate how much yield is due per deposit account
    tokens_to_return = 0
    yield_to_harvest = 0
    for d in deposits:
        yield_to_harvest += calculateYield(starting_epoch_index=d.epoch, start_time=d.time, amount=d.amount)
        tokens_to_return += amount
    # Send Tokens to user
    
    # Take % of Yield, send it to dev fund
       
    # Send Yield to user

    # Reset User's Deposits

    # Remove token amount from Stash

def calculateYield(starting_epoch_index:int, start_time, amount:float):
    current_epoch_index = getCurrentEpochIndex()
    this_epoch_index = starting_epoch_index
    y = 0
    while this_epoch_index <= current_epoch_index:
        this_epoch = Epochs[this_epoch_index]
        next_epoch = Epochs[this_epoch_index+1]
        delta = None
        if this_epoch_index == starting_epoch_index:
            delta = next_epoch.time - start_time
        elif this_epoch_index == current_epoch_index:
            delta = now - this_epoch['time']
        else:
            delta = next_epoch['time'] - this_epoch['time']
        pct_share_of_stash = amount / Stash.get()
        global_yield_this_epoch = delta.seconds * EMISSION_RATE_PER_SEC
        deposit_yield_this_epoch = global_yield_this_epoch * pct_share_of_stash
        y += deposit_yield_this_epoch
    return y       

@export
def harvestYield():
    ## stub
    stub = True


@export
def testTime():
    d1 = datetime.datetime(year = 2019, month = 10, day = 11, hour = 12, minute = 10, second = 10)
    delta = now - d1

    return delta.seconds

@export
def testWhile():
    integer = 10
    while integer > 0 :
        integer -= 1



# @export 
# def get_delta_in_seconds(year:int, month: int, day: int, hour: int, minute: int, second: int):
#     start_date

# @export
# def get_rate_last_hour