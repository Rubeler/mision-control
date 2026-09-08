import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente para Route Handlers — lee la sesión real del usuario desde las
// cookies (la misma que usa el middleware), así las consultas respetan RLS
// y quedan automáticamente scopeadas a su negocio_id sin filtrar a mano.
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
}
