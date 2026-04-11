
"use client";

import { useState, useMemo, useEffect } from 'react';
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
  Save,
  Activity,
  Layers,
  Clock,
  FileText,
  Trash2,
  FileIcon,
  CheckSquare,
  Square,
  Calendar,
  User,
  FileSearch,
  MousePointer2,
  AlertCircle,
  FileWarning,
  ArchiveX
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
  Tooltip as ChartTooltip 
} from 'recharts';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Order, RoutingOperation, SystemUser, Vendor } from '@/lib/types';

type QualityStep = 'list' | 'upload' | 'checklist' | 'report' | 'review' | 'approval';
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

interface UploadedFile {
  id: string;
  name: string;
  url: string;
}

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
  { id: '1', feature: 'Overall Length', target: '100.00', tolerance: '±0.05', upperLimit: '100.050', lowerLimit: '99.950', actual: '', status: 'Pending', remark: '' },
];

interface QualityManagementProps {
  orders: Order[];
  users?: SystemUser[];
  vendors?: Vendor[];
  onUpdateStatus?: (orderId: string, operation: string, status: string) => void;
}

export function QualityManagement({ orders, users = [], vendors = [], onUpdateStatus }: QualityManagementProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<QualityStep>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOp, setSelectedOp] = useState<RoutingOperation | null>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);
  
  const [checks, setChecks] = useState<Record<string, CheckStatus>>({});
  const [dimensions, setDimensions] = useState<DimensionRecord[]>(INITIAL_DIMENSIONS);
  const [searchTerm, setSearchTerm] = useState('');

  // Cleanup Blob URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.url));
    };
  }, [uploadedFiles]);

  const qcEntries = useMemo(() => {
    const results: { order: Order; operation: RoutingOperation }[] = [];
    orders.forEach(o => {
      const qcOps = o.routing?.filter(op => op.name === 'QC') || [];
      qcOps.forEach(op => {
        if (o.id.includes(searchTerm) || o.customer.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({ order: o, operation: op });
        }
      });
    });
    return results;
  }, [orders, searchTerm]);

  const getResourceName = (op: RoutingOperation) => {
    const firstSub = op.subTasks?.[0];
    if (!firstSub || !firstSub.machineId) return 'Unassigned';
    const user = users.find(u => u.id === firstSub.machineId);
    if (user) return user.name;
    const vendor = vendors.find(v => v.id === firstSub.machineId);
    if (vendor) return vendor.name;
    return 'Station: ' + firstSub.machineId;
  };

  const activeDrawing = useMemo(() => {
    return uploadedFiles.find(f => f.id === activeDrawingId);
  }, [uploadedFiles, activeDrawingId]);

  const statsData = useMemo(() => {
    const pendingCount = qcEntries.filter(e => 
      ['Yet to start', 'WIP', 'Ready for QC'].includes(e.operation.status || '')
    ).length;
    const inReviewCount = qcEntries.filter(e => 
      ['Review Pending', 'In Review'].includes(e.operation.status || '')
    ).length;
    return [
      { name: 'Pending', count: pendingCount, color: '#f59e0b' },
      { name: 'Work in Progress', count: inReviewCount, color: '#3b82f6' },
    ];
  }, [qcEntries]);

  const handleSelectTask = (order: Order, op: RoutingOperation) => {
    // Only reset if changing to a completely different task session
    if (selectedOrder?.id !== order.id || selectedOp?.id !== op.id) {
      setSelectedOrder(order);
      setSelectedOp(op);
      setUploadedFiles([]);
      setActiveDrawingId(null);
      setDimensions(INITIAL_DIMENSIONS);
      const initial: Record<string, CheckStatus> = {};
      MACHINING_OPS.forEach(o => initial[o] = 'Pending');
      setChecks(initial);
    }
    setCurrentStep('upload');
  };

  const handleToggleCheck = (op: string, status: CheckStatus) => {
    setChecks(prev => ({ ...prev, [op]: status }));
  };

  const handleUpdateDimension = (id: string, field: keyof DimensionRecord, value: string) => {
    setDimensions(prev => prev.map(dim => {
      if (dim.id !== id) return dim;
      
      let updatedDim = { ...dim, [field]: value };
      
      if (field === 'target' || field === 'tolerance') {
        const targetNum = parseFloat(updatedDim.target);
        if (!isNaN(targetNum)) {
          let upperOffset = 0;
          let lowerOffset = 0;
          const tol = updatedDim.tolerance.trim();

          const pmMatch = tol.match(/[±](\d+\.?\d*)/);
          const plusMatch = tol.match(/\+(\d+\.?\d*)/);
          const minusMatch = tol.match(/-(\d+\.?\d*)/);

          if (pmMatch) {
            const val = parseFloat(pmMatch[1]);
            upperOffset = val;
            lowerOffset = -val;
          } else if (plusMatch || minusMatch) {
            if (plusMatch) upperOffset = parseFloat(plusMatch[1]);
            if (minusMatch) lowerOffset = -parseFloat(minusMatch[1]);
          } else if (!isNaN(parseFloat(tol))) {
            const val = parseFloat(tol);
            upperOffset = val;
            lowerOffset = -val;
          }
          
          updatedDim.upperLimit = (targetNum + upperOffset).toFixed(3);
          updatedDim.lowerLimit = (targetNum + lowerOffset).toFixed(3);
        }
      }

      const actualNum = parseFloat(updatedDim.actual);
      const upperNum = parseFloat(updatedDim.upperLimit);
      const lowerNum = parseFloat(updatedDim.lowerLimit);

      if (updatedDim.actual === '') {
        updatedDim.status = 'Pending';
      } else if (!isNaN(actualNum) && !isNaN(upperNum) && !isNaN(lowerNum)) {
        updatedDim.status = (actualNum >= lowerNum && actualNum <= upperNum) ? 'Pass' : 'Fail';
      } else {
        updatedDim.status = 'Fail';
      }
      
      return updatedDim;
    }));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: `FILE-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Auto-focus on the first newly uploaded file
      if (newFiles.length > 0) {
        setActiveDrawingId(newFiles[0].id);
      }
      
      // Clear input value so same file can be re-selected if deleted/re-added
      e.target.value = '';
      
      toast({ title: "Drawing Matrix Initialized", description: `${newFiles.length} files onboarded to sequence.` });
    }
  };

  const removeFile = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file) URL.revokeObjectURL(file.url);
    
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (activeDrawingId === id) setActiveDrawingId(null);
  };

  const submitForReview = () => {
    setCurrentStep('review');
    if (selectedOrder && onUpdateStatus) {
      onUpdateStatus(selectedOrder.id, 'QC', 'Review Pending');
    }
  };

  const finalApproval = () => {
    setCurrentStep('approval');
    if (selectedOrder && onUpdateStatus) {
      onUpdateStatus(selectedOrder.id, 'QC', 'Completed');
    }
    toast({ title: "Quality Release Authorized", description: `Report for ${activeDrawing?.name} released.` });
  };

  const hasFailures = useMemo(() => dimensions.some(d => d.status === 'Fail'), [dimensions]);
  const passCount = dimensions.filter(d => d.status === 'Pass').length;
  const failCount = dimensions.filter(d => d.status === 'Fail').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <ShieldCheck className="h-4 w-4" />
            Quality Control Center
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            {currentStep === 'list' && 'Master Inspection Pipeline'}
            {currentStep === 'upload' && 'Drawing Onboarding'}
            {currentStep === 'checklist' && 'Dimensional Matrix Entry'}
            {currentStep === 'report' && 'Compliance Report Preview'}
            {currentStep === 'review' && 'Final Review & Approval'}
            {currentStep === 'approval' && 'Final Quality Release'}
          </h2>
          <p className="text-muted-foreground font-medium">Automated dimension mapping and industrial verdict synchronization.</p>
        </div>
        
        {currentStep !== 'list' && (
          <Button variant="ghost" onClick={() => setCurrentStep('list')} className="rounded-full gap-2 text-slate-400 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Abort Inspection
          </Button>
        )}
      </header>

      {currentStep === 'list' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 p-8 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Procedural Distribution</h3>
                  <p className="text-xs text-muted-foreground mt-1">Live visualization of inspection threads in the production pipeline.</p>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">REAL_TIME_SYNC</Badge>
              </div>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} width={120} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl group hover:border-amber-500/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-600">{statsData[0].count}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
              </Card>
              <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{statsData[1].count}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Under Compliance Review</p>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Order ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Timeline Window</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Assigned Resource</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                  <TableHead className="text-right px-8 w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qcEntries.map(({ order, operation }) => (
                  <TableRow key={operation.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group transition-colors">
                    <TableCell className="px-8 font-bold text-sm text-primary">#{order.id}</TableCell>
                    <TableCell className="text-[#001F3D] font-bold uppercase">{order.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] font-code font-bold text-slate-500">
                        <span>{operation.startDate}</span>
                        <span className="text-slate-300">→</span>
                        <span>{operation.endDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase">{getResourceName(operation)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "text-[9px] font-bold uppercase px-3 py-1 rounded-full border shadow-sm",
                        operation.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
                        (['Review Pending', 'WIP'].includes(operation.status || '')) ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      )}>
                        {operation.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-[#001F3D] hover:bg-black text-white text-[10px] font-bold uppercase h-10 px-6 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                        onClick={() => handleSelectTask(order, operation)}
                      >
                        Initialize Audit <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {qcEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30 py-10">
                        <ArchiveX className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Pipeline Clear</p>
                        <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto font-medium">No active QC nodes detected in the shop floor routing.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {currentStep === 'upload' && selectedOrder && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
          <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-[3rem] relative overflow-hidden min-h-[800px] flex flex-col">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/5 rounded-2xl">
                  <FileSearch className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Onboard Blueprints</h3>
                  <p className="text-xs text-slate-500">Upload technical drawings for Order #{selectedOrder.id}.</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold tracking-widest uppercase">WO #{selectedOrder.id}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow mb-8 relative z-10 overflow-hidden">
              <div className="lg:col-span-4 space-y-6 flex flex-col min-h-0">
                <input 
                  type="file" 
                  id="multi-cad-upload" 
                  className="hidden" 
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="multi-cad-upload"
                  className="h-32 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group shrink-0"
                >
                  <Upload className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attach PDF Drawing</span>
                </label>

                <div className="flex-grow flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Attachment Matrix</h4>
                  </div>
                  
                  <ScrollArea className="flex-1 pr-2">
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div 
                          key={file.id}
                          onClick={() => setActiveDrawingId(file.id)}
                          className={cn(
                            "p-4 rounded-xl border flex items-center justify-between group transition-all cursor-pointer relative",
                            activeDrawingId === file.id ? "bg-[#001F3D] border-[#001F3D] text-white shadow-lg" : "bg-white border-slate-100 hover:border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <FileIcon className={cn("h-4 w-4", activeDrawingId === file.id ? "text-accent" : "text-primary")} />
                            <span className="text-[11px] font-bold truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} 
                            className={cn(
                              "h-7 w-7 rounded-lg",
                              activeDrawingId === file.id ? "text-white/40 hover:text-white" : "text-slate-300 hover:text-red-500"
                            )}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      {uploadedFiles.length === 0 && (
                        <div className="py-12 text-center opacity-20 border-2 border-dashed border-slate-100 rounded-2xl">
                          <p className="text-[10px] font-bold uppercase tracking-widest">Protocol Null</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="lg:col-span-8 bg-slate-100/50 rounded-3xl border border-slate-200 overflow-hidden relative group h-[600px] lg:h-auto">
                {activeDrawing ? (
                  <embed 
                    key={`${activeDrawing.id}-${activeDrawing.url}`}
                    src={`${activeDrawing.url}#view=FitH&toolbar=0&navpanes=0`} 
                    type="application/pdf"
                    className="w-full h-full border-none bg-white" 
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                    <ImageIcon className="h-16 w-16 text-slate-300" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Drawing Selection Required</p>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                   <Badge className="bg-black/60 text-white border-none backdrop-blur-md font-code text-[10px] px-3">PREVIEW_MODE</Badge>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-between items-center relative z-10 mt-auto">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select an onboarded blueprint to initialize dimensional matrix entry.</span>
              </div>
              <Button 
                disabled={!activeDrawingId}
                className="h-14 px-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 flex gap-3 transition-all"
                onClick={() => setCurrentStep('checklist')}
              >
                Start Measurement Audit <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {currentStep === 'checklist' && selectedOrder && activeDrawing && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-700 px-2">
          <Card className="xl:col-span-5 h-[800px] overflow-hidden rounded-[2.5rem] bg-[#001F3D] shadow-2xl relative border-none">
            <div className="absolute top-4 left-4 z-20 flex gap-2">
               <Badge className="bg-accent text-white border-none font-bold uppercase text-[8px] tracking-widest px-3 h-6 flex items-center">Technical Reference</Badge>
               <Badge className="bg-black/40 text-white/80 border-none font-code text-[8px] tracking-widest px-3 h-6 flex items-center backdrop-blur-md uppercase">{activeDrawing.name}</Badge>
            </div>
            <embed 
              key={`${activeDrawing.id}-${activeDrawing.url}-audit`}
              src={`${activeDrawing.url}#view=FitH&toolbar=0&navpanes=0`} 
              type="application/pdf"
              className="w-full h-full border-none bg-white" 
            />
          </Card>

          <div className="xl:col-span-7 flex flex-col h-[800px]">
            <Card className="flex-1 p-8 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden">
              <Tabs defaultValue="customer" className="w-full flex flex-col flex-1 overflow-hidden">
                <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200 w-fit shrink-0">
                  <TabsTrigger value="customer" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-md transition-all">
                    Dimension Matrix
                  </TabsTrigger>
                  <TabsTrigger value="internal" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-md transition-all">
                    Process Validation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="customer" className="m-0 flex-1 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center px-1 mb-6 shrink-0">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <MousePointer2 className="h-4 w-4 text-primary" /> Entry Protocol
                    </h3>
                    <Button variant="ghost" onClick={handleAddDimension} className="text-[9px] uppercase font-bold gap-2 text-primary hover:bg-primary/5 h-8 px-4 rounded-xl">
                      <Plus className="h-3.5 w-3.5" /> Add Node
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <Table className="min-w-[800px]">
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-b border-slate-100">
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 py-4 px-4 w-[150px]">Feature</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center">Target</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center">Tolerance</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center">Actual</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center">Verdict</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dimensions.map((dim) => (
                          <TableRow key={dim.id} className="border-b border-slate-50 h-16 hover:bg-slate-50/30 transition-colors">
                            <TableCell className="px-4">
                              <Input 
                                className="h-10 bg-slate-50/50 border-none font-bold text-xs rounded-xl" 
                                value={dim.feature} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'feature', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                className="h-10 bg-slate-50/50 border-none font-code font-bold text-xs text-center rounded-xl" 
                                value={dim.target} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'target', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                placeholder="±0.05"
                                className="h-10 bg-slate-50/50 border-none font-code font-bold text-xs text-center rounded-xl" 
                                value={dim.tolerance} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'tolerance', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                placeholder="0.000" 
                                className={cn(
                                  "h-10 bg-white border-2 font-code font-bold text-sm text-center rounded-xl transition-all shadow-inner",
                                  dim.status === 'Pass' ? "border-emerald-200" :
                                  dim.status === 'Fail' ? "border-red-200" :
                                  "border-primary/10"
                                )}
                                value={dim.actual}
                                onChange={(e) => handleUpdateDimension(dim.id, 'actual', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <div className={cn(
                                  "h-6 w-6 rounded-full flex items-center justify-center border-2",
                                  dim.status === 'Pass' ? "bg-green-50 border-green-500 text-green-600" : 
                                  dim.status === 'Fail' ? "bg-red-50 border-red-500 text-red-600" :
                                  "bg-slate-50 border-slate-200 text-slate-300"
                                )}>
                                  {dim.status === 'Pass' ? <Check className="h-3 w-3" /> : 
                                   dim.status === 'Fail' ? <X className="h-3 w-3" /> : null}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-2">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-lg" onClick={() => setDimensions(dimensions.filter(d => d.id !== dim.id))}>
                                 <Trash2 className="h-3.5 w-3.5" />
                               </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="internal" className="m-0 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-3 border-l-4 border-accent pl-4 mb-8 shrink-0">
                    <Activity className="h-5 w-5 text-accent" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Validation Nodes</h3>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="grid grid-cols-1 gap-4 pr-2">
                      {MACHINING_OPS.map((op) => (
                        <div key={op} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-6 transition-all hover:border-primary/20 group">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm",
                              checks[op] === 'Pass' ? "bg-green-500 border-green-500 text-white" :
                              checks[op] === 'Fail' ? "bg-red-500 border-red-500 text-white" :
                              checks[op] === 'NA' ? "bg-slate-400 border-slate-400 text-white" :
                              "bg-white border-slate-200 text-slate-300"
                            )}>
                              {checks[op] === 'Pass' ? <Check className="h-5 w-5" /> : 
                               checks[op] === 'Fail' ? <X className="h-5 w-5" /> : 
                               checks[op] === 'NA' ? <MinusCircle className="h-5 w-5" /> :
                               <Box className="h-5 w-5" />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{op}</span>
                          </div>
                          <div className="flex gap-1.5">
                            {['Pass', 'Fail', 'NA'].map((st) => (
                              <Button 
                                key={st}
                                size="sm" 
                                variant="outline" 
                                className={cn(
                                  "rounded-lg h-8 px-3 font-bold text-[9px] uppercase tracking-widest transition-all border-b-2",
                                  checks[op] === st 
                                    ? (st === 'Pass' ? "bg-green-50 border-green-500 text-green-700" : st === 'Fail' ? "bg-red-50 border-red-500 text-red-700" : "bg-slate-100 border-slate-400 text-slate-700")
                                    : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
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
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="pt-8 border-t border-slate-100 flex gap-4 mt-8 shrink-0">
                <Button 
                  variant="ghost"
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] text-slate-400"
                  onClick={() => setCurrentStep('upload')}
                >
                  Return to Matrix
                </Button>
                <Button 
                  className="flex-[2] h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] shadow-2xl flex gap-3"
                  onClick={() => setCurrentStep('report')}
                >
                  Compile Compliance Report <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {(currentStep === 'report' || currentStep === 'review' || currentStep === 'approval') && selectedOrder && activeDrawing && (
        <div className="space-y-10 pb-20 max-w-[1100px] mx-auto animate-in zoom-in-95 duration-500 px-2">
          <div className="flex justify-between items-center px-4 print:hidden">
            <Button variant="ghost" onClick={() => setCurrentStep('checklist')} className="rounded-xl gap-3 h-12 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Edit Matrix
            </Button>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-3 h-12 px-8 font-bold uppercase text-[10px] tracking-widest border-slate-200 shadow-sm">
                <Printer className="h-4 w-4" /> Print Matrix
              </Button>
              <Button className="rounded-xl bg-slate-900 hover:bg-black text-white gap-3 h-12 px-8 font-bold uppercase text-[10px] tracking-widest shadow-xl">
                <Download className="h-4 w-4" /> Export Protocol
              </Button>
            </div>
          </div>

          <Card className={cn(
            "bg-white border border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] p-16 space-y-12 transition-all duration-700",
            currentStep === 'review' && hasFailures ? "ring-8 ring-red-500/10 border-red-200" : currentStep === 'review' ? "ring-8 ring-primary/5 border-primary/20" : ""
          )}>
            <div className="flex justify-between items-start border-b-2 border-[#001F3D] pb-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#001F3D] rounded-2xl shadow-xl shadow-primary/20">
                    <ShieldCheck className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-display font-bold tracking-tighter">BHARAT<span className="text-primary">AXIS</span></h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Precision Engineering & QC Hub</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-500 space-y-1 uppercase tracking-widest leading-relaxed">
                  <p>Dimensional Compliance Protocol: ISO_9001_IND</p>
                  <p>Conditional Logic v2.4 Active</p>
                </div>
              </div>
              <div className="text-right space-y-3">
                <h2 className="text-5xl font-display font-bold text-[#001F3D] tracking-tighter uppercase">Inspection Sheet</h2>
                <Badge className={cn(
                  "border-none text-[9px] font-bold px-5 py-1.5 rounded-full",
                  hasFailures ? "bg-red-600 text-white" : "bg-primary text-white"
                )}>
                  {hasFailures ? 'DEVIATION_ALERT' : 'CERTIFIED_LEDGER'}
                </Badge>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">DATE: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-12 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Work Order ID</p>
                <p className="text-lg font-bold text-[#001F3D]">#{selectedOrder.id}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blueprint Identification</p>
                <p className="text-sm font-bold text-slate-900 uppercase truncate">{activeDrawing.name}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Audit Terminal</p>
                <p className="text-sm font-bold text-slate-900 uppercase">{selectedOp ? getResourceName(selectedOp) : 'Inspector_Node_01'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Compliance Summary</p>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[8px] font-bold">{passCount} PASS</Badge>
                  {failCount > 0 && <Badge className="bg-red-50 text-red-700 border-red-100 text-[8px] font-bold">{failCount} FAIL</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Measurement Compliance Matrix</h3>
              <div className="border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <Table className="border-collapse">
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                      <TableHead className="text-[9px] font-bold uppercase py-5 px-6 text-center border-r border-slate-200 w-16">SN</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase border-r border-slate-200 text-[#001F3D]">Dimensional Feature</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Target</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Limits (U/L)</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200 text-primary">Actual Entry</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center w-24">Verdict</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dimensions.map((dim, idx) => (
                      <TableRow key={dim.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="text-center font-bold text-xs border-r border-slate-100 text-slate-400 py-5">{idx + 1}</TableCell>
                        <TableCell className="font-bold text-xs border-r border-slate-100 text-slate-700 uppercase">{dim.feature}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.target} <span className="opacity-50">{dim.tolerance}</span></TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.upperLimit} / {dim.lowerLimit}</TableCell>
                        <TableCell className="text-center font-code text-sm font-bold border-r border-slate-100 text-primary">{dim.actual || '---'}</TableCell>
                        <TableCell className="text-center">
                          <div className={cn(
                            "mx-auto h-6 w-6 rounded-full flex items-center justify-center border-2",
                            dim.status === 'Pass' ? "bg-green-50 border-green-500 text-green-600" : 
                            dim.status === 'Fail' ? "bg-red-50 border-red-500 text-red-600 shadow-[0_0_8px_rgba(239,68,68,0.3)]" :
                            "bg-white border-slate-100 text-slate-200"
                          )}>
                            {dim.status === 'Pass' ? <Check className="h-3 w-3" /> : 
                             dim.status === 'Fail' ? <X className="h-3 w-3" /> : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-40 pt-20">
              <div className="space-y-10 text-center">
                <div className="h-[1px] bg-slate-300 w-full" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Officer Signature</p>
                  <p className="text-sm font-bold text-slate-900 uppercase">{selectedOp ? getResourceName(selectedOp) : 'Inspector_Node_01'}</p>
                </div>
              </div>
              <div className="space-y-10 text-center">
                <div className="h-[1px] bg-slate-300 w-full" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Director</p>
                  <p className={cn(
                    "text-sm font-bold",
                    currentStep === 'approval' ? "text-slate-900 uppercase" : "text-slate-200 italic"
                  )}>
                    {currentStep === 'approval' ? 'Authorized Protocol Active' : 'Awaiting Matrix Signature'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {currentStep === 'report' && (
            <div className="flex justify-center pt-10 print:hidden">
              <Button 
                className="rounded-2xl bg-[#001F3D] hover:bg-black text-white h-16 px-16 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all"
                onClick={submitForReview}
              >
                Transmit for Final Compliance Review
              </Button>
            </div>
          )}

          {currentStep === 'review' && (
            <div className={cn(
              "border-none rounded-[3rem] p-12 max-w-[900px] mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 print:hidden shadow-2xl transition-all",
              hasFailures ? "bg-red-950 border-red-900" : "bg-[#001F3D]"
            )}>
              <div className="flex items-center gap-6">
                <div className={cn(
                  "p-5 rounded-[1.5rem] border",
                  hasFailures ? "bg-red-500/20 border-red-500/30" : "bg-white/10 border-white/10"
                )}>
                  {hasFailures ? <FileWarning className="h-10 w-10 text-red-400 animate-pulse" /> : <ShieldCheck className="h-10 w-10 text-accent" />}
                </div>
                <div>
                  <h4 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
                    {hasFailures ? 'Deviation Protocol Locked' : 'Security Review Locked'}
                  </h4>
                  <p className={cn(
                    "text-sm font-medium",
                    hasFailures ? "text-red-300" : "text-white/40"
                  )}>
                    {hasFailures 
                      ? "Dimensional deviations detected. Verify internal rework requirements before force release."
                      : `Verify dimensional benchmarks for ${activeDrawing.name} before authorization.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <Button 
                  className={cn(
                    "flex-1 h-16 rounded-2xl font-bold uppercase text-[10px] tracking-widest gap-3 shadow-xl transition-all",
                    hasFailures ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20" : "bg-accent hover:bg-accent/90 text-white shadow-accent/20"
                  )}
                  onClick={finalApproval}
                >
                  <CheckCircle2 className="h-5 w-5" /> 
                  {hasFailures ? 'Force Release with Deviations' : 'Authorize Final Release'}
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1 h-16 rounded-2xl border border-white/10 text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest gap-3"
                  onClick={() => setCurrentStep('checklist')}
                >
                  <AlertTriangle className="h-5 w-5 text-amber-400" /> Return for Rectification
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'approval' && (
            <div className="text-center space-y-10 pt-10 print:hidden">
              <div className={cn(
                "inline-flex items-center gap-3 px-10 py-4 rounded-full border-2 font-bold text-xs uppercase tracking-[0.3em] shadow-xl",
                hasFailures ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
              )}>
                <CheckCircle2 className="h-5 w-5" /> 
                PROTOCOL_STATUS: {hasFailures ? 'FORCE_RELEASED' : 'FINAL_APPROVED'}
              </div>
              <div className="flex flex-col items-center gap-6">
                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Procedural cycle complete for blueprint <b>{activeDrawing.name}</b>. Audit trail synchronized with master ledger.</p>
                <Button 
                  onClick={() => {
                    setActiveDrawingId(null);
                    setCurrentStep('upload');
                    setDimensions(INITIAL_DIMENSIONS);
                    toast({ title: "Reset Sequence", description: "Select another blueprint from the onboarding matrix." });
                  }}
                  className="rounded-2xl bg-[#001F3D] hover:bg-black text-white h-14 px-12 font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 flex gap-3 transition-all"
                >
                  <Plus className="h-4 w-4" /> Start Report for Next Drawing
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
