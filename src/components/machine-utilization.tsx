"use client";

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const utilizationData = [
  { name: 'VMC milling-BFW (01)', value: 72, color: '#3b82f6' },
  { name: 'VMC milling-BFW (02)', value: 62, color: '#3b82f6' },
  { name: 'VMC milling-HASS (03)', value: 88, color: '#22c55e' },
  { name: 'VMC milling (04)', value: 42, color: '#ef4444' },
  { name: 'CNC Turning -Jyothi (05)', value: 78, color: '#3b82f6' },
  { name: 'EDM ZNC (06)', value: 54, color: '#ef4444' },
];

const loadData = [
  { name: 'VMC milling-BFW (01)', value: 85, color: 'text-blue-500' },
  { name: 'VMC milling-BFW (02)', value: 72, color: 'text-blue-500' },
  { name: 'VMC milling-HASS (03)', value: 94, color: 'text-blue-500' },
  { name: 'VMC milling (04)', value: 45, color: 'text-red-500' },
  { name: 'CNC Turning -Jyothi (05)', value: 88, color: 'text-blue-500' },
  { name: 'EDM ZNC (06)', value: 60, color: 'text-orange-500' },
];

export function MachineUtilization() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="px-4 py-1 border border-slate-200 rounded-full text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white/5">
          Target: 90%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Card */}
        <Card className="lg:col-span-8 p-8 bg-[#111827] border-slate-800 shadow-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Current Availability (Last 24h)</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#1f2937', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Load Distribution Card */}
        <Card className="lg:col-span-4 p-8 bg-[#111827] border-slate-800 shadow-2xl flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Load Distribution</h3>
          <div className="space-y-8 flex-grow">
            {loadData.map((machine) => (
              <div key={machine.name} className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                  <span className="text-slate-200">{machine.name}</span>
                  <span className={machine.color}>{machine.value}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000" 
                    style={{ width: `${machine.value}%`, opacity: 0.9 }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KPI Cards Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-[#2563eb] text-white border-none shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Avg. Utilization</p>
          <p className="text-3xl font-bold">74.2%</p>
        </Card>
        <Card className="p-6 bg-[#16a34a] text-white border-none shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Peak Capacity</p>
          <p className="text-3xl font-bold">94.0%</p>
        </Card>
        <Card className="p-6 bg-[#dc2626] text-white border-none shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Downtime Hours</p>
          <p className="text-3xl font-bold">12.4h</p>
        </Card>
        <Card className="p-6 bg-[#1f2937] text-white border-none shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Active Units</p>
          <p className="text-3xl font-bold tracking-tight">5 / 6</p>
        </Card>
      </div>
    </div>
  );
}
