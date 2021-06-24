<script>

    export let guideItem

</script>

<style>
    .container{
        background: var(--faq-item-background);
        justify-content: space-evenly;
        border-radius: 8px;
        width: 110px;
        height: 90px;

        box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
		-webkit-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
		-moz-box-shadow: -1px 10px 15px 0px rgba(0, 0, 0, 0.3);
    }
    .icon{
        width: 35px;
        height: 35px;
    }
    p{
        margin: 0;
        font-size: var(--text-size-xsmall);
    }

    @media screen and (min-width: 420px) {
        .container{
            width: 130px;
            height: 110px;
        }
        .icon{
            width: 42px;
            height: 42px;
        }
        p{
            margin: 0;
            font-size: var(--text-size-xsmall);
        }
	}

    @media screen and (min-width: 490px) {
        .container{
            background: var(--faq-item-background);
            border-radius: 8px;
            width: 160px;
            height: 130px;
        }
        .icon{
            width: 55px;
            height: 55px;
        }
        p{
            font-size: unset;
        }
        
	}

    @media screen and (min-width: 2560px) {
        .container{
            background: var(--faq-item-background);
            border-radius: 14px;
            width: 300px;
            height: 230px;
        }
        .icon{
            width: 90px;
            height: 90px;
        }
        p{
            font-size: var(--text-size-xxlarge);
        }
	}
</style>

<a href={guideItem.link} rel="noopener noreferrer" target="_blank" class="container flex-col flex-align-center">
    <div class="icon">
        <svelte:component this={guideItem.icon} width="100%" />
    </div>
    <p>{guideItem.title}</p>
</a>