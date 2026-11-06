'use client'

import { useState } from 'react'
import { Bell, ChevronDown, FileText, Home, LogOut, Menu, Plus, Settings, Share2, Sparkles, Users, WalletCards, X, Check, Clock3, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const starterProjects = [
  { id: '1', name: 'Viaje a Antigua', meta: '4 participantes · GTQ 2,500', date: '15 dic 2024', progress: 68, color: 'bg-coral', icon: '✦' },
  { id: '2', name: 'Regalo de cumpleaños', meta: '8 participantes · GTQ 800', date: '22 nov 2024', progress: 92, color: 'bg-sage', icon: '◌' },
  { id: '3', name: 'Casa compartida', meta: '3 participantes · GTQ 4,200', date: '30 nov 2024', progress: 41, color: 'bg-teal', icon: '⌂' },
]

export default function PoolPay() {
  const [active, setActive] = useState('Inicio')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')
  const [projectName, setProjectName] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [projects, setProjects] = useState(starterProjects)
  const nav = [{ label: 'Inicio', icon: Home }, { label: 'Mis proyectos', icon: FileText }, { label: 'Configuración', icon: Settings }]
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2600) }
  const loadProjects = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('projects').select('id,name,currency,goal_amount,deadline,status').order('created_at', { ascending: false })
    if (data?.length) setProjects(data.map((project, index) => ({
      id: project.id,
      name: project.name,
      meta: `${project.currency} ${Number(project.goal_amount ?? 0).toLocaleString('es-GT')}`,
      date: project.deadline ? new Date(`${project.deadline}T00:00:00`).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' }) : 'Sin fecha límite',
      progress: 0,
      color: ['bg-coral', 'bg-sage', 'bg-teal'][index % 3],
      icon: ['✦', '◌', '⌂'][index % 3],
    })))
  }
  const createProject = async () => {
    if (!projectName.trim() || !goalAmount || Number(goalAmount) <= 0) return notify('Completa el nombre y una meta válida.')
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsSaving(false); return notify('Inicia sesión para crear un proyecto.') }
    const { error } = await supabase.from('projects').insert({ owner_id: user.id, name: projectName.trim(), currency: 'GTQ', goal_amount: Number(goalAmount), status: 'active' })
    setIsSaving(false)
    if (error) return notify('No pudimos guardar el proyecto. Intenta de nuevo.')
    setProjectName(''); setGoalAmount(''); setShowModal(false); await loadProjects(); notify('Proyecto creado. ¡Listo para invitar a tu equipo!')
  }

  return <div className="min-h-screen bg-cream">
    <header className="sticky top-0 z-20 border-b border-[#e8e5dc] bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <button onClick={() => setActive('Inicio')} className="display text-[24px] font-bold tracking-[-0.04em]">pool<span className="text-teal">pay</span><span className="ml-1 text-coral">.</span></button>
        <div className="hidden items-center gap-2 md:flex"><button onClick={() => notify('Pronto podrás compartir PoolPay con tu equipo.')} className="flex items-center gap-2 rounded-full border border-[#dedbd0] px-4 py-2 text-sm font-semibold hover:bg-white"><Share2 size={16}/> Compartir PoolPay</button><button onClick={() => notify('No tienes notificaciones nuevas.')} className="relative rounded-full p-2 hover:bg-white" aria-label="Notificaciones"><Bell size={19}/><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-coral"/></button><button className="flex items-center gap-2 rounded-full border border-[#dedbd0] bg-white px-2 py-1.5 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-sage text-xs">AG</span> Andrea <ChevronDown size={15}/></button></div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 md:hidden" aria-label="Abrir menú">{menuOpen ? <X/> : <Menu/>}</button>
      </div>
      {menuOpen && <div className="border-t border-[#e8e5dc] bg-white p-4 md:hidden"><div className="flex flex-col gap-3">{nav.map(({label, icon: Icon}) => <button key={label} onClick={() => {setActive(label); setMenuOpen(false); if (label === 'Mis proyectos') void loadProjects()}} className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm"><Icon size={17}/>{label}</button>)}</div></div>}
    </header>
    <div className="mx-auto flex max-w-[1240px]">
      <aside className="hidden w-[224px] shrink-0 flex-col justify-between border-r border-[#e8e5dc] px-5 py-8 md:flex" style={{minHeight:'calc(100vh - 72px)'}}><div><p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b9188]">Menú</p><nav className="space-y-1">{nav.map(({label, icon: Icon}) => <button key={label} onClick={() => setActive(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active === label ? 'bg-white text-teal shadow-sm' : 'text-[#68716b] hover:bg-white/70'}`}><Icon size={18}/>{label}</button>)}</nav></div><button onClick={() => notify('Sesión cerrada')} className="flex items-center gap-3 px-3 text-sm font-semibold text-[#68716b]"><LogOut size={17}/> Cerrar sesión</button></aside>
      <main className="min-w-0 flex-1 px-5 py-9 lg:px-12 lg:py-12">
        <section className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-semibold text-teal">Martes, 12 de noviembre</p><h1 className="display text-[clamp(32px,4vw,48px)] font-bold leading-none tracking-[-0.05em]">Hola, Andrea <span className="text-coral">✦</span></h1><p className="mt-3 max-w-md text-[15px] leading-6 text-[#68716b]">Todo en orden. Aquí tienes un vistazo de tus pagos y proyectos compartidos.</p></div><div className="flex flex-wrap items-center gap-3"><a href="/contributions" className="flex w-fit items-center gap-2 rounded-full border border-[#dedbd0] bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5">Registrar aporte</a><button onClick={() => setShowModal(true)} className="flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"><Plus size={17}/> Nuevo proyecto</button></div></section>
        <section className="grid gap-4 sm:grid-cols-3"><Stat label="Total aportado" value="GTQ 1,850" note="Este mes" icon={<WalletCards size={19}/>} /><Stat label="Proyectos activos" value="3" note="En seguimiento" icon={<FileText size={19}/>} /><Stat label="Pendiente de revisión" value="2" note="Requieren tu atención" icon={<Clock3 size={19}/>} coral /></section>
        <section className="mt-12"><div className="mb-5 flex items-center justify-between"><div><h2 className="display text-2xl font-bold tracking-[-0.03em]">Tus proyectos</h2><p className="mt-1 text-sm text-[#7e867f]">Sigue el progreso de tus fondos compartidos.</p></div><button onClick={() => setActive('Mis proyectos')} className="hidden items-center gap-1 text-sm font-bold text-teal sm:flex">Ver todos <ArrowUpRight size={15}/></button></div><div className="grid gap-4 lg:grid-cols-3">{projects.map(p => <ProjectCard key={p.id} {...p} onClick={() => notify(`Abriendo ${p.name}`)}/>)}</div></section>
        <section className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]"><div className="rounded-3xl bg-white p-6 shadow-[0_8px_28px_rgba(18,33,31,0.05)]"><div className="mb-6 flex items-center justify-between"><div><h2 className="display text-xl font-bold">Actividad reciente</h2><p className="mt-1 text-sm text-[#7e867f]">Tus últimos movimientos en PoolPay.</p></div><button onClick={() => notify('Mostrando toda la actividad')} className="text-sm font-bold text-teal">Ver todo</button></div><div className="space-y-5"><Activity icon={<Check size={16}/>} title="Aporte registrado" desc="Viaje a Antigua · GTQ 350" time="Hace 2 horas"/><Activity icon={<Users size={16}/>} title="Nueva persona se unió" desc="Regalo de cumpleaños · Sofía M." time="Ayer"/><Activity icon={<Clock3 size={16}/>} title="Aporte por revisar" desc="Casa compartida · GTQ 700" time="Ayer" coral/></div></div><div className="relative overflow-hidden rounded-3xl bg-sage p-6"><Sparkles className="absolute -right-2 -top-2 h-24 w-24 rotate-12 text-white/70"/><div className="relative"><p className="mb-8 text-sm font-bold uppercase tracking-[0.15em] text-teal">Tip de PoolPay</p><h3 className="display max-w-[230px] text-2xl font-bold leading-tight">La claridad también es una forma de cuidar.</h3><p className="mt-4 text-sm leading-6 text-[#52655c]">Mantén a todos al día con recordatorios amables y transparentes.</p><button onClick={() => notify('Los recordatorios se activarán pronto.')} className="mt-6 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink">Aprender más</button></div></div></section>
      </main>
    </div>
    {showModal && <div className="fixed inset-0 z-30 grid place-items-center bg-ink/30 p-5"><div className="w-full max-w-md rounded-3xl bg-cream p-7 shadow-2xl"><div className="mb-6 flex items-start justify-between"><div><p className="text-sm font-bold text-teal">Nuevo proyecto</p><h2 className="display mt-1 text-3xl font-bold">¿Qué vamos a organizar?</h2></div><button onClick={() => setShowModal(false)} aria-label="Cerrar"><X/></button></div><label className="mb-2 block text-sm font-bold">Nombre del proyecto</label><input value={projectName} onChange={event => setProjectName(event.target.value)} placeholder="Ej. Viaje a la playa" className="mb-4 w-full rounded-2xl border border-[#dedbd0] bg-white px-4 py-3 outline-none focus:border-teal"/><label className="mb-2 block text-sm font-bold">Meta estimada</label><div className="mb-6 flex rounded-2xl border border-[#dedbd0] bg-white"><span className="grid place-items-center px-4 text-sm font-bold text-[#7e867f]">GTQ</span><input value={goalAmount} onChange={event => setGoalAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="w-full rounded-r-2xl px-2 py-3 outline-none"/></div><button onClick={createProject} disabled={isSaving} className="w-full rounded-full bg-ink px-5 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Guardando…' : 'Crear proyecto'}</button></div></div>}
    {toast && <div role="status" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
  </div>
}

function Stat({label,value,note,icon,coral=false}:{label:string,value:string,note:string,icon:React.ReactNode,coral?:boolean}) { return <div className="rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(18,33,31,0.04)]"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-semibold text-[#68716b]">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-full ${coral ? 'bg-[#fff0eb] text-[#d67860]' : 'bg-mint text-teal'}`}>{icon}</span></div><p className="display text-3xl font-bold tracking-[-0.04em]">{value}</p><p className="mt-1 text-xs font-semibold text-[#98a098]">{note}</p></div> }
function ProjectCard({name,meta,date,progress,color,icon,onClick}:{name:string,meta:string,date:string,progress:number,color:string,icon:string,onClick:()=>void}) { return <button onClick={onClick} className="group text-left rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(18,33,31,0.04)] transition hover:-translate-y-1 hover:shadow-lg"><div className={`mb-5 grid h-28 place-items-center rounded-2xl ${color} text-5xl text-ink/60`}>{icon}</div><div className="flex items-start justify-between gap-3"><div><h3 className="display text-lg font-bold">{name}</h3><p className="mt-1 text-xs font-semibold text-[#89928a]">{meta}</p></div><ArrowUpRight size={18} className="text-[#89928a] transition group-hover:text-teal"/></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-[#89928a]">Progreso</span><span className="text-teal">{progress}%</span></div><div className="h-2 rounded-full bg-[#edf0e9]"><div className="h-2 rounded-full bg-teal" style={{width:`${progress}%`}}/></div></div><p className="mt-3 text-xs font-semibold text-[#89928a]">Meta: {date}</p></button> }
function Activity({icon,title,desc,time,coral=false}:{icon:React.ReactNode,title:string,desc:string,time:string,coral?:boolean}) { return <div className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${coral ? 'bg-[#fff0eb] text-[#d67860]' : 'bg-mint text-teal'}`}>{icon}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{title}</p><p className="truncate text-xs text-[#89928a]">{desc}</p></div><span className="shrink-0 text-xs text-[#a0a69f]">{time}</span></div> }
