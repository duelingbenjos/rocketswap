<script>
    //Icons
    import GridView from '../../icons/grid-view.svelte'
    import RowView from '../../icons/row-view.svelte'
    
    //Misc
    import { earnFilters } from '../../store.js'
    import { setEarnFilters } from '../../utils.js'
    
    const handleGridView = () => {
        if (!$earnFilters) return
        if ($earnFilters.rowView) setEarnFilters({...$earnFilters, rowView: false})
    }

    const handleRowView = () => {
        if (!$earnFilters) return
        if (!$earnFilters.rowView) setEarnFilters({...$earnFilters, rowView: true})
    }

    const handleSearch = (e) => {
        if (e.target.value.length > 0) setEarnFilters({...$earnFilters, search: e.target.value.toLowerCase()})
        else setEarnFilters({...$earnFilters, search: null})
    }

</script>

<style>
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

    @media screen and (min-width: 800px) {
        .layout-buttons{
            display: block;
        }
    }
</style>

<div class="flex-row flex-align-end">
    <div class="layout-buttons flex-row flex-grow">
        <button on:click={handleGridView} >
            <GridView 
                width="30px" 
                mainColor={$earnFilters?.rowView ? "secondary" : "primary"}/>
        </button>

        <button on:click={handleRowView}>
            <RowView 
                width="30px" 
                mainColor={!$earnFilters?.rowView ? "secondary" : "primary"}/>
        </button>
    </div>

    <div class="search-container flex-col">
        <lable>Search</lable>
        <input 
            class="primaryInput" 
            on:keydown={handleSearch} 
            value={$earnFilters?.search || ""}/>
    </div>

</div>