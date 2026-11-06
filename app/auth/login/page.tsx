'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(''); const supabase = createClient(); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setError('Correo o contraseña inválidos.'); else window.location.href = '/'; setLoading(false) }
  return <main className="grid min-h-screen place-items-center bg-cream p-5"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><p className="text-sm font-bold text-teal">pool<span className="text-coral">pay</span>.</p><h1 className="display mt-8 text-4xl font-bold">Tu dinero, en orden.</h1><p className="mt-3 text-sm leading-6 text-[#68716b]">Inicia sesión para ver tus proyectos compartidos.</p><label className="mt-8 block text-sm font-bold">Correo electrónico<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label><label className="mt-4 block text-sm font-bold">Contraseña<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label>{error && <p role="alert" className="mt-4 text-sm font-semibold text-coral">{error}</p>}<button disabled={loading} className="mt-6 w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:opacity-60">{loading ? 'Entrando…' : 'Entrar'}</button></form></main>
}
