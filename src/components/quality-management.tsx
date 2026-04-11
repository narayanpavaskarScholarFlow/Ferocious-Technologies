
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
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
  Upload, 
  Printer, 
  Download, 
  ChevronRight, 
  ArrowLeft,
  Check,
  X,
  Plus,
  Activity,
  Clock,
  FileText,
  Trash2,
  FileIcon,
  User,
  ExternalLink,
  ClipboardCheck,
  Eye,
  FileBadge,
  Unlock,
  ShieldAlert,
  Maximize2,
  AlertCircle,
  ArchiveX
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
} from 'recharts';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Order, RoutingOperation, SystemUser, Vendor, QualityReport, DimensionRecord } from '@/lib/types';
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

type QualityStep = 'list' | 'upload' | 'checklist' | 'report' | 'review' | 'approval';
type CheckStatus = 'OK' | 'NOT OK' | 'NA' | 'Pending';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  status: 'Pending' | 'Completed';
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
  { id: '1', balloonNo: '1', target: '100.00', tolerance: '±0.05', upperLimit: '100.050', lowerLimit: '99.950', actual: '', status: 'Pending', remark: '' },
];

interface QualityManagementProps {
  orders: Order[];
  users?: SystemUser[];
  vendors?: Vendor[];
  onUpdateStatus?: (orderId: string, operation: string, status: string) => void;
}

export function QualityManagement({ orders, users = [], vendors = [], onUpdateStatus }: QualityManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<QualityStep>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOp, setSelectedOp] = useState<RoutingOperation | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);
  
  const createdUrlsRef = useRef<string[]>([]);

  const [checks, setChecks] = useState<Record<string, CheckStatus>>({});
  const [dimensions, setDimensions] = useState<DimensionRecord[]>(INITIAL_DIMENSIONS);
  const [searchTerm, setSearchTerm] = useState('');

  // Global Reports Listener for the Review Tab
  const allReportsQuery = useMemoFirebase(() => collection(db, 'quality_reports'), [db]);
  const { data: allReportsData } = useCollection<QualityReport>(allReportsQuery);
  const allReports = allReportsData || [];

  const reviewPendingReports = useMemo(() => {
    return allReports.filter(r => r.status === 'Review Pending');
  }, [allReports]);

  // Reports specifically for the selected Work Order
  const orderReports = useMemo(() => {
    if (!selectedOrder) return [];
    return allReports.filter(r => r.workOrderId === selectedOrder.id);
  }, [allReports, selectedOrder?.id]);

  useEffect(() => {
    // Cleanup blob URLs on unmount
    return () => {
      createdUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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
    const inReviewCount = reviewPendingReports.length;
    return [
      { name: 'Pending Pipeline', count: pendingCount, color: '#f59e0b' },
      { name: 'Compliance Review', count: inReviewCount, color: '#ef4444' },
    ];
  }, [qcEntries, reviewPendingReports]);

  const handleSelectTask = (order: Order, op: RoutingOperation) => {
    if (selectedOrder?.id !== order.id) {
      setSelectedOrder(order);
      setSelectedOp(op);
      setDimensions(INITIAL_DIMENSIONS);
      setActiveReportId(null);
      const initial: Record<string, CheckStatus> = {};
      MACHINING_OPS.forEach(o => initial[o] = 'Pending');
      setChecks(initial);
    }
    setCurrentStep('upload');
  };

  const handleOpenReportForReview = (report: QualityReport) => {
    const order = orders.find(o => o.id === report.workOrderId);
    if (!order) return;
    setSelectedOrder(order);
    setActiveReportId(report.id);
    setDimensions(report.dimensions);
    setChecks(report.checks as any);
    const qcOp = order.routing?.find(op => op.name === 'QC');
    if (qcOp) setSelectedOp(qcOp);
    setCurrentStep('review');
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
        updatedDim.status = (actualNum >= lowerNum && actualNum <= upperNum) ? 'OK' : 'NOT OK';
      } else {
        updatedDim.status = 'NOT OK';
      }
      
      return updatedDim;
    }));
  };

  const handleAddDimension = () => {
    const newDim: DimensionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      balloonNo: '',
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
      const newFiles: UploadedFile[] = Array.from(files).map(file => {
        const url = URL.createObjectURL(file);
        createdUrlsRef.current.push(url);
        return {
          id: `FILE-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: url,
          status: 'Pending'
        };
      });
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (newFiles.length > 0) setActiveDrawingId(newFiles[0].id);
      e.target.value = '';
      toast({ title: "Drawing Matrix Initialized", description: `${newFiles.length} technical files onboarded.` });
    }
  };

  const saveReportDraft = () => {
    if (!selectedOrder || !activeDrawing) return;
    
    const reportId = activeReportId || `QR-${Date.now()}`;
    const report: QualityReport = {
      id: reportId,
      workOrderId: selectedOrder.id,
      drawingId: activeDrawing.id,
      drawingName: activeDrawing.name,
      dimensions: dimensions,
      checks: checks,
      status: 'Draft',
      verdict: dimensions.some(d => d.status === 'NOT OK') ? 'Fail' : 'Pass',
      inspector: selectedOp ? getResourceName(selectedOp) : 'Plant Inspector',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(doc(db, 'quality_reports', reportId), report, { merge: true });
    setActiveReportId(reportId);
    setCurrentStep('report');
  };

  const submitForReview = () => {
    if (!activeReportId) return;
    updateDocumentNonBlocking(doc(db, 'quality_reports', activeReportId), {
      status: 'Review Pending',
      updatedAt: new Date().toISOString()
    });
    setCurrentStep('upload'); 
    setActiveReportId(null);
    if (selectedOrder && onUpdateStatus) onUpdateStatus(selectedOrder.id, 'QC', 'Review Pending');
  };

  const finalApproval = () => {
    if (!activeReportId) return;
    updateDocumentNonBlocking(doc(db, 'quality_reports', activeReportId), {
      status: 'Released',
      releasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    if (activeDrawingId) {
      setUploadedFiles(prev => prev.map(f => f.id === activeDrawingId ? { ...f, status: 'Completed' } : f));
    }
    setCurrentStep('upload'); 
    setActiveReportId(null);
    if (selectedOrder && onUpdateStatus) onUpdateStatus(selectedOrder.id, 'QC', 'Completed');
  };

  const hasFailures = useMemo(() => dimensions.some(d => d.status === 'NOT OK'), [dimensions]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <ShieldCheck className="h-4 w-4" />
            Quality Control Center
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            {currentStep === 'list' && 'Master Inspection Hub'}
            {currentStep === 'upload' && 'Inspection Hub'}
            {currentStep === 'checklist' && 'Dimensional Matrix Entry'}
            {currentStep === 'report' && 'Compliance Report Preview'}
            {currentStep === 'review' && 'Final Review & Approval'}
            {currentStep === 'approval' && 'Final Quality Release'}
          </h2>
        </div>
        {currentStep !== 'list' && (
          <Button variant="ghost" onClick={() => setCurrentStep('list')} className="rounded-full gap-2 text-slate-400 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Abort Session
          </Button>
        )}
      </header>

      {currentStep === 'list' && (
        <div className="space-y-8">
          <Tabs defaultValue="pipeline" className="w-full">
            <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
              <TabsTrigger value="pipeline" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Activity className="h-3.5 w-3.5 mr-2" /> Inspection Pipeline
              </TabsTrigger>
              <TabsTrigger value="review" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all relative">
                <Unlock className="h-3.5 w-3.5 mr-2" /> Final Compliance Review
                {reviewPendingReports.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                    {reviewPendingReports.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="m-0 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-8 p-8 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Procedural Distribution</h3>
                      <p className="text-xs text-muted-foreground mt-1">Live visualization of inspection threads.</p>
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
                  <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="p-3 bg-amber-50 rounded-xl"><Clock className="h-5 w-5 text-amber-600" /></div>
                      <span className="text-2xl font-bold text-amber-600">{statsData[0].count}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Entry Matrix</p>
                  </Card>
                  <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="p-3 bg-red-50 rounded-xl"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
                      <span className="text-2xl font-bold text-red-600">{reviewPendingReports.length}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Final Approver</p>
                  </Card>
                </div>
              </div>

              <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
                <Table>
                  <TableHeader className="bg-white border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-32">Order ID</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account Identity</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Assigned Resource</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                      <TableHead className="text-right px-8 w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qcEntries.map(({ order, operation }) => (
                      <TableRow key={operation.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                        <TableCell className="px-8 font-bold text-sm text-primary">#{order.id}</TableCell>
                        <TableCell className="text-[#001F3D] font-bold uppercase">{order.customer}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary"><User className="h-4 w-4" /></div>
                            <span className="text-[11px] font-bold text-slate-700 uppercase">{getResourceName(operation)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="text-[9px] font-bold uppercase px-3 py-1 rounded-full border shadow-sm bg-amber-50 text-amber-700 border-amber-100">
                            {operation.status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Button 
                            className="rounded-xl bg-[#001F3D] hover:bg-black text-white text-[10px] font-bold uppercase h-10 px-6 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                            onClick={() => handleSelectTask(order, operation)}
                          >
                            Initialize Hub <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="m-0 space-y-8">
              <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
                <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-600/20"><Unlock className="h-6 w-6 text-white" /></div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Compliance Review Matrix</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Cross-Order Authorization Ledger</p>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader className="bg-white border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-32">Report ID</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Work Order</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Blueprint Identity</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-center w-32">Verdict</TableHead>
                      <TableHead className="text-right px-8 w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewPendingReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                        <TableCell className="px-8 font-code text-xs font-bold text-slate-400">{report.id}</TableCell>
                        <TableCell className="font-bold text-[#001F3D]">#{report.workOrderId}</TableCell>
                        <TableCell className="text-[11px] font-bold text-slate-700 uppercase">{report.drawingName}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn("text-[9px] font-bold uppercase px-3 py-1 rounded-full", report.verdict === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                            {report.verdict === 'Pass' ? 'OK' : 'NOT OK'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Button 
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase h-10 px-6 shadow-xl"
                            onClick={() => handleOpenReportForReview(report)}
                          >
                            Authorize Release
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {currentStep === 'upload' && selectedOrder && (
        <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-[3rem] relative overflow-hidden min-h-[800px] flex flex-col">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/5 rounded-2xl"><ClipboardCheck className="h-8 w-8 text-primary" /></div>
              <div>
                <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Technical Matrix Registry</h3>
                <p className="text-xs text-slate-500">Inspection artifacts for Order #{selectedOrder.id}.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative z-10">
            <div className="lg:col-span-4 space-y-8 flex flex-col min-h-0">
              <div className="space-y-4">
                <input type="file" id="multi-cad-upload" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
                <label htmlFor="multi-cad-upload" className="h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group shrink-0">
                  <Upload className="h-5 w-5 text-slate-300 group-hover:text-primary" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onboard Technical Drawing</span>
                </label>
                <div className="flex items-center gap-2 px-1"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Blueprint Registry</h4></div>
                <ScrollArea className="max-h-[450px] pr-2">
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} onClick={() => setActiveDrawingId(file.id)} className={cn("p-4 rounded-xl border flex items-center justify-between group transition-all cursor-pointer", activeDrawingId === file.id ? "bg-[#001F3D] border-[#001F3D] text-white" : "bg-white border-slate-100 hover:border-primary/20")}>
                        <div className="flex items-center gap-3">
                          {file.status === 'Completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <FileIcon className="h-4 w-4" />}
                          <span className="text-[11px] font-bold truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id)); }} className={cn("h-7 w-7 rounded-lg", activeDrawingId === file.id ? "text-white/40 hover:text-white" : "text-slate-300 hover:text-red-500")}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    {uploadedFiles.length === 0 && (
                      <div className="py-10 text-center opacity-20 border-2 border-dashed border-slate-100 rounded-2xl">
                        <FileIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-[9px] font-bold uppercase">Registry Null</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col min-h-0">
              <Card className="flex-1 bg-slate-50/50 border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-inner">
                <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3"><FileBadge className="h-5 w-5 text-[#001F3D]" /><h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-[0.1em]">Final Compliance Reports</h3></div>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[9px] font-bold px-3">LEDGER_SYNC_ON</Badge>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orderReports.map((report) => (
                      <Card key={report.id} className="bg-white border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2"><Badge className={cn("text-[8px] font-bold uppercase", report.status === 'Released' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white")}>{report.status}</Badge></div>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-slate-50 text-[#001F3D]"><FileText className="h-6 w-6" /></div>
                            <div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-[#001F3D] uppercase truncate">{report.drawingName}</p><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{report.id}</p></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className={cn("text-[8px] font-bold uppercase px-3 py-1 rounded-full", report.verdict === 'Pass' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{report.verdict === 'Pass' ? 'OK' : 'NOT OK'}</Badge>
                            <Button size="sm" variant="outline" className="h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest gap-2 bg-[#001F3D] hover:bg-black text-white border-none" onClick={() => { setActiveReportId(report.id); setDimensions(report.dimensions); setChecks(report.checks as any); setCurrentStep(report.status === 'Released' ? 'approval' : 'review'); }}>
                              <Eye className="h-3.5 w-3.5" /> Preview Report
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {orderReports.length === 0 && (
                      <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-30 text-center">
                        <ArchiveX className="h-12 w-12 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Compliance Archive Null</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center relative z-10 mt-auto">
            <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Sync Node Active</span></div>
            <Button disabled={!activeDrawingId || activeDrawing?.status === 'Completed'} className="h-14 px-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl flex gap-3" onClick={() => setCurrentStep('checklist')}>Initialize Inspection Matrix <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {currentStep === 'checklist' && selectedOrder && activeDrawing && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-700 px-2">
          <Card className="xl:col-span-5 h-[800px] overflow-hidden rounded-[2.5rem] bg-[#0f172a] shadow-2xl relative border-none flex flex-col group">
            <div className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg text-white shadow-lg shadow-accent/20"><FileText className="h-5 w-5" /></div>
                <div><h3 className="text-sm font-bold text-white uppercase tracking-tight">Technical Reference</h3><p className="text-[9px] text-white/40 font-code font-bold uppercase">{activeDrawing.name}</p></div>
              </div>
            </div>
            <div className="flex-1 w-full bg-[#1e293b] relative flex flex-col items-center justify-center p-10 text-center">
              <div className="p-10 rounded-[2.5rem] bg-white shadow-2xl border border-slate-100 flex flex-col items-center gap-6 max-w-sm">
                <div className="p-5 bg-amber-50 rounded-3xl"><AlertCircle className="h-12 w-12 text-amber-500" /></div>
                <div><p className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">Security Handshake Required</p><p className="text-xs text-slate-500 mt-2 leading-relaxed">Browser security policies may restrict the inline viewer. Use the protocols below to open the technical reference.</p></div>
                <div className="flex flex-col w-full gap-3">
                  <Button className="w-full bg-[#001F3D] hover:bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest h-14 gap-3 shadow-xl" onClick={() => window.open(activeDrawing.url, '_blank')}><Maximize2 className="h-4 w-4" /> Open Drawing in New Tab</Button>
                  <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest h-14 gap-3 shadow-sm" onClick={() => { window.location.href = `microsoft-edge:${activeDrawing.url}`; }}><ExternalLink className="h-4 w-4" /> Open in Microsoft Edge</Button>
                </div>
              </div>
              <p className="text-[9px] text-white/20 mt-8 uppercase font-bold tracking-[0.4em]">Audit Access Protocol v2.4</p>
            </div>
          </Card>

          <div className="xl:col-span-7 flex flex-col h-[800px]">
            <Card className="flex-1 p-8 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden">
              <Tabs defaultValue="customer" className="w-full flex flex-col flex-1 overflow-hidden">
                <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200 w-fit shrink-0">
                  <TabsTrigger value="customer" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm transition-all">Dimension Matrix</TabsTrigger>
                  <TabsTrigger value="internal" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm transition-all">Validation Nodes</TabsTrigger>
                </TabsList>
                <TabsContent value="customer" className="m-0 flex-1 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center px-1 mb-6 shrink-0"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Measurement Entry Matrix</h3><Button variant="ghost" onClick={handleAddDimension} className="text-[9px] uppercase font-bold gap-2 text-primary hover:bg-primary/5 h-8 px-4 rounded-xl"><Plus className="h-3.5 w-3.5" /> Append Measurement</Button></div>
                  <ScrollArea className="flex-1">
                    <Table className="min-w-[1000px]">
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-b border-slate-100">
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 py-4 px-4 w-[120px]">Balloon No.</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center w-[100px]">Target</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center w-[100px]">Tolerance</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center w-[100px]">Actual</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center w-[100px]">Verdict</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-left pl-6">Remark / Observation</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dimensions.map((dim) => (
                          <TableRow key={dim.id} className="border-b border-slate-50 h-16 hover:bg-slate-50/30 transition-colors">
                            <TableCell className="px-4"><Input className="h-10 bg-slate-50/50 border-none font-bold text-xs rounded-xl" placeholder="e.g. 1" value={dim.balloonNo} onChange={(e) => handleUpdateDimension(dim.id, 'balloonNo', e.target.value)} /></TableCell>
                            <TableCell><Input className="h-10 bg-slate-50/50 border-none font-code font-bold text-xs text-center rounded-xl" value={dim.target} onChange={(e) => handleUpdateDimension(dim.id, 'target', e.target.value)} /></TableCell>
                            <TableCell><Input className="h-10 bg-slate-50/50 border-none font-code font-bold text-xs text-center rounded-xl" value={dim.tolerance} onChange={(e) => handleUpdateDimension(dim.id, 'tolerance', e.target.value)} /></TableCell>
                            <TableCell><Input className={cn("h-10 bg-white border-2 font-code font-bold text-sm text-center rounded-xl shadow-inner", dim.status === 'OK' ? "border-emerald-200 text-emerald-700" : dim.status === 'NOT OK' ? "border-red-200 text-red-700" : "border-primary/10")} value={dim.actual} onChange={(e) => handleUpdateDimension(dim.id, 'actual', e.target.value)} /></TableCell>
                            <TableCell><div className="flex justify-center"><Badge className={cn("text-[8px] font-bold uppercase w-16 justify-center rounded-full border shadow-sm", dim.status === 'OK' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : dim.status === 'NOT OK' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100")}>{dim.status}</Badge></div></TableCell>
                            <TableCell className="pl-6"><Input placeholder="Observations..." className="h-10 bg-slate-50/50 border-none text-[10px] rounded-xl font-medium" value={dim.remark} onChange={(e) => handleUpdateDimension(dim.id, 'remark', e.target.value)} /></TableCell>
                            <TableCell className="px-2"><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => setDimensions(dimensions.filter(d => d.id !== dim.id))}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="internal" className="m-0 flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="grid grid-cols-1 gap-4 pr-2">
                      {MACHINING_OPS.map((op) => (
                        <div key={op} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-6 transition-all hover:border-primary/20 group">
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{op}</span>
                          <div className="flex gap-1.5">{['OK', 'NOT OK', 'NA'].map((st) => (<Button key={st} size="sm" variant="outline" className={cn("rounded-lg h-8 px-3 font-bold text-[9px] uppercase tracking-widest transition-all border-b-2", checks[op] === st ? (st === 'OK' ? "bg-green-50 border-green-500 text-green-700" : st === 'NOT OK' ? "bg-red-50 border-red-500 text-red-700" : "bg-slate-100 border-slate-400 text-slate-700") : "bg-white text-slate-400 border-slate-100")} onClick={() => setChecks(prev => ({ ...prev, [op]: st as any }))}>{st}</Button>))}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              <div className="pt-8 border-t border-slate-100 flex gap-4 mt-8 shrink-0"><Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] text-slate-400" onClick={() => setCurrentStep('upload')}>Return to Hub</Button><Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] shadow-2xl flex gap-3" onClick={saveReportDraft}>Generate Compliance Draft <ChevronRight className="h-4 w-4" /></Button></div>
            </Card>
          </div>
        </div>
      )}

      {(currentStep === 'report' || currentStep === 'review' || currentStep === 'approval') && selectedOrder && (
        <div className="space-y-10 pb-20 max-w-[1100px] mx-auto animate-in zoom-in-95 duration-500 px-2">
          <div className="flex justify-between items-center px-4 print:hidden">
            <Button variant="ghost" onClick={() => setCurrentStep('checklist')} className="rounded-xl gap-3 h-12 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Edit Matrix</Button>
            <div className="flex gap-4"><Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-3 h-12 px-8 font-bold uppercase text-[10px] tracking-widest border-slate-200 shadow-sm"><Printer className="h-4 w-4" /> Print Matrix</Button><Button className="rounded-xl bg-slate-900 hover:bg-black text-white gap-3 h-12 px-8 font-bold uppercase text-[10px] tracking-widest shadow-xl"><Download className="h-4 w-4" /> Export Protocol</Button></div>
          </div>
          <Card className={cn("bg-white border border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] p-16 space-y-12 transition-all duration-700", currentStep === 'review' && hasFailures ? "ring-8 ring-red-500/10 border-red-200" : "")}>
            <div className="flex justify-between items-start border-b-2 border-[#001F3D] pb-10">
              <div className="space-y-6"><div className="flex items-center gap-4"><div className="p-3 bg-[#001F3D] rounded-2xl shadow-xl shadow-primary/20"><ShieldCheck className="h-10 w-10 text-white" /></div><div><h1 className="text-3xl font-display font-bold tracking-tighter">BHARAT<span className="text-primary">AXIS</span></h1><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Precision Engineering & QC Hub</p></div></div></div>
              <div className="text-right space-y-3"><h2 className="text-5xl font-display font-bold text-[#001F3D] tracking-tighter uppercase">Inspection Sheet</h2><Badge className={cn("border-none text-[9px] font-bold px-5 py-1.5 rounded-full", hasFailures ? "bg-red-600 text-white" : "bg-primary text-white")}>{hasFailures ? 'DEVIATION_ALERT' : 'CERTIFIED_LEDGER'}</Badge></div>
            </div>
            <div className="space-y-8">
              <h3 className="text-xs font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Dimensional Compliance Protocol</h3>
              <div className="border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <Table className="border-collapse">
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                      <TableHead className="text-[9px] font-bold uppercase border-r border-slate-200 text-[#001F3D]">Balloon No.</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200">Target / Limits</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200 text-primary">Actual Measured</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center border-r border-slate-200 w-24">Verdict</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-left pl-6">Observations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dimensions.map((dim) => (
                      <TableRow key={dim.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="font-bold text-xs border-r border-slate-100 text-slate-700 uppercase py-5">{dim.balloonNo}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-500">{dim.target} ({dim.upperLimit}/{dim.lowerLimit})</TableCell>
                        <TableCell className="text-center font-code text-sm font-bold border-r border-slate-100 text-primary">{dim.actual || '---'}</TableCell>
                        <TableCell className="text-center border-r border-slate-100"><Badge className={cn("text-[8px] font-bold uppercase w-16 justify-center rounded-full", dim.status === 'OK' ? "bg-emerald-500 text-white" : dim.status === 'NOT OK' ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-400")}>{dim.status}</Badge></TableCell>
                        <TableCell className="pl-6 text-[10px] font-medium text-slate-500 uppercase italic">{dim.remark || '---'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-40 pt-20"><div className="space-y-10 text-center"><div className="h-[1px] bg-slate-300 w-full" /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Officer Signature</p></div><div className="space-y-10 text-center"><div className="h-[1px] bg-slate-300 w-full" /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Director</p></div></div>
          </Card>
          <div className="flex justify-center pt-10 print:hidden gap-6"><Button variant="ghost" className="rounded-2xl h-16 px-10 font-bold uppercase text-slate-400" onClick={() => setCurrentStep('upload')}>Return to Hub</Button>{currentStep === 'report' ? (<Button className="rounded-2xl bg-[#001F3D] hover:bg-black text-white h-16 px-16 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl" onClick={submitForReview}>Transmit for Compliance Review</Button>) : currentStep === 'review' ? (<Button className={cn("rounded-2xl h-16 px-16 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl", hasFailures ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700")} onClick={finalApproval}>{hasFailures ? 'Force Release with Deviations' : 'Authorize Quality Release'}</Button>) : null}</div>
        </div>
      )}
    </div>
  );
}
