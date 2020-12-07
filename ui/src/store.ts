import { Writable, writable } from 'svelte/store'

import type { SwapPanelType, TokenListType, TokenMetricsType, TokenSelectType } from './types/api.types'
import type { WalletType } from './types/wallet.types'

export const wallet_store: Writable<WalletType> = writable({ init: true })
export const amount_input_store: Writable<any> = writable('')
export const token_list_store: Writable<TokenListType[]> = writable([])
export const show_token_select_store: Writable<TokenSelectType> = writable({ open: false })
export const swap_panel_store: Writable<SwapPanelType> = writable({
  slot_a: {
    position: 'from',
    role: 'currency',
    input_amount: null
  },
  slot_b: {
    position: 'to',
    role: 'token',
    input_amount: null
  }
})

export const pool_panel_store: Writable<SwapPanelType> = writable({
  slot_a: {
    position: 'from',
    role: 'currency',
    input_amount: null
  },
  slot_b: {
    position: 'to',
    role: 'token',
    input_amount: null
  }
})

export const token_metrics_store: Writable<TokenMetricsType> = writable({})


