import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'PoolPay — Organiza, comparte, cumple', description: 'La forma clara y tranquila de organizar pagos grupales.' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html> }
