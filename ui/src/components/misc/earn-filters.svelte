<script>
    // Icons
    import DirectionalChevron from '../../icons/directional-chevron.svelte'

    // Misc
    import { earnFilters, farmFilter, farmFilterUpDown, farmStakedByMe, farmShowClosed } from '../../store.js'
    import { setEarnFilters, setFarmFilter, setFarmFilterUpDown, setFarmStakedByMe, setFarmShowClosed } from '../../utils.js'

    $: stakedByMeChecked = $farmStakedByMe
    $: showClosedChecked = $farmShowClosed
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
            name: "APY %",
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

            
    const handleShowClosed = () => {
        setFarmShowClosed(showClosedChecked)
    }

</script>

<style>
    .container{
        display: flex;
        flex-direction: column-reverse;
        margin: 10px;
        margin-bottom: 2rem;
    }
    select{
        width: 100%;
        max-width: 280px;
        font-size: 16px;
        padding: 0 10px;
        font-weight: 200;
        margin: 0;
        height: 36px;
        border: 1px solid var(--text-color-highlight);
    }
    input{
        margin: 0;
    }

    .search-container{
        flex-grow: 1;
    }
    button{
        margin: 0 4px;
    }

    input.primaryInput{
        font-size: 16px;
        width: 100%;
        height: 34px;
        padding: 6px 10px;
        font-weight: 200;
        margin: 0;
        border: 1px solid var(--text-color-highlight);
        
    }

    .checkboxes{
        margin: 1rem 0 0.5rem;
        min-width: fit-content;
    }
    .chk-container{
        margin-right: 10px;
        color: var(--text-color-highlight);
        width: -webkit-fill-available;
        width: fit-content;
    }
    .chk-container > span{
        margin-right: 10px;
    }
    .chk-checkmark{
        margin-left: 0;
    }
    label.show-staked-by-me{
        color: var(--text-color-highlight);
    }
    label.search{
        width: 100%;
        max-width: 400px;
    }
    @media screen and (min-width: 600px) {
        .container{
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin: 10px;
        }
        .checkboxes{
            margin: 0 10px;
        }
        .chk-container{
            position: relative;
            top: 14px;
            margin-left: 10px;
        }
    }
    @media screen and (min-width: 850px) {
        .search-container{
            justify-content: flex-end;
        }
    }
</style>


<div class="container">
    <div class="dropdown flex-col">
        <label>Sort</label>
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
        </div>
    </div>
    <div class="checkboxes flex">
        <label class="flex-row chk-container flex-align-center" class:show-staked-by-me={$farmStakedByMe} id="chk-stakedByMe">
            <input  type="checkbox" bind:checked={stakedByMeChecked} on:change={handleStakedByMeChange}>
            <span  class="chk-checkmark chk-small"></span>
            Staked by me
        </label>

        <label class="flex-row chk-container flex-align-center" class:show-staked-by-me={$farmShowClosed} id="chk-showClosed">
            <input  type="checkbox" bind:checked={showClosedChecked} on:change={handleShowClosed}>
            <span  class="chk-checkmark chk-small"></span>
            Show closed
        </label>
    </div>

    <div class="search-container flex">
        <label class="search">
            Search
            <input 
                class="primaryInput" 
                on:input={handleSearch} 
                value={$earnFilters?.search || ""}/>
        </label>
    </div>
</div>