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
  { label: "WIP", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
  { label: "Hold", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "Review Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "NA", color: "text-slate-400 bg-slate-50 border-slate-100" },
  { label: "Vendor", color: "text-purple-600 bg-purple-50 border-purple-200" },
];

interface OperationsStatusProps {
  initialOrderId?: string | null;
  onOrderIdChange?: (orderId: string | null) => void;
  onNavigateToVendor?: () => void;
}

export function OperationsStatus({ initialOrderId, onOrderIdChange, onNavigateToVendor }: OperationsStatusProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);
  const [opStatuses, setOpStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialOrderId) {
      setSelectedWorkOrder(initialOrderId);
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
    
    const initial: Record<string, string> = {};
    OPERATION_COLUMNS.forEach((col, idx) => {
      if (idx < 3) initial[col] = "Completed";
      else if (idx === 3) initial[col] = "WIP";
      else initial[col] = "NA";
    });
    setOpStatuses(initial);
  };

  const handleStatusChange = (column: string, status: string) => {
    let finalStatus = status;
    
    // If Vendor is selected, we append a mock vendor name and navigate to the portal
    if (status === 'Vendor') {
      finalStatus = "Vendor: Precision HT";
      onNavigateToVendor?.();
    }
    
    setOpStatuses(prev => ({ ...prev, [column]: finalStatus }));
  };

  const getStatusStyles = (status?: string) => {
    if (status?.startsWith('Vendor')) {
      return "text-purple-600 bg-purple-50 border-purple-200";
    }
    return STATUS_OPTIONS.find(opt => opt.label === status)?.color || "text-slate-400 bg-slate-50 border-slate-100";
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
                    className="font-bold text-[9px] uppercase text-slate-500 py-6 px-2 text-center border-r border-slate-100 last:border-r-0 min-w-[140px]"
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
                    const currentStatus = opStatuses[col] || "NA";
                    
                    return (
                      <TableCell key={idx} className="border-r border-slate-50 last:border-r-0 p-2">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="outline-none focus:ring-2 focus:ring-primary/20 rounded-md transition-all w-full">
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] font-bold uppercase py-1 px-2 w-full justify-center whitespace-nowrap",
                                    getStatusStyles(currentStatus)
                                  )}
                                >
                                  {currentStatus}
                                </Badge>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-40">
                              {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuItem 
                                  key={opt.label}
                                  onClick={() => handleStatusChange(col, opt.label)}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
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

      <div className="flex flex-wrap items-center gap-6 text-[10px] font-code text-slate-400 uppercase tracking-widest pt-4">
        {STATUS_OPTIONS.filter(opt => opt.label !== 'NA').map(opt => (
          <div key={opt.label} className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[8px] font-bold px-1.5 py-0", opt.color)}>
              {opt.label}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
