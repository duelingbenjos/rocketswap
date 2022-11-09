<script lang="ts">
  import { onMount } from 'svelte'
  import { Chart, CandlestickSeries, HistogramSeries } from 'svelte-lightweight-charts'
  import { CrosshairMode } from 'lightweight-charts'
  import axios from 'axios'

  let data
  let transformed_data
  let priceFormat

  onMount(async () => {
    getData()
  })
  //
  // const histogram_options = { 
  //   color: '#26a69a',
  //   priceFormat: {
  //     type: 'volume'
  //   },
  //   priceScaleId: '',
  //   scaleMargins: {
  //     top: 0.8,
  //     bottom: 0
  //   }
  // }

  async function getData() {
    const res = await axios.get('http://0.0.0.0:2001/get_chart_data?contract_name=con_lambdoge&resolution=1w')
    const { candles, meta } = res.data
    data = candles
    priceFormat = {
      type: 'custom',
      formatter: (price) => parseFloat(price).toFixed(meta.precision)
      //   minMove: meta.precision
    }
    transformed_data = buildVolumeData(data)
  }

  function buildVolumeData(data: any[]) {
    const transformed = data.map((d) => {
      return {
        value: d.volume,
        time: d.time,
        color: d.open > d.close ? 'red' : 'green'
      }
    })
    return transformed
  }

  const options = {
    width: 1000,
    height: 800,
    rightPriceScale: {
      // scaleMargins: {
      //   top: 0.3,
      //   bottom: 0.25
      // },
      drawTicks: true,
      borderColor: 'rgba(197, 203, 206, 0.8)',
      autoScale: true,
      borderVisible: true
    },
    layout: {
      backgroundColor: '#222',
      textColor: '#DDD'
    },
    grid: {
      vertLines: {
        color: 'rgba(197, 203, 206, 0.5)'
      },
      horzLines: {
        color: 'rgba(197, 203, 206, 0.5)'
      }
    },
    crosshair: {
      mode: CrosshairMode.Normal
    },
    timeScale: {
      borderColor: 'rgba(197, 203, 206, 0.8)'
    }
  }
</script>

{#if data && transformed_data}
  <div class="page-container">
    <Chart {...options}>
      <CandlestickSeries
        reactive={true}
        {data}
        {priceFormat}
        
      />
      <HistogramSeries data={transformed_data} priceScaleId="" color="#26a69a" priceFormat={{ type: 'volume' }} scaleMargins={{ top: 0.8, bottom: 0 }} reactive={true} />
    </Chart>
  </div>
{/if}

<style>
  .page-container {
    padding-bottom: 10rem;
  }
</style>
