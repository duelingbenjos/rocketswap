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

Distribution

Yield will be distributed at a fixed rate per vault over time, divided by the amount of participants, farming at that time.

Distribution Rate

The distribution rate will change periodically, depending on how many participants are farming at any one time.

Let's run the tape and see how it will work out

The pool distribution rate is going to be 100 RSWP/HOUR

* 22:00 Bob deposits 10 TAU to vault
  * Bob's rate is 100 RSWP per hour (10 RSWP per 1 TAU)

* 23:00 Janis deposits 5 TAU to vault
  * The rates are as follows 100 / 15 = 6.66 per hour / TAU staked
  Bob = 10 * 6.66 = 66.6
  Janis = 5 * 6.66 = 33.3

* 00:00 = Murray Joins and deposits 20
  * Rates are now as follows 100 / (10 + 5 + 20) = 2.85 Per hour / TAU staked
  Bob = 10 * 2.85 = 28.5
  Janis = 5 * 2.85 = 14.25
  Murray = 20 * 2.85 = 57

* 02:30 Pete joins and deposits 100
  * Rates are now as follows 100 / (10 + 5 + 20 + 100) = 0.74074074 Per hour / TAU staked
  Bob = 7.4074074
  Janis = 3.7037035
  Murray = 14.814799999999998
  Pete = 74.0744

* 4:30 Bob Decides to withdraw his stake
  * Bob is due to receive :
  22:00 - 23:00 = 100 RSWP
  23:00 - 00:00 = 66.66 RSWP
  00:00 - 02:30 = 71.25 RSWP
  02:30 - 04:30 = 14.8148148 RSWP

So how do we bookend the changes in rate so that they :
* Are easy to track from a data-schema point of view
* Don't require so much processing overhead to make stamp fees unmanagable

Epochs. *an event or a time marked by an event that begins a new period or development. b : a memorable event or date.*

Each time someone leaves or enters the farmm the Epoch is incremented, and an new Epoch object is created. :

```
{
    time: <starting time of next epoch (the turn of the next hour)>
    pool_value: <the total amount of tokens in the pool>
}
```

New joiners of the pool will create an object with the following schema :

```
Deposits['TAUJEFF'][vk].append({
    amount: 100
    epoch: current_epoch
})
```

  
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
