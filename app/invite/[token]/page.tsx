import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InviteAccept from './invite-accept'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: details } = await supabase.rpc('get_invitation_details', { invite_token: token })
  if (!details?.[0]) return <main className="grid min-h-screen place-items-center bg-cream p-6"><div className="rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="display text-3xl font-bold">Invitación no disponible</h1><p className="mt-3 text-sm text-[#68716b]">Este enlace expiró o ya fue utilizado.</p><a href="/" className="mt-6 inline-block rounded-full bg-ink px-5 py-3 font-bold text-white">Ir a PoolPay</a></div></main>
  const { data: { user } } = await supabase.auth.getUser()
  return <InviteAccept token={token} projectId={details[0].project_id} projectName={details[0].project_name} isLoggedIn={Boolean(user)} />
}
