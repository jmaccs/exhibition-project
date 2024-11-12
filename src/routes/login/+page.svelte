<script>
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';

    let isLogin = true;
    let showSignup = false;
    let error = '';

    const handleSubmit = async (event) => {
        error = '';
    };
</script>

<container class="flex h-full w-full items-center justify-center gap-4 bg-stone-50 p-6">
    {#if error}
        <div class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    {/if}

    {#if !showSignup}
        <div
            class="w-full max-w-2xl lg:max-w-lg border border-stone-300 bg-stone-100 p-6 rounded-lg shadow-md font-sans text-md text-center text-stone-800"
        >
            <form 
                method="POST" 
                action="?/login"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === 'failure') {
                            error = result.data?.message || 'Login failed';
                        } else if (result.type === 'success') {
                            await goto('/');
                        }
                    };
                }}
                class="space-y-4"
            >
                <label class="block text-left font-semibold text-stone-600">
                    Email
                    <input 
                        name="email" 
                        type="email" 
                        class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                        required 
                    />
                </label>

                <label class="block text-left font-semibold text-stone-600">
                    Password
                    <input 
                        name="password" 
                        type="password" 
                        class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                        required 
                    />
                </label>

                <button class="mt-4 w-full rounded-full bg-stone-600 px-4 py-3 text-white font-semibold hover:bg-stone-700 transition-colors">
                    Log in
                </button>
            </form>
            <div class="mt-6 text-stone-500">
                Or...sign up with
                <button 
                    class="ml-2 rounded-full bg-stone-200 px-4 py-2 text-stone-700 font-semibold hover:bg-stone-300 transition-colors" 
                    onclick={() => showSignup = true}
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
            use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'failure') {
                        error = result.data?.message || 'Signup failed';
                    } else if (result.type === 'success') {
                        await goto('/');
                    }
                };
            }}
            class="w-full max-w-2xl space-y-4 border border-stone-300 bg-stone-100 p-6 rounded-lg shadow-md"
        >
            <label class="block text-left font-semibold text-stone-600">
                Name
                <input 
                    name="name" 
                    type="text" 
                    class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                    required 
                />
            </label>
            <label class="block text-left font-semibold text-stone-600">
                Email
                <input 
                    name="email" 
                    type="email" 
                    class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                    required 
                />
            </label>
            <label class="block text-left font-semibold text-stone-600">
                Password
                <input 
                    name="password" 
                    type="password" 
                    class="mt-1 w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:border-stone-500 focus:ring focus:ring-stone-400 focus:ring-opacity-50" 
                    required 
                />
            </label>
            <button class="w-full rounded-full bg-stone-600 px-4 py-3 text-white font-semibold hover:bg-stone-700 transition-colors">
                Sign up
            </button>
            <button 
                type="button"
                class="mt-4 w-full text-stone-500 hover:text-stone-700"
                onclick={() => showSignup = false}
            >
                Back to login
            </button>
        </form>
    {/if}
</container>
