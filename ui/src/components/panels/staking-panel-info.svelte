<script>
  import { fade } from 'svelte/transition'
  import { onMount, setContext } from 'svelte'

  export let toggleInfo
  export let stakingInfo

  let info = []

  let wantedValues = [
    'ROI_yearly',
    'contract_name',
    'DevRewardWallet',
    'StakedBalance',
    'EmissionRatePerHour',
    'DevRewardPct',
    'OpenForBusiness',
    'EpochMaxRatioIncrease',
    'WithdrawnBalance',
    'meta'
  ]

  function processStakingInfo(stakingInfo) {
    let keys = Object.keys(stakingInfo).filter((key) => wantedValues.includes(key))
    return keys.reduce((accum, curr) => {
      if (curr === 'meta') {
        let meta_keys = Object.keys(stakingInfo[curr])
        let meta = stakingInfo[curr]
        meta_keys.forEach((key) => {
          accum.push({
            key: `meta.${key}`,
            value: meta[key]
          })
        })
      } else {
        accum.push({ key: curr, value: stakingInfo[curr] })
      }
      return accum
    }, [])
  }

  onMount(() => {
    console.log({ stakingInfo })
    info = processStakingInfo(stakingInfo)
    console.log(info)
  })
</script>

<div class="wrap" in:fade>
  {#each info as i}
    <b>{i.key} : </b> {i.value} <br />
  {/each}
  <div class="flex-row flex-center-center">
    <button class="primary" on:click={toggleInfo}>CLOSE</button>
  </div>
</div>

<style>
  .wrap {
    word-wrap: break-word;
  }

  b {
    color: var(--color-secondary);
  }
</style>
