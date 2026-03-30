"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const mockOrders: Order[] = [
  { id: '103645', machine: 'Verpackungsvorrichtung VE0060', status: 'Betrieb', progress: 85, startTime: '03.03.2025, 14:23:01', endTime: '03.03.2025, 17:30:00', oee: 75 },
  { id: '102778', machine: 'Löteinrichtung SL01', status: 'Störung', progress: 42, startTime: '03.03.2025, 13:10:45', endTime: '-', oee: 34 },
  { id: '100685', machine: 'Prüfstand-02', status: 'Leerlauf', progress: 10, startTime: '03.03.2025, 15:00:00', endTime: '-', oee: 62 },
  { id: '105542', machine: 'Kniehebelpresse KP402', status: 'Betrieb', progress: 67, startTime: '03.03.2025, 08:30:00', endTime: '03.03.2025, 16:45:00', oee: 92 },
  { id: '101230', machine: 'Gantry Mill TR-80', status: 'Wartung', progress: 0, startTime: '-', endTime: '-', oee: 0 },
];

export function ShopFloorOrders() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-bold text-xl text-slate-800 uppercase tracking-tight">Aktuelle Produktionsaufträge</h2>
        <div className="flex gap-2">
           <Badge variant="outline" className="bg-white" suppressHydrationWarning>Heute: 24</Badge>
           <Badge variant="outline" className="bg-white" suppressHydrationWarning>Offen: 12</Badge>
        </div>
      </div>

      <div className="glass-card border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Auftrag ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Maschine</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Status</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Fortschritt</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Geplant Ende</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right text-slate-400">OEE Index</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-sm text-slate-700">{order.id}</TableCell>
                <TableCell className="text-slate-600 font-medium">{order.machine}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      order.status === 'Betrieb' ? 'bg-green-500' :
                      order.status === 'Störung' ? 'bg-red-500' :
                      order.status === 'Leerlauf' ? 'bg-amber-500' : 'bg-blue-500'
                    )} />
                    <span className="text-xs font-bold text-slate-500">{order.status}</span>
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{order.endTime}</TableCell>
                <TableCell className="text-right">
                   <div className={cn(
                     "inline-flex px-2 py-1 rounded text-xs font-bold min-w-[40px] justify-center",
                     order.oee > 80 ? 'bg-green-100 text-green-700' :
                     order.oee > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                   )}>
                     {order.oee}%
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[260px] border border-slate-200">
          <h3 className="text-slate-400 font-headline uppercase tracking-widest text-[10px] font-bold mb-8">Auftragsverteilung</h3>
          <div className="flex items-center gap-16">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#005a9c" strokeWidth="24" fill="transparent" strokeDasharray="376.8" strokeDashoffset="135" />
                <circle cx="72" cy="72" r="60" stroke="#f59e0b" strokeWidth="24" fill="transparent" strokeDasharray="376.8" strokeDashoffset="310" />
              </svg>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <div className="w-3 h-3 bg-[#005a9c] rounded-sm" /> In Bearbeitung (64%)
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <div className="w-3 h-3 bg-[#f59e0b] rounded-sm" /> Leerlauf (36%)
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-between min-h-[260px] border border-slate-200">
           <h3 className="text-slate-400 font-headline uppercase tracking-widest text-[10px] font-bold mb-6">Schicht-Zusammenfassung</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Geplante Zeit</p>
                <p className="text-2xl font-bold text-slate-700">08:00 h</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Effektive Zeit</p>
                <p className="text-2xl font-bold text-primary">07:12 h</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Ausschuss</p>
                <p className="text-2xl font-bold text-red-500">2.4 %</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Produktivität</p>
                <p className="text-2xl font-bold text-green-500">94.1 %</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
