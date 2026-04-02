"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Printer, 
  Download, 
  ChevronRight, 
  ArrowLeft,
  Image as ImageIcon,
  Check,
  X,
  Box,
  MinusCircle,
  Plus,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type QualityStep = 'list' | 'checklist' | 'report' | 'review' | 'approval';
type CheckStatus = 'Pass' | 'Fail' | 'NA' | 'Pending';

interface DimensionRecord {
  id: string;
  feature: string;
  target: string;
  tolerance: string;
  upperLimit: string;
  lowerLimit: string;
  actual: string;
  status: 'Pass' | 'Fail' | 'NA' | 'Pending';
  remark: string;
}

const mockOrders = [
  { id: '103645', customer: 'Automotive Corp', part: 'Axle Support', status: 'Ready for QC', date: '03 Mar 2025' },
  { id: '102778', customer: 'Precision Aero', part: 'Gear Housing', status: 'Ready for QC', date: '03 Mar 2025' },
  { id: '100685', customer: 'Medical Solutions', part: 'Surgical Tray', status: 'In Review', date: '02 Mar 2025' },
];

const MACHINING_OPS = [
  "VMC Milling - Dimensions Verification",
  "CNC Turning - Surface Finish Ra < 0.8",
  "1st Grinding - Parallelism Check",
  "Heat Treatment - Hardness Rockwell C",
  "2nd Grinding - Tolerance ±0.005mm",
  "EDM / WEDM - Wire Cut Profile Check",
  "Assembly - Fit & Function Test"
];

const INITIAL_DIMENSIONS: DimensionRecord[] = [
  { id: '1', feature: 'Overall Length', target: '150.00', tolerance: '±0.05', upperLimit: '150.050', lowerLimit: '149.950', actual: '', status: 'Pending', remark: '' },
  { id: '2', feature: 'Outer Diameter', target: '45.00', tolerance: '+0.02/-0.00', upperLimit: '45.020', lowerLimit: '45.000', actual: '', status: 'Pending', remark: '' },
  { id: '3', feature: 'Internal Bore', target: '22.00', tolerance: '+0.021', upperLimit: '22.021', lowerLimit: '22.000', actual: '', status: 'Pending', remark: '' },
];

export function QualityManagement() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<QualityStep>('list');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [checks, setChecks] = useState<Record<string, CheckStatus>>({});
  const [dimensions, setDimensions] = useState<DimensionRecord[]>(INITIAL_DIMENSIONS);
  const [drawingUploaded, setDrawingUploaded] = useState(false);

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
    setCurrentStep('checklist');
    const initial: Record<string, CheckStatus> = {};
    MACHINING_OPS.forEach(op => initial[op] = 'Pending');
    setChecks(initial);
    setDimensions(INITIAL_DIMENSIONS);
  };

  const handleToggleCheck = (op: string, status: 'Pass' | 'Fail' | 'NA') => {
    setChecks(prev => ({ ...prev, [op]: status }));
  };

  const handleUpdateDimension = (id: string, field: keyof DimensionRecord, value: string) => {
    setDimensions(prev => prev.map(dim => {
      if (dim.id !== id) return dim;
      
      let updatedDim = { ...dim, [field]: value };
      
      // AUTO-CALCULATE LIMITS if Target or Tolerance changed
      if (field === 'target' || field === 'tolerance') {
        const targetNum = parseFloat(updatedDim.target);
        if (!isNaN(targetNum)) {
          let upperOffset = 0;
          let lowerOffset = 0;
          const tol = updatedDim.tolerance.trim();

          const plusMatch = tol.match(/\+([\d.]+)/);
          const minusMatch = tol.match(/-([\d.]+)/);
          const pmMatch = tol.match(/±([\d.]+)/);

          if (pmMatch) {
            const val = parseFloat(pmMatch[1]);
            upperOffset = val;
            lowerOffset = -val;
          } else {
            if (plusMatch) upperOffset = parseFloat(plusMatch[1]);
            if (minusMatch) lowerOffset = -parseFloat(minusMatch[1]);
            
            // If raw number like "0.05"
            if (!plusMatch && !minusMatch && !isNaN(parseFloat(tol))) {
               const val = parseFloat(tol);
               upperOffset = val;
               lowerOffset = -val;
            }
          }
          
          updatedDim.upperLimit = (targetNum + upperOffset).toFixed(3);
          updatedDim.lowerLimit = (targetNum + lowerOffset).toFixed(3);
        }
      }

      // AUTO-CALCULATE STATUS
      const actualNum = parseFloat(updatedDim.actual);
      const upperNum = parseFloat(updatedDim.upperLimit);
      const lowerNum = parseFloat(updatedDim.lowerLimit);

      if (!isNaN(actualNum) && !isNaN(upperNum) && !isNaN(lowerNum)) {
        if (actualNum >= lowerNum && actualNum <= upperNum) {
          updatedDim.status = 'Pass'; // Within tolerance (OK)
        } else {
          updatedDim.status = 'Fail'; // Out of tolerance (NOT OK)
        }
      } else if (updatedDim.actual === '') {
        updatedDim.status = 'Pending';
      }
      
      return updatedDim;
    }));
  };

  const handleDimensionStatus = (id: string, status: 'Pass' | 'Fail' | 'NA') => {
    setDimensions(prev => prev.map(dim => 
      dim.id === id ? { ...dim, status } : dim
    ));
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: `Dimension entries for Order #${selectedOrder?.id} have been updated in the ledger.`,
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Generating Document",
      description: "Preparing inspection report for print/export...",
    });
  };

  const handleAddDimension = () => {
    const newDim: DimensionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      feature: 'New Feature',
      target: '0.00',
      tolerance: '±0.00',
      upperLimit: '0.000',
      lowerLimit: '0.000',
      actual: '',
      status: 'Pending',
      remark: ''
    };
    setDimensions([...dimensions, newDim]);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <ShieldCheck className="h-4 w-4" />
            Quality Assurance 2.0
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            {currentStep === 'list' && 'Inspection Pipeline'}
            {currentStep === 'checklist' && 'Quality Check Entry'}
            {currentStep === 'report' && 'Inspection Report Generation'}
            {currentStep === 'review' && 'Compliance Review'}
            {currentStep === 'approval' && 'Final Quality Release'}
          </h2>
          <p className="text-muted-foreground font-medium">Standardized industrial inspection workflows & customer dimension reporting.</p>
        </div>
        
        {currentStep !== 'list' && (
          <Button variant="ghost" onClick={() => setCurrentStep('list')} className="rounded-full gap-2 text-slate-400 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back to Pipeline
          </Button>
        )}
      </header>

      {currentStep === 'list' && (
        <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search Work Orders for QC..." className="pl-10 h-10 bg-white border-none text-xs" />
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase">Pending Inspections: 12</Badge>
          </div>
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Order ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Component</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Status</TableHead>
                <TableHead className="text-right px-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                  <TableCell className="px-8 font-bold text-sm text-primary">{order.id}</TableCell>
                  <TableCell className="text-slate-900 font-semibold">{order.customer}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{order.part}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "text-[9px] uppercase font-bold px-3 py-1",
                      order.status === 'Ready for QC' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    )}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Button 
                      size="sm" 
                      className="rounded-full bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase h-9 px-5 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleSelectOrder(order)}
                    >
                      Start Inspection <ChevronRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {currentStep === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="bg-slate-100 p-1 rounded-full mb-6 h-12 inline-flex border border-slate-200">
                <TabsTrigger value="customer" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Customer Dimensions
                </TabsTrigger>
                <TabsTrigger value="internal" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Internal Process Checks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="internal" className="m-0">
                <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Machining Operation Verification</h3>
                    <Badge className="bg-primary/5 text-primary border-primary/10">Internal Compliance</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {MACHINING_OPS.map((op) => (
                      <div key={op} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between transition-all hover:border-primary/20">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center border transition-all",
                            checks[op] === 'Pass' ? "bg-green-500 border-green-500 text-white" :
                            checks[op] === 'Fail' ? "bg-red-500 border-red-500 text-white" :
                            checks[op] === 'NA' ? "bg-slate-400 border-slate-400 text-white" :
                            "bg-white border-slate-200 text-slate-300"
                          )}>
                            {checks[op] === 'Pass' ? <Check className="h-4 w-4" /> : 
                             checks[op] === 'Fail' ? <X className="h-4 w-4" /> : 
                             checks[op] === 'NA' ? <MinusCircle className="h-4 w-4" /> :
                             <Box className="h-4 w-4" />}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{op}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {['Pass', 'Fail', 'NA'].map((st) => (
                            <Button 
                              key={st}
                              size="sm" 
                              variant="outline" 
                              className={cn(
                                "rounded-lg h-8 px-3 font-bold text-[9px] uppercase transition-all",
                                checks[op] === st 
                                  ? (st === 'Pass' ? "bg-green-50 border-green-200 text-green-700" : st === 'Fail' ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-100 border-slate-300 text-slate-700")
                                  : "bg-white text-slate-400"
                              )}
                              onClick={() => handleToggleCheck(op, st as any)}
                            >
                              {st}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="customer" className="m-0">
                <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">Customer Dimension Entry</h3>
                      <p className="text-xs text-muted-foreground">Record critical measurements for product release. Status updates automatically based on limits.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddDimension} className="rounded-full border-slate-200 text-[10px] uppercase font-bold gap-2 hover:bg-primary/5 hover:text-primary transition-all">
                      <Plus className="h-3 w-3" /> Add More Dimensions
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table className="min-w-[1000px]">
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 py-4 w-[150px]">Dimension Name</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400">Target</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400">Tolerance</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400">Limits (U/L)</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 w-[100px]">Actual</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center">Status</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400">Remark</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dimensions.map((dim) => (
                          <TableRow key={dim.id} className="border-slate-50 h-16">
                            <TableCell>
                              <Input 
                                className="h-8 text-xs bg-slate-50 border-none" 
                                value={dim.feature} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'feature', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                className="h-8 text-xs font-code bg-slate-50 border-none" 
                                value={dim.target} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'target', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                className="h-8 text-xs font-code bg-slate-50 border-none" 
                                value={dim.tolerance} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'tolerance', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Input 
                                  placeholder="U"
                                  className="h-8 text-[10px] font-code bg-slate-50 border-none w-14" 
                                  value={dim.upperLimit} 
                                  onChange={(e) => handleUpdateDimension(dim.id, 'upperLimit', e.target.value)}
                                />
                                <Input 
                                  placeholder="L"
                                  className="h-8 text-[10px] font-code bg-slate-50 border-none w-14" 
                                  value={dim.lowerLimit} 
                                  onChange={(e) => handleUpdateDimension(dim.id, 'lowerLimit', e.target.value)}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input 
                                placeholder="0.00" 
                                className="h-8 text-xs font-code bg-slate-100 border border-primary/20 focus-visible:ring-primary/20 rounded-md"
                                value={dim.actual}
                                onChange={(e) => handleUpdateDimension(dim.id, 'actual', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-1">
                                {['Pass', 'Fail'].map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleDimensionStatus(dim.id, st as any)}
                                    className={cn(
                                      "px-2 py-1 rounded text-[8px] font-bold uppercase border transition-all",
                                      dim.status === st 
                                        ? (st === 'Pass' ? "bg-green-500 border-green-500 text-white shadow-sm" : "bg-red-500 border-red-500 text-white shadow-sm")
                                        : "bg-white border-slate-200 text-slate-300 hover:border-slate-400"
                                    )}
                                  >
                                    {st === 'Pass' ? 'OK' : 'NOT OK'}
                                  </button>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input 
                                placeholder="..." 
                                className="h-8 text-xs bg-slate-50 border-none" 
                                value={dim.remark}
                                onChange={(e) => handleUpdateDimension(dim.id, 'remark', e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button 
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs border-primary/20 text-primary hover:bg-primary/5"
                onClick={handleSaveDraft}
              >
                <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              <Button 
                className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                onClick={() => setCurrentStep('report')}
              >
                Verify & Preview Inspection Sheet
              </Button>
            </div>
          </div>

          <Card className="lg:col-span-4 p-8 bg-white border-slate-200 shadow-xl rounded-3xl space-y-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Details</h3>
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Work Order ID</p>
                <p className="text-lg font-bold text-slate-900">#{selectedOrder?.id}</p>
              </div>
              
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Drawing Reference</p>
                <div 
                  className={cn(
                    "h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                    drawingUploaded ? "border-green-500/50 bg-green-50/20" : "border-slate-200 hover:border-primary/50 bg-slate-50/50"
                  )}
                  onClick={() => setDrawingUploaded(true)}
                >
                  {drawingUploaded ? (
                    <>
                      <ImageIcon className="h-10 w-10 text-green-500" />
                      <span className="text-[10px] font-bold text-green-600 uppercase">DRAWING_LOADED.PDF</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Click to attach CAD/PDF</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {(currentStep === 'report' || currentStep === 'review' || currentStep === 'approval') && (
        <div className="space-y-8 pb-20">
          <div className="flex justify-end gap-3 print:hidden">
            <Button variant="outline" onClick={handlePrint} className="rounded-full gap-2 h-11 px-6 font-bold uppercase text-[10px]">
              <Printer className="h-4 w-4" /> Print Report
            </Button>
            <Button className="rounded-full bg-slate-900 hover:bg-black text-white gap-2 h-11 px-6 font-bold uppercase text-[10px]">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>

          <Card className={cn(
            "bg-white border border-slate-200 shadow-2xl p-12 max-w-[1000px] mx-auto space-y-10 transition-all duration-700",
            currentStep === 'review' && "border-primary/30 ring-4 ring-primary/5"
          )}>
            <div className="flex justify-between items-start border-b border-slate-100 pb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <Box className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-display font-bold tracking-tight">TOOLROOM<span className="text-primary">2.0</span></h1>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Precision Quality Control Division</p>
                  <p className="text-sm font-medium text-slate-600">Final Compliance Report - Secure Ledger</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tighter uppercase">Inspection Sheet</h2>
                <p className="text-xs font-bold text-primary uppercase font-code">REP_VAL: QC-{selectedOrder?.id}-{new Date().getFullYear()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Work Order</p>
                <p className="text-sm font-bold text-slate-900">#{selectedOrder?.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Client Name</p>
                <p className="text-sm font-bold text-slate-900">{selectedOrder?.customer}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Component Name</p>
                <p className="text-sm font-bold text-slate-900">{selectedOrder?.part}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</p>
                <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] border-l-2 border-primary pl-3">I. Technical Drawing Sheet</h3>
                <Badge variant="outline" className="text-[8px] bg-white border-slate-200">RESTRICTED</Badge>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] h-[450px] flex items-center justify-center relative overflow-hidden shadow-inner">
                {drawingUploaded ? (
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="p-8 bg-white rounded-full shadow-sm border border-slate-100">
                      <ImageIcon className="h-16 w-16 text-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-slate-900">DRAWING_REF_#{selectedOrder?.id}.PDF</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Blueprint Scaled for A4 Sheet Verification</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <ImageIcon className="h-12 w-12" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]">No Document Attached</span>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] border-l-2 border-green-500 pl-3">II. Dimensional Compliance Report</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <Table className="border-collapse">
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                      <TableHead className="text-[9px] font-bold uppercase py-4 px-4 text-center border-r border-slate-200 w-12">Si No</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase border-r border-slate-200">Dimension Detail</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Tolerance</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Upper Limit</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Lower Limit</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Actual</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200 w-16">OK</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200 w-16">Not OK</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase px-4">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dimensions.map((dim, idx) => (
                      <TableRow key={dim.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                        <TableCell className="text-center font-bold text-xs border-r border-slate-100 text-slate-400">{idx + 1}</TableCell>
                        <TableCell className="font-bold text-xs border-r border-slate-100 text-slate-700">{dim.feature} ({dim.target})</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.tolerance}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.upperLimit}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.lowerLimit}</TableCell>
                        <TableCell className="text-center font-code text-xs font-bold border-r border-slate-100 text-primary">{dim.actual || '-'}</TableCell>
                        <TableCell className="text-center border-r border-slate-100">
                          {dim.status === 'Pass' ? <div className="mx-auto h-4 w-4 rounded-full bg-green-500 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div> : <div className="mx-auto h-4 w-4 rounded-full border border-slate-200" />}
                        </TableCell>
                        <TableCell className="text-center border-r border-slate-100">
                          {dim.status === 'Fail' ? <div className="mx-auto h-4 w-4 rounded-full bg-red-500 flex items-center justify-center"><X className="h-2.5 w-2.5 text-white" /></div> : <div className="mx-auto h-4 w-4 rounded-full border border-slate-200" />}
                        </TableCell>
                        <TableCell className="px-4 font-medium text-[10px] text-slate-400 italic">
                          {dim.remark || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-20 pt-16">
              <div className="space-y-6">
                <div className="h-[1px] bg-slate-200 w-full" />
                <div className="flex justify-between items-center px-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Created By (Inspector)</p>
                    <p className="text-sm font-bold text-slate-900">Admin_User_01</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-[1px] bg-slate-200 w-full" />
                <div className="flex justify-between items-center px-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Approved By (Compliance)</p>
                    <p className={cn(
                      "text-sm font-bold",
                      currentStep === 'approval' ? "text-slate-900" : "text-slate-200 italic"
                    )}>
                      {currentStep === 'approval' ? 'Director of Quality' : 'Pending Signature'}
                    </p>
                  </div>
                  {currentStep === 'approval' ? (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-100" />
                  )}
                </div>
              </div>
            </div>
          </Card>

          {currentStep === 'report' && (
            <div className="flex justify-center pt-10 print:hidden">
              <Button 
                className="rounded-full bg-primary hover:bg-primary/90 text-white h-14 px-12 font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
                onClick={() => setCurrentStep('review')}
              >
                Submit for Final Quality Review
              </Button>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 max-w-[1000px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 print:hidden">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Management Approval Protocol</h4>
                  <p className="text-sm text-slate-500">Verify dimensional compliance and remark accuracy before releasing component.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs tracking-widest gap-2 shadow-lg shadow-green-600/20"
                  onClick={() => {
                    setCurrentStep('approval');
                    toast({ title: "Release Authorized", description: "Report has been digitally signed and archived." });
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Authorize & Sign
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl bg-white border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase text-xs tracking-widest gap-2"
                  onClick={() => {
                    setCurrentStep('checklist');
                    toast({ variant: "destructive", title: "Review Rejected", description: "Dimension sheet returned for correction." });
                  }}
                >
                  <AlertTriangle className="h-4 w-4" /> Reject Report
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'approval' && (
            <div className="text-center space-y-6 pt-10 print:hidden">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 font-bold text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3" /> Report Status: FINAL_APPROVED
              </div>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Compliance verified. Drawing and measurements are locked in the ERP ledger.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
