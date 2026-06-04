import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas públicas — accesibles sin login
const PUBLIC_ROUTES = ['/login', '/catalogo', '/galeria', '/api/whatsapp']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // ¿Es ruta pública?
  const isPublic = PUBLIC_ROUTES.some(r => path.startsWith(r))

  // Sin sesión en ruta privada → redirigir a /login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Con sesión en /login → redirigir al dashboard
  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Ruta /admin → solo para el admin email
  if (path.startsWith('/admin')) {
    const adminEmail = process.env.ADMIN_EMAIL
    if (user?.email !== adminEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)'],
}
