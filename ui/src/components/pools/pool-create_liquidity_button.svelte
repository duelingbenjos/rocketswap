<style>
    .container{
        flex-direction: column;
        box-sizing: border-box;
        justify-content: center;
        width: 100%;
        padding: 0px 20px;
    }
    button{
        font-size: var(--text-size-xsmall);
        margin: auto 0 auto 0.5rem;
        min-width: fit-content;
    }
    .buttons{
        align-items: center;
        justify-content: center;
        margin: 1rem 0 2rem;
    }
    p{
        margin: 0;
        margin-top: 1rem;
        font-size: var(--text-size-large);
        width: 100%;
        text-align: center;
    }

    @media screen and (min-width: 430px) {
        .container{
            flex-direction: row;
            padding: 2rem 20px;
        }
        .buttons{
            justify-content: end;
            margin: 0;
        }
        p{
            font-size: var(--text-size-xlarge);
            width: fit-content;
            text-align: left;
            margin: 0;
        }
        button{
            font-size: unset;
            margin: auto 0 auto 0.5rem;
        }
    }
</style>

<div class="container flex">
    <p class="weight-600 flex-grow">Your Liquidity</p>
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