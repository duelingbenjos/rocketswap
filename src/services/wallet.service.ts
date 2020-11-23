import WalletController from 'lamden_wallet_controller'

export class WalletService {
  public static getInstance() {
    if (!WalletService._instance) {
      WalletService._instance = new WalletService()
    }
    return WalletService._instance
  }
  private static _instance: WalletService

  lwc: WalletController

  constructor() {
    const connectionRequest = {
      appName: 'RocketSwap',
      version: '1.0.0',
      logo: 'images/logo.png',
      contractName: 'con_amm',
      currencySymbol: 'dTau', 
      // domainName: "https://demoapp.lamden.io",
      blockExplorer: 'https://testnet.lamden.io/api',
      masternode: 'https://testnet-master-1.lamden.io',
      networkType: 'testnet' // or 'mainnet'
    }

    this.lwc = new WalletController(connectionRequest)
    console.log(this.lwc)
    // Create event handlers
    const handleWalletInfo = (walletInfo) => console.log(walletInfo)
    const handleTxResults = (txInfo) => console.log(txInfo)

    //Connect to event emitters
    this.lwc.events.on('newInfo', handleWalletInfo) // Wallet Info Events, including errors
    this.lwc.events.on('txStatus', handleTxResults) // Transaction Results

    this.lwc.walletIsInstalled().then((installed) => {
      if (installed) console.log('wallet not installed')
      else this.lwc.sendConnection(connectionRequest)
    })
  }
}
