
"use client";

import { useState, useMemo } from 'react';
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
  MousePointer2
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
  { id: '1', feature: 'Overall Length', target: '0.00', tolerance: '±0.00', upperLimit: '0.000', lowerLimit: '0.000', actual: '', status: 'Pending', remark: '' },
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
  
  // Selection logic for per-drawing reports
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);
  
  const [checks, setChecks] = useState<Record<string, CheckStatus>>({});
  const [dimensions, setDimensions] = useState<DimensionRecord[]>(INITIAL_DIMENSIONS);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders that have a QC operation in their routing
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
    setSelectedOrder(order);
    setSelectedOp(op);
    setCurrentStep('upload');
    setUploadedFiles([]);
    setActiveDrawingId(null);
    setDimensions(INITIAL_DIMENSIONS);
    const initial: Record<string, CheckStatus> = {};
    MACHINING_OPS.forEach(o => initial[o] = 'Pending');
    setChecks(initial);
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

          const pmMatch = tol.match(/±([\d.]+)/);
          const plusMatch = tol.match(/\+([\d.]+)/);
          const minusMatch = tol.match(/-([\d.]+)/);

          if (pmMatch) {
            const val = parseFloat(pmMatch[1]);
            upperOffset = val;
            lowerOffset = -val;
          } else {
            if (plusMatch) upperOffset = parseFloat(plusMatch[1]);
            if (minusMatch) lowerOffset = -parseFloat(minusMatch[1]);
            
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

      const actualNum = parseFloat(updatedDim.actual);
      const upperNum = parseFloat(updatedDim.upperLimit);
      const lowerNum = parseFloat(updatedDim.lowerLimit);

      if (!isNaN(actualNum) && !isNaN(upperNum) && !isNaN(lowerNum)) {
        updatedDim.status = (actualNum >= lowerNum && actualNum <= upperNum) ? 'Pass' : 'Fail';
      } else if (updatedDim.actual === '') {
        updatedDim.status = 'Pending';
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
        id: Math.random().toString(36).substr(2, 9),
        name: file.name
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({ title: "Technical Blueprints Loaded", description: `${newFiles.length} files added to operational context.` });
    }
  };

  const removeFile = (id: string) => {
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
    toast({ title: "Report Release Authorized", description: `Dedicated report for ${activeDrawing?.name} archived.` });
  };

  const handleCreateAnother = () => {
    // Reset entry state for next drawing
    setActiveDrawingId(null);
    setCurrentStep('upload');
    setDimensions(INITIAL_DIMENSIONS);
    const initial: Record<string, CheckStatus> = {};
    MACHINING_OPS.forEach(o => initial[o] = 'Pending');
    setChecks(initial);
    toast({ title: "Procedure Reset", description: "Select another drawing to begin next inspection cycle." });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <ShieldCheck className="h-4 w-4" />
            Quality Matrix Protocol
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            {currentStep === 'list' && 'Inspection Pipeline'}
            {currentStep === 'upload' && 'Drawing Matrix Onboarding'}
            {currentStep === 'checklist' && 'Dimensional Verification'}
            {currentStep === 'report' && 'Inspection Report Preview'}
            {currentStep === 'review' && 'Compliance Review'}
            {currentStep === 'approval' && 'Final Quality Release'}
          </h2>
          <p className="text-muted-foreground font-medium">Sequential verification lifecycle for industrial parts & blueprints.</p>
        </div>
        
        {currentStep !== 'list' && (
          <Button variant="ghost" onClick={() => setCurrentStep('list')} className="rounded-full gap-2 text-slate-400 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Abort Procedure
          </Button>
        )}
      </header>

      {currentStep === 'list' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 p-8 bg-white border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Queue Distribution</h3>
                  <p className="text-xs text-muted-foreground mt-1">Live mapping of Work Orders with active QC gateways.</p>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">TELEMETRY_LIVE</Badge>
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
              <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-amber-500/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-600">{statsData[0].count}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Inspection</p>
              </Card>
              <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{statsData[1].count}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Compliance Review</p>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-[2rem]">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Order ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Start - End Cycle</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Inspector / Resource</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                  <TableHead className="text-right px-8 w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qcEntries.map(({ order, operation }) => (
                  <TableRow key={operation.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                    <TableCell className="px-8 font-bold text-sm text-primary">#{order.id}</TableCell>
                    <TableCell className="text-slate-900 font-bold uppercase">{order.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] font-code font-bold text-slate-500">
                        <span>{operation.startDate}</span>
                        <span className="text-slate-300">→</span>
                        <span>{operation.endDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase">{getResourceName(operation)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "text-[9px] font-bold uppercase px-3 py-1 rounded-full",
                        operation.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                        (['Review Pending', 'WIP'].includes(operation.status || '')) ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      )}>
                        {operation.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-[#001F3D] hover:bg-black text-white text-[10px] font-bold uppercase h-10 px-6 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        onClick={() => handleSelectTask(order, operation)}
                      >
                        Start Audit <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {currentStep === 'upload' && selectedOrder && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
          <Card className="p-12 bg-white border-slate-200 shadow-2xl rounded-[3rem] text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="space-y-4 max-w-md mx-auto relative z-10">
              <div className="p-6 bg-primary/5 rounded-[2.5rem] w-fit mx-auto mb-6">
                <FileSearch className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Onboard Blueprints</h3>
              <p className="text-sm text-slate-500">Upload multiple technical drawings for Order #{selectedOrder.id}. Each drawing will receive its own dimensional report.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
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
                  className="h-64 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group"
                >
                  <Upload className="h-12 w-12 text-slate-300 group-hover:text-primary transition-colors" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Drop Technical PDFs</span>
                    <span className="text-[9px] text-slate-300 font-bold uppercase">Multi-File Protocol v2.4</span>
                  </div>
                </label>
              </div>

              <div className="space-y-6 text-left">
                <div className="flex items-center gap-3 px-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Blueprint Matrix</h4>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id}
                      onClick={() => setActiveDrawingId(file.id)}
                      className={cn(
                        "p-5 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer relative overflow-hidden",
                        activeDrawingId === file.id ? "bg-[#001F3D] border-[#001F3D] text-white shadow-xl shadow-primary/20 scale-[1.02]" : "bg-white border-slate-100 hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          activeDrawingId === file.id ? "bg-white/10" : "bg-primary/5 text-primary"
                        )}>
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold block truncate max-w-[180px]">{file.name}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest",
                            activeDrawingId === file.id ? "text-white/40" : "text-slate-300"
                          )}>IDENTIFIED_NODE</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 relative z-10">
                        {activeDrawingId === file.id && <MousePointer2 className="h-4 w-4 text-accent animate-pulse" />}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} 
                          className={cn(
                            "h-8 w-8 rounded-lg transition-all",
                            activeDrawingId === file.id ? "text-white/40 hover:text-white hover:bg-white/10" : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {uploadedFiles.length === 0 && (
                    <div className="py-12 text-center opacity-20 border-2 border-dashed border-slate-100 rounded-3xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest">No Drawings Loaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Ready: Attach blueprints to initialize dimensional verification.</span>
              </div>
              <Button 
                disabled={!activeDrawingId}
                className="h-14 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex gap-3 transition-all"
                onClick={() => setCurrentStep('checklist')}
              >
                Inspect Selected Drawing <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {currentStep === 'checklist' && selectedOrder && activeDrawing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in duration-700">
          <div className="lg:col-span-12 space-y-10">
            {/* Visual Identification Header */}
            <div className="flex items-center justify-between p-8 bg-[#001F3D] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 p-10 opacity-5">
                <FileSearch className="h-32 w-32" />
              </div>
              <div className="flex items-center gap-8 relative z-10">
                <div className="h-20 w-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/10">
                  <ImageIcon className="h-10 w-10 text-accent" />
                </div>
                <div>
                  <Badge className="bg-accent text-white border-none text-[8px] font-bold uppercase px-3 mb-2">Active Inspection Node</Badge>
                  <h3 className="text-3xl font-display font-bold tracking-tight uppercase">{activeDrawing.name}</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mt-1">Audit Protocol for WO #{selectedOrder.id}</p>
                </div>
              </div>
              <div className="text-right relative z-10 hidden md:block">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Report Sequence</p>
                <p className="text-xl font-display font-bold text-accent">ID_REP_{activeDrawing.id.toUpperCase()}</p>
              </div>
            </div>

            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-inner">
                <TabsTrigger value="customer" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-lg transition-all">
                  Customer Dimension Entry
                </TabsTrigger>
                <TabsTrigger value="internal" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-lg transition-all">
                  Internal Process Checks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="m-0 space-y-10">
                <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[3rem] space-y-10">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                      <MousePointer2 className="h-5 w-5 text-primary" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Measurement Matrix</h3>
                    </div>
                    <Button variant="ghost" onClick={handleAddDimension} className="text-[10px] uppercase font-bold gap-2 text-primary hover:bg-primary/5 h-10 px-6 rounded-xl">
                      <Plus className="h-4 w-4" /> Append Dimension Node
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table className="min-w-[1100px]">
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-b border-slate-100">
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 py-6 px-6 w-[200px]">Technical Feature</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center">Target (MM)</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center">Tolerance</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center">Limits (U/L)</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center w-[120px]">Actual Entry</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-center">Verdict</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-slate-400 px-6">Remark / Observation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dimensions.map((dim) => (
                          <TableRow key={dim.id} className="border-b border-slate-50 h-20 hover:bg-slate-50/30 transition-colors">
                            <TableCell className="px-6">
                              <Input 
                                className="h-11 bg-slate-50/50 border-none font-bold text-xs rounded-xl" 
                                value={dim.feature} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'feature', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                className="h-11 bg-slate-50/50 border-none font-code font-bold text-xs text-center rounded-xl" 
                                value={dim.target} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'target', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                className="h-11 bg-slate-50/50 border-none font-code font-bold text-xs text-center rounded-xl" 
                                value={dim.tolerance} 
                                onChange={(e) => handleUpdateDimension(dim.id, 'tolerance', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                <Input className="h-11 bg-white border-slate-100 font-code text-[10px] w-16 text-center rounded-xl" value={dim.upperLimit} readOnly />
                                <Input className="h-11 bg-white border-slate-100 font-code text-[10px] w-16 text-center rounded-xl" value={dim.lowerLimit} readOnly />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input 
                                placeholder="0.000" 
                                className="h-11 bg-white border-2 border-primary/20 focus-visible:ring-primary/20 font-code font-bold text-sm text-center rounded-xl shadow-inner"
                                value={dim.actual}
                                onChange={(e) => handleUpdateDimension(dim.id, 'actual', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <Badge className={cn(
                                  "text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm",
                                  dim.status === 'Pass' ? "bg-green-50 text-green-700 border-green-100" :
                                  dim.status === 'Fail' ? "bg-red-50 text-red-700 border-red-100" :
                                  "bg-slate-50 text-slate-400 border-slate-100"
                                )}>
                                  {dim.status === 'Pending' ? 'UNSET' : dim.status === 'Pass' ? 'NOMINAL' : 'DEVIATION'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="px-6">
                              <Input 
                                placeholder="..." 
                                className="h-11 bg-slate-50/50 border-none text-xs rounded-xl" 
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

              <TabsContent value="internal" className="m-0">
                <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[3rem] space-y-10">
                  <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                    <Activity className="h-5 w-5 text-accent" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Process Validation Nodes</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MACHINING_OPS.map((op) => (
                      <div key={op} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:border-primary/20 group">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm",
                            checks[op] === 'Pass' ? "bg-green-500 border-green-500 text-white" :
                            checks[op] === 'Fail' ? "bg-red-500 border-red-500 text-white" :
                            checks[op] === 'NA' ? "bg-slate-400 border-slate-400 text-white" :
                            "bg-white border-slate-200 text-slate-300 group-hover:border-primary/30"
                          )}>
                            {checks[op] === 'Pass' ? <Check className="h-6 w-6" /> : 
                             checks[op] === 'Fail' ? <X className="h-6 w-6" /> : 
                             checks[op] === 'NA' ? <MinusCircle className="h-6 w-6" /> :
                             <Box className="h-6 w-6" />}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-tight block">{op}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">INTERNAL_CHECK_NODE</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {['Pass', 'Fail', 'NA'].map((st) => (
                            <Button 
                              key={st}
                              size="sm" 
                              variant="outline" 
                              className={cn(
                                "rounded-xl h-10 px-5 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm border-b-4",
                                checks[op] === st 
                                  ? (st === 'Pass' ? "bg-green-50 border-green-200 text-green-700" : st === 'Fail' ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-100 border-slate-300 text-slate-700")
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
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-6">
              <Button 
                variant="ghost"
                className="flex-1 h-16 rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:text-[#001F3D] hover:bg-slate-50"
                onClick={() => setCurrentStep('upload')}
              >
                Return to Drawing Matrix
              </Button>
              <Button 
                className="flex-[2] h-16 bg-[#001F3D] hover:bg-black text-white rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 flex gap-4 transition-all"
                onClick={() => {
                  if (dimensions.every(d => d.actual === '')) {
                    toast({ variant: "destructive", title: "Protocol Refused", description: "At least one dimensional entry is required to generate a compliance report." });
                    return;
                  }
                  setCurrentStep('report');
                }}
              >
                Compile Inspection Report <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {(currentStep === 'report' || currentStep === 'review' || currentStep === 'approval') && selectedOrder && activeDrawing && (
        <div className="space-y-10 pb-20 max-w-[1100px] mx-auto animate-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center px-4 print:hidden">
            <Button variant="ghost" onClick={() => setCurrentStep('checklist')} className="rounded-xl gap-3 h-12 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Edit Measurements
            </Button>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-3 h-12 px-8 font-bold uppercase text-[10px] tracking-widest border-slate-200 shadow-sm">
                <Printer className="h-4 w-4" /> Print Matrix
              </Button>
              <Button className="rounded-xl bg-slate-900 hover:bg-black text-white gap-3 h-12 px-8 font-bold uppercase text-[10px] tracking-widest shadow-xl">
                <Download className="h-4 w-4" /> Export Report
              </Button>
            </div>
          </div>

          <Card className={cn(
            "bg-white border border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] p-16 space-y-12 transition-all duration-700",
            currentStep === 'review' && "ring-8 ring-primary/5 border-primary/20"
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
                  <p>Secure Hash: {activeDrawing.id.toUpperCase()}_{selectedOrder.id}</p>
                </div>
              </div>
              <div className="text-right space-y-3">
                <h2 className="text-5xl font-display font-bold text-[#001F3D] tracking-tighter uppercase">Inspection Sheet</h2>
                <Badge className="bg-primary text-white border-none text-[9px] font-bold px-5 py-1.5 rounded-full">CERTIFIED_LEDGER</Badge>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">DATE: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-12 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Work Order Identity</p>
                <p className="text-lg font-bold text-[#001F3D]">#{selectedOrder.id}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Corporate Client</p>
                <p className="text-sm font-bold text-slate-900 uppercase truncate">{selectedOrder.customer}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Audit Terminal</p>
                <p className="text-sm font-bold text-slate-900 uppercase">{selectedOp ? getResourceName(selectedOp) : 'SYS_NODE_01'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Procedural Status</p>
                <Badge variant="outline" className="bg-white border-slate-200 text-emerald-600 font-bold text-[9px] px-4 py-1">NOMINAL_STATE</Badge>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Technical Blueprint Identification</h3>
              <div className="bg-slate-50 border-2 border-slate-100 rounded-[3rem] h-[500px] flex items-center justify-center relative overflow-hidden shadow-inner group">
                <div className="flex flex-col items-center gap-8 text-center transition-transform group-hover:scale-105 duration-700">
                  <div className="p-10 bg-white rounded-[2rem] shadow-xl border border-slate-100">
                    <ImageIcon className="h-20 w-20 text-primary/10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-display font-bold text-[#001F3D] uppercase">{activeDrawing.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Visual Reference Reference Node Locked</p>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-4">Measurement Compliance Table</h3>
              <div className="border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <Table className="border-collapse">
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                      <TableHead className="text-[9px] font-bold uppercase py-5 px-6 text-center border-r border-slate-200 w-16">SN</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase border-r border-slate-200 text-[#001F3D]">Dimensional Feature</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Target</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Upper</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Lower</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200 text-primary">Actual</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center w-24">Compliance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dimensions.map((dim, idx) => (
                      <TableRow key={dim.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="text-center font-bold text-xs border-r border-slate-100 text-slate-400 py-5">{idx + 1}</TableCell>
                        <TableCell className="font-bold text-xs border-r border-slate-100 text-slate-700 uppercase">{dim.feature}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.target}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.upperLimit}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.lowerLimit}</TableCell>
                        <TableCell className="text-center font-code text-sm font-bold border-r border-slate-100 text-primary">{dim.actual || '---'}</TableCell>
                        <TableCell className="text-center">
                          <div className={cn(
                            "mx-auto h-6 w-6 rounded-full flex items-center justify-center border-2",
                            dim.status === 'Pass' ? "bg-green-50 border-green-500 text-green-600" : 
                            dim.status === 'Fail' ? "bg-red-50 border-red-500 text-red-600" :
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
                className="rounded-2xl bg-primary hover:bg-[#002d4f] text-white h-16 px-16 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/20"
                onClick={submitForReview}
              >
                Transmit for Final Compliance Review
              </Button>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="bg-[#001F3D] border-none rounded-[3rem] p-12 max-w-[900px] mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 print:hidden shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-white/10 rounded-[1.5rem] border border-white/10">
                  <ShieldCheck className="h-10 w-10 text-accent" />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Security Review Locked</h4>
                  <p className="text-sm text-white/40 font-medium">Verify dimensional benchmarks for {activeDrawing.name} before authorization.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <Button 
                  className="flex-1 h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-accent/20"
                  onClick={finalApproval}
                >
                  <CheckCircle2 className="h-5 w-5" /> Authorize Final Release
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1 h-16 rounded-2xl border border-white/10 text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest gap-3"
                  onClick={() => setCurrentStep('checklist')}
                >
                  <AlertTriangle className="h-5 w-5 text-red-400" /> Return for Revision
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'approval' && (
            <div className="text-center space-y-10 pt-10 print:hidden">
              <div className="inline-flex items-center gap-3 px-10 py-4 bg-emerald-50 text-emerald-700 rounded-full border-2 border-emerald-100 font-bold text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/5">
                <CheckCircle2 className="h-5 w-5" /> REPORT_STATUS: FINAL_APPROVED
              </div>
              <div className="flex flex-col items-center gap-6">
                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Procedural cycle complete for blueprint <b>{activeDrawing.name}</b>. Audit trail synchronized with master ledger.</p>
                <Button 
                  onClick={handleCreateAnother}
                  className="rounded-2xl bg-[#001F3D] hover:bg-black text-white h-14 px-12 font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 flex gap-3"
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
