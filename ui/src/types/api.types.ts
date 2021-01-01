export type TokenListType = {
  id: string
  token_name: string
  token_symbol: string
  contract_name: string
  base_supply?: string
  balance?: string
}

export type TokenSelectType = {
  open: boolean,
  content?: string,
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
  input_amount: number
}

export type MetricsUpdateType = {
  contract_name: string
  price: string
  time: string
  lp: string
  reserves: [string, string]
}

export type TokenMetricsType = {
  [key: string]: MetricsUpdateType
}
