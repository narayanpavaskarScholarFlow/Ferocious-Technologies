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
        <h2 className="font-headline font-bold text-xl text-slate-800">Aktuelle Produktionsaufträge</h2>
        <div className="flex gap-2">
           <Badge variant="outline" className="bg-white">Heute: 24</Badge>
           <Badge variant="outline" className="bg-white">Offen: 12</Badge>
        </div>
      </div>

      <div className="glass-card">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase">Auftrag ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase">Maschine</TableHead>
              <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
              <TableHead className="font-bold text-[10px] uppercase">Fortschritt</TableHead>
              <TableHead className="font-bold text-[10px] uppercase">Geplant Ende</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right">OEE Index</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-sm">{order.id}</TableCell>
                <TableCell className="text-slate-600 font-medium">{order.machine}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      order.status === 'Betrieb' ? 'bg-green-500' :
                      order.status === 'Störung' ? 'bg-red-500' :
                      order.status === 'Leerlauf' ? 'bg-amber-500' : 'bg-blue-500'
                    )} />
                    <span className="text-xs font-bold">{order.status}</span>
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{order.endTime}</TableCell>
                <TableCell className="text-right">
                   <div className={cn(
                     "inline-flex px-2 py-1 rounded text-xs font-bold",
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
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[240px]">
          <h3 className="text-slate-400 font-headline uppercase tracking-widest text-sm mb-6">Auftragsverteilung</h3>
          <div className="flex items-center gap-12">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="50" stroke="#005a9c" strokeWidth="20" fill="transparent" strokeDasharray="314" strokeDashoffset="100" />
                <circle cx="64" cy="64" r="50" stroke="#f59e0b" strokeWidth="20" fill="transparent" strokeDasharray="314" strokeDashoffset="280" />
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 bg-[#005a9c] rounded-sm" /> In Bearbeitung (64%)
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-3 h-3 bg-[#f59e0b] rounded-sm" /> Leerlauf (36%)
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-between min-h-[240px]">
           <h3 className="text-slate-400 font-headline uppercase tracking-widest text-sm mb-4">Schicht-Zusammenfassung</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Geplante Zeit</p>
                <p className="text-2xl font-bold">08:00 h</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Effektive Zeit</p>
                <p className="text-2xl font-bold text-primary">07:12 h</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Ausschuss</p>
                <p className="text-2xl font-bold text-red-500">2.4 %</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Produktivität</p>
                <p className="text-2xl font-bold text-green-500">94.1 %</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}