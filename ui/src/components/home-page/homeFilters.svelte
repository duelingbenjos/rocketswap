<script>
    // MISC
    import { homeFilters } from "../../store";
    import { updateHomeFilters } from "../../utils";

    $: showLowLiquidity = $homeFilters.showLowLiquidity || false
    $: showLowVolume = $homeFilters.showLowVolume || false

    const handleUpdateFilter = (filterName, new_value) => {
        console.log({filterName, new_value})
        updateHomeFilters(filterName, new_value)
    }

    const handleSearch = (e) => {
        if (e.target.value === "") updateHomeFilters("search", null) 
        else updateHomeFilters("search", e.target.value.toLowerCase()) 
    }

</script>

<style>
    .container{
        margin: 0 auto;
        max-width: 850px;
        padding: 18px 20px;
    }
    label{
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    label.checked{
        color: var(--text-color-highlight);
    }
    label.chk-container{
        color: var(--text-color-highlight);
    }
    input.primaryInput{
        font-size: 16px;
        width: 100%;
        height: 34px;
        padding: 6px 10px;
        font-weight: 200;
        margin: 0 0 0 10px;
        border: 1px solid var(--text-color-highlight);
        
    }
    label.search{
        width: 100%;
        max-width: 400px;
    }
    @media screen and (min-width: 2560px) {
        .container{
            max-width: 1020px;
        }
	}
    
</style>

<div class="container flex flex-row flex-wrap flex-align-center flex-justify-spacebetween">
    <div class="flex flex-wrap flex-align-center">
        <label class="flex-row chk-container flex-align-center m-r-20" class:checked={showLowLiquidity} id="chk-showLowLiquidity">
            <input type="checkbox" bind:checked={$homeFilters.showLowLiquidity} on:change={(e) => handleUpdateFilter("showLowLiquidity", e.target.checked)}>
            <span class="chk-checkmark chk-small"></span>
            Show Low Liquidity
        </label>
        <label class="flex-row chk-container flex-align-center" class:checked={showLowVolume} id="chk-showLowVolume">
            <input type="checkbox" bind:checked={$homeFilters.showLowVolume} on:change={(e) => handleUpdateFilter("showLowVolume", e.target.checked)}>
            <span class="chk-checkmark chk-small"></span>
            Show Low Volume
        </label>
    </div>

    <label class="search flex flex-align-center flex-grow ">
        Search
        <input 
            class="primaryInput" 
            on:input={handleSearch} 
            value={$homeFilters.search || ""}/>
    </label>
</div>