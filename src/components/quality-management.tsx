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
  FileText, 
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
  User,
  Calendar,
  Box,
  MinusCircle,
  Ruler,
  Plus
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
  actual: string;
  status: 'Pass' | 'Fail' | 'NA' | 'Pending';
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
  { id: '1', feature: 'Overall Length', target: '150.00 mm', tolerance: '±0.05', actual: '', status: 'Pending' },
  { id: '2', feature: 'Outer Diameter', target: '45.00 mm', tolerance: '+0.02/-0.00', actual: '', status: 'Pending' },
  { id: '3', feature: 'Internal Bore', target: '22.00 mm', tolerance: 'H7', actual: '', status: 'Pending' },
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
    // Reset checks
    const initial: Record<string, CheckStatus> = {};
    MACHINING_OPS.forEach(op => initial[op] = 'Pending');
    setChecks(initial);
    setDimensions(INITIAL_DIMENSIONS);
  };

  const handleToggleCheck = (op: string, status: 'Pass' | 'Fail' | 'NA') => {
    setChecks(prev => ({ ...prev, [op]: status }));
  };

  const handleUpdateDimension = (id: string, field: keyof DimensionRecord, value: string) => {
    setDimensions(prev => prev.map(dim => 
      dim.id === id ? { ...dim, [field]: value } : dim
    ));
  };

  const handleDimensionStatus = (id: string, status: 'Pass' | 'Fail' | 'NA') => {
    setDimensions(prev => prev.map(dim => 
      dim.id === id ? { ...dim, status } : dim
    ));
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Generating Document",
      description: "Preparing inspection report for print/export...",
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      {/* Header - Hidden on print */}
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

      {/* STEP 1: Work Order List */}
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

      {/* STEP 2: Multi-Part Entry (Machining + Dimensions) */}
      {currentStep === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <Tabs defaultValue="internal" className="w-full">
              <TabsList className="bg-slate-100 p-1 rounded-full mb-6 h-12 inline-flex border border-slate-200">
                <TabsTrigger value="internal" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Internal Process Checks
                </TabsTrigger>
                <TabsTrigger value="customer" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Customer Dimensions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="internal" className="m-0">
                <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Machining Operation Verification</h3>
                    <Badge className="bg-primary/5 text-primary border-primary/10">Internal Use Only</Badge>
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
                      <h3 className="text-lg font-bold text-slate-900">Customer Dimension Report</h3>
                      <p className="text-xs text-muted-foreground">Record critical measurements for product delivery.</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-[10px] uppercase font-bold gap-2">
                      <Plus className="h-3 w-3" /> Add Feature
                    </Button>
                  </div>

                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-bold uppercase text-slate-400 py-4">Feature / Desc</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-slate-400">Target</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-slate-400">Tolerance</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-slate-400 w-[120px]">Actual</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right">Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dimensions.map((dim) => (
                        <TableRow key={dim.id} className="border-slate-50 h-16">
                          <TableCell className="font-bold text-xs text-slate-700">{dim.feature}</TableCell>
                          <TableCell className="font-code text-xs text-slate-500">{dim.target}</TableCell>
                          <TableCell className="font-code text-[10px] text-slate-400">{dim.tolerance}</TableCell>
                          <TableCell>
                            <Input 
                              placeholder="0.00" 
                              className="h-8 text-xs font-code bg-slate-50 border-none rounded-md focus-visible:ring-primary/20"
                              value={dim.actual}
                              onChange={(e) => handleUpdateDimension(dim.id, 'actual', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {['Pass', 'Fail', 'NA'].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleDimensionStatus(dim.id, st as any)}
                                  className={cn(
                                    "px-2 py-1 rounded text-[8px] font-bold uppercase border transition-all",
                                    dim.status === st 
                                      ? (st === 'Pass' ? "bg-green-500 border-green-500 text-white" : st === 'Fail' ? "bg-red-500 border-red-500 text-white" : "bg-slate-400 border-slate-400 text-white")
                                      : "bg-white border-slate-200 text-slate-300"
                                  )}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>

            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              onClick={() => setCurrentStep('report')}
            >
              Verify All Checks & Generate Master Report
            </Button>
          </div>

          <Card className="lg:col-span-4 p-8 bg-white border-slate-200 shadow-xl rounded-3xl space-y-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inspection Metadata</h3>
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Work Order</p>
                <p className="text-lg font-bold text-slate-900">#{selectedOrder?.id}</p>
              </div>
              
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical Drawing Upload</p>
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
                      <span className="text-[10px] font-bold text-green-600 uppercase">DRAWING_LOADED.CAD</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Click to upload drawing</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3 & 4: Inspection Report Preview & Review */}
      {(currentStep === 'report' || currentStep === 'review' || currentStep === 'approval') && (
        <div className="space-y-8 pb-20">
          <div className="flex justify-end gap-3 print:hidden">
            <Button variant="outline" onClick={handlePrint} className="rounded-full gap-2 h-11 px-6 font-bold uppercase text-[10px]">
              <Printer className="h-4 w-4" /> Print Report
            </Button>
            <Button className="rounded-full bg-slate-900 hover:bg-black text-white gap-2 h-11 px-6 font-bold uppercase text-[10px]">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>

          <Card className={cn(
            "bg-white border-slate-200 shadow-2xl p-16 max-w-[900px] mx-auto space-y-12 transition-all duration-700",
            currentStep === 'review' && "border-primary/30 ring-4 ring-primary/5"
          )}>
            {/* Report Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <Box className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-display font-bold tracking-tight">TOOLROOM<span className="text-primary">2.0</span></h1>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quality Control Division</p>
                  <p className="text-sm font-medium text-slate-600">Plant Alpha - Secure Ledger Entry</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tighter">INSPECTION REPORT</h2>
                <p className="text-xs font-bold text-primary uppercase font-code">REP_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-12">
              <div className="grid grid-cols-2 gap-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Work Order ID</p>
                  <p className="text-sm font-bold text-slate-900">#{selectedOrder?.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Date Generated</p>
                  <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Customer Name</p>
                  <p className="text-sm font-bold text-slate-900">{selectedOrder?.customer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Component Ref</p>
                  <p className="text-sm font-bold text-slate-900">{selectedOrder?.part}</p>
                </div>
              </div>
              
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
                {drawingUploaded ? (
                  <div className="flex flex-col items-center gap-2 opacity-60">
                    <ImageIcon className="h-12 w-12 text-slate-300" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Technical Drawing Reference Attached</span>
                  </div>
                ) : (
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No Drawing Attached</span>
                )}
                <div className="absolute top-0 right-0 p-3">
                  <Badge variant="outline" className="text-[8px] bg-white border-slate-200">CONFIDENTIAL</Badge>
                </div>
              </div>
            </div>

            {/* Internal Process Verification */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] border-l-2 border-primary pl-3">I. Machining Tolerance Verification</h3>
              <div className="border border-slate-100 rounded-3xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="text-[9px] font-bold uppercase py-4 px-6">Operation Index</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center">Result</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right px-6">Inspector Sign-off</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MACHINING_OPS.map((op) => (
                      <TableRow key={op} className="border-slate-50 hover:bg-slate-50/30">
                        <TableCell className="px-6 py-4 font-bold text-xs text-slate-700">{op}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-bold uppercase px-2",
                            checks[op] === 'Pass' ? "text-green-600 bg-green-50 border-green-100" : 
                            checks[op] === 'Fail' ? "text-red-600 bg-red-50 border-red-100" :
                            checks[op] === 'NA' ? "text-slate-400 bg-slate-50 border-slate-100" :
                            "text-slate-300 bg-white border-slate-100"
                          )}>
                            {checks[op] || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 font-code text-[10px] text-slate-400 uppercase tracking-tighter">DIGITAL_VERIFIED</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Customer Dimension Report */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] border-l-2 border-green-500 pl-3">II. Customer Dimension Report</h3>
              <div className="border border-slate-100 rounded-3xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="text-[9px] font-bold uppercase py-4 px-6">Feature</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center">Target</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center">Actual</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right px-6">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dimensions.map((dim) => (
                      <TableRow key={dim.id} className="border-slate-50 hover:bg-slate-50/30">
                        <TableCell className="px-6 py-4 font-bold text-xs text-slate-700">{dim.feature}</TableCell>
                        <TableCell className="text-center font-code text-[10px] text-slate-500">{dim.target} ({dim.tolerance})</TableCell>
                        <TableCell className="text-center font-code text-xs font-bold text-primary">{dim.actual || 'N/A'}</TableCell>
                        <TableCell className="text-right px-6">
                          <Badge className={cn(
                            "text-[8px] font-bold uppercase px-3",
                            dim.status === 'Pass' ? "bg-green-50 text-green-700 border-green-100" : 
                            dim.status === 'Fail' ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                            {dim.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-20 pt-12">
              <div className="space-y-6">
                <div className="h-[1px] bg-slate-200 w-full" />
                <div className="flex justify-between items-center px-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Created By</p>
                    <p className="text-sm font-bold text-slate-900">Admin Inspector</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-[1px] bg-slate-200 w-full" />
                <div className="flex justify-between items-center px-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Approved By</p>
                    <p className="text-sm font-bold text-slate-300 italic">Pending Digital Signature</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-slate-200" />
                </div>
              </div>
            </div>
          </Card>

          {/* Review Actions - Hidden on print */}
          {currentStep === 'report' && (
            <div className="flex justify-center pt-10 print:hidden">
              <Button 
                className="rounded-full bg-primary hover:bg-primary/90 text-white h-14 px-12 font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
                onClick={() => setCurrentStep('review')}
              >
                Submit for Compliance Review
              </Button>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-10 max-w-[900px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 print:hidden">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Compliance Officer Review</h4>
                  <p className="text-sm text-slate-500">Verify dimension results and technical drawings before final release.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs tracking-widest gap-2 shadow-lg shadow-green-600/20"
                  onClick={() => {
                    setCurrentStep('approval');
                    toast({ title: "Quality Approved", description: "Report has been moved to final approval phase." });
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve Report
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl bg-white border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase text-xs tracking-widest gap-2"
                  onClick={() => {
                    setCurrentStep('checklist');
                    toast({ variant: "destructive", title: "Review Rejected", description: "Report sent back to Inspector for corrections." });
                  }}
                >
                  <AlertTriangle className="h-4 w-4" /> Reject & Send Back
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'approval' && (
            <div className="text-center space-y-6 pt-10 print:hidden">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 font-bold text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3" /> Final Status: Authorized
              </div>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">This report is now digitally signed and archived in the ERP ledger.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
