
import { SvelteKitAuth } from "@auth/sveltekit"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./lib/db/db"
import {users, email_idx} from "./lib/db/schema"
 
export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(db),
  providers: [],
})