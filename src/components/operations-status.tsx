"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

export function OperationsStatus() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold uppercase">Operational Routing Status</h2>
        <Badge variant="outline" className="bg-slate-800 text-white border-none">Active Ops: 0</Badge>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center border-dashed bg-white/50 border-slate-200 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <Layers className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">No Active Operations</h3>
        <p className="text-sm text-slate-500 max-w-xs mt-1">
          Operational tracking details have been cleared. New routing sequences will appear here when initialized.
        </p>
      </Card>
    </div>
  );
}
