'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = { full_name: string | null; phone: string | null; preferred_language: string; preferred_theme: string }

export default function ProfileForm({ email, profile }: { email: string; profile: Profile | null }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [language, setLanguage] = useState(profile?.preferred_language ?? 'es')
  const [theme, setTheme] = useState(profile?.preferred_theme ?? 'system')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/auth/login')
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: fullName.trim(), phone: phone.trim() || null, preferred_language: language, preferred_theme: theme })
    if (error) setMessage('No pudimos guardar tu perfil. Intenta nuevamente.')
    else { setMessage('Perfil actualizado.'); router.refresh() }
    setSaving(false)
  }

  return <main className="min-h-screen bg-[#f7f6f1] px-5 py-8 text-[#17211c] sm:px-8 lg:px-16"><div className="mx-auto max-w-2xl"><a href="/" className="text-sm font-semibold text-[#177d73]">← Volver a PoolPay</a><section className="mt-8 rounded-[28px] border border-[#dedbd0] bg-white p-6 shadow-[0_18px_60px_rgba(23,33,28,0.08)] sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#177d73]">Tu cuenta</p><h1 className="display mt-3 text-4xl font-bold tracking-[-0.05em]">Completa tu perfil.</h1><p className="mt-3 text-[#68716b]">Estos datos ayudan a que tus proyectos compartidos sean fáciles de identificar.</p><form onSubmit={save} className="mt-8 space-y-5"><label className="block text-sm font-bold">Nombre completo<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dedbd0] px-4 py-3 font-normal outline-none focus:border-[#177d73]" /></label><label className="block text-sm font-bold">Correo electrónico<input value={email} disabled className="mt-2 w-full rounded-xl border border-[#dedbd0] bg-[#f3f2ec] px-4 py-3 font-normal text-[#68716b]" /></label><label className="block text-sm font-bold">Teléfono de contacto<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+502 5555 5555" className="mt-2 w-full rounded-xl border border-[#dedbd0] px-4 py-3 font-normal outline-none focus:border-[#177d73]" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Idioma<select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dedbd0] bg-white px-4 py-3 font-normal"><option value="es">Español</option><option value="en">English</option></select></label><label className="block text-sm font-bold">Tema<select value={theme} onChange={(e) => setTheme(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dedbd0] bg-white px-4 py-3 font-normal"><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label></div>{message && <p className="text-sm font-semibold text-[#177d73]">{message}</p>}<button disabled={saving} className="w-full rounded-xl bg-[#177d73] px-5 py-3 font-bold text-white transition hover:bg-[#12665e] disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar cambios'}</button></form></section></div></main>
}
