<script>
    // Icons
    import DirectionalChevron from '../../icons/directional-chevron.svelte'

    // Misc
    import { earnFilters, farmFilter, farmFilterUpDown } from '../../store.js'
    import { setEarnFilters, setFarmFilter, setFarmFilterUpDown } from '../../utils.js'

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
        },
        {
            name: "Value of total staked token",
            value: "total_value_of_staked"
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

</script>

<style>
    select{
        max-width: fit-content;
        font-size: 16px;
        padding: 6px 10px;
        font-weight: 200;
        margin: 0;
    }
    input{
        font-size: 16px;
        padding: 6px 10px;
        font-weight: 200;
        margin: 0;
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
                        styles={`position: relative; ${$farmFilterUpDown === "up" ? "top: -5px;" : "top: 4px;"}`}
                        margin={"0 0 0 8px"}
                        direction={$farmFilterUpDown}
                        color={$farmFilterUpDown === "price_change" ? "var(--text-color-highlight)" : "var(--text-primary-color-dim)"}
                    />
                </button>
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