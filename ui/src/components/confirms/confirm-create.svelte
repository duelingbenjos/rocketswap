<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';

    //Icons
    import LamdenLogo from '../../icons/lamden-logo.svelte';
    import Base64SvgLogo from '../../icons/base64_svg.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed } from '../../utils'
    import { config } from '../../config'

    //Props
    export let selectedToken;
    export let currencyAmount;
    export let tokenAmount;
    export let closeConfirm;

    const { pageStats, resetPage } = getContext('pageContext')

    let loading = false;

    const success = () => {
        loading = false;
        resetPage();
        closeConfirm();
    }

    const error = () => {
        loading = false;
    }

  const createMarket = () => {
    if (!currencyAmount || !tokenAmount || !selectedToken) return
    loading = true;
    walletService.createMarket({
      'contract': selectedToken.contract_name,
      'currency_amount': {'__fixed__': stringToFixed(currencyAmount.toString(), 30)},
      'token_amount': {'__fixed__': stringToFixed(tokenAmount.toString(), 30)}
    }, selectedToken, tokenAmount, currencyAmount, { success, error })
  }

</script>


<style>
    .rates{
        margin-top: 0.5rem;
    }
    .modal-style{
        width: 380px;
    }
    .modal-sub-box{
        width: 360px;
    }
    .rates > p {
        margin: 0.5px 0;
    }
    .pair-display{
        margin: 2rem 0 3rem;
        align-items: center;
        justify-content: center;  
    }
    .separator{
        margin: 0 15px;
    }
    .modal-confirm-details-box{
        padding-top: 1rem;
    }

</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0">You are creating a pool</p>
        <button class="nostyle" on:click={closeConfirm}>
            <img class="confirm-modal-close-img" src="assets/images/cancel.svg" alt="" />
        </button>
    </div>
    <div class="flex-row pair-display text-xlarge text-bold">
        <LamdenLogo width="35px" height="30px" margin="0 5px 0 0"/>
        <span>{`${config.currencySymbol}`}</span>
        <span class="separator">/</span>
        <Base64SvgLogo string={selectedToken.logo_svg_base64} width="30px" height="35px" margin="0 5px 0 0"/>
        <span>{`${selectedToken.token_symbol}`}</span>
    </div>
    <div class="flex-col modal-confirm-details-box">
        <div class="flex-row modal-confirm-item">
            <p>TAU Deposited</p>
            <p class="text-bold">{stringToFixed(currencyAmount, 4)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p>{`${selectedToken.token_symbol} Deposited`}</p>
            <p class="text-bold">{stringToFixed(tokenAmount, 4)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p>Rates</p>
            <div class="flex-col rates">
                <p class="text-bold">{`1 TAU = ${stringToFixed($pageStats.quoteCalc.prices.currency, 4)} ${selectedToken.token_symbol}`}</p>
                <p class="text-bold">{`1 ${selectedToken.token_symbol} = ${stringToFixed($pageStats.quoteCalc.prices.token, 4)} TAU`}</p>
            </div>
        </div>
        <div class="flex-row modal-confirm-item">
            <p>Share of Pool</p>
            <p class="text-bold">100%</p>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="secondary" loading={loading} callback={createMarket} text="Confirm Create Supply" />
        </div>
    </div>
</div>

<div class="modal-sub-box">
    By creating liquidity you'll earn 0.3% of all trades on the pair proportional to your share of the pool. 
    Fees added to the pool accrue in real time and can be reclaimed by withdrawing your liquidity.
</div>
