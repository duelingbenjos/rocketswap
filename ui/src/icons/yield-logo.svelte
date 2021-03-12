<script>
    import TokenLogo from '../icons/token-logo.svelte'
    import Rocket from '../icons/rocket.svelte'

    export let stakingToken;
    export let yieldToken;
    export let margin = "0";

</script>

<style>
    .container{
        position: relative;
        height: 50px;
    }
    .yield-logo{
        position: absolute;
        top: 33px;
        left: 40px;
    }
</style>

<div class="container" style={`margin: ${margin};`}>
    <div>
        <TokenLogo tokenMeta={stakingToken} width="55px" margin="0"/>
    </div>
    <div class="yield-logo">
        <TokenLogo tokenMeta={yieldToken} width="25px" margin="0"/>
    </div>
</div>