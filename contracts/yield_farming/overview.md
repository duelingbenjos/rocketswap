# Rocketswap Yield Farming v0.1

This document will give a rough overview of how the first iteration of yield farming will work on lamden.

As a user I can : 

* Deposit LP in vault contract
* Add more LP to contract without interupting yield farming.
* Withdraw some or all staked LP
* On withdrawal of any LP, all farmed tokens are credited to the user.
* Withdraw Farmed tokens at any point, without withdrawing LP

Contract Considerations

* The contract will decide how much yield a user is due by calculating the time delta between when the farming started and when the farming ceased
* Because it's possible to add more tokens during farming, it will be necessary to record the date and amount of each deposit.

```
// Schema

Deposits = Hash(default_value = False)
Withdrawals = Hash(default_value = False)

Deposits['TAUJEFF']['some_key']['deposits'] = []
Withdrawals['TAUJEFF']['some_key'] = 0

// on deposit

Deposits['TAUJEFF']['some_key'][].push({
    amount: 100
    time: now()
})

// total object would end up looking like : 
[
    {
        amount: 200,
        deposit_time: '20 January, 2020'
    },
    {
        amount: 100,
        deposit_time: '30 January, 2020'
    }
]

def calcFarmed(pair: str) :
    user = ctx.caller
    farmed = 0
    withdrawn = Withdrawals['TAUJEFF'][user]
    let pair_arr = Deposits[pair][user]
    for p in pair_arr:
        delta = p.time - now()
```
