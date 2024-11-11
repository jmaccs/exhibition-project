<script>
	
	import '../app.css';
	let { children } = $props();
	
	console.log(allUsers);
</script>

<nav>
	<a href="/">home</a>
	<a href="/search">search</a>
	<a href="login">login</a>
</nav>

{@render children()}
