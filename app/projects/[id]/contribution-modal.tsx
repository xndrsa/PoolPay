'use client'

import { useState } from 'react'
import ContributionForm from '../../contributions/contribution-form'

type Project = { id: string; name: string; currency: string; goal_amount: number | null }
type Member = { id: string; user_id: string; profiles: { full_name: string | null } | { full_name: string | null }[] | null }

export default function ContributionModal({ project, members }: { project: Project; members: Member[] }) {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-teal px-4 py-2.5 text-center text-sm font-bold text-white">Agregar pago</button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><div role="dialog" aria-modal="true" aria-labelledby="contribution-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-teal">Nuevo movimiento</p><h2 id="contribution-title" className="display mt-1 text-3xl font-bold">Registrar aporte</h2><p className="mt-2 text-sm text-[#68716b]">{project.name}</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar ventana" className="rounded-full border border-[#dedbd0] px-3 py-1 text-xl leading-none">×</button></div><ContributionForm projects={[project]} initialProjectId={project.id} initialMembers={members} hideProjectSelector /></div></div>}
  </>
}
