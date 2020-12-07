### TO-DO

##### Price Feed Type.



##### Integrate fns on API side

* sell

```
[
  {
    key: 'con_token_test14.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '99997895.168181818181818181818181817185' }
  },
  {
    key: 'con_token_test14.balances:con_amm2',
    value: { __fixed__: '2104.831818181818181818181818182815' }
  },
  {
    key: 'currency.balances:con_amm2',
    value: { __fixed__: '3005.792149232393864333794753630638' }
  },
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '1695.239150767606135666205246369362' }
  },
  {
    key: 'con_amm2.reserves:con_token_test14',
    value: [ [Object], [Object] ]
  },
  {
    key: 'con_amm2.prices:con_token_test14',
    value: { __fixed__: '0.995705277318910494151842936703' }
  }
]
```

* buy

```
[
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def:con_amm2',
    value: { __fixed__: '105900.0' }
  },
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '1594.681299999999999999999999999' }
  },
  {
    key: 'currency.balances:con_amm2',
    value: { __fixed__: '3110.000000000000000000000000001' }
  },
  {
    key: 'con_token_test14.balances:con_amm2',
    value: { __fixed__: '2004.831818181818181818181818182815' }
  },
  {
    key: 'con_token_test14.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '99997995.168181818181818181818181817185' }
  },
  {
    key: 'con_amm2.reserves:con_token_test14',
    value: [ [Object], [Object] ]
  },
  {
    key: 'con_amm2.prices:con_token_test14',
    value: { __fixed__: '1.097348904804982508167767416446' }
  }
]
```

* remove_liquidity

```
[
  {
    key: 'currency.balances:con_amm2',
    value: { __fixed__: '3010.000000000000000000000000001' }
  },
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '1698.481299999999999999999999999' }
  },
  {
    key: 'con_token_test14.balances:con_amm2',
    value: { __fixed__: '2100.000000000000000000000000001' }
  },
  {
    key: 'con_token_test14.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '99997899.999999999999999999999999999' }
  },
  {
    key: 'con_amm2.lp_points:con_token_test14:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '2100.0' }
  },
  {
    key: 'con_amm2.lp_points:con_token_test14',
    value: { __fixed__: '2100.0' }
  },
  {
    key: 'con_amm2.reserves:con_token_test14',
    value: [ { __fixed__: '100.0' }, { __fixed__: '100.0' }  ]
  }
]
```

* create_market

```
[
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def:con_amm2',
    value: { __fixed__: '109700.0' }
  },
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '4512.85130000' }
  },
  { key: 'currency.balances:con_amm2', value: { __fixed__: '300.0' } },
  {
    key: 'con_token_test7.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '99999900.0' }
  },
  {
    key: 'con_token_test7.balances:con_amm2',
    value: { __fixed__: '100.0' }
  },
  { key: 'con_amm2.prices:con_token_test7', value: { __fixed__: '1' } },
  { key: 'con_amm2.pairs:con_token_test7', value: true },
  {
    key: 'con_amm2.lp_points:con_token_test7:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: 100
  },
  { key: 'con_amm2.lp_points:con_token_test7', value: 100 },
  {
    key: 'con_amm2.reserves:con_token_test7',
    value: [  { __fixed__: '100.0' }, { __fixed__: '100.0' }  ]
  }
]
create_market
```

* approve
```
Found block for token con_token_test3
function : approve
[
  {
    key: 'con_token_test3.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def:con_amm2',
    value: { __fixed__: '100000.0' }
  },
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '4915.72130000' }
  }
]
```

* approve_liquidity

```
ignoring block for contract: con_amm2
[
  {
    key: 'con_amm2.lp_points:con_token_test4:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '100.0' }
  },
  {
    key: 'currency.balances:f8a429afc20727902fa9503f5ecccc9b40cfcef5bcba05204c19e44423e65def',
    value: { __fixed__: '4869.58130000' }
  }
] approve_liquidity
```
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
