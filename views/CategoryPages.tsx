
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DailyEntry, RatingScale as RatingType } from '../types';
import { COMMON_EMOTIONS, EMPTY_ENTRY, getLocalISODate } from '../constants';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { 
  PageContainer, SectionHeader, Card, MoodLevelSelector, 
  Counter, RatingScale, TextInput, 
  SaveIndicator 
} from '../components/ui/Controls';
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const WRITING_PROMPTS = {
  wins: "What was a small moment of pride today?",
  breakthroughs: "What truth did you finally admit to yourself?",
  gratitude: "Think of one person you're glad exists.",
  future: "What are you preparing your future self for?",
  happy: "A texture, a sound, or a smell that felt good.",
  people: "Who left an impression on your energy today?"
};

const DateNavigator = ({ date, setDate }: { date: string, setDate: (d: string) => void }) => {
  const changeDate = (days: number) => {
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    setDate(getLocalISODate(dateObj));
  };
  
  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 mb-10 shadow-soft border border-stone-100 animate-in slide-in-from-top-4 duration-500"
    >
       <button 
         type="button" 
         onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeDate(-1); }} 
         className="p-3 hover:bg-stone-50 rounded-xl text-stone-300 hover:text-ink active:scale-75 transition-all cursor-pointer outline-none"
        >
          <ChevronLeft size={20} />
        </button>
       <div className="flex items-center gap-3">
          <Calendar size={16} className="text-organic-600 opacity-30" />
          <span className="font-serif font-black text-ink text-base md:text-lg tracking-tight">
             {(() => {
                const [y, m, d] = date.split('-').map(Number);
                return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
             })()}
          </span>
       </div>
       <button 
         type="button" 
         onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeDate(1); }} 
         className="p-3 hover:bg-stone-50 rounded-xl text-stone-300 hover:text-ink active:scale-75 transition-all cursor-pointer outline-none"
        >
          <ChevronRight size={20} />
        </button>
    </div>
  );
};

const useDailyEntry = (dateStr: string) => {
  const { user, loading: authLoading } = useAuth();
  const [entry, setEntry] = useState<DailyEntry>(() => {
    const local = StorageService.loadLocal();
    return local.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr };
  });
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle' | 'local' | 'error'>('idle');
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const userHasEditedRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (authLoading) return;

    setIsCloudLoading(true);
    userHasEditedRef.current = false;
    
    const localData = StorageService.loadLocal();
    setEntry(localData.entries[dateStr] || { ...EMPTY_ENTRY, id: dateStr });

    if (user) {
      let mounted = true;
      StorageService.getEntry(dateStr, user.uid).then(remote => {
        if (mounted) {
          if (!userHasEditedRef.current) {
            setEntry(remote);
          }
          setIsCloudLoading(false);
        }
      }).catch(() => {
        if (mounted) setIsCloudLoading(false);
      });
      return () => { mounted = false; };
    } else {
      setIsCloudLoading(false);
    }
  }, [dateStr, user, authLoading]);

  const triggerSave = useCallback((updatedEntry: DailyEntry) => {
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    
    setSaveStatus('saving');
    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        if (user) {
          await StorageService.saveEntry(updatedEntry, user.uid);
          setSaveStatus('saved');
        } else {
          setSaveStatus('local');
        }
        setTimeout(() => setSaveStatus(prev => (prev === 'saved' || prev === 'local') ? 'idle' : prev), 2000);
      } catch (err: any) {
        setSaveStatus(err.message.includes('permission') ? 'local' : 'error');
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    }, 1200);
  }, [user]);

  const save = useCallback((updater: (prev: DailyEntry) => DailyEntry) => {
    userHasEditedRef.current = true;
    setEntry(prev => {
      const next = updater(prev);
      triggerSave(next);
      return next;
    });
  }, [triggerSave]);

  return { entry, save, saveStatus, isCloudLoading };
};

const PageWrapper = ({ Component, title, subtitle }: { Component: any, title: string, subtitle: string }) => {
   const [date, setDate] = useState(getLocalISODate());
   const { entry, save, saveStatus, isCloudLoading } = useDailyEntry(date);

   return (
     <PageContainer className="max-w-4xl">
        <SaveIndicator status={saveStatus} />
        <DateNavigator date={date} setDate={setDate} />
        <SectionHeader title={title} subtitle={subtitle} />
        
        {isCloudLoading && (
          <div className="flex items-center justify-center gap-3 mb-8 text-organic-300 animate-pulse">
            <Loader2 size={18} className="animate-spin opacity-40" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Opening Archive...</span>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Component entry={entry} save={save} />
        </div>
     </PageContainer>
   );
};

const StateContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
  <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
      <Card title="Emotional Core">
        <MoodLevelSelector value={entry.state.mood} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, mood: v as RatingType}}))} />
      </Card>
      
      <Card title="Nuance">
         <div className="flex flex-wrap gap-2.5">
            {COMMON_EMOTIONS.map(emo => {
              const isActive = entry.state.descriptors.includes(emo);
              return (
                <button
                  key={emo}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    save((p: DailyEntry) => ({
                      ...p, 
                      state: {
                        ...p.state, 
                        descriptors: isActive ? p.state.descriptors.filter(d => d !== emo) : [...p.state.descriptors, emo]
                      }
                    }));
                  }}
                  className={`
                    px-5 py-2.5 rounded-2xl text-[11px] font-bold transition-all duration-300 active:scale-90 cursor-pointer border-2
                    ${isActive 
                        ? 'bg-organic-600 border-organic-600 text-white shadow-md -translate-y-1' 
                        : 'bg-white border-stone-100 text-stone-400 hover:border-organic-300 hover:text-organic-600 hover:-translate-y-0.5'}
                  `}
                >
                  {emo}
                </button>
              )
            })}
         </div>
      </Card>

      <Card title="Bio-Metrics">
        <div className="space-y-10 py-2">
          <RatingScale label="Internal Stress" value={entry.state.stress} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, stress: v as RatingType}}))} />
          <RatingScale label="Mental Focus" value={entry.state.mentalClarity} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, mentalClarity: v as RatingType}}))} />
          <RatingScale label="Anxiety Response" value={entry.state.anxiety} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, anxiety: v as RatingType}}))} />
        </div>
      </Card>

      <Card title="Physicality">
         <Counter label="Deep Laughter" value={entry.state.timesLaughed} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesLaughed: v}}))} />
         <Counter label="Crying / Release" value={entry.state.timesCried} onChange={(v) => save((p: DailyEntry) => ({...p, state: {...p.state, timesCried: v}}))} />
      </Card>
  </div>
);

const EffortContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Productive Focus">
          <div className="space-y-4">
            <Counter label="Work Hours" value={entry.effort.workHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, workHours: v}}))} />
            <Counter label="Creative Play" value={entry.effort.creativeHours} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, creativeHours: v}}))} />
          </div>
          <div className="mt-10 pt-8 border-t border-stone-100">
             <RatingScale label="Deep Flow Quality" value={entry.effort.focusQuality} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, focusQuality: v as RatingType}}))} />
          </div>
        </Card>
        <Card title="Regeneration">
          <Counter label="Hours Rested" value={entry.effort.sleepDuration} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, sleepDuration: v}}))} />
          <div className="mt-10 pt-8 border-t border-stone-100">
            <RatingScale label="Rest Quality" value={entry.effort.sleepQuality} onChange={(v) => save((p: DailyEntry) => ({...p, effort: {...p.effort, sleepQuality: v as RatingType}}))} />
          </div>
        </Card>
      </div>
    </div>
);

const AchievementsContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
      <Card title="The Victories"><TextInput label="Wins of the Day" prompt={WRITING_PROMPTS.wins} value={entry.achievements.dailyWins} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, dailyWins: v}}))} rows={3} /></Card>
      <Card title="Cognitive Shifts"><TextInput label="Breakthroughs" prompt={WRITING_PROMPTS.breakthroughs} value={entry.achievements.breakthroughs} onChange={(v) => save((p: DailyEntry) => ({...p, achievements: {...p.achievements, breakthroughs: v}}))} rows={3} /></Card>
    </div>
);

const ReflectionsContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <div className="animate-in fade-in duration-700" onClick={(e) => e.stopPropagation()}>
      <Card className="min-h-[60vh] flex flex-col border-none shadow-soft/50">
        <textarea 
          className="w-full flex-grow bg-transparent border-none p-0 text-xl md:text-2xl font-serif text-ink leading-[1.8] focus:ring-0 resize-none placeholder-stone-200 selection:bg-organic-100" 
          value={entry.reflections.longForm} 
          onChange={(e) => save((p: DailyEntry) => ({...p, reflections: {...p.reflections, longForm: e.target.value}}))} 
          placeholder="Unfold the day's inner dialogue..." 
          onClick={(e) => e.stopPropagation()}
        />
        <div className="pt-8 border-t border-stone-50 mt-8 flex justify-end items-center gap-3">
            <span className="font-mono text-[9px] text-stone-300 font-black uppercase tracking-[0.4em]">Vault Protection Active</span>
        </div>
      </Card>
    </div>
);

const MemoriesContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
      <Card title="Texture"><TextInput label="Moments of Joy" prompt={WRITING_PROMPTS.happy} value={entry.memory.happyMoments} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, happyMoments: v}}))} rows={3} /></Card>
      <Card title="Connection"><TextInput label="Humans Encountered" prompt={WRITING_PROMPTS.people} value={entry.memory.peopleMet} onChange={(v) => save((p: DailyEntry) => ({...p, memory: {...p.memory, peopleMet: v}}))} rows={3} /></Card>
    </div>
);

const FutureContent = ({ entry, save }: { entry: DailyEntry, save: any }) => (
    <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
      <Card title="Rootedness">
        <TextInput label="Gratitude" prompt={WRITING_PROMPTS.gratitude} value={entry.future.gratitude} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, gratitude: v}}))} rows={4} />
      </Card>
      <Card title="The Horizon">
        <TextInput label="Looking Forward" prompt={WRITING_PROMPTS.future} value={entry.future.lookingForward} onChange={(v) => save((p: DailyEntry) => ({...p, future: {...p.future, lookingForward: v}}))} rows={4} />
      </Card>
    </div>
);

export const StatePage = () => <PageWrapper Component={StateContent} title="Vital Signs" subtitle="Biological State" />;
export const EffortPage = () => <PageWrapper Component={EffortContent} title="Allocations" subtitle="Energy & Recovery" />;
export const AchievementsPage = () => <PageWrapper Component={AchievementsContent} title="The Archive" subtitle="Wins & Wisdom" />;
export const ReflectionsPage = () => <PageWrapper Component={ReflectionsContent} title="Solitude" subtitle="Journaling" />;
export const MemoriesPage = () => <PageWrapper Component={MemoriesContent} title="Sensations" subtitle="Preserving History" />;
export const FuturePage = () => <PageWrapper Component={FutureContent} title="Hope" subtitle="Gratitude & Future" />;
