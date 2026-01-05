import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { StorageService } from '../services/storage';
import { PageContainer, SectionHeader, Card } from '../components/ui/Controls';
import { 
  User, ShieldCheck, LogOut, Download, AlertCircle, Share2, Calendar 
} from 'lucide-react';

export const Accounts = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalEntries: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const data = StorageService.loadLocal();
    setStats({ totalEntries: Object.keys(data.entries).length });
  }, []);

  const handleFullTransfer = async () => {
    const entry = await StorageService.getEntry(selectedDate, user?.uid || '');
    if (!entry) {
        alert("No node found for this date.");
        return;
    }

    const dateStr = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    
    // Detailed node block text
    const text = `Node Record: ${dateStr}\n\n` +
                 `[BIOMETRICS]\nMood: ${entry.state.mood || 'N/A'}\nStress: ${entry.state.stress || 'N/A'}\nClarity: ${entry.state.mentalClarity || 'N/A'}\nFeelings: ${entry.state.descriptors?.join(', ') || 'N/A'}\n\n` +
                 `[OUTPUT]\nDeep Work: ${entry.effort.workHours}h\nCreative: ${entry.effort.creativeHours}h\nRest: ${entry.effort.sleepDuration}h (${entry.effort.sleepQuality || 'N/A'})\n\n` +
                 `[ACHIEVEMENTS]\nWin of Day: ${entry.achievements.dailyWins || 'N/A'}\nBreakthroughs: ${entry.achievements.breakthroughs || 'N/A'}\n\n` +
                 `[REFLECTION]\n${entry.reflections.longForm || 'No journal recorded.'}\n\n` +
                 `[GRATITUDE]\n${entry.future.gratitude || 'N/A'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vault Node: ${selectedDate}`,
          text: text,
        });
      } catch (err) {
        console.warn("Share operation cancelled or failed", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Node content copied to clipboard for manual transfer.");
    }
  };

  if (!user) return null;

  return (
    <PageContainer>
      <SectionHeader title="Identity" subtitle="Vault Ownership" />

      <Card className="flex items-center gap-4 py-5 shadow-soft/50 border-stone-50">
        <div className="w-14 h-14 rounded-2xl bg-organic-50 flex items-center justify-center text-organic-600 shadow-sm border border-stone-100/50 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={24} />
          )}
        </div>
        <div className="flex-grow">
          <h2 className="font-serif text-xl font-bold text-ink leading-tight tracking-tight">{user.displayName || 'Vault Owner'}</h2>
          <p className="text-stone-400 text-[9px] font-sans uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
            <ShieldCheck size={11} className="text-organic-600" />
            Isolated Identity
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Card title="Vault Transfer">
           <div className="space-y-4">
              <p className="text-[10px] text-stone-400 leading-relaxed font-serif italic">
                Send a complete daily node to the system share sheet (e.g. Apple Journal).
              </p>
              <div className="flex gap-2">
                 <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-grow bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:ring-1 focus:ring-organic-100 transition-all"
                 />
                 <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); handleFullTransfer(); }}
                    className="px-4 bg-ink text-white rounded-xl hover:bg-stone-800 active:scale-90 transition-all outline-none flex items-center justify-center"
                    title="Share Node"
                 >
                    <Share2 size={16} />
                 </button>
              </div>
           </div>
        </Card>

        <Card title="Node Integrity">
           <div className="space-y-3 py-1">
              <div className="flex justify-between items-center text-xs font-serif">
                <span className="text-stone-400">Archived Nodes</span>
                <span className="font-bold text-ink bg-stone-50 px-2 py-0.5 rounded-md">{stats.totalEntries}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-serif pt-3 border-t border-stone-50">
                <span className="text-stone-400">Encryption Level</span>
                <span className="font-black text-organic-600 text-[9px] uppercase tracking-widest bg-organic-50 px-2 py-0.5 rounded-md">End-to-End</span>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-16">
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); StorageService.exportData(); }}
          className="py-4 bg-white border-2 border-stone-100 text-stone-500 rounded-2xl font-sans font-bold uppercase tracking-widest text-[10px] hover:border-stone-200 hover:text-ink hover:shadow-soft transition-all flex items-center justify-center gap-2.5 outline-none"
        >
          <Download size={14} /> JSON Vault Export
        </button>

        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
          className="py-4 bg-stone-50 text-stone-400 rounded-2xl font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-stone-100 hover:text-ink transition-all flex items-center justify-center gap-2.5 outline-none"
        >
          <LogOut size={14} /> Exit Vault
        </button>
      </div>

      <div className="text-center space-y-4 pb-20">
         <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-stone-50 rounded-full border border-stone-100/50">
            <AlertCircle size={12} className="text-stone-300" />
            <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-stone-300">Chronos Core 1.0.6 — Isolated Instance</span>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-200/60 animate-in fade-in duration-1000 delay-500">
           Made by Anvi Karanjkar
         </p>
      </div>
    </PageContainer>
  );
};
