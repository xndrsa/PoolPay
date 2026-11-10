'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InviteAccept({ token, projectId, projectName, inviteeEmail, inviteePhone, isLoggedIn }: { token: string; projectId: string; projectName: string; inviteeEmail?: string | null; inviteePhone?: string | null; isLoggedIn: boolean }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function accept() {
    if (!isLoggedIn) {
      const accessEmail = inviteeEmail || email.trim()
      if (!accessEmail) { setMessage('Escribe un correo para recibir el acceso sin contraseña.'); return }
      setLoading(true)
      const redirectTo = new URL(process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`); redirectTo.searchParams.set('next', `/invite/${token}`)
      const { error } = await createClient().auth.signInWithOtp({ email: accessEmail, options: { emailRedirectTo: redirectTo.toString() } })
      setLoading(false)
      setMessage(error ? 'No pudimos enviar el acceso. Intenta nuevamente.' : `Enlace enviado a ${accessEmail}. Ábrelo para entrar sin contraseña.`)
      return
    }
    setLoading(true)
    const { data, error } = await createClient().rpc('accept_project_invitation', { invite_token: token })
    setLoading(false)
    if (error || !data) { setMessage('No pudimos aceptar esta invitación. Puede haber expirado.'); return }
    window.location.href = `/projects/${projectId}`
  }

  const recipient = inviteeEmail || inviteePhone
  return <main className="grid min-h-screen place-items-center bg-cream p-6"><div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"><p className="text-sm font-bold text-teal">pool<span className="text-coral">pay</span>.</p><h1 className="display mt-7 text-4xl font-bold">Te invitaron a un proyecto.</h1><p className="mt-4 text-lg">Únete a <strong>{projectName}</strong> para compartir aportes y avances.</p>{recipient && <p className="mt-3 text-sm text-[#68716b]">Invitación preparada para {recipient}</p>}{!isLoggedIn && !inviteeEmail && <label className="mt-5 block text-left text-sm font-bold">Correo para entrar<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" className="mt-2 w-full rounded-xl border border-[#dedbd0] px-4 py-3 font-normal outline-none focus:border-teal" /></label>}{message && <p role="status" className="mt-5 text-sm font-semibold text-teal">{message}</p>}<button onClick={() => void accept()} disabled={loading} className="mt-7 w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:opacity-60">{loading ? 'Preparando acceso…' : isLoggedIn ? 'Unirme al proyecto' : inviteeEmail ? 'Entrar y unirme' : 'Enviar acceso y continuar'}</button><a href="/" className="mt-5 inline-block text-sm font-semibold text-teal">Volver a PoolPay</a></div></main>
}
