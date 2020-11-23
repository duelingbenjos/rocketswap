<script lang="ts">
  import { onMount } from 'svelte'
  import { WalletService } from '../services/wallet.service'
  import WalletController from 'lamden_wallet_controller'

  import Input from './input.svelte'
  import Quote from './quote.svelte'
  import SwapButtons from './swap-buttons.svelte'

  //   onMount(() => {
  const connectionRequest = {
    appName: 'RocketSwap', // Your DAPPS's name
    version: '1.0.0', // any version to start, increment later versions to update connection info
    logo: 'images/logo.png', // or whatever the location of your logo
    contractName: 'con_amm',
    currencySymbol: 'dTau', //   domainName: "https://demoapp.lamden.io",
    blockExplorer: 'https://testnet.lamden.io/api',
    masternode: 'https://testnet-master-1.lamden.io',
    networkType: 'testnet' // other option is 'mainnet'
  }
  const walletService = WalletService.getInstance()

  //   let lwc = new WalletController(connectionRequest)
  //   console.log(lwc)
  //   // Create event handlers
  //   const handleWalletInfo = (walletInfo) => console.log(walletInfo)
  //   const handleTxResults = (txInfo) => console.log(txInfo)

  //   //Connect to event emitters
  //   lwc.events.on('newInfo', handleWalletInfo) // Wallet Info Events, including errors
  //   lwc.events.on('txStatus', handleTxResults) // Transaction Results

  //   lwc.walletIsInstalled().then((installed) => {
  //     if (installed) console.log('wallet not installed')
  //     else console.log('wallet installed')
  //     lwc.sendConnection()
  //   })
</script>

<div class="container">
  <Input />
  <div class="switch-symbols-cont"><button><img src="/assets/images/down-arrow.svg" alt="" /> </button></div>
  <Input />
  <Quote />
  <SwapButtons />
</div>

<style>
  .switch-symbols-cont {
    margin: 0 auto;
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }

  .container {
    background-color: #875dd6;
    /* height: 556px; */
    width: 556px;
    border-radius: 60px;
    box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
    padding-top: 50px;
    /* display: flex; */
    /* flex-direction: column;
    align-content: center; */
  }

  button,
  input[type='submit'],
  input[type='reset'] {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
</style>
