<script>
    import TokenLogo from '../icons/token-logo.svelte'
    import Rocket from '../icons/rocket.svelte'

    export let stakingToken;
    export let yeildToken;

</script>

<style>
    .container{
        position: relative;
        height: 50px;
    }
    .staking-logo{
        /*position: absolute;*/
        /*top: 22px;*/
        /*left: 36px;*/
        /*z-index: 10;*/
    }
    .yeild-logo{
        position: absolute;
        top: 33px;
        left: 30px;
        /*left: 2px;*/
        /*z-index: 10;*/
    }
</style>

<div class="container">
    <div class="staking-logo">
        <TokenLogo tokenMeta={stakingToken} width="55px" margin="0"/>
    </div>
    <!--<Rocket width="65" direction="right" />-->
    <div class="yeild-logo">
        <TokenLogo tokenMeta={yeildToken} width="25px" margin="0"/>
    </div>
</div>