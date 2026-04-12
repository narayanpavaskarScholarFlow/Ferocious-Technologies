
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      const start = item.startDate;
      const end = item.endDate;
      return filterDate >= start && filterDate <= end;
    });
  }, [machineSchedule, filterDate]);

  const totalLoadHours = useMemo(() => {
    // Mock calculation: 2 hours per task in filtered view for OEE visualization
    return filteredSchedule.length * 2;
  }, [filteredSchedule]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
        <div className="flex-1 space-y-3 w-full">
          <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-primary" /> Target Asset Node
          </Label>
          <Select value={selectedMachineId || ''} onValueChange={setSelectedMachineId}>
            <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-sm font-bold uppercase shadow-inner">
              <SelectValue placeholder="Identify machine..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-2xl max-h-[300px]">
              {machines.map(m => (
                <SelectItem key={m.id} value={m.id} className="text-xs font-bold uppercase">{m.name} ({m.mcNumber})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-3 w-full">
          <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Analysis Window
          </Label>
          <DatePicker 
            value={filterDate}
            onChange={setFilterDate}
            className="h-12 bg-slate-50 border-none rounded-xl shadow-inner text-xs"
          />
        </div>
      </div>

      {selectedMachine ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-white border-slate-200/60 shadow-xl rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="h-16 w-16" />
              </div>
              <div className="space-y-1 mb-6 relative z-10">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Scheduled Load</p>
                <h3 className="text-4xl font-display font-bold text-[#001F3D]">{totalLoadHours} <span className="text-lg text-slate-300">/ 8h</span></h3>
              </div>
              <div className="space-y-2 relative z-10">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      totalLoadHours > 7 ? "bg-red-500" : totalLoadHours > 4 ? "bg-primary" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min((totalLoadHours / 8) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Capacity Utilization Index</p>
              </div>
            </Card>

            <Card className="p-8 bg-white border-slate-200/60 shadow-xl rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Hash className="h-16 w-16" />
              </div>
              <div className="space-y-1 mb-6 relative z-10">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blocked Threads</p>
                <h3 className="text-4xl font-display font-bold text-primary">{filteredSchedule.length} <span className="text-lg text-slate-300">Jobs</span></h3>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed relative z-10">Active work orders reserved for this machine node on the selected cycle.</p>
            </Card>

            <Card className="p-8 bg-[#001F3D] text-white border-none shadow-xl rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <div className="space-y-1 mb-6 relative z-10">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Completion Protocol</p>
                <h3 className="text-4xl font-display font-bold text-white">
                  {filteredSchedule.filter(s => s.status === 'Completed').length}
                  <span className="text-lg text-white/30 ml-2">Verified</span>
                </h3>
              </div>
              <Badge className="bg-white/10 text-white border-white/10 text-[8px] font-bold tracking-widest uppercase w-fit">NOMINAL_HEALTH</Badge>
            </Card>
          </div>

          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2.5rem]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-[0.15em]">Daily Blockage Ledger: {selectedMachine.name}</h3>
              </div>
              <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-8 px-4 uppercase">
                {filteredSchedule.length} Nodes detected
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Work Order / Project</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Operation / Sub-Task</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Timeline Window</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-right px-10">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedule.map((item, idx) => (
                    <TableRow key={idx} className="h-20 border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                      <TableCell className="px-10">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[#001F3D] uppercase tracking-tight">#{item.workOrderId} - {item.customer}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Master Thread Reserved</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 uppercase">{item.operation}</span>
                          <span className="text-[10px] text-slate-400 italic mt-0.5">{item.task}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Badge variant="outline" className="font-code text-[10px] border-slate-200 text-slate-500 bg-white">{item.startDate}</Badge>
                          <ChevronLeft className="h-3 w-3 text-slate-300 rotate-180" />
                          <Badge variant="outline" className="font-code text-[10px] border-slate-200 text-slate-500 bg-white">{item.endDate}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm",
                          item.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          item.status === 'WIP' ? "bg-blue-50 text-blue-700 border-blue-100" :
                          "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-bold uppercase px-3 py-1",
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
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30 py-10">
                          <div className="p-8 bg-slate-50 rounded-[2rem] mb-6">
                            <Box className="h-16 w-16 text-slate-300" />
                          </div>
                          <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Machine Node Idle</p>
                          <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto font-medium">No work orders detected for this asset on the current timeline.</p>
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
        <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
          <div className="p-10 bg-slate-100 rounded-full mb-8">
            <Cpu className="h-20 w-20 text-slate-300" />
          </div>
          <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Resource Not Targeted</h4>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium">Select an asset from the fleet registry to load its specific load timeline and blocked threads.</p>
        </div>
      )}

      <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Logistics Advisory</p>
          <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
            Double-booking prevention is active. To modify a reserved slot, you must update the master work order routing in the **Operational Spreadsheet**.
          </p>
        </div>
      </div>
    </div>
  );
}
