<script>
    import { getContext } from 'svelte'

    //Icons
    import DirectionalArrow from '../../icons/directional-arrow.svelte'

    const { pageStats } = getContext('pageContext') 

    pageStats.subscripbe

</script>

<div class="flex-row flex-align-center modal-confirm-item">
    <p class="text-primary-dim">Share Change</p>
    <div class="number flex-row flex-align-center">
        <span>{`${$pageStats.currentLpSharePercent}%`}</span>
        <DirectionalArrow width="14px" direction="right" margin="3px 5px 0 5px" color="var(--text-primary-color)"/>
        <span>{`${$pageStats.newLpSharePercent}%`}</span>
    </div>
</div>