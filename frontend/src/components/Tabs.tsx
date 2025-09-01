import React from "react";


export type Tab = { id: string; label: string; icon?: React.ReactNode };


export function Tabs({ tabs, value, onChange }:{ tabs: Tab[]; value: string; onChange: (id: string) => void; }){
    return (
        <div className="flex justify-center">
            <div role="tablist" aria-label="Ergebnis-Bereiche" className="inline-flex gap-2 rounded-full bg-white/60 p-1 shadow ring-1 ring-slate-200">
                {tabs.map(t => {
                    const active = value === t.id;
                    return (
                        <button key={t.id} role="tab" aria-selected={active} aria-controls={`panel-${t.id}`} id={`tab-${t.id}`} onClick={()=>onChange(t.id)}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${active?"bg-sky-600 text-white":"text-slate-700 hover:bg-white"}`}>
                            {t.icon && <span aria-hidden>{t.icon}</span>}
                            {t.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}