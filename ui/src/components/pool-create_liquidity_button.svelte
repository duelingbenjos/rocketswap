<style>
    div{
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        padding: 20px 32px;
    }
    button{
        margin: auto 0;
    }
</style>

<div>
    <h2>Your Liquidity</h2>
    <button 
        class="nostyle outline info"
        on:click={() => location.assign('#/pool-create')}
    >Create Liquidity</button>
</div>