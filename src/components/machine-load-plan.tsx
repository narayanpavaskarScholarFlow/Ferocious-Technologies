"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Calendar, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MachineLoadPlanProps {
  machineId: string;
  machineName: string;
  onBack: () => void;
}

const mockSchedule = [
  { id: 'WO-88452', part: 'Front Axle Support', qty: 200, start: '08:00', end: '12:00', operator: 'Sarah Miller', status: 'Completed' },
  { id: 'WO-88453', part: 'Main Gear Housing', qty: 50, start: '12:30', end: '16:30', operator: 'Sarah Miller', status: 'In Progress' },
  { id: 'WO-88454', part: 'Hydraulic Coupler', qty: 120, start: '17:00', end: '21:00', operator: 'A. Chen', status: 'Queued' },
  { id: 'WO-88455', part: 'Valve Block B', qty: 75, start: '21:30', end: '01:30', operator: 'A. Chen', status: 'Queued' },
];

export function MachineLoadPlan({ machineId, machineName, onBack }: MachineLoadPlanProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 text-slate-400 hover:bg-slate-100">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-headline font-bold uppercase text-slate-900 tracking-tight">
            {machineName}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
            Detailed Machine Load Plan | Station ID: {machineId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase text-slate-500">Total Shift Load</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">7.5 <span className="text-sm text-slate-400">/ 8h</span></p>
            <div className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-blue-600 w-[93%]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-purple-600" />
            <span className="text-[10px] font-bold uppercase text-slate-500">Assigned Operators</span>
          </div>
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                {i === 1 ? 'SM' : 'AC'}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-[10px] font-bold uppercase text-slate-500">Jobs Completed</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">01 <span className="text-sm text-slate-400">/ 04</span></p>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Production Schedule | 03 Mar 2025</h3>
           </div>
           <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">
              Morning Shift
           </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-white hover:bg-transparent border-slate-200">
              <TableHead className="text-[10px] font-bold uppercase text-slate-400">Work Order</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-400">Part Description</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center">Qty</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-400">Timeline</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-400">Operator</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSchedule.map((job) => (
              <TableRow key={job.id} className="h-16 border-slate-100">
                <TableCell className="font-bold text-sm text-[#003d6b]">{job.id}</TableCell>
                <TableCell className="font-medium text-slate-600">{job.part}</TableCell>
                <TableCell className="text-center font-code text-slate-500">{job.qty}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs font-code text-slate-500">
                    <span>{job.start}</span>
                    <div className="h-px w-4 bg-slate-300" />
                    <span>{job.end}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-600">{job.operator}</TableCell>
                <TableCell className="text-right">
                  <Badge 
                    className={cn(
                      "text-[9px] uppercase font-bold px-3 py-0.5",
                      job.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      job.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-slate-50 text-slate-400 border border-slate-200'
                    )}
                  >
                    {job.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-xs font-medium">
          <span className="font-bold uppercase mr-2">Maintenance Alert:</span>
          VMC milling-HASS (03) requires hydraulic fluid inspection in 4.5 operational hours.
        </p>
      </div>
    </div>
  );
}
