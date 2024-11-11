<script>
	import '../app.css';
	let { children } = $props();
</script>

<header class="absolute inset-x-0 top-0 h-32 bg-white p-3 font-sans shadow">
	<nav class="flex w-full max-w-2xl pb-20  align-middle md:pt-16">
		<a class="p-4 hover:text-slate-200" href="/">home</a>
		<a class="p-4 hover:text-slate-200" href="/search">search</a>
		<a class="p-4 hover:text-slate-200" href="login">login | sign up </a>
	</nav>
</header>
<div class="flex w-full flex-col items-center justify-center p-4">
	{@render children()}
</div>
