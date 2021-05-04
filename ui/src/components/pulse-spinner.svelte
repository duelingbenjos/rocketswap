<script lang="ts">
	import { range } from '../utils'

	export let size = 60
	export let color = '#FF3E00'
	export let unit = 'px'
	export let padding = "0";
	export let margin = "0";
</script>


<style>
	.spinner {
		position: relative;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
		width: var(--size);
		height: calc(var(--size) / 2.5);
		margin: 0 auto;
	}
	.cube {
		position: absolute;
		width: calc(var(--size) / 5);
		height: calc(var(--size) / 2.5);
		background-color: var(--color);
		animation: motion 1.5s cubic-bezier(0.895, 0.03, 0.685, 0.22) infinite;
	}
	@keyframes motion {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>

<div class="spinner" style="--size: {size}{unit}; --color: {color}; padding: {padding}; margin: {margin};">
	{#each range(3, 0) as version}
		<div class="cube" style="animation-delay: {version * 0.15}s; left: {version * (size / 3 + size / 15) + unit};" />
	{/each}
</div>
