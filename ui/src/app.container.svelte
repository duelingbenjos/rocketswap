<script lang="ts">
	import { onMount, setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import Router from 'svelte-hash-router'

	//Components
	import Header from './components/header.svelte'
	import Footer from './components/footer.svelte'
	import TrollBox from './components/misc/troll-box.svelte'
	import TrollBoxButton from './components/misc/troll-box-button.svelte'
	import ToastsContainer from './components/toasts-container.svelte'

	//Services
	import { WalletService } from './services/wallet.service'
	import { ApiService } from './services/api.service'
	import { WsService } from './services/ws.service'

	// Misc
	import { initializeStateFromLocalStorage  } from './utils'

	//TO DO REMOVE THIS!!
	import { ToastService } from './services/toast.service'
	const toastService = ToastService.getInstance()

	let currentThemeName = writable()

	setContext("app", {
		themeToggle,
		currentThemeName
	})
	

	onMount(() => {
		themeSet();
		/** Initialise Singleton Instances */
		WsService.getInstance()
		WalletService.getInstance()
		ApiService.getInstance()

		initializeStateFromLocalStorage()
/*
		toastService.addToast({ 
			icon: "buyToken",
					heading: `TESTING TOAST!`,
					text: `You have a new info toast You have a new info toast You have a new info toast You have a new info toast You have a new info toast`, 
			type: 'info',
			link: {
			text: "explorer",
			href: "https://www.google.ca",
			icon: "popout"
			},
					duration: 7000000
		})

		toastService.addToast({ 
			icon: "sellToken",
					heading: `TESTING TOAST!`,
					text: `You have a new ERROR toast`, 
			type: 'error',
			link: {
			text: "explorer",
			href: "https://www.google.ca",
			icon: "popout"
			},
					duration: 7000000
		})
		toastService.addToast({ 
		icon: "gaugePlus",
					heading: `TESTING TOAST!`,
					text: `You have a new WARNING toast`, 
			type: 'warning',
			link: {
			text: "explorer",
			href: "https://www.google.ca",
			icon: "popout"
			},
					duration: 7000000
		})
		toastService.addToast({ 
			icon: "userAuth",
					heading: `TESTING TOAST!`,
					text: `You have a SUCCESS new toast`, 
			type: 'success',
			link: {
			text: "explorer",
			href: "https://www.google.ca",
			icon: "popout"
			},
					duration: 7000000
		})*/
	})

	function themeToggle() {
		let body = document.getElementById("theme-toggle")
		let lighttheme = getThemeSetting()
		if (!lighttheme) {
			body.classList.add("light");
			currentThemeName.set('light')  
		}else {
			body.classList.remove("light");
			currentThemeName.set('dark')
		}
		localStorage.setItem("lighttheme", !lighttheme)
	}

	function themeSet() {
		let body = document.getElementById("theme-toggle")
		let lighttheme = getThemeSetting()
		if (lighttheme) {
			body.classList.add("light");
			currentThemeName.set('light')
		}else currentThemeName.set('dark')
	}

	function getThemeSetting() {
		return JSON.parse(localStorage.getItem("lighttheme"))
	}
</script>

<style>
	main {
		height: 100%;
		width: 100%;
	}

	@media screen and (min-width: 650px) {

	}

</style>

<main>
	<Header />
	<Router />
	<ToastsContainer />
</main>
<Footer />
<TrollBoxButton />
<TrollBox />