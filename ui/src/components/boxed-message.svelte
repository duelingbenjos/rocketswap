<script>
    export let title
    export let messages

</script>

<style>
    div{
        box-sizing: border-box;
        background-color: var(--msg-box-background);
        color: var(--text-primary-color);
        font-size: var(--text-size-small);
        border-radius: 0;
        padding: 10px 20px;
        box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        padding-top: 15px;
        width: 100%;
    }

    p{
        margin: 0.25rem 0;
    }
    strong{
        margin: 1rem 0 ;
    }

    @media screen and (min-width: 430px) {
        div{
            padding: 30px;
            border-radius: var(--border-radius);
        }
    }

    @media screen and (min-width: 650px) {

    }
</style>

<div>
    {#if title}<p><strong>{title}</strong></p> {/if}
    {#each messages as message}
        <p>{message}</p>
    {/each}
</div>