<script>
    // Misc
    import { payInRswp } from '../../store'
    import { setPayInRswp } from '../../utils' 

    $: checked = $payInRswp;

    const handleCheckChange = () => {
        setPayInRswp(checked)
    }
</script>

<style>
    label{
        margin: 0 0 0 auto;
    }
    label.pay-in-rswp{
        color: var(--text-color-highlight);
    }
</style>

<label class="flex-row chk-container text-color-dim" class:pay-in-rswp={$payInRswp} id="chk-all">
    Pay all Fees in RSWP (30% discount)
    <input  type="checkbox" bind:checked on:change={handleCheckChange}>
    <span  class="chk-checkmark chk-small"></span>
</label>