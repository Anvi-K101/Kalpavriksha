import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check } from 'lucide-react';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen pb-32 pt-24 px-6 md:px-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-10">
    <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold mb-2 tracking-tight">{title}</h1>
    {subtitle && <p className="font-sans text-sm font-bold text-organic-400 uppercase tracking-widest">{subtitle}</p>}
  </div>
);

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-soft border border-organic-100/50 mb-6 transition-all duration-300 hover:shadow-float ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-5">
        {title && <h3 className="font-serif text-lg font-bold text-ink/90">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const MoodPicker: React.FC<{ value: number | null, onChange: (val: number) => void }> = ({ value, onChange }) => {
  const [internal, setInternal] = useState<number>(() => value || 5);
  const lastInteractionRef = useRef<number>(0);

  useEffect(() => {
    const isInteracting = Date.now() - lastInteractionRef.current < 2000;
    if (typeof value === 'number' && !isInteracting) {
      setInternal(value);
    }
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    lastInteractionRef.current = Date.now();
    setInternal(parseInt(e.target.value));
  };

  const handleCommit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    lastInteractionRef.current = Date.now();
    onChange(val);
  };

  const getLabel = (v: number) => v <= 2 ? "Despair" : v <= 4 ? "Heavy" : v <= 6 ? "Neutral" : v <= 8 ? "Light" : "Ecstatic";

  return (
    <div className="w-full py-4">
      <div className="relative h-24 w-full rounded-2xl bg-stone-50 border-2 border-white shadow-pressed overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-organic-100 opacity-30 transition-all duration-150" style={{ width: `${((internal - 1) / 9) * 100}%` }} />
        <input
          type="range" min="1" max="10" step="1"
          value={internal}
          onInput={handleInput}
          onChange={handleCommit}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div className="absolute inset-0 flex items-center justify-between px-10 pointer-events-none z-10">
           <div className="flex flex-col">
             <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Current Mood</span>
             <span className="font-serif font-black text-2xl text-ink/80 uppercase">{getLabel(internal)}</span>
           </div>
           <span className="font-serif font-black text-5xl text-organic-600">{internal}</span>
        </div>
      </div>
    </div>
  );
};

export const SliderInput: React.FC<{ label: string; value: number | null; onChange: (val: number) => void; min?: number; max?: number }> = ({ label, value, onChange, min = 1, max = 10 }) => {
  const [internal, setInternal] = useState<number>(() => value || 5);
  const lastInteractionRef = useRef<number>(0);

  useEffect(() => {
    const isInteracting = Date.now() - lastInteractionRef.current < 2000;
    if (typeof value === 'number' && !isInteracting) {
      setInternal(value);
    }
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    lastInteractionRef.current = Date.now();
    setInternal(parseInt(e.target.value));
  };

  const handleCommit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    lastInteractionRef.current = Date.now();
    onChange(val);
  };

  const progress = ((internal - min) / (max - min)) * 100;

  return (
    <div className="mb-10 last:mb-0">
      <div className="flex justify-between mb-4 items-center">
        <label className="font-serif text-ink/70 text-base font-bold">{label}</label>
        <span className="font-mono text-lg font-bold text-organic-700 bg-organic-50 px-3 py-1 rounded-lg border border-organic-100">{internal}</span>
      </div>
      <div className="relative h-12 flex items-center">
        <div className="absolute w-full h-2.5 bg-stone-100 rounded-full border border-stone-200 overflow-hidden">
           <div className="h-full bg-organic-500 transition-all duration-150" style={{ width: `${progress}%` }} />
        </div>
        <input 
          type="range" min={min} max={max} value={internal} 
          onInput={handleInput}
          onChange={handleCommit}
          className="relative w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="absolute h-8 w-8 bg-white border-2 border-organic-600 rounded-full shadow-float pointer-events-none transition-all duration-150" style={{ left: `calc(${progress}% - 16px)` }} />
      </div>
    </div>
  );
};

export const Counter: React.FC<{ value: number; onChange: (val: number) => void; label: string }> = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between py-3 border-b border-dashed border-organic-100 last:border-0">
    <span className="font-serif text-ink text-lg">{label}</span>
    <div className="flex items-center gap-4 bg-organic-50 rounded-full p-1 border border-organic-100/50">
      <button onClick={(e) => { e.preventDefault(); onChange(Math.max(0, value - 1)); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-500 active:scale-90 transition-all"><Minus size={16} /></button>
      <span className="w-8 text-center font-bold text-ink text-lg">{value}</span>
      <button onClick={(e) => { e.preventDefault(); onChange(value + 1); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-organic-600 active:scale-90 transition-all"><Plus size={16} /></button>
    </div>
  </div>
);

export const TextInput: React.FC<{ label?: string; value: string; onChange: (val: string) => void; placeholder?: string; rows?: number; className?: string }> = ({ label, value, onChange, placeholder, rows = 1, className }) => (
  <div className={`mb-4 ${className}`}>
    {label && <label className="block font-sans text-xs font-bold text-organic-400 uppercase tracking-widest mb-2">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-stone-50/50 border-b-2 border-stone-100 focus:border-organic-400 py-3 px-2 font-serif text-lg text-ink focus:outline-none focus:bg-white transition-all resize-none rounded-t-lg"
    />
  </div>
);

export const CheckItem: React.FC<{ label: string; checked: boolean; onToggle: () => void }> = ({ label, checked, onToggle }) => (
  <button onClick={onToggle} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${checked ? 'bg-organic-50 border-organic-200' : 'bg-white border-gray-100 hover:bg-stone-50'}`}>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'bg-organic-600 border-organic-600' : 'border-gray-300'}`}>
      {checked && <Check size={14} strokeWidth={4} className="text-white" />}
    </div>
    <span className={`font-serif text-lg ${checked ? 'text-organic-800 line-through' : 'text-ink'}`}>{label}</span>
  </button>
);

export const SaveIndicator: React.FC<{ status: 'saved' | 'saving' | 'idle' | 'local' }> = ({ status }) => {
  if (status === 'idle') return null;
  const label = {
    saving: 'Vault Syncing...',
    saved: 'Cloud Secured',
    local: 'Stored Locally'
  }[status as string] || 'Active';

  return (
    <div className="fixed top-6 right-6 z-[60] pointer-events-none animate-in fade-in slide-in-from-top-2">
      <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-float border border-organic-100 flex items-center gap-3">
         <div className={`w-2 h-2 rounded-full ${status === 'saving' ? 'bg-orange-400 animate-pulse' : status === 'local' ? 'bg-stone-400' : 'bg-organic-600'}`} />
         <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
      </div>
    </div>
  );
};

export const Stepper: React.FC<{ value: number; onChange: (val: number) => void; step?: number; min?: number; max?: number; unit?: string }> = ({ value, onChange, step = 1, min = 0, max = 100, unit = '' }) => (
  <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-organic-100/50">
     <button onClick={() => onChange(Math.max(min, value - step))} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-stone-500 active:scale-95 transition-all"><Minus size={14} /></button>
     <span className="font-mono text-sm font-bold min-w-[4ch] text-center text-ink">{value}{unit}</span>
     <button onClick={() => onChange(Math.min(max, value + step))} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-organic-600 active:scale-95 transition-all"><Plus size={14} /></button>
  </div>
);

export const ChipGroup: React.FC<{ options: string[]; selected: string[]; onChange: (val: string[]) => void; single?: boolean }> = ({ options, selected, onChange, single }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const isSelected = selected.includes(opt);
      return (
        <button
          key={opt}
          onClick={() => single ? (!isSelected && onChange([opt])) : (onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt]))}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isSelected ? 'bg-organic-700 text-white shadow-lg' : 'bg-white border border-organic-100 text-gray-500'}`}
        >
          {opt}
        </button>
      )
    })}
  </div>
);

export const MinimalInput: React.FC<{ value: string; onChange: (val: string) => void; placeholder?: string; className?: string; multiline?: boolean }> = ({ value, onChange, placeholder, className = '', multiline }) => (
  React.createElement(multiline ? 'textarea' : 'input', {
    value,
    onChange: (e: any) => onChange(e.target.value),
    placeholder,
    className: `w-full bg-transparent border-b border-transparent focus:border-organic-400 focus:outline-none transition-colors placeholder-gray-300 font-serif ${className}`,
    rows: multiline ? 3 : undefined
  })
);