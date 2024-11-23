<script>
    import '../app.css';
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    
    let { children } = $props();
    let user = $derived($page.data.user);

    function handleLogout() {
        return async ({ result }) => {
            if (result.type === 'success') {
                await goto('/');
            }
        };
    }
</script>

<header class="sticky inset-x-0 top-0 h-32 z-20 bg-white p-3 font-sans shadow">
    <nav class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4 md:pt-16">
        <a class="p-4 hover:text-slate-200" href="/">home</a>
        <a class="p-4 hover:text-slate-200" href="/search">search</a>
        {#if user}
        <a class="p-4 hover:text-slate-200" href="/collection">collection</a>
            <div class="justify-self-end items-center ml-auto">
               
                <form action="/logout" method="POST" use:enhance={handleLogout}>
                    <button class="p-4 hover:text-slate-200">logout</button>
                </form>
            </div>
        {:else}
            <a class="p-4 justify-self-end hover:text-slate-200 ml-auto" href="/login">login | sign up</a>
        {/if}
    </nav>
</header>
<div class="flex w-full flex-col items-center justify-center p-4">
    {@render children()}
</div>
