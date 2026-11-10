'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InviteAccept({ token, projectId, projectName, isLoggedIn }: { token: string; projectId: string; projectName: string; isLoggedIn: boolean }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  async function accept() {
    if (!isLoggedIn) { window.location.href = `/auth/sign-up?next=/invite/${token}`; return }
    setLoading(true)
    const { data, error } = await createClient().rpc('accept_project_invitation', { invite_token: token })
    setLoading(false)
    if (error || !data) { setMessage('No pudimos aceptar esta invitación. Puede haber expirado.') ; return }
    window.location.href = `/projects/${projectId}`
  }
  return <main className="grid min-h-screen place-items-center bg-cream p-6"><div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"><p className="text-sm font-bold text-teal">pool<span className="text-coral">pay</span>.</p><h1 className="display mt-7 text-4xl font-bold">Te invitaron a un proyecto.</h1><p className="mt-4 text-lg">Únete a <strong>{projectName}</strong> para compartir aportes y avances.</p>{message && <p role="alert" className="mt-5 text-sm font-semibold text-coral">{message}</p>}<button onClick={() => void accept()} disabled={loading} className="mt-7 w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:opacity-60">{loading ? 'Uniendo…' : isLoggedIn ? 'Unirme al proyecto' : 'Crear cuenta y unirme'}</button><a href="/" className="mt-5 inline-block text-sm font-semibold text-teal">Volver a PoolPay</a></div></main>
}
