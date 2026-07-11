import { createClient } from '@supabase/supabase-js'

// Cliente con service role — solo para rutas de servidor (API routes)
// NUNCA exponer en el browser.
// Se crea como función lazy para evitar errores en build cuando las
// variables de entorno no están disponibles en tiempo de compilación estática.
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/** @deprecated Usar getSupabaseAdmin() en su lugar */
export const supabaseAdmin = {
  get auth() { return getSupabaseAdmin().auth },
  from: (...args: Parameters<ReturnType<typeof createClient>['from']>) =>
    getSupabaseAdmin().from(...args),
}
