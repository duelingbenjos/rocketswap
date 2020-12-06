import WalletController from 'lamden_wallet_controller'
import { ApiService } from './api.service'
import { config } from '../config'
import { wallet_store } from '../store'
import type { WalletType, WalletErrorType, WalletInitType, WalletConnectedType } from '../types/wallet.types'
import { refreshTAUBalance } from '../utils'

export class WalletService {
  private static _instance: WalletService
  private wallet_state: WalletType
  private lwc: WalletController
  private apiService = ApiService.getInstance()

  public static getInstance() {
    if (!WalletService._instance) {
      WalletService._instance = new WalletService()
    }
    return WalletService._instance
  }

  constructor() {
    this.lwc = new WalletController(config)
    wallet_store.subscribe((update) => {
      console.log(update)
      this.wallet_state = update
    })

    // events
    this.lwc.events.on('newInfo', this.handleWalletInfo)
    this.lwc.events.on('txStatus', handleTxResults)
    setTimeout(() => {
      this.lwc.walletIsInstalled().then((installed) => {
        console.log(installed)
        if (!installed) {
          console.info('wallet not installed')
          this.setNotInstalledError()
        }
        this.lwc.sendConnection(config)
      },1000)
    })

    setInterval(() => {
      if (isWalletConnected(this.wallet_state) && this.wallet_state.wallets[0]) {
        this.updateBalances(this.wallet_state.wallets[0])
      } else if (isWalletError(this.wallet_state)) {
        // To Do finish this.
      }
    }, 1000)
  }

  private setNotInstalledError() {
    setTimeout(() => {
      console.log(this.wallet_state)
      if (!isWalletConnected(this.wallet_state) && !isWalletError(this.wallet_state)) {
        wallet_store.set({ errors: ['not_installed'] })
      }
    }, 3000)
  }

  private handleWalletInfo = async (wallet_update: WalletType) => {
    let wallet_info: WalletType
    console.log(wallet_info)
    if (isWalletConnected(wallet_update)) {
      wallet_info = wallet_update
      console.log(wallet_info)
      if (wallet_info.wallets[0]) {
        const vk = wallet_info.wallets[0]
        const balances = await this.getBalances(vk)
        wallet_info.balance = balances[1]
        wallet_info.tokens = balances[0]
      }
    } else {
      wallet_info = wallet_update
    }
    wallet_store.set(wallet_info)
  }

  private async updateBalances(vk?: string) {
    if (isWalletConnected(this.wallet_state)) {
      const res = await this.getBalances(vk)
      this.wallet_state.tokens = res[0]
      this.wallet_state.balance = res[1]
      wallet_store.set(this.wallet_state)
      // console.log(this.wallet_state)
    }
  }

  private async getBalances(vk: string) {
    const proms = [this.apiService.getTokenBalances(vk), refreshTAUBalance(vk)]
    return await Promise.all(proms)
  }

  public async buyTransation(args) {
    // this.lwc send transaction, with callback
    // update balances by calling updateBalances()
  }
}

export function handleBuyResult(res) {
  // Send info to toast controller / success | fail
  // refresh balance w/ masternode & backend API
}

async function handleTxResults(txInfo) {
  console.log(txInfo)
}

export function isWalletError(wallet_info: WalletType): wallet_info is WalletErrorType {
  return (wallet_info as WalletErrorType).errors !== undefined
}

export function isWalletInit(wallet_info: WalletType): wallet_info is WalletInitType {
  return (wallet_info as WalletInitType).init !== undefined
}

export function isWalletConnected(wallet_info: WalletType): wallet_info is WalletConnectedType {
  return (wallet_info as WalletConnectedType).wallets !== undefined
}
