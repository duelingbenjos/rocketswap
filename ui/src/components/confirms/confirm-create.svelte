<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';
    import ConfirmRates from './confirm-rates.svelte'

    //Icons
    import LamdenLogo from '../../icons/lamden-logo.svelte';
    import Base64SvgLogo from '../../icons/base64_svg.svelte';
    import CloseIcon from '../../icons/close.svelte';

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
    .modal-style{
        width: 290px;
    }
    .modal-sub-box{
        width: 345px;
    }
    .pair-display{
        margin: 1rem 0 1.5rem;
        align-items: center;
        justify-content: center;  
        font-weight: 400;
    }
    .separator{
        margin: 0 11px;
    }
    .text-bold{
        text-align: right;
    }
    .flex-row.text-bold{
        justify-content: flex-end;
    }
</style>
<div class="modal-style">
    <div class="flex-row modal-confirm-header">
        <p class="text-large margin-0">You are creating a pair</p>
        <button class="close nostyle" on:click={closeConfirm}>
            <CloseIcon />
        </button>
    </div>
    <div class="flex-row pair-display text-xxlarge">
        <LamdenLogo width="27px"  margin="0 5px 0 0"/>
        <span>{`${config.currencySymbol}`}</span>
        <span class="separator">/</span>
        <Base64SvgLogo string={selectedToken.logo_svg_base64} width="29px"  margin="0 5px 0 0"/>
        <span>{`${selectedToken.token_symbol}`}</span>
    </div>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">TAU Deposited</p>
            <p class="number">{stringToFixed(currencyAmount, 4)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">{`${selectedToken.token_symbol} Deposited`}</p>
            <p class="number">{stringToFixed(tokenAmount, 4)}</p>
        </div>
        <ConfirmRates 
            currencyPrice={stringToFixed($pageStats.quoteCalc.prices.currency, 4)}
            tokenPrice={stringToFixed($pageStats.quoteCalc.prices.token, 4)}
            {selectedToken}
        />
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">Share of Pool</p>
            <p class="number">100%</p>
        </div>
        <div class="modal-confirm-buttons flex-col">
            <Button style="primary full" loading={loading} callback={createMarket} text="Confirm Create Pair" />
        </div>
    </div>
</div>

<div class="modal-sub-box">
    By creating liquidity you'll earn 0.3% of all trades on the pair proportional to your share of the pool. 
    Fees added to the pool accrue in real time and can be reclaimed by withdrawing your liquidity.
</div>
