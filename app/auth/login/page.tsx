'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const nextPath = typeof window === 'undefined' ? '/' : new URLSearchParams(window.location.search).get('next') || '/'

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(''); setMessage('')
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password })
    if (signInError) setError('Correo o contraseña inválidos.')
    else window.location.href = nextPath
    setLoading(false)
  }

  async function sendMagicLink() {
    if (!email) { setError('Escribe tu correo para recibir el enlace de acceso.'); return }
    setLoading(true); setError(''); setMessage('')
    const redirectTo = new URL(process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`); redirectTo.searchParams.set('next', nextPath)
    const { error: magicError } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo.toString() } })
    if (magicError) setError('No pudimos enviar el enlace. Verifica tu correo.')
    else setMessage('Revisa tu correo y abre el enlace para entrar sin contraseña.')
    setLoading(false)
  }

  return <main className="grid min-h-screen place-items-center bg-cream p-5"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><p className="text-sm font-bold text-teal">pool<span className="text-coral">pay</span>.</p><h1 className="display mt-8 text-4xl font-bold">Entra a PoolPay.</h1><p className="mt-3 text-sm leading-6 text-[#68716b]">Puedes entrar con contraseña o recibir un enlace en tu correo.</p><label className="mt-8 block text-sm font-bold">Correo electrónico<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label><label className="mt-4 block text-sm font-bold">Contraseña<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label>{error && <p role="alert" className="mt-4 text-sm font-semibold text-coral">{error}</p>}{message && <p role="status" className="mt-4 text-sm font-semibold text-teal">{message}</p>}<button disabled={loading} className="mt-6 w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:opacity-60">{loading ? 'Procesando…' : 'Entrar con contraseña'}</button><button type="button" disabled={loading} onClick={() => void sendMagicLink()} className="mt-3 w-full rounded-full border border-[#dedbd0] px-5 py-3.5 font-bold text-ink disabled:opacity-60">Entrar sin contraseña</button><p className="mt-5 text-center text-sm text-[#68716b]">¿No tienes cuenta? <a href="/auth/sign-up" className="font-bold text-teal">Crea una aquí</a></p></form></main>
}
