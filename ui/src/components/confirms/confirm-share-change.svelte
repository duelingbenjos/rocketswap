<script>
    import { getContext } from 'svelte'

    //Icons
    import DirectionalArrow from '../../icons/directional-arrow.svelte'

    const { pageStats } = getContext('pageContext') 

    pageStats.subscripbe

</script>

<div class="flex-row flex-align-center modal-confirm-item text-gray-3">
    <p>Share Change</p>
    <div class="number flex-row flex-align-center text-primary-inverted">
        <span>{`${$pageStats.currentLpSharePercent}%`}</span>
        <DirectionalArrow width="14px" direction="right" margin="0 3px 0 11px" color="var(--text-primary-inverted)"/>
        <span>{`${$pageStats.newLpSharePercent}%`}</span>
    </div>
</div>