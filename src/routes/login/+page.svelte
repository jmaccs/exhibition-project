<script>
	let isLogin = $state(false);
	let showSignup = $state(false);
</script>

<container class="flex h-full w-full items-center justify-center gap-4 bg-stone-50 p-6">
  {#if !showSignup}
      <div
          class="w-full max-w-2xl border border-stone-300 bg-stone-100 p-6 rounded-lg shadow-md text-center text-stone-800"
      >
          <form method="POST" action="?/login" class="space-y-4">
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
                  onclick="{(showSignup = true)}"
              >
                  email
              </button>
          </div>
      </div>
  {/if}
  {#if showSignup}
      <form method="POST" action="?/signup" class="w-full max-w-2xl space-y-4 border border-stone-300 bg-stone-100 p-6 rounded-lg shadow-md">
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
      </form>
  {/if}
</container>
