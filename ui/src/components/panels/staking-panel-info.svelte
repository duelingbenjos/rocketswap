<script>
    import { fade } from 'svelte/transition';

    export let toggleInfo


</script>

<div in:fade>
    <p>sdfsdfsdf</p>
    <p>sdfsadfsdf</p>
    <p>sfdsfd</p>
    <p>sfdsfdsfdf</p>

    <div class="flex-row flex-center-center">
        <button class="primary" on:click={toggleInfo}>CLOSE</button>
    </div>
</div>