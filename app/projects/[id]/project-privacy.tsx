'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Settings = { member_names_visible: boolean; member_amounts_visible: boolean; member_payment_counts_visible: boolean; project_total_visible: boolean; participant_list_visible: boolean; individual_history_visible: boolean; preset: string }

export default function ProjectPrivacy({ projectId, initial }: { projectId: string; initial: Settings | null }) {
  const [settings, setSettings] = useState<Settings>(initial ?? { member_names_visible: true, member_amounts_visible: true, member_payment_counts_visible: true, project_total_visible: true, participant_list_visible: true, individual_history_visible: false, preset: 'public' })
  const [message, setMessage] = useState('')
  async function update(key: keyof Settings, value: boolean | string) {
    const next = { ...settings, [key]: value }; setSettings(next); setMessage('Guardando…')
    const { error } = await createClient().from('project_settings').upsert({ project_id: projectId, ...next })
    setMessage(error ? 'No se pudo guardar.' : 'Privacidad actualizada.')
  }
  return <section className="mt-6 rounded-3xl bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="display text-2xl font-bold">Privacidad del proyecto</h2><p className="mt-1 text-sm text-[#7e867f]">Decide qué información ve el equipo.</p></div>{message && <span className="text-xs font-semibold text-teal">{message}</span>}</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{([['member_names_visible', 'Mostrar nombres'], ['member_amounts_visible', 'Mostrar montos'], ['member_payment_counts_visible', 'Mostrar cantidad de aportes'], ['project_total_visible', 'Mostrar total del proyecto'], ['participant_list_visible', 'Mostrar participantes'], ['individual_history_visible', 'Mostrar historial individual']] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-2xl border border-[#eeeade] px-4 py-3 text-sm font-semibold"><span>{label}</span><input type="checkbox" checked={settings[key]} onChange={(event) => void update(key, event.target.checked)} className="h-4 w-4 accent-[#177d73]" /></label>)}</div></section>
}
