import { createClient } from '@supabase/supabase-js'

// Cliente con service role — solo para rutas de servidor (API routes)
// NUNCA exponer en el browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
