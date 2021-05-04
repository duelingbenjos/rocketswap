
import Swap from './pages/swap.page.svelte'
import Pools from './pages/pool.page.svelte'
import RSWP from './pages/rswp.page.svelte'
import Farm from './pages/farm.page.svelte'
import CreatePool from './pages/pool-create.page.svelte'
import AddPool from './pages/pool-add.page.svelte'
import RemovePool from './pages/pool-remove.page.svelte'
import App from './app.container.svelte'
import { routes } from 'svelte-hash-router'
import Home from './pages/home.page.svelte'

routes.set({
  '/': {
    $$component: Home,
     $$name: 'Home'
   },
  '/swap/': {
    $$component: Swap,
    $$name: 'Swap',
    ':contract': Swap,
  },
  '/pool-main/': {
    $$component: Pools,
    $$name: 'Pools'
  },
  '/rswp/': {
    $$component: RSWP,
    $$name: '$RSWP'
  },
  '/farm/': {
    $$component: Farm,
    $$name: 'Farm'
  },
  '/pool-create/': {
    $$component: CreatePool,
    $$name: 'Create Pool',
    ':contract': CreatePool,
  },
  '/pool-add/': {
    $$component: AddPool,
    $$name: 'Create Pool',
    ':contract': AddPool,
  },
  '/pool-remove/': {
    $$component: RemovePool,
    $$name: 'Create Pool',
    ':contract': RemovePool,
  },
  '*': {
    $$redirect: '/'
  }
})

const app = new App({
  target: document.body,
  intro: true
})

export default app
