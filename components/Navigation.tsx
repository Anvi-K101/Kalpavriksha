import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Activity, Clock, Trophy, Feather, Camera, Sun, 
  Disc, X, ListChecks, UserCircle 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'checklist', path: '/checklist', icon: ListChecks, label: 'Ritual' },
  { id: 'state', path: '/log/state', icon: Activity, label: 'State' },
  { id: 'effort', path: '/log/effort', icon: Clock, label: 'Energy' },
  { id: 'achievements', path: '/log/achievements', icon: Trophy, label: 'Wins' },
  { id: 'reflections', path: '/log/reflections', icon: Feather, label: 'Mind' },
  { id: 'memories', path: '/log/memories', icon: Camera, label: 'Log' },
  { id: 'future', path: '/log/future', icon: Sun, label: 'Vision' },
];

export const BottomNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-ink/10 backdrop-blur-[2px] z-[80] transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed bottom-8 right-8 z-[90] flex flex-col items-end pointer-events-none">
        <nav 
          className={`
            mb-4 bg-white/98 backdrop-blur-xl rounded-[2rem] shadow-float p-5
            flex flex-col gap-4 min-w-[280px] md:min-w-[320px] pointer-events-auto
            origin-bottom-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            border border-stone-100/50
            ${isOpen ? 'scale-100 opacity-100 translate-y-0 translate-x-0' : 'scale-90 opacity-0 translate-y-8 translate-x-4 pointer-events-none'}
          `}
        >
          <div className="flex justify-around items-center border-b border-stone-50 pb-4">
             <NavLink to="/" onClick={(e) => { e.stopPropagation(); }} className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform outline-none">
                <div className="w-11 h-11 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-stone-100">
                  <Disc size={20} className="text-stone-300 group-hover:text-ink transition-colors" />
                </div>
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-400 group-hover:text-ink">Core</span>
             </NavLink>
             <NavLink to="/archive" onClick={(e) => { e.stopPropagation(); }} className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform outline-none">
                <div className="w-11 h-11 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-stone-100">
                  <Feather size={20} className="text-stone-300 group-hover:text-ink" />
                </div>
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-400 group-hover:text-ink">Archive</span>
             </NavLink>
             <NavLink to="/accounts" onClick={(e) => { e.stopPropagation(); }} className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform outline-none">
                <div className="w-11 h-11 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-stone-100">
                  <UserCircle size={20} className="text-stone-300 group-hover:text-ink" />
                </div>
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-400 group-hover:text-ink">Identity</span>
             </NavLink>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => (
              <NavLink
                key={cat.id}
                to={cat.path}
                onClick={(e) => { e.stopPropagation(); }}
                className={({ isActive }) => `
                  flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 active:scale-90 outline-none
                  ${isActive ? 'bg-organic-50 text-organic-700' : 'text-stone-200 hover:text-ink'}
                `}
              >
                <cat.icon size={16} strokeWidth={2} />
                <span className="text-[9px] font-black uppercase tracking-wider">{cat.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`
            pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center
            transition-all duration-500 z-[100] cursor-pointer outline-none border border-white/20
            ${isOpen ? 'bg-white text-ink rotate-45 scale-95' : 'bg-ink text-white hover:scale-105 active:scale-75'}
          `}
        >
          {isOpen ? <X size={22} /> : <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />} 
        </button>
      </div>
    </>
  );
};
