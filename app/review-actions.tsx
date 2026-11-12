'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ReviewActions({ contributionId, onChanged }: { contributionId: string; onChanged?: () => void }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function updateStatus(status: 'approved' | 'rejected') {
    if (status === 'rejected' && !rejecting) { setRejecting(true); return }
    if (status === 'rejected' && !reason.trim()) { setMessage('Agrega un motivo breve para devolver este aporte.'); return }
    setBusy(true); setMessage('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); setMessage('Tu sesión expiró. Inicia sesión nuevamente.'); return }
    const update = status === 'approved'
      ? { status, approved_by: user.id, approved_at: new Date().toISOString(), rejection_reason: null }
      : { status, approved_by: user.id, approved_at: null, rejection_reason: reason.trim() }
    const { data, error } = await supabase.from('contributions').update(update).eq('id', contributionId).eq('status', 'pending').select('id').maybeSingle()
    setBusy(false)
    if (error || !data) { setMessage('No se pudo actualizar. Solo el creador del proyecto puede revisar este aporte.'); return }
    onChanged?.()
    router.refresh()
  }

  return <div className="flex flex-col items-end gap-2">{rejecting && <label className="w-full text-xs font-semibold text-[#68716b]">Motivo para devolver<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-[#dedbd0] px-3 py-2 text-sm font-normal" placeholder="Ej. No coincide con el comprobante" /></label>}<div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void updateStatus('approved')} className="min-h-10 rounded-full bg-teal px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Guardando…' : 'Aprobar'}</button>{rejecting ? <button type="button" disabled={busy} onClick={() => void updateStatus('rejected')} className="min-h-10 rounded-full border border-[#d67860] px-4 py-2 text-xs font-bold text-[#b95f48] disabled:opacity-50">Devolver aporte</button> : <button type="button" disabled={busy} onClick={() => setRejecting(true)} className="min-h-10 rounded-full border border-[#dedbd0] px-4 py-2 text-xs font-bold text-[#68716b] disabled:opacity-50">Rechazar</button>}</div>{message && <p role="alert" className="max-w-56 text-right text-xs text-[#b95f48]">{message}</p>}</div>
}
