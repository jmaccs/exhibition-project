<script>
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
    import Spinner from '$lib/components/Spinner.svelte';

    let isLogin = true;
    let showSignup = false;
    let error = '';
    let success = '';
    let isLoading = false;

    const handleFormSubmit = () => {
        isLoading = true;
        error = '';
        success = '';
        
        return async ({ result }) => {
            if (result.type === 'failure') {
                error = result.data?.message || 'Authentication failed';
                isLoading = false;
            } else if (result.type === 'success') {
                success = 'Success! Redirecting...';
                // Small delay to show success message
                setTimeout(async () => {
                    await goto('/');
                }, 1000);
            }
        };
    };
</script>

<container class="flex h-full w-full items-center justify-center gap-4 bg-stone-50 p-6">
    {#if error}
        <div class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
        </div>
    {/if}

    {#if success}
        <div class="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
            {success}
        </div>
    {/if}

    {#if !showSignup}
        <div
            class="w-full max-w-2xl lg:max-w-lg border border-stone-300 bg-stone-100 p-6 rounded-lg shadow-md font-sans text-md text-center text-stone-800"
        >
            <form 
                method="POST" 
                action="?/login"
                use:enhance={handleFormSubmit}
                class="space-y-4"
            >
                <label class="block text-left font-semibold text-stone-600">
                    Email
                    <input 
                        name="email" 
                        type="email" 
                        class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                        required 
                        disabled={isLoading}
                    />
                </label>

                <label class="block text-left font-semibold text-stone-600">
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
                    type="submit"
                    class="mt-4 w-full rounded-full bg-stone-600 px-4 py-3 text-white font-semibold hover:bg-stone-700 transition-colors flex items-center justify-center"
                    disabled={isLoading}
                >
                    {#if isLoading}
                        <div class="scale-75">
                            <Spinner />
                        </div>
                    {:else}
                        Log in
                    {/if}
                </button>
            </form>
            <div class="mt-6 text-stone-500">
                Or...sign up with
                <button 
                    class="ml-2 rounded-full bg-stone-200 px-4 py-2 text-stone-700 font-semibold hover:bg-stone-300 transition-colors" 
                    onclick={() => showSignup = true}
                    disabled={isLoading}
                >
                    email
                </button>
            </div>
        </div>
    {/if}

    {#if showSignup}
        <form 
            method="POST" 
            action="?/signUp"
            use:enhance={handleFormSubmit}
            class="w-full max-w-2xl space-y-4 border border-stone-300 bg-stone-100 p-6 rounded-lg shadow-md"
        >
            <label class="block text-left font-semibold text-stone-600">
                Name
                <input 
                    name="name" 
                    type="text" 
                    class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                    required 
                    disabled={isLoading}
                />
            </label>
            <label class="block text-left font-semibold text-stone-600">
                Email
                <input 
                    name="email" 
                    type="email" 
                    class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                    required 
                    disabled={isLoading}
                />
            </label>
            <label class="block text-left font-semibold text-stone-600">
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
                type="submit"
                class="w-full rounded-full bg-stone-600 px-4 py-3 text-white font-semibold hover:bg-stone-700 transition-colors flex items-center justify-center"
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
            <button 
                type="button"
                class="mt-4 w-full text-stone-500 hover:text-stone-700"
                onclick={() => showSignup = false}
                disabled={isLoading}
            >
                Back to login
            </button>
        </form>
    {/if}
</container>
