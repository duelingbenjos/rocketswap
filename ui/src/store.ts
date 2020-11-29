import { Writable, writable } from 'svelte/store'
import type { TokenListType } from './types/api.types'
import type { WalletType, BalanceType } from './types/wallet.types'

export const walletStore: Writable<WalletType> = writable({ init: true })
export const balanceStore: Writable<BalanceType> = writable({})
export const amount_input_store: Writable<any> = writable('')
export const token_list_store: Writable<TokenListType[]> = writable([])
