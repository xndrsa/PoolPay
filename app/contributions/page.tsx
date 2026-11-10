import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ContributionForm from './contribution-form'

export default async function ContributionsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project: initialProjectId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/contributions')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, currency, goal_amount')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#f8f7f2] px-5 py-8 text-[#17221f] sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-[#177d73]">← Volver al inicio</Link>
        <div className="mt-10 rounded-3xl bg-white p-6 shadow-[0_10px_32px_rgba(18,33,31,0.06)] sm:p-9">
          <p className="text-sm font-bold text-[#177d73]">Nuevo movimiento</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Registrar una aportación</h1>
          <p className="mt-3 text-sm leading-6 text-[#68716b]">Guarda tu aporte en un proyecto y mantén el historial listo para revisión.</p>
          <ContributionForm projects={projects ?? []} initialProjectId={initialProjectId} />
        </div>
      </div>
    </main>
  )
}
