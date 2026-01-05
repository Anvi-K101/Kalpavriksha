import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TreeOfLife } from '../components/TreeOfLife';
import { WisdomPanel } from '../components/WisdomPanel';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { ArrowRight, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getLocalISODate } from '../constants';

export const Home = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ 
      count: 0, 
      activity: 0, 
      avgMood: 5, 
      totalCreative: 0, 
      totalStress: 0, 
      totalClarity: 0,
      checklistComplete: 0
  });
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    if (authLoading || !user) return;
    const refreshData = async () => {
        const data = StorageService.loadLocal();
        const entries = Object.values(data.entries);
        const moodSum = entries.reduce((acc, val) => acc + (val.state?.mood || 5), 0);
        const creativeSum = entries.reduce((acc, val) => acc + (val.effort?.creativeHours || 0), 0);
        const stressSum = entries.reduce((acc, val) => acc + (val.state?.stress || 0), 0);
        const claritySum = entries.reduce((acc, val) => acc + (val.state?.mentalClarity || 0), 0);
        setStats({
          count: entries.length,
          activity: entries.length > 0 ? 1 : 0,
          avgMood: entries.length ? moodSum / entries.length : 5,
          totalCreative: creativeSum,
          totalStress: stressSum,
          totalClarity: claritySum,
          checklistComplete: entries.reduce((acc, val) => acc + (val.checklist ? Object.values(val.checklist).filter(Boolean).length : 0), 0)
        });
        const todayStr = getLocalISODate();
        const [todayEntry, config] = await Promise.all([
          StorageService.getEntry(todayStr, user.uid),
          StorageService.getChecklistConfig(user.uid)
        ]);
        if (todayEntry && todayEntry.checklist) {
            setTodayCompleted(Object.values(todayEntry.checklist).filter(Boolean).length);
        }
        setTodayTotal(config.filter(c => c.enabled).length);
    };
    refreshData();
  }, [user, authLoading]);

  return (
    <div className="relative h-screen w-full bg-paper overflow-hidden flex flex-col items-center justify-center border-none shadow-none no-tap-highlight">
      
      {/* Subtle Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-56 h-56 bg-organic-50/40 rounded-full blur-[90px] pointer-events-none animate-pulse duration-[5000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-stone-50/60 rounded-full blur-[90px] pointer-events-none animate-pulse duration-[7000ms]" />

      {/* Top Header Controls */}
      <div className="absolute top-8 left-8 right-8 z-50 flex justify-between items-center pointer-events-none border-none">
         <div className="bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-stone-100/40 shadow-soft animate-in slide-in-from-left-6 duration-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-organic-500/50" />
            <span className="text-[9px] font-black uppercase tracking-[0.45em] text-organic-700/70">Archive Synchronized</span>
         </div>
         {user && (
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
              className="pointer-events-auto bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-ink active:scale-90 transition-all border border-stone-100/20 outline-none"
            >
              <LogOut size={12} /> Secure Exit
            </button>
         )}
      </div>

      {/* Visual Layer */}
      <div className="absolute inset-0 z-0 animate-in fade-in duration-[2000ms] pointer-events-none">
        <TreeOfLife 
           entryCount={stats.count} 
           activityLevel={stats.activity}
           stats={stats}
        />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 text-center space-y-8 p-10 max-w-xl bg-paper/5 backdrop-blur-[2px] rounded-[3rem] animate-in zoom-in-95 duration-700 border-none shadow-none">
         <div>
            <h1 className="font-serif text-5xl md:text-6xl text-ink font-bold tracking-tighter mb-3 leading-tight drop-shadow-sm">
              {stats.count === 0 ? "The Void." : "Chronos."}
            </h1>
            <div className="flex items-center justify-center gap-2.5 opacity-40 mt-3">
                <ShieldCheck size={16} className="text-organic-600" />
                <p className="font-serif text-sm md:text-base text-stone-500 italic tracking-wide">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
         </div>
        
        {/* AI Wisdom */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <WisdomPanel stats={stats} />
        </div>

        {/* Action Row */}
        <div className="flex flex-col items-center gap-5 pt-6">
            {todayTotal > 0 && (
                <Link to="/checklist" className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-stone-100/40 shadow-sm hover:shadow-soft hover:-translate-y-1 active:scale-95 transition-all outline-none">
                    <CheckCircle2 size={16} className={todayCompleted === todayTotal ? "text-organic-600" : "text-stone-300"} />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-ink/80">
                        Ritual Flow: {todayCompleted}/{todayTotal}
                    </span>
                </Link>
            )}

           <Link to="/log/state" className="group relative inline-flex items-center gap-4 px-10 py-5 bg-ink text-paper rounded-full font-sans font-black uppercase tracking-[0.4em] text-[10px] hover:bg-stone-800 transition-all shadow-xl hover:-translate-y-1 active:scale-95 outline-none">
             <span className="relative z-10">Capture Node</span>
             <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-500" />
             <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
           </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 text-center opacity-10 pointer-events-none">
         <p className="text-[8px] font-black uppercase tracking-[0.7em]">Chronos System 1.0.6 — Isolated</p>
      </div>
    </div>
  );
};
