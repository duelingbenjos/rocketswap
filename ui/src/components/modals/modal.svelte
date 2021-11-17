<script>
    // Components
    import ModalVerifiedTokenInfo from '../modals/verified-token-info.svelte'

    // Misc
    import { modal } from '../../store'

    const modal_MAP = {
        ModalVerifiedTokenInfo
    }
</script>

<style>
    .global-modal{
        position: fixed;
        width: 100vw;
        height: 100vh;
        background-color: var(--dropdown-background);
        z-index: 150;
        top: 0;
        left: 0;
    }
</style>

{#if $modal}
    <div class="flex flex-center-center global-modal">
        <svelte:component this={modal_MAP[$modal]} />
    </div>
{/if}