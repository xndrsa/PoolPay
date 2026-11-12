'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

const tips = [
  { title: 'Acuerden la meta antes de empezar.', body: 'Un objetivo y una fecha claros ayudan a que todos sepan cuánto falta y para cuándo.', action: 'Define la meta del proyecto' },
  { title: 'Registra cada aporte el mismo día.', body: 'Anotar el monto y una nota breve mantiene el historial claro para todo el equipo.', action: 'Registrar un aporte' },
  { title: 'Revisar también es cuidar el fondo.', body: 'Aprueba los aportes que coinciden y deja un motivo claro si hace falta corregir uno.', action: 'Revisar aportes pendientes' },
]

export default function PoolPayTips() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % tips.length), 9000)
    return () => window.clearInterval(timer)
  }, [])
  const tip = tips[index]
  return <div aria-live="polite" className="relative overflow-hidden rounded-3xl bg-sage p-6"><Sparkles aria-hidden="true" className="absolute -right-2 -top-2 size-24 rotate-12 text-white/70"/><div className="relative"><div className="mb-7 flex items-center justify-between"><p className="text-sm font-bold uppercase tracking-[0.15em] text-teal">Tip de PoolPay</p><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-teal">{index + 1} de {tips.length}</span></div><h3 className="display max-w-[250px] text-2xl font-bold leading-tight">{tip.title}</h3><p className="mt-4 text-sm leading-6 text-[#52655c]">{tip.body}</p><a href={index === 0 ? '#projects' : index === 1 ? '/contributions' : '#pending-reviews'} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink">{tip.action}<ArrowRight aria-hidden="true" size={15}/></a><div className="mt-5 flex gap-2" role="group" aria-label="Elegir tip">{tips.map((item, itemIndex) => <button key={item.title} type="button" aria-label={`Mostrar tip ${itemIndex + 1}`} aria-pressed={index === itemIndex} onClick={() => setIndex(itemIndex)} className={`h-2.5 rounded-full transition-all ${index === itemIndex ? 'w-7 bg-teal' : 'w-2.5 bg-white'}`}/>)}</div></div></div>
}
