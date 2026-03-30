"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPERATION_COLUMNS = [
  "DFM",
  "Design",
  "Review",
  "Final Design",
  "Raw Material",
  "Pre-machining",
  "1st Grinding",
  "Heat Treatment",
  "2nd Grinding",
  "Hard Part Milling",
  "EDM / WEDM",
  "QC",
  "Assembly"
];

interface OperationsStatusProps {
  initialOrderId?: string | null;
  onOrderIdChange?: (orderId: string | null) => void;
}

export function OperationsStatus({ initialOrderId, onOrderIdChange }: OperationsStatusProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);

  useEffect(() => {
    if (initialOrderId) {
      setSelectedWorkOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSelectChange = (val: string) => {
    setSelectedWorkOrder(val);
    onOrderIdChange?.(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-headline font-bold uppercase text-slate-800">Operational Routing Status</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Work Order:</span>
            <Select 
              value={selectedWorkOrder || undefined} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="w-[180px] h-9 bg-white text-xs border-slate-200">
                <SelectValue placeholder="Select Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="103645">103645</SelectItem>
                <SelectItem value="102778">102778</SelectItem>
                <SelectItem value="100685">100685</SelectItem>
                <SelectItem value="105542">105542</SelectItem>
                <SelectItem value="101230">101230</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="bg-slate-800 text-white border-none h-9 px-4 flex items-center gap-2">
            Active Ops: <span className="font-code text-primary">{selectedWorkOrder ? '5' : '0'}</span>
          </Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                {OPERATION_COLUMNS.map((col) => (
                  <TableHead 
                    key={col} 
                    className="font-bold text-[9px] uppercase text-slate-500 py-4 px-2 text-center border-r border-slate-100 last:border-r-0 min-w-[90px]"
                  >
                    {col}
                  </TableHead>
                ))}
                <TableHead className="font-bold text-[9px] uppercase text-primary py-4 px-2 text-center min-w-[100px]">
                  Status in %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedWorkOrder ? (
                <TableRow className="h-16 border-b border-slate-100">
                  {OPERATION_COLUMNS.map((col, idx) => {
                    // Logic to simulate different progress based on ID
                    const isCompleted = idx < (selectedWorkOrder === '103645' ? 10 : 4);
                    const isInProgress = idx === (selectedWorkOrder === '103645' ? 10 : 4);
                    
                    return (
                      <TableCell key={idx} className="border-r border-slate-50 last:border-r-0 p-2">
                        <div className="flex justify-center">
                          <div className={cn(
                            "h-3 w-3 rounded-full",
                            isCompleted ? "bg-green-500" : isInProgress ? "bg-blue-500 animate-pulse" : "bg-slate-100"
                          )} />
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-code font-bold text-primary">
                    {selectedWorkOrder === '103645' ? '85%' : '35%'}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={OPERATION_COLUMNS.length + 1} className="h-64 p-0">
                    <div className="flex flex-col items-center justify-center text-center opacity-60">
                      <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Layers className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">No Active Operations</h3>
                      <p className="text-sm text-slate-500 max-w-xs mt-1">
                        Select a work order from the list above to view its real-time routing status across the shop floor.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-[10px] font-code text-slate-400 uppercase tracking-widest">
        <div className="h-2 w-2 rounded-full bg-green-500" /> Completed
        <div className="h-2 w-2 rounded-full bg-blue-500 ml-4" /> In Progress
        <div className="h-2 w-2 rounded-full bg-slate-200 ml-4" /> Queued
      </div>
    </div>
  );
}
