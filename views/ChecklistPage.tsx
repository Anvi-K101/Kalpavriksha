import React, { useState, useEffect } from 'react';
import { DailyEntry, ChecklistItemConfig } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';
import { PageContainer, SectionHeader, Card, SaveIndicator, CheckItem } from '../components/ui/Controls';
import { Settings, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { EMPTY_ENTRY, getLocalISODate } from '../constants';

export const ChecklistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [date] = useState(getLocalISODate());
  const [entry, setEntry] = useState<DailyEntry>({ ...EMPTY_ENTRY, id: date });
  const [config, setConfig] = useState<ChecklistItemConfig[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle' | 'local' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [isCloudChecking, setIsCloudChecking] = useState(true);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState('Notification' in window && Notification.permission === 'granted');

  useEffect(() => {
    if (authLoading) return;

    let mounted = true;
    setIsCloudChecking(true);
    
    const local = StorageService.loadLocal();
    setConfig(local.checklistConfig);
    setEntry(local.entries[date] || { ...EMPTY_ENTRY, id: date });

    if (!user) {
        setIsCloudChecking(false);
        return;
    }

    const loadAll = async () => {
        try {
            const [cfg, data] = await Promise.all([
                StorageService.getChecklistConfig(user.uid),
                StorageService.getEntry(date, user.uid)
            ]);
            if (mounted) {
                setConfig(cfg);
                setEntry(data);
                setIsCloudChecking(false);
            }
        } catch (err) {
            if (mounted) setIsCloudChecking(false);
        }
    };

    loadAll();
    return () => { mounted = false; };
  }, [date, user, authLoading]);

  const toggleTask = async (id: string) => {
    const currentVal = entry.checklist[id] || false;
    const newVal = !currentVal;
    
    const updatedEntry = {
        ...entry,
        checklist: {
            ...entry.checklist,
            [id]: newVal
        }
    };

    setEntry(updatedEntry); 
    setSaveStatus('saving');
    
    try {
        if (user) {
            await StorageService.saveEntry(updatedEntry, user.uid);
            setSaveStatus('saved');
        } else {
            setSaveStatus('local');
        }
        setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (e: any) {
        setSaveStatus(e.message === 'PERMISSION_DENIED' ? 'local' : 'error');
        setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const saveConfig = async (newConfig: ChecklistItemConfig[]) => {
      setConfig(newConfig);
      setSaveStatus('saving');
      try {
        if (user) {
            await StorageService.saveChecklistConfig(newConfig, user.uid);
            setSaveStatus('saved');
        } else {
            setSaveStatus('local');
        }
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch (e: any) {
        setSaveStatus(e.message === 'PERMISSION_DENIED' ? 'local' : 'error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
  };

  const addItem = (e: React.MouseEvent) => {
      e.preventDefault();
      const newItem: ChecklistItemConfig = {
          id: Date.now().toString(),
          label: 'New Ritual',
          enabled: true
      };
      saveConfig([...config, newItem]);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      saveConfig(config.filter(c => c.id !== id));
  };

  const updateItemLabel = (id: string, label: string) => {
      saveConfig(config.map(c => c.id === id ? { ...c, label } : c));
  };

  const requestNotificationPermission = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!('Notification' in window)) return;
      Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
      });
  };

  return (
    <PageContainer className="max-w-4xl">
      <SaveIndicator status={saveStatus} />
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <SectionHeader title="Rituals" subtitle={new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} />
          <button 
             type="button"
             onClick={(e) => { e.preventDefault(); setIsEditing(!isEditing); }}
             className={`
               p-5 rounded-3xl transition-all duration-500 active:scale-90 shadow-soft cursor-pointer flex items-center gap-3
               ${isEditing ? 'bg-ink text-white rotate-0' : 'bg-white text-stone-400 hover:text-ink hover:shadow-float'}
             `}
          >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2">{isEditing ? 'Save Design' : 'Edit Habits'}</span>
              {isEditing ? <Check size={20} /> : <Settings size={20} />}
          </button>
      </div>

      {isCloudChecking && (
          <div className="flex items-center justify-center mb-10 text-organic-300 gap-3 animate-pulse">
              <Loader2 className="animate-spin" size={16} />
              <span className="font-black uppercase tracking-[0.3em] text-[10px] opacity-60">Connecting to Vault</span>
          </div>
      )}

      {isEditing && (
          <div className="animate-in slide-in-from-top-12 duration-700 mb-12">
             <Card title="Design Your Discipline">
                <div className="space-y-6">
                    {config.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-stone-50 p-2 rounded-2xl border border-stone-100/50 group">
                            <input 
                                value={item.label}
                                onChange={(e) => updateItemLabel(item.id, e.target.value)}
                                className="flex-grow p-4 bg-transparent font-serif text-xl text-ink focus:outline-none placeholder-stone-300"
                                placeholder="Habit Name"
                            />
                            <button type="button" onClick={(e) => removeItem(item.id, e)} className="text-red-300 hover:text-red-500 p-4 transition-colors cursor-pointer active:scale-75">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <button 
                       type="button"
                       onClick={addItem}
                       className="
                        w-full py-6 border-2 border-dashed border-stone-200 text-stone-400 rounded-3xl 
                        hover:border-organic-400 hover:text-organic-600 hover:bg-organic-50 transition-all 
                        flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.3em] cursor-pointer
                       "
                    >
                        <Plus size={20} /> Add New Ritual
                    </button>
                </div>
                
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex justify-between items-center bg-paper/50 p-6 rounded-3xl border border-stone-100">
                        <div>
                            <h4 className="font-serif font-bold text-ink text-lg tracking-tight">Silent Nudges</h4>
                            <p className="text-sm text-stone-400 font-sans mt-1">Receive daily habit reminders</p>
                        </div>
                        <button 
                           type="button"
                           onClick={requestNotificationPermission}
                           disabled={notificationsEnabled}
                           className={`
                            px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer
                            ${notificationsEnabled ? 'bg-organic-100 text-organic-700' : 'bg-ink text-paper hover:bg-organic-800'}
                           `}
                        >
                            {notificationsEnabled ? 'Active' : 'Enable'}
                        </button>
                    </div>
                </div>
             </Card>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.filter(c => c.enabled).length === 0 && !isEditing && (
              <div className="col-span-full text-center py-32 text-stone-300 italic font-serif text-xl animate-in fade-in duration-1000">
                Your ritual list is empty. Open settings to begin your chronicle.
              </div>
          )}
          
          {config.filter(c => c.enabled).map(item => (
              <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CheckItem 
                   label={item.label}
                   checked={!!entry.checklist[item.id]}
                   onToggle={() => toggleTask(item.id)}
                />
              </div>
          ))}
      </div>
    </PageContainer>
  );
};
