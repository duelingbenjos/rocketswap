import Swap from './pages/swap.page.svelte'
import Pool from './pages/pool.page.svelte'
import App from './app.container.svelte'
import { routes } from 'svelte-hash-router'

routes.set({
  '/': {
    $$component: Swap,
    $$name: 'Swap'
  },
  '/pool': {
    $$component: Pool,
    $$name: 'Pool'
  }
})

const app = new App({
  target: document.body,
  intro: true
})

export default app
