<style>
    .container{
        box-sizing: border-box;
        justify-content: space-between;
        width: 100%;
        padding: 20px 0;
    }
    button{
        margin: auto 0 auto 0.5rem;
    }
    .buttons{
        align-items: center;
        justify-content: end;
    }
</style>

<div class="container flex-row">
    <h2>Your Liquidity</h2>
    <div class="buttons flex-row">
        <button 
            class="nostyle primary outline"
            on:click={() => location.assign('#/pool-create/')}
        >Create Liquidity</button>
        <button 
            class="nostyle primary"
            on:click={() => location.assign('#/pool-add/')}
        >Add Liquidity</button>
    </div>
</div>