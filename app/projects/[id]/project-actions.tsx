'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProjectActions({ projectId }: { projectId: string }) {
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  async function invite(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('')
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage('Inicia sesión nuevamente.'); setSaving(false); return }
    const isEmail = value.includes('@')
    const { error } = await supabase.from('project_invitations').insert({ project_id: projectId, invited_by: user.id, ...(isEmail ? { invitee_email: value.trim() } : { invitee_phone: value.trim() }) })
    setSaving(false)
    if (error) { setMessage('No pudimos guardar la invitación.'); return }
    setValue(''); setMessage('Invitación guardada. Podrás compartirla cuando activemos los mensajes.')
  }
  return <div className="flex flex-col gap-3 sm:items-end"><form onSubmit={invite} className="flex flex-col gap-2 sm:flex-row"><input required value={value} onChange={(event) => setValue(event.target.value)} placeholder="Correo o teléfono" className="rounded-full border border-[#dedbd0] bg-white px-4 py-2.5 text-sm outline-none focus:border-teal"/><button disabled={saving} className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Guardando…' : 'Invitar'}</button></form>{message && <p className="max-w-xs text-right text-xs font-semibold text-teal">{message}</p>}</div>
}
