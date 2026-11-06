'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const countries = [
  { code: 'GT', name: 'Guatemala', dial: '+502' },
  { code: 'MX', name: 'México', dial: '+52' },
  { code: 'SV', name: 'El Salvador', dial: '+503' },
  { code: 'HN', name: 'Honduras', dial: '+504' },
  { code: 'US', name: 'Estados Unidos', dial: '+1' },
  { code: 'ES', name: 'España', dial: '+34' },
]

export default function SignUpPage() {
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('GT')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const selected = useMemo(() => countries.find((item) => item.code === country) ?? countries[0], [country])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true); setError(''); setMessage('')
    const supabase = createClient()
    const credentials = { email, password }
    const { data, error: signUpError } = await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`, data: { full_name: name, phone: phone ? `${selected.dial}${phone}` : null, country_code: country } } })
    if (signUpError) setError('No pudimos crear la cuenta. Verifica tus datos e inténtalo de nuevo.')
    else if (data.session) window.location.href = '/'
    else setMessage('Revisa tu correo para confirmar tu cuenta.')
    setLoading(false)
  }

  return <main className="grid min-h-screen place-items-center bg-cream p-5"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><p className="text-sm font-bold text-teal">pool<span className="text-coral">pay</span>.</p><h1 className="display mt-8 text-4xl font-bold">Crea tu cuenta.</h1><p className="mt-3 text-sm leading-6 text-[#68716b]">Organiza aportes y proyectos compartidos desde un solo lugar.</p><label className="mt-7 block text-sm font-bold">Nombre completo<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label><div className="mt-5 grid grid-cols-2 rounded-full bg-[#f0eee6] p-1 text-sm font-bold"><button type="button" onClick={() => setMode('email')} className={`rounded-full px-3 py-2 ${mode === 'email' ? 'bg-white shadow-sm' : 'text-[#68716b]'}`}>Correo</button><button type="button" onClick={() => setMode('phone')} className={`rounded-full px-3 py-2 ${mode === 'phone' ? 'bg-white shadow-sm' : 'text-[#68716b]'}`}>Correo + teléfono</button></div>{mode === 'email' ? <label className="mt-5 block text-sm font-bold">Correo electrónico<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label> : <div className="mt-5"><label className="block text-sm font-bold">Correo electrónico<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label><label className="mt-5 block text-sm font-bold">País<select value={country} onChange={(event) => setCountry(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] bg-white px-4 py-3 outline-none focus:border-teal">{countries.map((item) => <option key={item.code} value={item.code}>{item.name} ({item.dial}){item.code === 'GT' ? ' · recomendado' : ''}</option>)}</select></label><label className="mt-4 block text-sm font-bold">Número de teléfono<div className="mt-2 flex rounded-2xl border border-[#dedbd0] focus-within:border-teal"><span className="px-4 py-3 text-[#68716b]">{selected.dial}</span><input required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="min-w-0 flex-1 rounded-r-2xl px-2 py-3 outline-none" placeholder="5555 5555" /></div></label></div>}<label className="mt-5 block text-sm font-bold">Contraseña<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#dedbd0] px-4 py-3 outline-none focus:border-teal" /></label>{error && <p role="alert" className="mt-4 text-sm font-semibold text-coral">{error}</p>}{message && <p role="status" className="mt-4 text-sm font-semibold text-teal">{message}</p>}<button disabled={loading} className="mt-6 w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:opacity-60">{loading ? 'Creando…' : 'Crear cuenta'}</button><p className="mt-5 text-center text-sm text-[#68716b]">¿Ya tienes cuenta? <Link href="/auth/login" className="font-bold text-teal">Inicia sesión</Link></p></form></main>
}
