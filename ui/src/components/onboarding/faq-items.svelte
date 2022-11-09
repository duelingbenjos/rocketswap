<script>
    import { onMount } from 'svelte'
    // Components
    import FAQItem from './faq-item.svelte'

    import FAQ from './faq-questions-list.json'

</script>

<style>
    .panel-container{
        padding: 15px;
        border-radius: 8px;
        width: 100%;
        max-width: unset;
    }
    h1{
        font-size: var(--text-size-xlarge);
        margin-bottom: 1rem;
        margin-left: 15px;
    }
    @media screen and (min-width: 490px) {
		h1{
			font-size: 2em;
            margin-left: 0px;
		}
	}
    @media screen and (min-width: 2560px) {
        h1{
            font-size: 2.5em;
        }
        .panel-container{
            padding: 20px 20px 12px 20px;
            border-radius: 14px;
        }
	}
</style>
<h1>Frequently Asked Questions</h1>
<div class="panel-container">
    {#each FAQ as faqItem}
        <FAQItem {faqItem} />
    {/each}
</div>