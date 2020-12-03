import Swap from './swap.container.svelte'
import App from './app.container.svelte'
import { routes } from 'svelte-hash-router'
// import Swap from './'

routes.set({
  '/': Swap
  // '/about': About
})

const app = new App({
  target: document.body,
  intro: true
})

export default app
