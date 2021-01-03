import type BigNumber from 'bignumber.js'

export type TokenListType = {
  id: string
  token_name: string
  token_symbol: string
  contract_name: string
  base_supply?: BigNumber
  balance?: BigNumber
}

export type TokenSelectType = {
  open: boolean
  content?: string
  context?: 'pool' | 'swap'
}

export type SwapPanelType = {
  slot_a: SlotType
  slot_b: SlotType
}

export type SlotType = {
  position: 'from' | 'to'
  selected_token?: TokenListType
  role: 'currency' | 'token'
  input_amount: string
}

export type MetricsUpdateType = {
  contract_name: string
  price: BigNumber
  time: string
  lp: BigNumber
  reserves: [BigNumber, BigNumber]
}

export type TokenMetricsType = {
  [key: string]: MetricsUpdateType
}
