<script>
    // MISC
    import { homeFilters,homeFiltersApplied } from "../../store";
    import { updateHomeFilters } from "../../utils";

    $: showLowLiquidity = $homeFilters.showLowLiquidity || false
    $: showLowVolume = $homeFilters.showLowVolume || false
    $: showNotVerified = $homeFilters.showNotVerified || false
    $: filterApplied = showLowLiquidity || showLowVolume || showNotVerified || false

    let expanded = false;
    let multiselectElm

    const handleUpdateFilter = (filterName, new_value) => {
        console.log({filterName, new_value})
        updateHomeFilters(filterName, new_value)
    }

    const handleSearch = (e) => {
        if (e.target.value === "") updateHomeFilters("search", null) 
        else updateHomeFilters("search", e.target.value.toLowerCase()) 
    }
    

    function showCheckboxes() {
        var checkboxes = document.getElementById("checkboxes");
        if (!expanded) {
            checkboxes.style.display = "block";
            expanded = true;
        } else {
            checkboxes.style.display = "none";
            expanded = false;
        }
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
    .multiselect {
        position: relative;
        width: 200px;
    }
    select{
        font-size: 16px;
        width: 100%;
        height: 34px;
        padding: 2px 10px;
        font-weight: 200;
        margin-bottom: 0;
        border: 1px solid var(--text-color-highlight);
    }

    select.open{
        border-radius: var(--button-border-radius) var(--button-border-radius) 0 0;
    }

    .selectBox {
        position: relative;
    }

    .selectBox:hover > select {
        background: var(--dropdown-background);
        cursor: pointer;
    }

    .selectBox select {
        width: 100%;
    }

    .overSelect {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }

    #checkboxes {
        display: none;
        border: 1px #dadada solid;
        position: absolute;
        top: -1;
        z-index: 1;
        background: var(--color-secondary-dark);
        border: 1px solid var(--text-color-highlight);
        border-radius: 0 0 var(--button-border-radius) var(--button-border-radius);
        border-top: 1px;
        width: 100%;
        box-sizing: border-box;
    }

    #checkboxes label:hover {
        background-color: #1e90ff;
    }
    button{
        display: block;
        margin: 0.5rem auto 1rem;
    }
    .filters-badge{
        border: 1px solid var(--color-gray-5);
        border-radius: 99px;
        background-color: var(--color-primary);
        text-align: center;
        color: var(--color-gray-5);
        width: 22px;
        font-weight: 600;
        margin-left: 10px;
        font-size: 13px;
        cursor: pointer;
        margin: 0 10px 0 auto;
    }
    @media screen and (min-width: 2560px) {
        .container{
            max-width: 1020px;
        }
	}
    
</style>

<div class="container flex flex-row flex-wrap flex-align-center flex-justify-spacebetween" >
    <div class="flex-row flex-align-center ">
        <div class="multiselect" bind:this={multiselectElm}>
            <div class="selectBox" on:click={showCheckboxes}>
                <select class:open={expanded}>
                <option>{filterApplied ? "Filters Applied" : "Select Filter"}</option>
                </select>
                <div class="flex flex-align-center overSelect">
                    <div class="filters-badge" on:click={showCheckboxes}>{$homeFiltersApplied}</div>
                </div>
            </div>
            <div id="checkboxes">
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
                <label class="flex-row chk-container flex-align-center" class:checked={showNotVerified} id="chk-showNotVerified">
                    <input type="checkbox" bind:checked={$homeFilters.showNotVerified} on:change={(e) => handleUpdateFilter("showNotVerified", e.target.checked)}>
                    <span class="chk-checkmark chk-small"></span>
                    Show Not Verified
                </label>
                <button class="primary outline small" on:click={showCheckboxes}>close</button>
            </div>
        </div>
    </div>

    <!--
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
    -->
    <label class="search flex flex-align-center flex-grow ">
        Search
        <input 
            class="primaryInput" 
            on:input={handleSearch} 
            value={$homeFilters.search || ""}/>
    </label>
</div>
