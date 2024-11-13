<script>
    import Spinner from "$lib/components/Spinner.svelte";
    import Results from "$lib/components/Results.svelte"
    let data = $props()
</script>

{#await data}
<Spinner />
{:then data}
<div class="grid gap-8 md:grid-cols-2">
    <div class="flex-col justify-items-center">
{#each data.results as artwork}

            <Results {artwork} />

{/each}
</div>
</div>
{/await}