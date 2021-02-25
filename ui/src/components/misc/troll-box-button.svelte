<script>
    import TrollIcon from '../../icons/troll.svelte'

    //Misc
    import { trollBoxOpen } from '../../store'

    const handelClick = () => {
        if ($trollBoxOpen) trollBoxOpen.set(false)
        else trollBoxOpen.set(true)
    }
</script>

<style>
    button{
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 103;
        padding: 8px 12px;
        border-radius: 99px;
        background: var(--color-secondary);

        box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
	    -webkit-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
	    -moz-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
    }

    button:active{
        bottom: 8px;
        box-shadow: -1px 8px 23px 0px rgba(0, 0, 0, 0.5);
	    -webkit-box-shadow: -1px 8px 23px 0px rgba(0, 0, 0, 0.5);
	    -moz-box-shadow: -1px 8px 23px 0px rgba(0, 0, 0, 0.5);
    }
    .large{
        display: none;
    }

    @media screen and (min-width: 430px) {
        button{
            padding: 10px 14px;
            bottom: 20px;
            right: 20px;
        }
        button:active{
            bottom: 18px;
        }
        .small{
            display: none;
        }
        .large{
            display: block;
        }
    }

    /* When page width is greater than 900px (tablets) */
    @media screen and (min-width: 900px) {
        button{
            display: none;
        }

    }
</style>

<button on:click={handelClick}>
    <div class="small">
        <TrollIcon width="25px" color="var(--color-white)" />
    </div>
    <div class="large">
        <TrollIcon width="40px" color="var(--color-white)" />
    </div>
    
</button>