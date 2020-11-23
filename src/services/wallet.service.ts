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
      appName: 'RocketSwap', // Your DAPPS's name
      version: '1.0.0', // any version to start, increment later versions to update connection info
      logo: 'images/logo.png', // or whatever the location of your logo
      contractName: 'con_killer_app', // Will never change
      networkType: 'testnet' // other option is 'mainnet'
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
