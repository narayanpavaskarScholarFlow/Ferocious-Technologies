"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Layers, ChevronDown } from 'lucide-react';
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

const STATUS_OPTIONS = [
  { label: "WIP", color: "bg-blue-500" },
  { label: "Completed", color: "bg-green-500" },
  { label: "Hold", color: "bg-red-500" },
  { label: "Review Pending", color: "bg-amber-500" },
  { label: "NA", color: "bg-slate-200" },
  { label: "Vendor", color: "bg-purple-500" },
];

interface OperationsStatusProps {
  initialOrderId?: string | null;
  onOrderIdChange?: (orderId: string | null) => void;
}

export function OperationsStatus({ initialOrderId, onOrderIdChange }: OperationsStatusProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);
  // Using local state to track status for demo purposes
  const [opStatuses, setOpStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialOrderId) {
      setSelectedWorkOrder(initialOrderId);
      // Initialize some random statuses when an order is selected
      const initial: Record<string, string> = {};
      OPERATION_COLUMNS.forEach((col, idx) => {
        if (idx < 5) initial[col] = "Completed";
        else if (idx === 5) initial[col] = "WIP";
        else initial[col] = "NA";
      });
      setOpStatuses(initial);
    }
  }, [initialOrderId]);

  const handleSelectChange = (val: string) => {
    setSelectedWorkOrder(val);
    onOrderIdChange?.(val);
  };

  const handleStatusChange = (column: string, status: string) => {
    setOpStatuses(prev => ({ ...prev, [column]: status }));
  };

  const getStatusColor = (status?: string) => {
    return STATUS_OPTIONS.find(opt => opt.label === status)?.color || "bg-slate-100";
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
                <SelectValue placeholder="Add Filter" />
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
          <Badge variant="outline" className="bg-[#1e293b] text-white border-none h-9 px-4 flex items-center gap-2 rounded-full font-bold">
            Active Ops: <span className="text-white">5</span>
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
                    className="font-bold text-[9px] uppercase text-slate-500 py-6 px-2 text-center border-r border-slate-100 last:border-r-0 min-w-[110px]"
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
                <TableRow className="h-20 border-b border-slate-100">
                  {OPERATION_COLUMNS.map((col, idx) => {
                    const currentStatus = opStatuses[col];
                    
                    return (
                      <TableCell key={idx} className="border-r border-slate-50 last:border-r-0 p-2">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="outline-none focus:ring-2 focus:ring-primary/20 rounded-full p-1 transition-all">
                                <div className={cn(
                                  "h-3.5 w-3.5 rounded-full shadow-sm",
                                  getStatusColor(currentStatus),
                                  currentStatus === "WIP" && "animate-pulse"
                                )} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-40">
                              {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuItem 
                                  key={opt.label}
                                  onClick={() => handleStatusChange(col, opt.label)}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <div className={cn("h-2 w-2 rounded-full", opt.color)} />
                                  <span className="text-xs font-medium">{opt.label}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <div className="flex flex-wrap items-center gap-4 text-[10px] font-code text-slate-400 uppercase tracking-widest pt-4">
        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-green-500" /> COMPLETED</div>
        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> IN PROGRESS</div>
        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-slate-200" /> QUEUED</div>
      </div>
    </div>
  );
}
