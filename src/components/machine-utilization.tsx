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
  { name: 'ML-01', value: 85, target: 90 },
  { name: 'ML-02', value: 72, target: 90 },
  { name: 'TR-04', value: 94, target: 90 },
  { name: 'TR-05', value: 45, target: 90 },
  { name: 'GR-01', value: 88, target: 90 },
  { name: '3D-09', value: 60, target: 90 },
];

export function MachineUtilization() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold uppercase">Machine Utilization Analysis</h2>
        <Badge variant="outline" className="bg-white">Target: 90%</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-6">Current Availability (Last 24h)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 90 ? '#22c55e' : entry.value >= 70 ? '#3b82f6' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase">Load Distribution</h3>
          <div className="space-y-6">
            {utilizationData.map((machine) => (
              <div key={machine.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>{machine.name}</span>
                  <span className={machine.value < 70 ? 'text-red-500' : 'text-blue-600'}>
                    {machine.value}%
                  </span>
                </div>
                <Progress value={machine.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-600 text-white border-none">
          <p className="text-[10px] uppercase font-bold opacity-80">Avg. Utilization</p>
          <p className="text-2xl font-bold">74.2%</p>
        </Card>
        <Card className="p-4 bg-green-600 text-white border-none">
          <p className="text-[10px] uppercase font-bold opacity-80">Peak Capacity</p>
          <p className="text-2xl font-bold">94.0%</p>
        </Card>
        <Card className="p-4 bg-red-600 text-white border-none">
          <p className="text-[10px] uppercase font-bold opacity-80">Downtime Hours</p>
          <p className="text-2xl font-bold">12.4h</p>
        </Card>
        <Card className="p-4 bg-slate-800 text-white border-none">
          <p className="text-[10px] uppercase font-bold opacity-80">Active Units</p>
          <p className="text-2xl font-bold">5 / 6</p>
        </Card>
      </div>
    </div>
  );
}
