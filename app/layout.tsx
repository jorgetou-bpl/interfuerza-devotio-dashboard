import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Devotio × InterFuerza | Panel de Fidelidad',
  description: 'Dashboard de cashback en tiempo real — InterFuerza × Devotio Rewards',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-950 text-gray-100 antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
