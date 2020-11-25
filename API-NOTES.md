### DB Tables

* Token
    - chainId: string || number
    - address: string
    - name: string
    - symbol: string
    - decimals: number
    - logoURI: string

To calculate the trade details \/

```
def calculate_trade_details(tau_contract, token_contract, tau_in, token_in):
    # First we need to get tau + token reserve
    tau_reserve = pairs[tau_contract, token_contract, 'tau_reserve']
    token_reserve = pairs[tau_contract, token_contract, 'token_reserve']

    lp_total = tau_reserve * token_reserve

    # Calculate new reserve based on what was passed in
    tau_reserve_new = tau_reserve + tau_in if tau_in > 0 else 0
    token_reserve_new = token_reserve + token_in if token_in > 0 else 0

    # Calculate remaining reserve
    tau_reserve_new = lp_total / token_reserve_new if token_in > 0 else tau_reserve_new
    token_reserve_new = lp_total / tau_reserve_new if tau_in > 0 else token_reserve_new

    # Calculate how much will be removed
    tau_out = tau_reserve - tau_reserve_new if token_in > 0 else 0
    token_out = token_reserve - token_reserve_new if tau_in > 0  else 0

    # Finally, calculate the slippage incurred
    tau_slippage = (tau_reserve / tau_reserve_new) -1 if token_in > 0 else 0
    token_slippage = (token_reserve / token_reserve_new) -1 if tau_in > 0 else 0

    return tau_out, token_out, tau_slippage, token_slippage
```
