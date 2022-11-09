<script>
    export let title

</script>

<style>
    div{
        box-sizing: border-box;
        /*background-color: var(--msg-box-background);*/
        background-color: var(--small-box-background);
        color: var(--text-primary-color);
        border-radius: 0;
        padding: 20px 30px;

        box-shadow: 0px 4px 14px 2px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: 0px 4px 14px 2px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: 0px 4px 14px 2px rgba(0, 0, 0, 0.3);
        
        width: fit-content;

        width: 100%;
        margin: 10px 0;

        border-top: 2px solid var(--text-color-highlight);
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

            min-width: 350px;
        }
    }

    @media screen and (min-width: 650px) {
        div{
            margin: 10px;
            max-width: 45%;
        }
                

    }
</style>

<div>
    {#if title}<p><strong class="text-small">{title}</strong></p> {/if}
    <slot class="text-small" name="message"></slot>
</div>