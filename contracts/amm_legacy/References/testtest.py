import submission
@export
def createChildContract(AMMAddress: str, tokenAddress: str):
    contract = """# you must transfer 0.01 TAU and the equivalent in your Token to ctx.this to start liquidity. It's a hack, but I really don't want to think about liquidity logic any more
                  # your currency must have the following and follow the currency format: approve, transfer_from, balance_of, transfer

import currency
import {}

liquidityTokenBalance = Hash(default_value=0)
totalLiquidityTokens = 100

@export
def tradeTAUForToken(amount: int, fromAddress: str):
    assert amount > 0, 'Cannot send negative balance'
    inputReserve = currency.balance_of(ctx.this)
    outputReserve = {}.balance_of(ctx.this)
    assert input_reserve > 0 and output_reserve > 0
    numerator = amount * outputReserve
    denominator = (inputReserve * 1000) + amount
    amount = numerator / denominator
    currency.transfer_from(amount, ctx.this, fromAddress)
    {}.transfer(amount, fromAddress)

@export
def tradeTAUForToken(amount: int, fromAddress: str):
    assert amount > 0, 'Cannot send negative balance'
    outputReserve = currency.balance_of(ctx.this)
    inputReserve = {}.balance_of(ctx.this)
    assert input_reserve > 0 and output_reserve > 0
    numerator = amount * outputReserve
    denominator = (inputReserve * 1000) + amount
    amount = numerator / denominator
    {}.transfer_from(amount, ctx.this, fromAddress)
    currency.transfer(amount, fromAddress)

@export
def addLiquidity(amountInTAU:int):
    assert amountInTAU > 0, 'Cannot add negative liquidity'
    tokenReserve = {}.balance_of(ctx.this)
    TAUReserve = currency.balance_of(ctx.this)
    currency.transfer_from(amountInTau, ctx.this, ctx.caller)
    {}.transfer_from((amountInTau * {}.balance_of(ctx.this) / currency.balance_of(ctx.this)), ctx.this, ctx.caller)
    tokenWorthInTAU = TAUReserve / totalLiquidityTokens
    tokenAmount = amountInTAU / tokenWorthInTAU
    liquidityTokenBalance[ctx.caller] += tokenAmount
    totalLiquidityTokens += tokenAmount
    return tokenAmount

@export
def removeLiquidity(amount:int):
    assert amountInTAU > 0, 'Cannot add negative liquidity'
    assert totalLiquidityTokens > 0
    assert liquidityTokenBalance > 0
    liquidityTokenBalance[ctx.caller] -= amount
    totalLiquidityTokens -= amount
    percentOfPool = amount / totalLiquidityTokens
    tokenPayout = {}.balance_of(ctx.this) * percentOfPool
    TAUPayout = currency.balance_of(ctx.this) * percentOfPool
    currency.transfer(TAUPayout, ctx.caller)
    {}.transfer(tokenPayout, ctx.caller)
    return TAUPayout, tokenPayout

@export
def transfer(amount: int, receiver: str):
    #Transfer liquidity token
    assert amount > 0, 'Cannot send negative balance'
    sender = ctx.caller
    balance = liquidityTokenBalance[sender]
    assert balance >= amount, "Transfer amount exceeds available balance"
    liquidityTokenBalance[sender] -= amount
    liquidityTokenBalance[receiver] += amount

@export
def liquidityRatio():
    tokenReserve = {}balance_of(ctx.this)
    TAUReserve = currency.balance_of(ctx.this)
    return TAUReserve, tokenReserve
""".format(tokenAddress,tokenAddress,tokenAddress,tokenAddress,tokenAddress,tokenAddress,tokenAddress,tokenAddress,tokenAddress,tokenAddress,tokenAddress)
submission.submit_contract(AMMAddress, contract)
submission.change_developer(AMMAddress, ctx.caller)