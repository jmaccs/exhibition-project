<script>
    import '../app.css';
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import Spinner from '$lib/components/Spinner.svelte';
    
    let { children } = $props();
    let user = $derived($page.data.user);
    let isLoggingOut = false;
 
</script>

<header class="sticky inset-x-0 top-0 h-32 z-20 bg-white p-3 font-sans shadow">
    <nav class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4 md:pt-16">
        <div class="justify-self-start">
            <a class="p-4 hover:text-slate-200 " href="/">home</a>
            <a class="p-4 hover:text-slate-200 " href="/search">search</a>
        </div>
        {#if user}
            <a class="p-4 hover:text-slate-200 justify-self-start" href="/collection">collection</a>
            <div class="justify-self-end items-center ml-auto flex gap-2">
                <form 
                    action="/logout" 
                    method="POST" 
                    use:enhance={() => {
                        isLoggingOut = true;
                        return async ({ result }) => {
                            await new Promise(resolve => setTimeout(resolve, 500)); 
                            window.location.href = '/';
                        };
                    }}
                >
                    <button class="font-sans hover:text-gray-600 flex items-center gap-2" type="submit" disabled={isLoggingOut}>
                        {#if isLoggingOut}
                            <Spinner />
                        {/if}
                        Log out
                    </button>
                </form>
            </div>
        {:else}
            <div class="p-4">
                <a class="justify-self-end hover:text-slate-200 ml-auto" href="/login">
                    login | 
                </a>
                <a class="justify-self-end hover:text-slate-200 ml-auto" href="/register">
                     sign up
                </a>
            </div>
        {/if}
    </nav>
</header>

<div class="flex w-full items-center justify-center p-4">
    {@render children()}
</div>
