<script>
    import { getContext } from 'svelte';

    //Components
    import Button from '../button.svelte';
    import ConfirmRates from './confirm-rates.svelte'

    //Icons
    import LamdenLogo from '../../icons/lamden-logo.svelte';
    import TokenLogo from '../../icons/token-logo.svelte'
    import CloseIcon from '../../icons/close.svelte';

    //Services
    import { WalletService } from '../../services/wallet.service'
    const walletService = WalletService.getInstance()

    //Misc
    import { stringToFixed, refreshLpBalances } from '../../utils'
    import { config } from '../../config'

    //Props
    export let closeConfirm;

    const { pageStats, pageStores, resetPage } = getContext('pageContext')
    const { currencyAmount, tokenAmount, selectedToken } = pageStores

    let loading = false;

    const success = () => {
        finish();
        setTimeout(refreshLpBalances, 2500)
        setTimeout(refreshLpBalances, 10000)
        resetPage();
        closeConfirm();
    }

    const error = () => {
        finish()
    }

    const finish = () => {
        loading = false;
    }

  const createMarket = () => {
    if (!$currencyAmount || !$tokenAmount || !$selectedToken) return
    loading = true;
    walletService.createMarket({
      'contract': $selectedToken.contract_name,
      'currency_amount': {'__fixed__': stringToFixed($currencyAmount, 30)},
      'token_amount': {'__fixed__': stringToFixed($tokenAmount, 30)}
    }, $selectedToken, $tokenAmount, $currencyAmount, { success, error })
  }

</script>


<style>
    .modal-style{
        width: 100vw;
        max-width: 400px;
    }
    .modal-sub-box{
        width: 100vw;
        max-width: 380px;
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

    @media screen and (min-width: 430px) {
        .modal-style{
            margin-top: 8rem;
        }
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
        <TokenLogo tokenMeta={$selectedToken} width="29px"  margin="0 5px 0 0"/>
        <span>{`${$selectedToken.token_symbol}`}</span>
    </div>
    <div class="flex-col modal-confirm-details-box text-small weight-400">
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">TAU Deposited</p>
            <p class="number number-span">{stringToFixed($currencyAmount, 8)}</p>
        </div>
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">{`${$selectedToken.token_symbol} Deposited`}</p>
            <p class="number number-span">{stringToFixed($tokenAmount, 8)}</p>
        </div>
        <ConfirmRates 
            currencyPrice={stringToFixed($pageStats.quoteCalc.prices.currency, 8)}
            tokenPrice={stringToFixed($pageStats.quoteCalc.prices.token, 8)}
            {selectedToken}
        />
        <div class="flex-row modal-confirm-item">
            <p class="text-primary-dim">Share of Pool</p>
            <p class="number number-span">100%</p>
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
