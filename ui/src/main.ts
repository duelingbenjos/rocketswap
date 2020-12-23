import Swap from './pages/swap.page.svelte'
import Pools from './pages/pool.page.svelte'
import CreatePool from './pages/pool-create.page.svelte'
import App from './app.container.svelte'
import { routes } from 'svelte-hash-router'

routes.set({
  '/': {
    $$component: Swap,
    $$name: 'Swap'
  },
  '/pool-main': {
    $$component: Pools,
    $$name: 'Pool'
  },
  '/pool-create': {
    $$component: CreatePool,
    $$name: 'Create Pool'
  },
  '/pool-add': {
    $$component: CreatePool,
    $$name: 'Add Liquidity'
  },
  '/pool-remove': {
    $$component: CreatePool,
    $$name: 'Remove Liquidity'
  }
})

const app = new App({
  target: document.body,
  intro: true
})

export default app
