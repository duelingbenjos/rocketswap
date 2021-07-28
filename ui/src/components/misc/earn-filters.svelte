<script>
    // Icons
    import DirectionalChevron from '../../icons/directional-chevron.svelte'

    // Misc
    import { earnFilters, farmFilter, farmFilterUpDown, farmStakedByMe, farmOpenForBusiness } from '../../store.js'
    import { setEarnFilters, setFarmFilter, setFarmFilterUpDown, setFarmStakedByMe, setFarmOpenForBusiness } from '../../utils.js'

    $: stakedByMeChecked = $farmStakedByMe
    $: openForBusinessChecked = $farmOpenForBusiness
    $: sortFilter = $farmFilter

    let sortOptions = [
        {
            name: "Alphabetically by reward token",
            value: "alpha_reward_token"
        },
        {
            name: "Alphabetically by staking token",
            value: "alpha_staking_token"
        },
        {
            name: "Apy",
            value: "apy"
        },
        {
            name: "Start Date",
            value: "start_date"
        },
        {
            name: "End Date",
            value: "end_date"
        }
    ]

    const handleChangedSort = (e) => setFarmFilter(e.target.value)

    const handleSearch = (e) => {
        console.log(e)
        if (e.target.value === "") setEarnFilters({...$earnFilters, search: null}) 
        else setEarnFilters({...$earnFilters, search: e.target.value.toLowerCase()})
    }

    const handleFarmFilterUpDownClick = () => {
        $farmFilterUpDown === "up" ? setFarmFilterUpDown("down") : setFarmFilterUpDown("up")
    }

        
    const handleStakedByMeChange = () => {
        setFarmStakedByMe(stakedByMeChecked)
    }

            
    const handleOpenForBusinessChange = () => {
        setFarmOpenForBusiness(openForBusinessChecked)
    }

</script>

<style>
    select{
        max-width: fit-content;
        font-size: 16px;
        padding: 6px 10px;
        font-weight: 200;
        margin: 0;
        height: 40px;
        border: 1px solid var(--text-color-highlight);
    }
    input{
        font-size: 16px;
        padding: 6px 10px;
        font-weight: 200;
        margin: 0;
        height: 40px;
        border: 1px solid var(--text-color-highlight);
    }
    .search-container{
        width: 100%;
        max-width: 300px;
        margin-left: 10px;
    }
    button{
        margin: 0 4px;
    }
    .layout-buttons{
        display: none;
    }
    input.primaryInput{
        height: 32px;
    }
    .chk-container{
        position: relative;
        top: 9px;
        margin-left: 10px;
        color: var(--text-color-highlight);
    }
    .chk-container > span{
        margin-right: 10px;
    }
    label.show-staked-by-me{
        color: var(--text-color-highlight);
    }
    @media screen and (min-width: 800px) {
        .layout-buttons{
            display: block;
        }
    }
</style>

<div class="flex-row flex-align-end">
    <div class="layout-buttons flex-row flex-grow">
        <div class="dropdown flex-col">
            <lable>Sort</lable>
            <div class="flex-row flex-align-center">
                <select bind:value={sortFilter} on:change={handleChangedSort}>
                    {#each sortOptions as option}
                        <option value={option.value} selected={option.value === $farmFilter ? "selected" : null}>{option.name}</option>
                    {/each}
                </select>

                <button class="flex" on:click={handleFarmFilterUpDownClick}>
                    <DirectionalChevron 
                        width="14px"
                        styles={`position: relative; ${$farmFilterUpDown === "up" ? "top: -4px;" : "top: 5px;"}`}
                        margin={"0 0 0 8px"}
                        direction={$farmFilterUpDown}
                        color={$farmFilterUpDown === "price_change" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                    />
                </button>

                <label class="flex-row chk-container" class:show-staked-by-me={$farmStakedByMe} id="chk-stakedByMe">
                    <input  type="checkbox" bind:checked={stakedByMeChecked} on:change={handleStakedByMeChange}>
                    <span  class="chk-checkmark chk-small"></span>
                    Staked by me
                </label>

                <label class="flex-row chk-container" class:show-staked-by-me={$farmOpenForBusiness} id="chk-openForBusiness">
                    <input  type="checkbox" bind:checked={openForBusinessChecked} on:change={handleOpenForBusinessChange}>
                    <span  class="chk-checkmark chk-small"></span>
                    Open For Business
                </label>

            </div>
        </div>
    </div>

    <div class="search-container flex-col">
        <lable>Search</lable>
        <input 
            class="primaryInput" 
            on:input={handleSearch} 
            value={$earnFilters?.search || ""}/>
    </div>

</div>