import WalletController from 'lamden_wallet_controller'
import { WalletConnectedType, WalletErrorType, WalletInitType, walletStore, WalletType } from '../store'
import { config } from '../config'
import { refreshTAUBalance } from '../utils'

export class WalletService {
  public static getInstance() {
    if (!WalletService._instance) {
      WalletService._instance = new WalletService()
    }
    return WalletService._instance
  }
  private static _instance: WalletService
  private wallet_state: WalletType
  lwc: WalletController

  constructor() {
    this.lwc = new WalletController(config)
    walletStore.subscribe((update) => {
      this.wallet_state = update
    })

    //Connect to event emitters
    this.lwc.events.on('newInfo', handleWalletInfo) // Wallet Info Events, including errors
    this.lwc.events.on('txStatus', handleTxResults) // Transaction Results
    this.lwc.walletIsInstalled().then((installed) => {
      if (!installed) {
        console.info('wallet not installed')
        this.setNotInstalledError()
      }
      this.lwc.sendConnection(config)
    })
  }

  private setNotInstalledError() {
    setTimeout(() => {
      if (!isWalletConnected(this.wallet_state)) {
        walletStore.set({ errors: ['not_installed'] })
      }
    }, 3000)
  }
}

async function handleWalletInfo(wallet_update: WalletType) {
  let wallet_info: WalletType
  if (isWalletConnected(wallet_update)) {
    wallet_info = wallet_update
    if (wallet_info.wallets[0]) {
      wallet_info.balance = await refreshTAUBalance(wallet_info)
    }
  } else {
    wallet_info = wallet_update
  }
  walletStore.set(wallet_info)
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
