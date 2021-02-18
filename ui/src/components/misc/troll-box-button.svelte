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
        bottom: 20px;
        right: 20px;
        z-index: 103;
        padding: 10px 14px;
        border-radius: 99px;
        background: var(--color-secondary);

        box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
	    -webkit-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
	    -moz-box-shadow: -1px 10px 25px 0px rgba(0, 0, 0, 0.5);
    }

    button:active{
        bottom: 33px;
        box-shadow: -1px 8px 23px 0px rgba(0, 0, 0, 0.5);
	    -webkit-box-shadow: -1px 8px 23px 0px rgba(0, 0, 0, 0.5);
	    -moz-box-shadow: -1px 8px 23px 0px rgba(0, 0, 0, 0.5);
    }

    /* When page width is greater than 900px (tablets) */
    @media screen and (min-width: 900px) {
        button{
            display: none;
        }
    }
</style>

<button on:click={handelClick}>
    <TrollIcon width="40px" color="var(--color-white)" />
</button>