import { Writable, writable } from 'svelte/store'

import type { TokenListType } from './types/api.types'
import type { WalletType } from './types/wallet.types'

export const wallet_store: Writable<WalletType> = writable({ init: true })
export const amount_input_store: Writable<any> = writable('')
export const token_list_store: Writable<TokenListType[]> = writable([])
export const show_token_select_store: Writable<boolean> = writable(false)
export const swap_panel_store: Writable<SwapPanelType> = writable({
  slot_a: {
    position: 'from',
    role: 'currency'
  },
  slot_b: {
    position: 'to',
    role: 'token'
  }
})

export type SwapPanelType = {
  slot_a: SlotType
  slot_b: SlotType
}

export type SlotType = {
  position: 'from' | 'to'
  selected_token?: TokenListType
  role: 'currency' | 'token'
}
