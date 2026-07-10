import {createClient} from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  ''
).trim()

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
	  'Missing Supabase environment variables. Check .env.local in the project root and make sure the URL and publishable key are exact.',
	)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)