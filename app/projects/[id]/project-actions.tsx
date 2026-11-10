'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProjectActions({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [value, setValue] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function invite(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(''); setInviteLink('')
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage('Inicia sesión nuevamente.'); setSaving(false); return }
    const token = crypto.randomUUID()
    const isEmail = value.includes('@')
    const { error } = await supabase.from('project_invitations').insert({ project_id: projectId, invited_by: user.id, token, ...(isEmail ? { invitee_email: value.trim() } : { invitee_phone: value.trim() }) })
    setSaving(false)
    if (error) { setMessage('No pudimos crear la invitación.'); return }
    const link = `${window.location.origin}/invite/${token}`
    setInviteLink(link)
    setRecipient(isEmail ? '' : value.replace(/\D/g, ''))
    setValue('')
    setMessage(isEmail ? 'Invitación lista para enviar por correo.' : 'Invitación lista para enviar por WhatsApp.')
  }

  const whatsappUrl = inviteLink && recipient ? `https://wa.me/${recipient}?text=${encodeURIComponent(`Te invito a unirte a ${projectName} en PoolPay: ${inviteLink}`)}` : ''
  const emailUrl = inviteLink ? `mailto:?subject=${encodeURIComponent(`Invitación a ${projectName}`)}&body=${encodeURIComponent(`Únete a ${projectName} en PoolPay desde este enlace: ${inviteLink}`)}` : ''

  return <div className="flex flex-col gap-3 sm:items-end"><form onSubmit={invite} className="flex flex-col gap-2 sm:flex-row"><input required value={value} onChange={(event) => setValue(event.target.value)} placeholder="Correo o teléfono" className="rounded-full border border-[#dedbd0] bg-white px-4 py-2.5 text-sm outline-none focus:border-teal"/><button disabled={saving} className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Creando…' : 'Crear invitación'}</button></form>{message && <p className="max-w-xs text-right text-xs font-semibold text-teal">{message}</p>}{inviteLink && <div className="flex flex-wrap justify-end gap-2 text-xs"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#e3f7e9] px-3 py-2 font-bold text-[#16743c]">Abrir WhatsApp</a><a href={emailUrl} className="rounded-full bg-[#eef5ff] px-3 py-2 font-bold text-[#34629a]">Abrir correo</a><button type="button" onClick={() => void navigator.clipboard.writeText(inviteLink)} className="rounded-full border border-[#dedbd0] px-3 py-2 font-bold">Copiar enlace</button></div>}</div>
}
