'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InviteAccept({ token, projectId, projectName, inviteeEmail, inviteePhone, userEmail, isLoggedIn }: { token: string; projectId: string; projectName: string; inviteeEmail?: string | null; inviteePhone?: string | null; userEmail?: string | null; isLoggedIn: boolean }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const normalizedInviteEmail = inviteeEmail?.trim().toLowerCase() || ''
  const normalizedUserEmail = userEmail?.trim().toLowerCase() || ''
  const needsAccountSwitch = Boolean(isLoggedIn && normalizedInviteEmail && normalizedUserEmail !== normalizedInviteEmail)

  async function accept() {
    const supabase = createClient()
    if (!isLoggedIn || needsAccountSwitch) {
      const accessEmail = inviteeEmail?.trim() || email.trim()
      if (!accessEmail) { setMessage('Escribe un correo para recibir el acceso sin contraseña.'); return }
      setLoading(true)
      if (needsAccountSwitch) {
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
          setLoading(false)
          setMessage('No pudimos cambiar de cuenta. Intenta nuevamente.')
          return
        }
      }
      const redirectTo = new URL(process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`)
      redirectTo.searchParams.set('next', `/invite/${token}`)
      const { error } = await supabase.auth.signInWithOtp({ email: accessEmail, options: { emailRedirectTo: redirectTo.toString() } })
      setLoading(false)
      setMessage(error ? 'No pudimos enviar el acceso. Intenta nuevamente.' : `Enlace enviado a ${accessEmail}. Ábrelo para entrar sin contraseña.`)
      return
    }

    setLoading(true)
    const { data, error } = await supabase.rpc('accept_project_invitation', { invite_token: token })
    setLoading(false)
    if (error || !data) {
      setMessage(error?.message.includes('invitation_email_mismatch') ? `Entra con ${inviteeEmail} para aceptar esta invitación.` : 'No pudimos aceptar esta invitación. Puede haber expirado.')
      return
    }
    window.location.href = `/projects/${projectId}`
  }

  const recipient = inviteeEmail || inviteePhone
  return <main className="grid min-h-screen place-items-center bg-cream p-6"><div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"><p className="text-sm font-bold text-teal">pool<span className="text-coral">pay</span>.</p><h1 className="display mt-7 text-4xl font-bold">Te invitaron a un proyecto.</h1><p className="mt-4 text-lg">Únete a <strong>{projectName}</strong> para compartir aportes y avances.</p>{recipient && <p className="mt-3 text-sm text-[#68716b]">Invitación preparada para {recipient}</p>}{needsAccountSwitch && <p className="mt-3 text-sm text-[#68716b]">Tu sesión actual usa {userEmail || 'otra cuenta'}. Te enviaremos el acceso al correo invitado para entrar con la cuenta correcta.</p>}{!isLoggedIn && !inviteeEmail && <label className="mt-5 block text-left text-sm font-bold">Correo para entrar sin contraseña<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" className="mt-2 w-full rounded-xl border border-[#dedbd0] px-4 py-3 font-normal outline-none focus:border-teal" /><span className="mt-2 block text-xs font-normal text-[#68716b]">El teléfono de la invitación queda como dato de contacto; no enviamos ni validamos un código SMS.</span></label>}{message && <p role="status" className="mt-5 text-sm font-semibold text-teal">{message}</p>}<button onClick={() => void accept()} disabled={loading} className="mt-7 w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:opacity-60">{loading ? 'Preparando acceso…' : needsAccountSwitch ? 'Entrar con el correo invitado' : isLoggedIn ? 'Unirme al proyecto' : inviteeEmail ? 'Entrar y unirme' : 'Enviar acceso y continuar'}</button><a href="/" className="mt-5 inline-block text-sm font-semibold text-teal">Volver a PoolPay</a></div></main>
}
