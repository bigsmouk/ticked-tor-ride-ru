import { Link, useLocation } from 'react-router-dom';
import { Menu, X, TrainFront } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/language';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
const items = [['/','Главная','Home'],['/play-with-friends','С друзьями','With friends'],['/play-solo','Против бота','Solo vs bot'],['/how-to-play','Как играть','How to play'],['/rules','Правила','Rules'],['/about','О проекте','About'],['/privacy','Конфиденциальность','Privacy']] as const;
export default function SiteNavigation() {
 const { language } = useLanguage(); const { pathname } = useLocation(); const [open,setOpen]=useState(false);
 return <nav data-no-translate aria-label={language==='en'?'Main navigation':'Главная навигация'} className="relative z-40 border-b border-amber-500/40 bg-[#4b2818] text-amber-50">
  <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
   <Link to="/" className="flex items-center gap-2 font-display font-bold text-amber-300"><TrainFront size={20}/> Ticket to Ride</Link>
   <div className="hidden lg:flex flex-wrap items-center justify-center gap-1">{items.map(([to,ru,en])=><Link key={to} to={to} aria-current={pathname===to?'page':undefined} className={`rounded-md px-2.5 py-2 text-sm hover:bg-white/10 ${pathname===to?'bg-amber-500/20 text-amber-300':''}`}>{language==='en'?en:ru}</Link>)}</div>
   <div className="flex items-center gap-2"><LanguageSwitcher/><button className="lg:hidden rounded-md p-2 hover:bg-white/10" aria-expanded={open} aria-label={language==='en'?'Toggle menu':'Открыть меню'} onClick={()=>setOpen(!open)}>{open?<X size={21}/>:<Menu size={21}/>}</button></div>
  </div>
  {open&&<div className="absolute inset-x-0 top-full border-b border-amber-500/40 bg-[#4b2818] p-3 shadow-xl lg:hidden"><div className="grid grid-cols-2 gap-2">{items.map(([to,ru,en])=><Link key={to} to={to} onClick={()=>setOpen(false)} className={`rounded-lg px-3 py-3 text-sm hover:bg-white/10 ${pathname===to?'bg-amber-500/20 text-amber-300':''}`}>{language==='en'?en:ru}</Link>)}</div></div>}
 </nav>;
}