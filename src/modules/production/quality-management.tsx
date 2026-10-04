"use client";

import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldCheck, 
  Search, 
  Printer, 
  ChevronRight, 
  ArrowLeft,
  Plus,
  Activity,
  Clock,
  FileText,
  Trash2,
  User,
  ClipboardCheck,
  FileBadge,
  Unlock,
  ShieldAlert,
  Archive,
  Edit2,
  Upload,
  ImageIcon,
  Maximize2,
  X,
  Send
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
} from 'recharts';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Order, RoutingOperation, SystemUser, Vendor, QualityReport, DimensionRecord, PermissionLevel, BillingRecord } from '@/lib/types';
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

type QualityStep = 'list' | 'upload' | 'checklist' | 'report' | 'review' | 'approval';
type CheckStatus = 'OK' | 'NOT OK' | 'NA' | 'Pending';

const MACHINING_OPS = [
  "VMC Milling - Dimensions Verification",
  "CNC Turning - Surface Finish Ra < 0.8",
  "1st Grinding - Parallelism Check",
  "Heat Treatment - Hardness Rockwell C",
  "2nd Grinding - Tolerance ±0.005mm",
  "Hard Part Milling - Wire Cut Profile Check",
  "Assembly - Fit & Function Test"
];

const INSTRUMENTS = ["Vernier", "CMM", "Hight gauge", "Micro meter"];
const STATUS_OPTIONS = ["Pending", "Yet to start", "Hold", "Completed", "WIP"];

const INITIAL_DIMENSIONS: DimensionRecord[] = [
  { id: '1', balloonNo: 'BL-01', typeOfDim: 'Normal Dim', instrument: 'Vernier', target: '', tolerance: '±', upperLimit: '0.000', lowerLimit: '0.000', actual: '', status: 'Pending', remark: '' },
];

export function QualityManagement({ orders, users = [], vendors = [], permissions }: { orders: Order[], users?: SystemUser[], vendors?: Vendor[], permissions?: Record<string, PermissionLevel> }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<QualityStep>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOp, setSelectedOp] = useState<RoutingOperation | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [manualComponentName, setManualComponentName] = useState('');
  const [isDrawingDialogOpen, setIsDrawingDialogOpen] = useState(false);
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  const [pendingDrawingFile, setPendingDrawingFile] = useState<string | undefined>();
  const [checks, setChecks] = useState<Record<string, CheckStatus>>({});
  const [dimensions, setDimensions] = useState<DimensionRecord[]>(INITIAL_DIMENSIONS);
  const [searchTerm, setSearchTerm] = useState('');

  const allReportsQuery = useMemoFirebase(() => collection(db, 'quality_reports'), [db]);
  const { data: allReportsData } = useCollection<QualityReport>(allReportsQuery);
  const allReports = allReportsData || [];

  const billingQuery = useMemoFirebase(() => collection(db, 'billing'), [db]);
  const { data: allBillingData } = useCollection<BillingRecord>(billingQuery);
  const allBilling = allBillingData || [];

  const reviewPendingReports = useMemo(() => allReports.filter(r => r.status === 'Review Pending'), [allReports]);

  const orderReports = useMemo(() => {
    if (!selectedOrder) return [];
    return allReports.filter(r => r.workOrderId === selectedOrder.id);
  }, [allReports, selectedOrder?.id]);

  const activePreviewReport = useMemo(() => {
    if (!activeReportId) return null;
    return allReports.find(r => r.id === activeReportId) || null;
  }, [allReports, activeReportId]);

  const currentQCOperation = useMemo(() => {
    if (!selectedOrder) return null;
    const order = orders.find(o => o.id === selectedOrder.id);
    return order?.routing?.find(op => op.name === 'QC') || null;
  }, [orders, selectedOrder]);

  const qcSubTasks = useMemo(() => currentQCOperation?.subTasks || [], [currentQCOperation]);

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

  const statsData = useMemo(() => {
    const pendingCount = qcEntries.filter(e => ['Yet to start', 'WIP', 'Pending'].includes(e.operation.status || '')).length;
    const inReviewCount = reviewPendingReports.length;
    return [
      { name: 'Pending Pipeline', count: pendingCount, color: '#f59e0b' },
      { name: 'Compliance Review', count: inReviewCount, color: '#ef4444' },
    ];
  }, [qcEntries, reviewPendingReports]);

  const isQCReadyForCompletion = (order: Order, op: RoutingOperation, newlyReleasedReportId?: string) => {
    const orderReports = allReports.filter(r => r.workOrderId === order.id);
    const subTasks = op.subTasks || [];
    if (subTasks.length === 0) return true;
    return subTasks.every(st => {
      const report = orderReports.find(r => r.drawingName === st.name);
      const isReleased = (report && report.status === 'Released') || (report && report.id === newlyReleasedReportId);
      return isReleased;
    });
  };

  const handleStatusUpdate = (order: Order, opId: string, newStatus: string) => {
    const updatedRouting = order.routing?.map(op => op.id === opId ? { ...op, status: newStatus } : op) || [];
    let totalTasks = 0;
    let completedTasks = 0;
    updatedRouting.forEach(op => {
      if (op.status === 'NA') return;
      if (op.subTasks && op.subTasks.length > 0) {
        totalTasks += op.subTasks.length;
        completedTasks += op.subTasks.filter(s => s.status === 'Completed' || s.isCompleted).length;
      } else {
        totalTasks += 1;
        if (op.status === 'Completed') completedTasks += 1;
        else if (op.status === 'WIP') completedTasks += 0.5;
      }
    });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    let orderStatus = order.status;
    if (progress === 100) {
      const orderReports = allReports.filter(r => r.workOrderId === order.id);
      const qualityReleased = orderReports.length > 0 && orderReports.every(r => r.status === 'Released');
      const orderBilling = allBilling.filter(b => b.orderId === order.id && b.type === 'invoice');
      const billingPaid = orderBilling.length > 0 && orderBilling.every(b => b.status === 'Paid');
      if (qualityReleased && billingPaid) orderStatus = 'Ready for Delivery';
      else orderStatus = 'Completed';
    } else if (progress > 0 && (orderStatus === 'Pending' || orderStatus === 'Yet to start')) {
      orderStatus = 'Active';
    }
    setDocumentNonBlocking(doc(db, 'orders', order.id), { routing: updatedRouting, progress: progress, status: orderStatus }, { merge: true });
    toast({ title: "Status Synchronized", description: `QC state for Order #${order.id} updated.` });
  };

  const handleSelectTask = (order: Order, op: RoutingOperation) => {
    if (selectedOrder?.id !== order.id) {
      setSelectedOrder(order);
      setSelectedOp(op);
      setDimensions(INITIAL_DIMENSIONS);
      setActiveReportId(null);
      setManualComponentName('');
      setPendingDrawingFile(undefined);
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
    setManualComponentName(report.drawingName);
    setDimensions(report.dimensions);
    setChecks(report.checks as any);
    setPendingDrawingFile(report.drawingFile);
    const qcOp = order.routing?.find(op => op.name === 'QC');
    if (qcOp) setSelectedOp(qcOp);
    setCurrentStep('review');
  };

  const handleEditReport = (report: QualityReport) => {
    const order = orders.find(o => o.id === report.workOrderId);
    if (!order) return;
    setSelectedOrder(order);
    setActiveReportId(report.id);
    setManualComponentName(report.drawingName);
    setDimensions(report.dimensions);
    setChecks(report.checks as any);
    setPendingDrawingFile(report.drawingFile);
    const qcOp = order.routing?.find(op => op.name === 'QC');
    if (qcOp) setSelectedOp(qcOp);
    setCurrentStep('checklist');
  };

  const handleDeleteReport = (reportId: string) => {
    deleteDocumentNonBlocking(doc(db, 'quality_reports', reportId));
    toast({ title: "Report Deleted", variant: "destructive" });
  };

  const handleUpdateDimension = (id: string, field: keyof DimensionRecord, value: string) => {
    setDimensions(prev => prev.map(dim => {
      if (dim.id !== id) return dim;
      let updatedDim = { ...dim, [field]: value };
      if (field === 'target' || field === 'tolerance') {
        const targetNum = parseFloat(updatedDim.target);
        if (!isNaN(targetNum)) {
          let upperOffset = 0, lowerOffset = 0;
          const tol = updatedDim.tolerance.trim();
          const pmMatch = tol.match(/[±](\d+\.?\d*)/);
          const plusMatch = tol.match(/\+(\d+\.?\d*)/);
          const minusMatch = tol.match(/-(\d+\.?\d*)/);
          if (pmMatch) upperOffset = parseFloat(pmMatch[1]), lowerOffset = -parseFloat(pmMatch[1]);
          else if (plusMatch || minusMatch) {
            if (plusMatch) upperOffset = parseFloat(plusMatch[1]);
            if (minusMatch) lowerOffset = -parseFloat(minusMatch[1]);
          }
          updatedDim.upperLimit = (targetNum + upperOffset).toFixed(3);
          updatedDim.lowerLimit = (targetNum + lowerOffset).toFixed(3);
        }
      }
      const actualNum = parseFloat(updatedDim.actual), upperNum = parseFloat(updatedDim.upperLimit), lowerNum = parseFloat(updatedDim.lowerLimit);
      if (updatedDim.actual === '') updatedDim.status = 'Pending';
      else if (!isNaN(actualNum) && !isNaN(upperNum) && !isNaN(lowerNum)) updatedDim.status = (actualNum >= lowerNum && actualNum <= upperNum) ? 'OK' : 'NOT OK';
      else updatedDim.status = 'NOT OK';
      return updatedDim;
    }));
  };

  const handleAddDimension = () => {
    const nextSeq = dimensions.length + 1;
    const newDim: DimensionRecord = { id: Math.random().toString(36).substr(2, 9), balloonNo: `BL-${nextSeq.toString().padStart(2, '0')}`, typeOfDim: 'Normal Dim', instrument: 'Vernier', target: '', tolerance: '±', upperLimit: '0.000', lowerLimit: '0.000', actual: '', status: 'Pending', remark: '' };
    setDimensions(prev => [...prev, newDim]);
    return newDim.id;
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string, idx: number, dimId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      let nextField = '', nextId = dimId;
      if (field === 'target') nextField = 'tolerance';
      else if (field === 'tolerance') nextField = 'actual';
      else if (field === 'actual') nextField = 'remark';
      else if (field === 'remark') {
        nextField = 'target';
        if (idx === dimensions.length - 1) nextId = handleAddDimension();
        else nextId = dimensions[idx + 1].id;
      }
      if (nextField) setTimeout(() => document.getElementById(`${nextField}-${nextId}`)?.focus(), 50);
    }
  };

  const handleDrawingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingDrawingFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const commitReportToLedger = (drawingFile?: string) => {
    if (!selectedOrder || !manualComponentName) return;
    const reportId = activeReportId || `QR-${Date.now()}`;
    const report: QualityReport = { id: reportId, workOrderId: selectedOrder.id, drawingId: 'manual', drawingName: manualComponentName, drawingFile: drawingFile || pendingDrawingFile, dimensions: dimensions, checks: checks, status: 'Draft', verdict: dimensions.some(d => d.status === 'NOT OK') ? 'Fail' : 'Pass', inspector: selectedOp ? getResourceName(selectedOp) : 'Inspector', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setDocumentNonBlocking(doc(db, 'quality_reports', reportId), report, { merge: true });
    setActiveReportId(reportId);
    setCurrentStep('report');
    setIsDrawingDialogOpen(false);
  };

  const saveReportDraft = () => {
    if (!selectedOrder || !manualComponentName) { toast({ variant: "destructive", title: "Identity Required" }); return; }
    if (!pendingDrawingFile) setIsDrawingDialogOpen(true);
    else commitReportToLedger();
  };

  const submitForReview = () => {
    if (!activeReportId) return;
    updateDocumentNonBlocking(doc(db, 'quality_reports', activeReportId), { status: 'Review Pending', updatedAt: new Date().toISOString() });
    setCurrentStep('upload'); setActiveReportId(null);
    if (selectedOrder && selectedOp) handleStatusUpdate(selectedOrder, selectedOp.id, 'Review Pending');
  };

  const finalApproval = () => {
    if (!activeReportId) return;
    updateDocumentNonBlocking(doc(db, 'quality_reports', activeReportId), { status: 'Released', releasedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    if (selectedOrder && selectedOp) {
      if (isQCReadyForCompletion(selectedOrder, selectedOp, activeReportId)) handleStatusUpdate(selectedOrder, selectedOp.id, 'Completed');
      else handleStatusUpdate(selectedOrder, selectedOp.id, 'WIP');
    }
    setCurrentStep('upload'); setActiveReportId(null);
  };

  const handlePrint = useCallback(() => { if (typeof window !== 'undefined') { window.focus(); window.print(); } }, []);

  const hasFailures = useMemo(() => dimensions.some(d => d.status === 'NOT OK'), [dimensions]);
  const canDeleteReport = permissions?.['quality-report-delete'] === 'edit' || permissions?.['quality-report-delete'] === 'full';
  const hasReviewTabAccess = permissions?.['quality-review'] !== 'none';

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <ShieldCheck className="h-4 w-4" />
            Quality Control Hub
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            {currentStep === 'list' && 'Master Inspection Hub'}
            {currentStep === 'upload' && 'Technical Matrix Registry'}
            {currentStep === 'checklist' && 'Dimensional Matrix Entry'}
            {currentStep === 'report' && 'Compliance Report Preview'}
            {currentStep === 'review' && 'Final Review & Approval'}
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
              <TabsTrigger value="pipeline" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
                <Activity className="h-3.5 w-3.5 mr-2" /> Inspection Pipeline
              </TabsTrigger>
              {hasReviewTabAccess && (
                <TabsTrigger value="review" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all relative">
                  <Unlock className="h-3.5 w-3.5 mr-2" /> Compliance Review
                  {reviewPendingReports.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                      {reviewPendingReports.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="pipeline" className="m-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 bg-amber-50 rounded-xl"><Clock className="h-5 w-5 text-amber-600" /></div>
                    <span className="text-2xl font-bold text-amber-600">{qcEntries.length}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Queue</p>
                </Card>
                <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 bg-red-50 rounded-xl"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
                    <span className="text-2xl font-bold text-red-600">{reviewPendingReports.length}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Release</p>
                </Card>
              </div>

              <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-2xl">
                <Table>
                  <TableHeader className="bg-white border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-32">Order ID</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Resource</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-center w-[200px]">Status</TableHead>
                      <TableHead className="text-right px-8 w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qcEntries.map(({ order, operation }) => (
                      <TableRow key={operation.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                        <TableCell className="px-8 font-bold text-sm text-primary">#{order.id}</TableCell>
                        <TableCell className="text-[#001F3D] font-bold uppercase">{order.customer}</TableCell>
                        <TableCell>
                          <span className="text-[11px] font-bold text-slate-700 uppercase">{getResourceName(operation)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                           <Badge className={cn("text-[9px] font-bold uppercase px-3 py-1", operation.status === 'Completed' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>
                             {operation.status || 'Pending'}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Button className="rounded-xl bg-[#001F3D] hover:bg-black text-white text-[10px] font-bold uppercase h-10 px-6 opacity-0 group-hover:opacity-100 transition-all shadow-xl" onClick={() => handleSelectTask(order, operation)}>
                            Process Hub <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="m-0">
               <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-2xl">
                 <Table>
                   <TableHeader className="bg-slate-50/50">
                     <TableRow>
                       <TableHead className="px-8 py-5 text-[10px] font-bold uppercase">Report ID</TableHead>
                       <TableHead className="text-[10px] font-bold uppercase">Work Order</TableHead>
                       <TableHead className="text-[10px] font-bold uppercase">Identity</TableHead>
                       <TableHead className="text-right px-8"></TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {reviewPendingReports.map(report => (
                       <TableRow key={report.id} className="hover:bg-slate-50/50 h-20 border-slate-50">
                         <TableCell className="px-8 font-code text-xs font-bold text-slate-400">{report.id}</TableCell>
                         <TableCell className="font-bold text-[#001F3D]">#{report.workOrderId}</TableCell>
                         <TableCell className="text-[11px] font-bold text-slate-700 uppercase">{report.drawingName}</TableCell>
                         <TableCell className="text-right px-8">
                           <Button className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase h-10 px-6" onClick={() => handleOpenReportForReview(report)}>Authorize</Button>
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
        <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-[3rem] relative overflow-hidden min-h-[600px] flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
            <div className="lg:col-span-4 space-y-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Component Identification</Label>
                    <Select value={manualComponentName} onValueChange={setManualComponentName}>
                      <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase">
                        <SelectValue placeholder="Identify component..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {qcSubTasks.map(st => <SelectItem key={st.id} value={st.name} className="text-xs font-bold uppercase">{st.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Blueprint Matrix</Label>
                    <div className="relative">
                      <input type="file" id="qc-drawing-upload" className="hidden" accept="image/*" onChange={handleDrawingUpload} />
                      <label htmlFor="qc-drawing-upload" className={cn("h-24 w-full flex flex-col items-center justify-center gap-2 px-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all border-2 border-dashed", pendingDrawingFile ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-400 hover:border-primary/50")}>
                        {pendingDrawingFile ? "Blueprint Cached" : "Attach Blueprint"}
                      </label>
                    </div>
                  </div>
                </div>
                <Button disabled={!manualComponentName} className="w-full h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] shadow-xl" onClick={() => setCurrentStep('checklist')}>Initialize Entry Matrix</Button>
              </div>
            </div>
            <div className="lg:col-span-8 flex flex-col">
              <Card className="flex-1 bg-slate-50/50 border border-slate-200 rounded-3xl overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orderReports.map(report => (
                      <Card key={report.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative">
                         <Badge className="absolute top-4 right-4 text-[8px] font-bold uppercase">{report.status}</Badge>
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-50"><FileText className="h-5 w-5" /></div>
                            <div className="flex-1"><p className="text-xs font-bold uppercase truncate">{report.drawingName}</p></div>
                         </div>
                         <div className="mt-6 flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditReport(report)}><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" className="h-8 text-[8px] font-bold uppercase" onClick={() => handleOpenReportForReview(report)}>Preview</Button>
                         </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'checklist' && selectedOrder && (
        <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] flex flex-col min-h-[700px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Dimensional Entry Matrix</h3>
          </div>
          <ScrollArea className="flex-1 border border-slate-100 rounded-3xl">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[9px] font-bold uppercase py-4 px-4 w-[100px]">Balloon No.</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase py-4 px-4 w-[140px]">Instrument</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase text-center w-[100px]">Target (mm)</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase text-center w-[100px]">Tolerance</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase text-center w-[120px]">Actual</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase text-center w-[80px]">Status</TableHead>
                  <TableHead className="text-[9px] font-bold uppercase pl-6">Observations</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dimensions.map((dim, idx) => (
                  <TableRow key={dim.id} className="border-b border-slate-50 h-16 hover:bg-slate-50/30">
                    <TableCell className="px-4"><Input className="h-10 bg-slate-50/50 border-none font-bold text-xs" value={dim.balloonNo} onChange={(e) => handleUpdateDimension(dim.id, 'balloonNo', e.target.value)} /></TableCell>
                    <TableCell className="px-4">
                      <Select value={dim.instrument} onValueChange={(val) => handleUpdateDimension(dim.id, 'instrument', val)}>
                        <SelectTrigger className="h-10 bg-slate-50/50 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl">{INSTRUMENTS.map(inst => <SelectItem key={inst} value={inst} className="text-xs font-bold uppercase">{inst}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input id={`target-${dim.id}`} className="h-10 border-primary/10 text-center font-bold text-xs" value={dim.target} onChange={(e) => handleUpdateDimension(dim.id, 'target', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'target', idx, dim.id)} /></TableCell>
                    <TableCell><Input id={`tolerance-${dim.id}`} className="h-10 border-primary/10 text-center font-bold text-xs" value={dim.tolerance} onChange={(e) => handleUpdateDimension(dim.id, 'tolerance', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'tolerance', idx, dim.id)} /></TableCell>
                    <TableCell><Input id={`actual-${dim.id}`} className={cn("h-10 border-2 text-center font-bold text-sm", dim.status === 'OK' ? "border-emerald-200 text-emerald-700" : dim.status === 'NOT OK' ? "border-red-200 text-red-700" : "border-primary/10")} value={dim.actual} onChange={(e) => handleUpdateDimension(dim.id, 'actual', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'actual', idx, dim.id)} /></TableCell>
                    <TableCell className="text-center"><Badge className={cn("text-[8px] font-bold uppercase", dim.status === 'OK' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{dim.status}</Badge></TableCell>
                    <TableCell className="pl-6"><Input className="h-10 bg-slate-50/50 border-none text-[10px]" value={dim.remark} onChange={(e) => handleUpdateDimension(dim.id, 'remark', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'remark', idx, dim.id)} /></TableCell>
                    <TableCell className="px-2"><Button variant="ghost" size="icon" onClick={() => setDimensions(dimensions.filter(d => d.id !== dim.id))}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="pt-8 flex justify-end gap-4">
             <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold uppercase text-[9px]" onClick={() => setCurrentStep('upload')}>Abort</Button>
             <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-12 font-bold uppercase text-[9px] shadow-xl" onClick={saveReportDraft}>Commit Compliance Draft</Button>
          </div>
        </Card>
      )}

      {(currentStep === 'report' || currentStep === 'review' || currentStep === 'approval') && selectedOrder && (
        <div className="space-y-10 pb-20 max-w-[800px] mx-auto print:max-w-full">
          <Card className="bg-white border border-slate-200 shadow-2xl p-12 space-y-10 print:shadow-none print:border-none print:p-0">
             <div className="flex justify-between items-start border-b-2 border-[#001F3D] pb-10">
                <h1 className="text-3xl font-display font-bold tracking-tighter">FEROCIOUS<span className="text-primary">TECH</span></h1>
                <h2 className="text-4xl font-display font-bold text-[#001F3D] uppercase">Inspection Report</h2>
             </div>
             <div className="prose prose-sm max-w-none">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Compliance Summary</h3>
                <p className="text-sm font-bold uppercase text-[#001F3D]">{manualComponentName} • Order #{selectedOrder.id}</p>
             </div>
             <Table>
                <TableHeader className="bg-slate-50">
                   <TableRow>
                      <TableHead className="text-[8px] font-bold uppercase">Balloon</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-center">Target</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-center">Actual</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-center">Verdict</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {dimensions.map(dim => (
                     <TableRow key={dim.id}>
                        <TableCell className="font-bold text-[10px] py-4">{dim.balloonNo}</TableCell>
                        <TableCell className="text-center font-code text-[10px]">{dim.target}</TableCell>
                        <TableCell className="text-center font-code text-[10px] font-bold text-primary">{dim.actual}</TableCell>
                        <TableCell className="text-center"><Badge className="text-[8px] uppercase">{dim.status}</Badge></TableCell>
                     </TableRow>
                   ))}
                </TableBody>
             </Table>
          </Card>
          <div className="flex justify-center gap-6 print:hidden">
             {currentStep === 'report' && <Button className="h-14 px-12 bg-[#001F3D] text-white rounded-2xl font-bold uppercase text-[10px]" onClick={submitForReview}>Submit for Authorization</Button>}
             {currentStep === 'review' && <Button className="h-14 px-12 bg-emerald-600 text-white rounded-2xl font-bold uppercase text-[10px]" onClick={finalApproval}>Authorize Quality Release</Button>}
          </div>
        </div>
      )}
    </div>
  );
}
