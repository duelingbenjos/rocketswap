export type TokenListType = {
  id: string
  token_name: string
  token_symbol: string
  contract_name: string
  base_supply?: number
  balance?: number
}

export type TokenSelectType = {
  open: boolean
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

export type PriceUpdateType = {
    contract_name: string
    price: number
    time: string
  }

export type TokenMetricsType = {
  [key: string]: PriceUpdateType
}
