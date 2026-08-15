import { NextResponse } from 'next/server'
import { getConnectionState, getQr, getConnectedUser } from '@/lib/evolution'

export async function GET() {
  try {
    const state = await getConnectionState()

    if (state === 'open') {
      const user = await getConnectedUser()
      return NextResponse.json({ status: 'CONNECTED', qr: null, user })
    }

    if (state === 'connecting') {
      const qr = await getQr()
      if (qr) {
        return NextResponse.json({ status: 'SCAN_QR', qr, user: null })
      }
      return NextResponse.json({ status: 'DISCONNECTED', qr: null, user: null })
    }

    return NextResponse.json({ status: 'DISCONNECTED', qr: null, user: null })
  } catch {
    return NextResponse.json({ status: 'DISCONNECTED', qr: null, user: null })
  }
}
