<script>
    import { onMount } from 'svelte'

    // Icons
    import Rocket from '../../icons/rocket.svelte'
    import Smoke from '../../icons/smoke.svelte'

    export let title = "";

    let rocketElm
    let smokeTimer = null;

    onMount(() => {
        createSmoke()
        return () => stopSmoke()
    })

    function createSmoke (){
		const addSmoke = () => {
			if (rocketElm){
				const element = new Smoke({
					target: rocketElm,
					props: {
						scale: Math.random() * (1 - 0.5) + 0.5,
						smokeTrail: true,
                        width: 25,
                        direction: "left"
					}
				})
			}
		}
        smokeTimer = setInterval(addSmoke, 200)
    }
    
    const stopSmoke = () => {
        clearInterval(smokeTimer);
        smokeTimer = null;
	}

</script>    

<style>
    .rocket{
        display: none;
        position: relative;
        top: 10px;
        margin: 0 0 0 10px;
    }

    @media screen and (min-width: 430px) {
        .rocket{
            display: block;
            margin: 0 0 0 10px;
        }
        div.flex-row{
            margin-bottom: 1rem;
        }
    }

    @media screen and (min-width: 650px) {
        .rocket{
            margin: 0 0 0 30px;
        }
    }

</style>

<div class="flex-row">
    <span class="text-massive">{title}</span>
    <div class="rocket" bind:this={rocketElm}>
        <Rocket width="65px" direction={"down"} color={"var(--color-primary)"} shakeRight={true} blastOff={true}/>
    </div>
</div>
    
