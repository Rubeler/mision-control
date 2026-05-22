import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Misión Control — Debuenamadera',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-bg text-muted">
        <Sidebar />
        <Navbar />
        <main className="md:ml-56 pt-14 min-h-screen">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </body>
    </html>
  )
}
