<script>
    export let title

</script>

<style>
    div{
        box-sizing: border-box;
        background-color: var(--msg-box-background);
        color: var(--text-primary-color);
        border-radius: 0;
        padding: 10px 20px;
        box-shadow: -1px 10px 20px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 20px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 20px 0px rgba(0, 0, 0, 0.3);
        padding-top: 15px;
        width: fit-content;
        margin: 1rem;
        width: 100%;
        max-width: 350px;

        border-left: 2px solid var(--color-secondary);
        border-right: 2px solid var(--color-secondary);
    }

    p{
        margin: 0.25rem 0;
    }
    strong{
        margin: 1rem 0 ;
    }

    @media screen and (min-width: 430px) {
        div{
            border-radius: var(--border-radius);
        }
    }

    @media screen and (min-width: 650px) {

    }
</style>

<div>
    {#if title}<p><strong class="text-small">{title}</strong></p> {/if}
    <slot class="text-small" name="message"></slot>
</div>