"use client";

import { useState } from 'react';
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

export function OperationsStatus() {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-headline font-bold uppercase text-slate-800">Operational Routing Status</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Work Order:</span>
            <Select onValueChange={(val) => setSelectedWorkOrder(val)}>
              <SelectTrigger className="w-[180px] h-9 bg-white text-xs border-slate-200">
                <SelectValue placeholder="Select Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PO-88452">PO-88452</SelectItem>
                <SelectItem value="PO-88453">PO-88453</SelectItem>
                <SelectItem value="PO-88454">PO-88454</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="bg-slate-800 text-white border-none h-9 px-4 flex items-center gap-2">
            Active Ops: <span className="font-code text-primary">0</span>
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
                // Mock row for demonstration when a work order is selected
                <TableRow className="h-16 border-b border-slate-100">
                  {OPERATION_COLUMNS.map((col, idx) => (
                    <TableCell key={idx} className="border-r border-slate-50 last:border-r-0 p-2">
                      <div className="flex justify-center">
                        <div className={cn(
                          "h-3 w-3 rounded-full",
                          idx < 4 ? "bg-green-500" : idx === 4 ? "bg-blue-500 animate-pulse" : "bg-slate-100"
                        )} />
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-code font-bold text-primary">
                    35%
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
                        Operational tracking details have been cleared. New routing sequences will appear here when initialized.
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
