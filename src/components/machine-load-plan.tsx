
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Hash, 
  Box,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, Machine } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MachineLoadPlanProps {
  machines: Machine[];
  orders: Order[];
  initialMachineId?: string | null;
}

export function MachineLoadPlan({ machines, orders, initialMachineId }: MachineLoadPlanProps) {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(initialMachineId || (machines.length > 0 ? machines[0].id : null));

  useEffect(() => {
    if (initialMachineId) setSelectedMachineId(initialMachineId);
  }, [initialMachineId]);

  const selectedMachine = useMemo(() => 
    machines.find(m => m.id === selectedMachineId), 
    [machines, selectedMachineId]
  );

  const machineSchedule = useMemo(() => {
    if (!selectedMachineId) return [];
    const schedule: any[] = [];
    
    orders.forEach(order => {
      order.routing?.forEach(op => {
        op.subTasks?.forEach(sub => {
          if (sub.machineId === selectedMachineId) {
            schedule.push({
              workOrderId: order.id,
              customer: order.customer,
              operation: op.name,
              task: sub.name,
              startDate: sub.startDate,
              endDate: sub.endDate,
              status: sub.status || 'Yet to start',
              priority: order.priority
            });
          }
        });
      });
    });

    return schedule.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  }, [selectedMachineId, orders]);

  const filteredSchedule = useMemo(() => {
    if (!filterDate) return machineSchedule;
    return machineSchedule.filter(item => {
      if (!item.startDate || !item.endDate) return false;
      
      const targetDate = new Date(filterDate);
      const startD = new Date(item.startDate);
      const endD = new Date(item.endDate);
      
      targetDate.setHours(0,0,0,0);
      startD.setHours(0,0,0,0);
      endD.setHours(0,0,0,0);
      
      return targetDate >= startD && targetDate <= endD;
    });
  }, [machineSchedule, filterDate]);

  const totalLoadHours = useMemo(() => {
    // Mock calculation: 2 hours per task in filtered view for OEE visualization
    return filteredSchedule.length * 2;
  }, [filteredSchedule]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl shadow-blue-900/5">
        <div className="flex-1 space-y-3 w-full">
          <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-primary" /> Target Asset Node
          </Label>
          <Select value={selectedMachineId || ''} onValueChange={setSelectedMachineId}>
            <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl text-sm font-bold uppercase shadow-inner">
              <SelectValue placeholder="Identify machine..." />
            </SelectTrigger>
            <SelectContent className="rounded-[1.5rem] border-slate-100 shadow-2xl max-h-[300px]">
              {machines.map(m => (
                <SelectItem key={m.id} value={m.id} className="text-xs font-bold uppercase">{m.name} ({m.mcNumber})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-3 w-full">
          <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Analysis Window
          </Label>
          <DatePicker 
            value={filterDate}
            onChange={setFilterDate}
            className="h-12 bg-slate-50 border-none rounded-2xl shadow-inner text-xs font-bold"
          />
        </div>
      </div>

      {selectedMachine ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-10 bg-white border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Clock className="h-24 w-24" />
              </div>
              <div className="space-y-1 mb-8 relative z-10">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Scheduled Cycle Load</p>
                <h3 className="text-5xl font-headline font-bold text-[#001F3D] tracking-tighter">
                  {totalLoadHours} <span className="text-xl text-slate-300 ml-1">/ 8h</span>
                </h3>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      totalLoadHours > 7 ? "bg-red-500" : totalLoadHours > 4 ? "bg-primary" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min((totalLoadHours / 8) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Capacity Utilization Matrix</p>
              </div>
            </Card>

            <Card className="p-10 bg-white border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Hash className="h-24 w-24" />
              </div>
              <div className="space-y-1 mb-8 relative z-10">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Blocked Threads</p>
                <h3 className="text-5xl font-headline font-bold text-primary tracking-tighter">
                  {filteredSchedule.length} <span className="text-xl text-slate-300 ml-1">Nodes</span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed relative z-10">Active production threads reserved for this asset node.</p>
            </Card>

            <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle2 className="h-24 w-24" />
              </div>
              <div className="space-y-1 mb-8 relative z-10">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Operational Health</p>
                <h3 className="text-5xl font-headline font-bold text-white tracking-tighter">
                  {filteredSchedule.filter(s => s.status === 'Completed').length}
                  <span className="text-xl text-white/20 ml-2 font-medium">Verified</span>
                </h3>
              </div>
              <Badge className="bg-white/10 text-white border-none text-[8px] font-bold tracking-[0.2em] uppercase w-fit px-4 py-1.5 rounded-full">NOMINAL_MATRIX</Badge>
            </Card>
          </div>

          <Card className="overflow-hidden border-none bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[2.5rem]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><CalendarIcon className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-[0.2em]">Blockage Ledger: {selectedMachine.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Resource Availability Matrix</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-9 px-6 uppercase tracking-widest rounded-full">
                {filteredSchedule.length} Sequences Detected
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Work Order / Account</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Operation Sequence</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Protocol Window</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Node State</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-right px-10">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedule.map((item, idx) => (
                    <TableRow key={idx} className="h-24 border-b border-slate-50 hover:bg-slate-50/30 transition-all group">
                      <TableCell className="px-10">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[#001F3D] uppercase tracking-tight">#{item.workOrderId} - {item.customer}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">Master Thread Protocol</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{item.operation}</span>
                          <span className="text-[9px] text-slate-400 font-medium uppercase italic">{item.task}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                          <Badge variant="outline" className="font-code text-[10px] border-none text-slate-500 font-bold">{item.startDate}</Badge>
                          <ChevronLeft className="h-3 w-3 text-slate-200 rotate-180" />
                          <Badge variant="outline" className="font-code text-[10px] border-none text-primary font-bold">{item.endDate}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[9px] font-bold uppercase px-5 py-2 rounded-full border shadow-sm",
                          item.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          item.status === 'WIP' ? "bg-blue-50 text-blue-700 border-blue-100" :
                          "bg-slate-100 text-slate-400 border-slate-200"
                        )}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-bold uppercase px-4 py-1 rounded-full",
                          item.priority === 'High' ? "bg-red-50 text-red-600 border-red-100" :
                          item.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-slate-50 text-slate-500 border-slate-100"
                        )}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSchedule.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30 py-10">
                          <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                            <Box className="h-20 w-20 text-slate-300" />
                          </div>
                          <p className="#001F3D font-display font-bold text-2xl uppercase tracking-tight">Machine Node Idle</p>
                          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium">No production nodes detected for this asset on the current analysis window.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      ) : (
        <div className="h-[500px] flex flex-col items-center justify-center opacity-30 text-center">
          <div className="p-12 bg-slate-100 rounded-full mb-10">
            <Cpu className="h-24 w-24 text-slate-300" />
          </div>
          <h4 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Node Target Required</h4>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto font-medium leading-relaxed">Select an operational asset from the fleet registry to load its specific capacity load and blocked threads.</p>
        </div>
      )}

      <div className="p-8 bg-amber-50/50 border border-amber-100 rounded-[2rem] flex items-start gap-6 animate-in slide-in-from-bottom-2 duration-1000">
        <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20"><AlertCircle className="h-6 w-6" /></div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-amber-900 uppercase tracking-[0.3em]">Planning Protocol Advisory</p>
          <p className="text-xs text-amber-700 font-medium leading-relaxed max-w-3xl">
            Double-booking prevention is active for this asset node. To modify a reserved slot or re-allocate capacity, you must update the master work order routing within the <span className="font-bold underline cursor-pointer">Operational Spreadsheet</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
