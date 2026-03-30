"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OperationStep } from '@/lib/types';
import { Layers, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const opsData: OperationStep[] = [
  { id: '1', partId: 'GH-V6', operationName: 'OP 10: Face Milling', machineId: 'ML-01', status: 'Completed' },
  { id: '2', partId: 'GH-V6', operationName: 'OP 20: Pocketing', machineId: 'ML-02', status: 'In Progress' },
  { id: '3', partId: 'TB-X1', operationName: 'OP 10: Rough Turning', machineId: 'TR-04', status: 'In Progress' },
  { id: '4', partId: 'VA-88', operationName: 'OP 30: Grinding', machineId: 'GR-01', status: 'Queued' },
  { id: '5', partId: 'CH-PROTO', operationName: 'OP 50: Inspection', machineId: 'QC-01', status: 'Blocked' },
];

export function OperationsStatus() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold uppercase">Operational Routing Status</h2>
        <Badge variant="outline" className="bg-slate-800 text-white border-none">Active Ops: 8</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {opsData.map((op) => (
          <Card key={op.id} className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
            <div className="flex items-center gap-6">
              <div className="bg-blue-50 p-2 rounded">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold">{op.operationName}</p>
                <div className="flex gap-4 mt-1">
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Part: {op.partId}</p>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Workcenter: {op.machineId}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                {op.status === 'Completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {op.status === 'In Progress' && <Play className="h-4 w-4 text-blue-500 animate-pulse" />}
                {op.status === 'Queued' && <Clock className="h-4 w-4 text-slate-400" />}
                {op.status === 'Blocked' && <AlertCircle className="h-4 w-4 text-red-500" />}
                <span className="text-xs font-bold uppercase tracking-tight">{op.status}</span>
              </div>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase">View Details</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
