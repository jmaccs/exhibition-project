<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/stores';
	let { form } = $props();
	let isLoading = $state(false);
	let error = $state('');
	let success = $state(false);
</script>

<container class="flex h-full w-full items-center justify-center gap-4 bg-stone-50 p-6">
	{#if error}
		<div
			class="fixed right-4 top-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
			role="alert"
		>
			{error}
		</div>
	{/if}

	<form
		method="POST"
		action="?/signUp"
		use:enhance={() => {
			isLoading = true;
			error = '';
			
			return async ({ result }) => {
				try {
					if (result.type === 'success') {
						success = true;
	
						window.location.href = '/collection';
					} else {
						const response = await result.json();
						error = response.message || 'Registration failed. Please try again.';
						isLoading = false;
					}
				} catch (e) {
					error = 'An unexpected error occurred. Please try again.';
					isLoading = false;
				}
			};
		}}
		class="w-full max-w-2xl space-y-4 rounded-lg border border-stone-300 bg-stone-100 p-6 shadow-md"
	>
		<label class="block text-left font-sans font-semibold text-stone-600">
			Name
			<input
				name="name"
				type="text"
				class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50"
				required
				disabled={isLoading}
			/>
		</label>
		<label class="block text-left font-sans font-semibold text-stone-600">
			Email
			<input
				name="email"
				type="email"
				class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50"
				required
				disabled={isLoading}
			/>
		</label>
		<label class="block text-left font-sans font-semibold text-stone-600">
			Password
			<input
				name="password"
				type="password"
				class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50"
				required
				disabled={isLoading}
			/>
		</label>
		<button
			aria-label="submit"
			class="flex w-full items-center justify-center rounded-full bg-stone-600 px-4 py-3 font-sans font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
			disabled={isLoading}
		>
			{#if isLoading}
				<div class="scale-75">
					<Spinner />
				</div>
			{:else}
				Sign up
			{/if}
		</button>
	</form>
</container>
