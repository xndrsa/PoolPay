'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Bell, ChevronDown, FileText, Home, LogOut, Menu, Plus, Settings, Share2, Users, WalletCards, X, Check, Clock3, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReviewActions from './review-actions'
import PoolPayTips from './poolpay-tips'

export default function PoolPay() {
  const [active, setActive] = useState('Inicio')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')
  const [projectName, setProjectName] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const nav = [{ label: 'Inicio', icon: Home }, { label: 'Mis proyectos', icon: FileText }, { label: 'Configuración', icon: Settings }]
  const { data: dashboard, mutate: refreshProjects } = useSWR('poolpay-dashboard', async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { userId: '', projects: [], contributions: [] }
    const { data: projectRows, error: projectError } = await supabase.from('projects').select('id,owner_id,name,currency,goal_amount,deadline,status').order('created_at', { ascending: false })
    if (projectError) throw projectError
    const projectIds = (projectRows ?? []).map((project) => project.id)
    if (!projectIds.length) return { userId: user.id, projects: [], contributions: [] }
    const [{ data: contributionRows, error: contributionError }, { data: memberRows, error: memberError }] = await Promise.all([
      supabase.from('contributions').select('id,project_id,member_id,amount,status,payment_date,description,created_at').in('project_id', projectIds).order('created_at', { ascending: false }),
      supabase.from('project_members').select('id,profiles(full_name)').in('project_id', projectIds),
    ])
    if (contributionError) throw contributionError
    if (memberError) throw memberError
    const membersById = new Map((memberRows ?? []).map((member) => { const profiles = member.profiles as { full_name: string | null } | { full_name: string | null }[] | null; return [member.id, Array.isArray(profiles) ? profiles[0]?.full_name : profiles?.full_name] as const }))
    const contributions = (contributionRows ?? []).map((item) => ({ ...item, currency: projectRows?.find((project) => project.id === item.project_id)?.currency || 'GTQ', memberName: membersById.get(item.member_id) || 'Participante' }))
    const projects = (projectRows ?? []).map((project, index) => {
      const approved = contributions.filter((item) => item.project_id === project.id && item.status === 'approved').reduce((sum, item) => sum + Number(item.amount), 0)
      const goal = Number(project.goal_amount ?? 0)
      return {
        ...project,
        meta: `${project.currency} ${goal.toLocaleString('es-GT')}`,
        date: project.deadline ? new Date(`${project.deadline}T00:00:00`).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' }) : 'Sin fecha límite',
        progress: goal > 0 ? Math.min(100, Math.round(approved / goal * 100)) : 0,
        color: ['bg-coral', 'bg-sage', 'bg-teal'][index % 3],
        icon: ['✦', '◌', '⌂'][index % 3],
      }
    })
    return { userId: user.id, projects, contributions }
  })
  const visibleProjects = dashboard?.projects ?? []
  const dashboardContributions = dashboard?.contributions ?? []
  const approvedTotal = dashboardContributions.filter((item) => item.status === 'approved').reduce((sum, item) => sum + Number(item.amount), 0)
  const activeProjects = visibleProjects.filter((project) => project.status === 'active')
  const pendingReviews = dashboardContributions.filter((item) => item.status === 'pending' && visibleProjects.some((project) => project.id === item.project_id && project.owner_id === dashboard?.userId))
  const approvedByCurrency = dashboardContributions.filter((item) => item.status === 'approved').reduce<Record<string, number>>((totals, item) => { totals[item.currency] = (totals[item.currency] || 0) + Number(item.amount); return totals }, {})
  const approvedTotalLabel = Object.entries(approvedByCurrency).map(([currency, total]) => `${currency} ${total.toLocaleString('es-GT', { maximumFractionDigits: 2 })}`).join(' · ') || '—'
  useSWR('poolpay-auth-user', async () => {
    const { data: { user } } = await createClient().auth.getUser()
    if (!user && typeof window !== 'undefined') window.location.replace('/auth/login')
    return user
  })
  const { data: profile } = useSWR('poolpay-profile', async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
    return data
  })
  const displayName = profile?.full_name?.split(' ')[0] || ''
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2600) }
  const loadProjects = async () => { await refreshProjects() }
  const sharePoolPay = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'PoolPay', url: window.location.origin })
      else { await navigator.clipboard.writeText(window.location.origin); notify('Enlace de PoolPay copiado.') }
    } catch { notify('No pudimos compartir el enlace en este dispositivo.') }
  }
  const signOut = async () => { await createClient().auth.signOut(); window.location.href = '/auth/login' }
  const createProject = async () => {
    if (!projectName.trim() || !goalAmount || Number(goalAmount) <= 0) return notify('Completa el nombre y una meta válida.')
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsSaving(false); return notify('Inicia sesión para crear un proyecto.') }
    const { error } = await supabase.from('projects').insert({ owner_id: user.id, name: projectName.trim(), currency: 'GTQ', goal_amount: Number(goalAmount), status: 'active' })
    setIsSaving(false)
    if (error) return notify('No pudimos guardar el proyecto. Intenta de nuevo.')
    setProjectName(''); setGoalAmount(''); setShowModal(false); await loadProjects(); await refreshProjects(); notify('Proyecto creado. ¡Listo para invitar a tu equipo!')
  }

  return <div className="min-h-screen bg-cream">
    <header className="sticky top-0 z-20 border-b border-[#e8e5dc] bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <button onClick={() => setActive('Inicio')} className="display text-[24px] font-bold tracking-[-0.04em]">pool<span className="text-teal">pay</span><span className="ml-1 text-coral">.</span></button>
        <div className="hidden items-center gap-2 md:flex"><button onClick={() => void sharePoolPay()} className="flex items-center gap-2 rounded-full border border-[#dedbd0] px-4 py-2 text-sm font-semibold hover:bg-white"><Share2 size={16}/> Compartir PoolPay</button><button onClick={() => { document.getElementById('pending-reviews')?.scrollIntoView({ behavior: 'smooth' }); if (!pendingReviews.length) notify('No tienes aportes pendientes de revisión.') }} className="relative rounded-full p-2 hover:bg-white" aria-label={`Aportes pendientes: ${pendingReviews.length}`}><Bell size={19}/>{pendingReviews.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-coral"/>}</button><button className="flex items-center gap-2 rounded-full border border-[#dedbd0] bg-white px-2 py-1.5 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-sage text-xs">{displayName.slice(0, 2).toUpperCase()}</span> {displayName} <ChevronDown size={15}/></button></div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 md:hidden" aria-label="Abrir menú">{menuOpen ? <X/> : <Menu/>}</button>
      </div>
      {menuOpen && <div className="fixed inset-x-0 top-[72px] z-30 border-t border-[#e8e5dc] bg-white px-4 pb-6 pt-4 shadow-xl md:hidden"><div className="mx-auto flex max-w-[1240px] flex-col gap-2">{nav.map(({label, icon: Icon}) => <button key={label} onClick={() => { if (label === 'Configuración') { window.location.href = '/profile' } else { setActive(label); setMenuOpen(false); if (label === 'Mis proyectos') void loadProjects() } }} className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-semibold hover:bg-cream"><Icon size={20}/>{label}</button>)}<button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/auth/login' }} className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-semibold text-[#68716b] hover:bg-cream"><LogOut size={20}/> Cerrar sesión</button></div></div>}
    </header>
    <div className="mx-auto flex max-w-[1240px]">
      <aside className="hidden w-[224px] shrink-0 flex-col justify-between border-r border-[#e8e5dc] px-5 py-8 md:flex" style={{minHeight:'calc(100vh - 72px)'}}><div><p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b9188]">Menú</p><nav className="space-y-1">{nav.map(({label, icon: Icon}) => <button key={label} onClick={() => label === 'Configuración' ? (window.location.href = '/profile') : setActive(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active === label ? 'bg-white text-teal shadow-sm' : 'text-[#68716b] hover:bg-white/70'}`}><Icon size={18}/>{label}</button>)}</nav></div><button onClick={() => void signOut()} className="flex items-center gap-3 px-3 text-sm font-semibold text-[#68716b]"><LogOut size={17}/> Cerrar sesión</button></aside>
      <main className="min-w-0 flex-1 px-5 py-9 lg:px-12 lg:py-12">
        <section className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-semibold capitalize text-teal">{new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 className="display text-[clamp(32px,4vw,48px)] font-bold leading-none tracking-[-0.05em]">{displayName ? <>Hola, {displayName}</> : <>Tu espacio compartido</>} <span className="text-coral">✦</span></h1><p className="mt-3 max-w-md text-[15px] leading-6 text-[#68716b]">Todo en orden. Aquí tienes un vistazo de tus pagos y proyectos compartidos.</p></div><div className="flex w-full items-center gap-3 sm:w-auto">{visibleProjects.length > 0 && <a href="/contributions" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#dedbd0] bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5">Registrar aporte</a>}<button onClick={() => setShowModal(true)} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"><Plus size={17}/> Nuevo proyecto</button></div></section>
        <section className="grid gap-4 sm:grid-cols-3"><Stat label="Aportes aprobados" value={approvedTotalLabel} note="Importes visibles, separados por moneda" icon={<WalletCards size={19}/>} /><Stat label="Proyectos activos" value={String(activeProjects.length)} note={`${visibleProjects.length} propios o compartidos`} icon={<FileText size={19}/>} /><Stat label="Pendientes de revisión" value={String(pendingReviews.length)} note="En proyectos que administras" icon={<Clock3 size={19}/>} coral /></section>
        <section id="projects" className="mt-12 scroll-mt-24"><div className="mb-5 flex items-center justify-between"><div><h2 className="display text-2xl font-bold tracking-[-0.03em]">{active === 'Mis proyectos' ? 'Mis proyectos' : 'Tus proyectos'}</h2><p className="mt-1 text-sm text-[#7e867f]">Proyectos activos propios y compartidos. Selecciona uno para abrir sus detalles.</p></div><button onClick={() => { setActive('Mis proyectos'); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) }} className="hidden items-center gap-1 text-sm font-bold text-teal sm:flex">Ver todos <ArrowUpRight size={15}/></button></div>{visibleProjects.length ? <div className="grid gap-4 lg:grid-cols-3">{visibleProjects.map((project) => <ProjectCard key={project.id} {...project} onClick={() => { window.location.href = `/projects/${project.id}` }}/>)}</div> : <div className="rounded-3xl bg-white p-7 text-sm text-[#68716b]">{dashboard ? 'Todavía no tienes proyectos. Crea uno o acepta una invitación para verlo aquí.' : 'Cargando tus proyectos…'}</div>}</section>
        <section id="pending-reviews" className="mt-12 scroll-mt-24 rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(18,33,31,0.05)] sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="display text-xl font-bold">Aportes por revisar</h2><p className="mt-1 text-sm text-[#7e867f]">Solo se incluyen aportes de proyectos que administras.</p></div><span className="rounded-full bg-[#fff8da] px-3 py-1 text-xs font-bold text-[#8a711d]">{pendingReviews.length} pendientes</span></div>{pendingReviews.length ? <div className="space-y-3">{pendingReviews.map((item) => { const project = visibleProjects.find((entry) => entry.id === item.project_id); return <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#eeeade] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-bold">{item.currency} {Number(item.amount).toLocaleString('es-GT', { minimumFractionDigits: 2 })} · {item.memberName}</p><p className="mt-1 text-sm text-[#68716b]">{project?.name || 'Proyecto'} · {item.description || 'Sin nota'} · {new Date(`${item.payment_date}T00:00:00`).toLocaleDateString('es-GT')}</p><a href={`/projects/${item.project_id}`} className="mt-2 inline-block text-xs font-bold text-teal">Abrir proyecto</a></div><ReviewActions contributionId={item.id} onChanged={() => { void refreshProjects() }} /></article> })}</div> : <p className="rounded-2xl bg-[#f7f6f1] p-5 text-sm text-[#68716b]">{dashboard ? 'No tienes aportes pendientes de revisión.' : 'Cargando aportes pendientes…'}</p>}</section>
        <section className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]"><div className="rounded-3xl bg-white p-6 shadow-[0_8px_28px_rgba(18,33,31,0.05)]"><div className="mb-6"><h2 className="display text-xl font-bold">Actividad reciente</h2><p className="mt-1 text-sm text-[#7e867f]">Movimientos de tus proyectos que puedes consultar.</p></div><div className="space-y-5">{dashboardContributions.slice(0, 4).map((item) => <Activity key={item.id} icon={item.status === 'approved' ? <Check size={16}/> : <Clock3 size={16}/>} title={item.status === 'approved' ? 'Aporte aprobado' : item.status === 'rejected' ? 'Aporte devuelto' : 'Aporte pendiente'} desc={`${visibleProjects.find((project) => project.id === item.project_id)?.name || 'Proyecto'} · ${item.currency} ${Number(item.amount).toLocaleString('es-GT')} · ${item.memberName}`} time={new Date(item.created_at).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })} coral={item.status === 'pending'}/>)}</div>{dashboard && dashboardContributions.length === 0 && <p className="rounded-2xl bg-[#f7f6f1] p-4 text-sm text-[#68716b]">Cuando haya aportes, verás aquí la actividad reciente.</p>}</div><PoolPayTips/></section>
      </main>
    </div>
    {showModal && <div className="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-ink/40 p-4 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowModal(false) }}><div role="dialog" aria-modal="true" aria-labelledby="new-project-title" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-sm font-bold text-teal">Nuevo proyecto</p><h2 id="new-project-title" className="display mt-1 text-3xl font-bold">¿Qué vamos a organizar?</h2></div><button onClick={() => setShowModal(false)} aria-label="Cerrar" className="rounded-full p-2 hover:bg-white"><X/></button></div><label className="mb-2 block text-sm font-bold">Nombre del proyecto</label><input value={projectName} onChange={event => setProjectName(event.target.value)} placeholder="Ej. Viaje a la playa" className="mb-4 w-full rounded-2xl border border-[#dedbd0] bg-white px-4 py-3 outline-none focus:border-teal"/><label className="mb-2 block text-sm font-bold">Meta estimada</label><div className="mb-6 flex rounded-2xl border border-[#dedbd0] bg-white"><span className="grid place-items-center px-4 text-sm font-bold text-[#7e867f]">GTQ</span><input value={goalAmount} onChange={event => setGoalAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="w-full rounded-r-2xl px-2 py-3 outline-none"/></div><button onClick={createProject} disabled={isSaving} className="w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Guardando…' : 'Crear proyecto'}</button></div></div>}
    {toast && <div role="status" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
  </div>
}

function Stat({label,value,note,icon,coral=false}:{label:string,value:string,note:string,icon:React.ReactNode,coral?:boolean}) { return <div className="rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(18,33,31,0.04)]"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-semibold text-[#68716b]">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-full ${coral ? 'bg-[#fff0eb] text-[#d67860]' : 'bg-mint text-teal'}`}>{icon}</span></div><p className="display text-3xl font-bold tracking-[-0.04em]">{value}</p><p className="mt-1 text-xs font-semibold text-[#98a098]">{note}</p></div> }
function ProjectCard({name,meta,date,progress,color,icon,onClick}:{name:string,meta:string,date:string,progress:number,color:string,icon:string,onClick:()=>void}) { return <button onClick={onClick} className="group text-left rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(18,33,31,0.04)] transition hover:-translate-y-1 hover:shadow-lg"><div className={`mb-5 grid h-28 place-items-center rounded-2xl ${color} text-5xl text-ink/60`}>{icon}</div><div className="flex items-start justify-between gap-3"><div><h3 className="display text-lg font-bold">{name}</h3><p className="mt-1 text-xs font-semibold text-[#89928a]">{meta}</p></div><ArrowUpRight size={18} className="text-[#89928a] transition group-hover:text-teal"/></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-[#89928a]">Progreso</span><span className="text-teal">{progress}%</span></div><div className="h-2 rounded-full bg-[#edf0e9]"><div className="h-2 rounded-full bg-teal" style={{width:`${progress}%`}}/></div></div><p className="mt-3 text-xs font-semibold text-[#89928a]">Meta: {date}</p></button> }
function Activity({icon,title,desc,time,coral=false}:{icon:React.ReactNode,title:string,desc:string,time:string,coral?:boolean}) { return <div className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${coral ? 'bg-[#fff0eb] text-[#d67860]' : 'bg-mint text-teal'}`}>{icon}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{title}</p><p className="truncate text-xs text-[#89928a]">{desc}</p></div><span className="shrink-0 text-xs text-[#a0a69f]">{time}</span></div> }
