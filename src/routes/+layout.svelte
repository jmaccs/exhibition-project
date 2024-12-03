<script>
	import '../app.css';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import Logo from '$lib/components/Logo.svelte';
	let { children } = $props();
	let user = $derived($page.data.user);
	let isLoggingOut = $state(false);
</script>

<header class="sticky inset-x-0 top-0 z-20 bg-white shadow">
	<nav class="mx-auto flex max-w-screen-xl items-baseline justify-between px-2">
		<Logo />
		<div class="flex items-baseline gap-x-2">
			<div class="flex items-baseline">
				<a class="p-4 font-sans hover:text-slate-200" href="/">home</a>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					stroke="currentColor"
					class="current-fill h-4 w-4"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
					/>
				</svg>
				<a class="p-4 font-sans hover:text-slate-200" href="/search">search</a>
				{#if user}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						stroke="currentColor"
						class="current-fill h-4 w-4"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
						/>
					</svg>

					<a class="p-4 font-sans hover:text-slate-200" href="/collection">collection</a>
				{/if}
			</div>
		</div>

		{#if user}
			<div class="flex items-baseline gap-2">
				<form
					action="/logout"
					method="POST"
					use:enhance={() => {
						isLoggingOut = true;
						return async ({ result }) => {
							await new Promise((resolve) => setTimeout(resolve, 500));
							window.location.href = '/';
						};
					}}
				>
					{#if isLoggingOut}
						<Spinner />
					{:else}
						<button
							class="flex items-baseline gap-2 font-sans hover:text-gray-600"
							type="submit"
							disabled={isLoggingOut}
						>
							log out
						</button>
					{/if}
				</form>
			</div>
		{:else}
			<div class="flex items-baseline gap-2">
				<a class="font-sans hover:text-slate-200" href="/login">login</a>
				<span class="text-gray-400">|</span>
				<a class="font-sans hover:text-slate-200" href="/register">sign up</a>
			</div>
		{/if}
	</nav>
</header>
<div class="flex w-full items-center justify-center p-4">
	{@render children()}
</div>
