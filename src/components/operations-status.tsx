
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Layers, Truck, ExternalLink, Activity, Plus, Hash, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_OPERATIONS = [
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
  { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
  { label: "WIP", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Hold", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "Review Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "NA", color: "text-slate-400 bg-slate-100 border-slate-200" },
];

const VENDORS = [
  "Precision HT",
  "Global Logistics",
  "Electro-Chem",
  "Alpha Machining",
  "Apex Finishing"
];

interface OperationsStatusProps {
  initialOrderId?: string | null;
  onOrderIdChange?: (orderId: string | null) => void;
  onNavigateToVendor?: () => void;
  externalOpStatuses?: Record<string, Record<string, string>>;
  onStatusChange?: (orderId: string, operation: string, status: string) => void;
}

export function OperationsStatus({ 
  initialOrderId, 
  onOrderIdChange, 
  onNavigateToVendor,
  externalOpStatuses = {},
  onStatusChange
}: OperationsStatusProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);
  const [operations, setOperations] = useState<string[]>(INITIAL_OPERATIONS);
  const [newOpName, setNewOpName] = useState('');

  useEffect(() => {
    if (initialOrderId) {
      setSelectedWorkOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSelectChange = (val: string) => {
    setSelectedWorkOrder(val);
    onOrderIdChange?.(val);
  };

  const handleLocalStatusChange = (column: string, status: string, vendorName?: string) => {
    if (!selectedWorkOrder || !onStatusChange) return;
    
    let finalStatus = status;
    if (status === 'Vendor' && vendorName) {
      finalStatus = `Vendor: ${vendorName}`;
    }
    
    onStatusChange(selectedWorkOrder, column, finalStatus);
  };

  const handleAddOperation = () => {
    if (newOpName.trim()) {
      setOperations(prev => [...prev, newOpName.trim()]);
      setNewOpName('');
    }
  };

  const getStatusStyles = (status?: string) => {
    if (status?.startsWith('Vendor')) {
      return "text-purple-600 bg-purple-50 border-purple-200";
    }
    const match = STATUS_OPTIONS.find(opt => opt.label === status);
    return match?.color || "text-slate-400 bg-slate-50 border-slate-100";
  };

  const currentOpStatuses = selectedWorkOrder ? externalOpStatuses[selectedWorkOrder] || {} : {};

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
             <Activity className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-900">Operational Routing Status</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Industrial 2.0 Vertical Matrix</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-slate-200 h-11 px-6 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50"
            onClick={onNavigateToVendor}
          >
            Manage Vendors <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Order:</span>
            <Select 
              value={selectedWorkOrder || undefined} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="w-[200px] h-11 bg-white text-sm font-bold border-slate-200 rounded-full shadow-sm">
                <SelectValue placeholder="Select ID..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="103645">103645</SelectItem>
                <SelectItem value="102778">102778</SelectItem>
                <SelectItem value="100685">100685</SelectItem>
                <SelectItem value="105542">105542</SelectItem>
                <SelectItem value="101230">101230</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-8 overflow-hidden border-slate-200 bg-white shadow-xl rounded-[2rem]">
          <Table>
            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-20">Seq.</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Operation Name</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-[200px]">Current Status</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right px-8 w-20">
                  <Settings2 className="h-3.5 w-3.5 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedWorkOrder ? (
                <>
                  {operations.map((col, idx) => {
                    let defaultStatus = "NA";
                    const orderNum = parseInt(selectedWorkOrder);
                    if (idx < (orderNum % 10)) defaultStatus = "Completed";
                    if (idx === (orderNum % 10)) defaultStatus = "WIP";
                    
                    const currentStatus = currentOpStatuses[col] || defaultStatus;
                    
                    return (
                      <TableRow key={idx} className="h-20 border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                        <TableCell className="px-8 font-code text-xs text-slate-300 font-bold">
                          {(idx + 1).toString().padStart(2, '0')}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{col}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="outline-none focus:ring-4 focus:ring-primary/10 rounded-full transition-all w-full max-w-[160px]">
                                  <Badge 
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] font-bold uppercase py-2 px-4 w-full justify-center rounded-full border transition-all hover:scale-105 shadow-sm",
                                      getStatusStyles(currentStatus)
                                    )}
                                  >
                                    {currentStatus}
                                  </Badge>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100">
                                {STATUS_OPTIONS.map((opt) => (
                                  <DropdownMenuItem 
                                    key={opt.label}
                                    onClick={() => handleLocalStatusChange(col, opt.label)}
                                    className="flex items-center gap-3 cursor-pointer rounded-xl h-10 px-3 hover:bg-slate-50"
                                  >
                                    <div className={cn("h-2 w-2 rounded-full", opt.color.split(' ')[0].replace('text-', 'bg-'))} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                  </DropdownMenuItem>
                                ))}
                                
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="flex items-center gap-3 cursor-pointer rounded-xl h-10 px-3 hover:bg-slate-50">
                                    <Truck className="h-4 w-4 text-purple-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Vendor</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl">
                                      {VENDORS.map((vendor) => (
                                        <DropdownMenuItem 
                                          key={vendor}
                                          onClick={() => handleLocalStatusChange(col, 'Vendor', vendor)}
                                          className="cursor-pointer text-[10px] font-bold uppercase h-10 rounded-xl px-3"
                                        >
                                          {vendor}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-8">
                           <div className="h-2 w-2 rounded-full bg-slate-100 group-hover:bg-primary/20 transition-colors ml-auto" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-slate-50/30">
                    <TableCell colSpan={4} className="p-6">
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Input 
                            placeholder="Add manual routing step..." 
                            className="h-12 bg-white border-slate-200 rounded-2xl pl-10 text-xs font-bold uppercase tracking-widest focus-visible:ring-primary/20"
                            value={newOpName}
                            onChange={(e) => setNewOpName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddOperation()}
                          />
                          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        <Button 
                          onClick={handleAddOperation}
                          className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em]"
                        >
                          Add Step
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-80 p-0">
                    <div className="flex flex-col items-center justify-center text-center opacity-40">
                      <div className="bg-slate-50 p-8 rounded-full mb-6">
                        <Layers className="h-12 w-12 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">System Awaiting Selection</h3>
                      <p className="text-sm text-slate-500 max-w-xs mt-2 font-medium">
                        Search or select an active Work Order to initialize the routing telemetry data.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-8">Routing Analytics</h3>
            <div className="space-y-10">
               <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                      <circle 
                        cx="80" cy="80" r="70" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray="439.8" 
                        strokeDashoffset={439.8 - (439.8 * (selectedWorkOrder === '103645' ? 85 : 35) / 100)} 
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-display font-bold text-slate-900">{selectedWorkOrder ? (selectedWorkOrder === '103645' ? '85' : '35') : '0'}<span className="text-lg ml-0.5">%</span></span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Throughput</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-6 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Active Step:</span>
                    <Badge className="bg-primary/5 text-primary border-primary/10 font-bold uppercase text-[9px]">
                      {selectedWorkOrder ? (selectedWorkOrder === '103645' ? 'QC' : 'Design') : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Total Steps:</span>
                    <span className="text-sm font-bold text-slate-900">{operations.length}</span>
                  </div>
               </div>
            </div>
          </Card>

          <div className="flex flex-col gap-4 p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Routing Legend:</span>
            <div className="grid grid-cols-2 gap-4">
              {STATUS_OPTIONS.map(opt => (
                <div key={opt.label} className="flex items-center gap-2.5">
                  <div className={cn("h-2.5 w-2.5 rounded-full border shadow-sm", opt.color.split(' ')[0].replace('text-', 'bg-'))} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{opt.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-purple-600 shadow-sm" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Vendor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
