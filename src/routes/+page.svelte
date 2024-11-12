<script>
	import { page } from '$app/stores';
    let user = $derived($page.data.user);

</script>
<div class="flex h-full w-full flex-col items-center justify-center">
	<div>
		{#if user}
		<span class="p-4 text-stone-600">Hello, <button class="rounded-lg shadow-sm bg-gradient-to-r border border-gold from-indigo-500 via-purple-500 px-4 text-lg text-bold font-sans text-white">   { user.name }    </button> </span>
		{/if}
	</div>
</div>

