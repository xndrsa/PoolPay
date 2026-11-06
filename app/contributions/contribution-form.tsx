'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Project = { id: string; name: string; currency: string; goal_amount: number | null }
type Member = { id: string; user_id: string; profiles: { full_name: string | null } | { full_name: string | null }[] | null }

export default function ContributionForm({ projects }: { projects: Project[] }) {
  const [projectId, setProjectId] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [memberId, setMemberId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function chooseProject(id: string) {
    setProjectId(id); setMemberId(''); setMessage('')
    if (!id) { setMembers([]); return }
    const supabase = createClient()
    const { data, error } = await supabase.from('project_members').select('id,user_id,profiles(full_name)').eq('project_id', id)
    if (error) setMessage('No pudimos cargar los participantes.')
    setMembers((data as Member[]) ?? [])
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('')
    if (!projectId || !memberId || Number(amount) <= 0) { setMessage('Selecciona proyecto, participante y un monto válido.'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage('Tu sesión expiró. Inicia sesión nuevamente.'); setSaving(false); return }
    const { error } = await supabase.from('contributions').insert({ project_id: projectId, member_id: memberId, submitted_by: user.id, amount: Number(amount), payment_date: date, description: description || null })
    setSaving(false)
    if (error) { setMessage('No pudimos guardar el aporte. Revisa los datos e intenta de nuevo.'); return }
    setAmount(''); setDescription(''); setMessage('Aporte guardado. Quedó pendiente de revisión.')
  }

  return <form onSubmit={submit} className="mt-8 space-y-5">
    <label className="block text-sm font-semibold">Proyecto<select value={projectId} onChange={(e) => void chooseProject(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dedbd0] bg-white px-4 py-3 font-normal outline-none focus:border-[#177d73]"><option value="">Selecciona un proyecto</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name} · {project.currency}</option>)}</select></label>
    <label className="block text-sm font-semibold">Participante<select value={memberId} onChange={(e) => setMemberId(e.target.value)} disabled={!projectId} className="mt-2 w-full rounded-xl border border-[#dedbd0] bg-white px-4 py-3 font-normal outline-none focus:border-[#177d73] disabled:bg-[#f3f2ec]"><option value="">Selecciona quién aportó</option>{members.map((member) => { const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles; return <option key={member.id} value={member.id}>{profile?.full_name || 'Participante'}</option> })}</select></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Monto<input required type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dedbd0] bg-white px-4 py-3 font-normal outline-none focus:border-[#177d73]" placeholder="0.00" /></label><label className="block text-sm font-semibold">Fecha<input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dedbd0] bg-white px-4 py-3 font-normal outline-none focus:border-[#177d73]" /></label></div>
    <label className="block text-sm font-semibold">Nota <span className="font-normal text-[#8b9188]">(opcional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-24 w-full resize-y rounded-xl border border-[#dedbd0] bg-white px-4 py-3 font-normal outline-none focus:border-[#177d73]" placeholder="Ej. Transferencia para la reserva" /></label>
    {message && <p role="status" className="rounded-xl bg-[#eef7f4] px-4 py-3 text-sm text-[#12695f]">{message}</p>}
    <button disabled={saving || !projects.length} className="w-full rounded-xl bg-[#177d73] px-4 py-3.5 font-bold text-white transition hover:bg-[#12695f] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar aportación'}</button>
  </form>
}
