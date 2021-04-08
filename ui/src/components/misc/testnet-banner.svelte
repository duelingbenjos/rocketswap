<script lang="ts">
  import { connectionRequest } from '../../config'
</script>

{#if connectionRequest.networkType === 'testnet'}
  <div class="wrapper">
    <div class="testnet-banner">TESTNET</div>
  </div>
{/if}

<style>
  .testnet-banner {
    background-color: grey;
    /* padding: 5px 50px; */
    color: blue;
    font-size: 20px;
    font-weight: 600;
    font-style: italic;
    /* left: 50%; */
    padding: 3px 15px;
  }
  .wrapper {
    position: fixed;
    top: 0px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
</style>
