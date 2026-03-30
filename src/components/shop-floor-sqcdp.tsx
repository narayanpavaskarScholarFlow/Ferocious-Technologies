"use client";

import { SQCDPData } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const sqcdpData: SQCDPData[] = [
  { 
    category: 'S', label: 'Safety', value: 98,
    history: [{date: '1', value: 100}, {date: '2', value: 100}, {date: '3', value: 90}, {date: '4', value: 100}] 
  },
  { 
    category: 'Q', label: 'Quality', value: 92,
    history: [{date: '1', value: 85}, {date: '2', value: 88}, {date: '3', value: 92}, {date: '4', value: 92}] 
  },
  { 
    category: 'C', label: 'Cost', value: 78,
    history: [{date: '1', value: 70}, {date: '2', value: 72}, {date: '3', value: 75}, {date: '4', value: 78}] 
  },
  { 
    category: 'D', label: 'Delivery', value: 88,
    history: [{date: '1', value: 90}, {date: '2', value: 85}, {date: '3', value: 87}, {date: '4', value: 88}] 
  },
  { 
    category: 'P', label: 'People', value: 95,
    history: [{date: '1', value: 92}, {date: '2', value: 94}, {date: '3', value: 95}, {date: '4', value: 95}] 
  },
];

export function ShopFloorSQCDP() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-bold text-xl text-slate-800 uppercase tracking-tighter">SQCDP Performance Board</h2>
        <p className="text-xs font-bold text-slate-400 font-code">LAST_SYNC: {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {sqcdpData.map((item) => (
          <Card key={item.category} className="p-4 flex flex-col items-center gap-6 border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">{item.label}</div>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="64" cy="64" r="54" 
                    stroke={item.value > 90 ? "#22c55e" : item.value > 80 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="339.2" 
                    strokeDashoffset={339.2 - (339.2 * item.value / 100)} 
                    className="transition-all duration-1000"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-headline font-bold">{item.category}</span>
                  <span className="text-[10px] font-bold text-slate-400">{item.value}%</span>
               </div>
            </div>

            <div className="w-full h-16 mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={item.history}>
                    <Bar 
                      dataKey="value" 
                      fill={item.value > 90 ? "#22c55e" : item.value > 80 ? "#f59e0b" : "#ef4444"} 
                      radius={[2, 2, 0, 0]} 
                    />
                    <XAxis dataKey="date" hide />
                    <Tooltip cursor={{fill: 'transparent'}} content={() => null} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="absolute top-2 right-2">
               <div className={cn(
                 "h-2 w-2 rounded-full",
                 item.value > 90 ? "bg-green-500" : "bg-amber-500"
               )} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card">
           <div className="bg-slate-50 p-3 border-b border-slate-200">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ereignis-Protokoll (Safety/Quality)</h4>
           </div>
           <div className="p-4 space-y-4">
              <div className="flex gap-4 items-start border-b border-slate-100 pb-3">
                 <div className="bg-red-100 text-red-700 font-headline font-bold p-2 rounded text-sm w-10 text-center">S</div>
                 <div>
                    <p className="text-xs font-bold text-slate-800">Beinahe-Unfall an Maschine ML-02 gemeldet</p>
                    <p className="text-[10px] text-slate-400 mt-1">Status: In Klärung / Zuständig: Sicherheitsbeauftragter</p>
                 </div>
                 <div className="ml-auto text-[10px] text-slate-300 font-code">03.03. / 08:15</div>
              </div>
              <div className="flex gap-4 items-start">
                 <div className="bg-amber-100 text-amber-700 font-headline font-bold p-2 rounded text-sm w-10 text-center">Q</div>
                 <div>
                    <p className="text-xs font-bold text-slate-800">Abweichung in Charge #8845 - Prüfprotokoll folgt</p>
                    <p className="text-[10px] text-slate-400 mt-1">Status: Erledigt / Maßnahme: Nacharbeit</p>
                 </div>
                 <div className="ml-auto text-[10px] text-slate-300 font-code">02.03. / 16:40</div>
              </div>
           </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-2xl font-bold">Plant OEE</h4>
                <p className="text-xs text-slate-400">Monthly Performance Target</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">84%</span>
                <p className="text-[10px] text-green-500 font-bold">+5% target</p>
              </div>
           </div>
           <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Verfügbarkeit</span>
                    <span>92%</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[92%]" />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Leistungsgrad</span>
                    <span>88%</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[88%]" />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Qualitätsrate</span>
                    <span>96%</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[96%]" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}