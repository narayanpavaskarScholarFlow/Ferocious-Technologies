"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  CheckCircle2, 
  Printer, 
  ChevronRight, 
  ArrowLeft,
  Check,
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
  ArchiveX,
  Edit2,
  Upload,
  Image as ImageIcon,
  Maximize2,
  X,
  Calendar
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
import { Order, RoutingOperation, SystemUser, Vendor, QualityReport, DimensionRecord, PermissionLevel } from '@/lib/types';
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

interface QualityManagementProps {
  orders: Order[];
  users?: SystemUser[];
  vendors?: Vendor[];
  onUpdateStatus?: (orderId: string, operation: string, status: string) => void;
  permissions?: Record<string, PermissionLevel>;
}

export function QualityManagement({ orders, users = [], vendors = [], onUpdateStatus, permissions }: QualityManagementProps) {
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

  // Global Reports Listener
  const allReportsQuery = useMemoFirebase(() => collection(db, 'quality_reports'), [db]);
  const { data: allReportsData } = useCollection<QualityReport>(allReportsQuery);
  const allReports = allReportsData || [];

  const reviewPendingReports = useMemo(() => {
    return allReports.filter(r => r.status === 'Review Pending');
  }, [allReports]);

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
    const pendingCount = qcEntries.filter(e => 
      ['Yet to start', 'WIP', 'Pending'].includes(e.operation.status || '')
    ).length;
    const inReviewCount = reviewPendingReports.length;
    return [
      { name: 'Pending Pipeline', count: pendingCount, color: '#f59e0b' },
      { name: 'Compliance Review', count: inReviewCount, color: '#ef4444' },
    ];
  }, [qcEntries, reviewPendingReports]);

  // Logic to check if all components are released for a specific order's QC operation
  const isQCReadyForCompletion = (order: Order, op: RoutingOperation, newlyReleasedReportId?: string) => {
    const orderReports = allReports.filter(r => r.workOrderId === order.id);
    const subTasks = op.subTasks || [];
    
    // If no components (sub-tasks) are defined in QC routing, we allow manual completion as fallback
    if (subTasks.length === 0) return true;

    // Check if every component defined in the QC sub-tasks has a corresponding released report
    return subTasks.every(st => {
      const report = orderReports.find(r => r.drawingName === st.name);
      const isReleased = (report && report.status === 'Released') || (report && report.id === newlyReleasedReportId);
      return isReleased;
    });
  };

  const handleStatusUpdate = (order: Order, opId: string, newStatus: string) => {
    const updatedRouting = order.routing?.map(op => 
      op.id === opId ? { ...op, status: newStatus } : op
    ) || [];

    setDocumentNonBlocking(doc(db, 'orders', order.id), {
      routing: updatedRouting,
    }, { merge: true });

    toast({
      title: "Status Synchronized",
      description: `QC status for Order #${order.id} updated to ${newStatus}.`
    });
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
    toast({
      title: "Report Deleted",
      description: "The inspection record has been purged from the archive.",
      variant: "destructive"
    });
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
    const nextSeq = dimensions.length + 1;
    const balloonNo = `BL-${nextSeq.toString().padStart(2, '0')}`;
    const newDim: DimensionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      balloonNo: balloonNo,
      typeOfDim: 'Normal Dim',
      instrument: 'Vernier',
      target: '',
      tolerance: '±',
      upperLimit: '0.000',
      lowerLimit: '0.000',
      actual: '',
      status: 'Pending',
      remark: ''
    };
    setDimensions(prev => [...prev, newDim]);
    return newDim.id;
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string, idx: number, dimId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      let nextField = '';
      let nextId = dimId;

      if (field === 'target') {
        nextField = 'tolerance';
      } else if (field === 'tolerance') {
        nextField = 'actual';
      } else if (field === 'actual') {
        nextField = 'remark';
      } else if (field === 'remark') {
        nextField = 'target';
        const isLast = idx === dimensions.length - 1;
        if (isLast) {
          const newId = handleAddDimension();
          nextId = newId;
        } else {
          nextId = dimensions[idx + 1].id;
        }
      }

      if (nextField) {
        setTimeout(() => {
          const el = document.getElementById(`${nextField}-${nextId}`);
          el?.focus();
        }, 50);
      }
    }
  };

  const handleDrawingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingDrawingFile(reader.result as string);
        toast({ title: "Drawing Matrix Cached", description: "Blueprints initialized for protocol embed." });
      };
      reader.readAsDataURL(file);
    }
  };

  const commitReportToLedger = (drawingFile?: string) => {
    if (!selectedOrder || !manualComponentName) return;
    
    const reportId = activeReportId || `QR-${Date.now()}`;
    const report: QualityReport = {
      id: reportId,
      workOrderId: selectedOrder.id,
      drawingId: 'manual',
      drawingName: manualComponentName,
      drawingFile: drawingFile || pendingDrawingFile,
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
    setIsDrawingDialogOpen(false);
  };

  const saveReportDraft = () => {
    if (!selectedOrder || !manualComponentName) {
      toast({ variant: "destructive", title: "Identity Required", description: "Please enter a component name for manual entry." });
      return;
    }
    if (!pendingDrawingFile) {
      setIsDrawingDialogOpen(true);
    } else {
      commitReportToLedger();
    }
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
    
    // 1. Finalize the individual component report
    updateDocumentNonBlocking(doc(db, 'quality_reports', activeReportId), {
      status: 'Released',
      releasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 2. Automated status logic: If all components released, set QC status to Completed
    if (selectedOrder && selectedOp) {
      if (isQCReadyForCompletion(selectedOrder, selectedOp, activeReportId)) {
        handleStatusUpdate(selectedOrder, selectedOp.id, 'Completed');
        toast({
          title: "QC Protocol Completed",
          description: `All components for Order #${selectedOrder.id} released. Master status updated to Completed.`
        });
      } else {
        toast({
          title: "Component Released",
          description: "Individual compliance report verified and released."
        });
      }
    }

    setCurrentStep('upload'); 
    setActiveReportId(null);
  };

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.focus();
      window.print();
    }
  }, []);

  const hasFailures = useMemo(() => dimensions.some(d => d.status === 'NOT OK'), [dimensions]);

  const getStatusStyles = (status?: string) => {
    if (status === 'Completed') return "text-green-600 bg-green-50 border-green-200";
    if (status === 'WIP') return "text-blue-600 bg-blue-50 border-blue-200";
    if (status === 'Hold') return "text-red-600 bg-red-50 border-red-200";
    if (status === 'Pending') return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-slate-400 bg-slate-100 border-slate-200";
  };

  const canDeleteReport = permissions?.['quality-report-delete'] === 'edit' || permissions?.['quality-report-delete'] === 'full';
  const hasReviewTabAccess = permissions?.['quality-review'] !== 'none';

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
            {currentStep === 'upload' && 'Technical Matrix Registry'}
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
              {hasReviewTabAccess && (
                <TabsTrigger value="review" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all relative">
                  <Unlock className="h-3.5 w-3.5 mr-2" /> Final Compliance Review
                  {reviewPendingReports.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                      {reviewPendingReports.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
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
                      <TableHead className="font-bold text-[10px] uppercase text-center w-32">Start Date</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-center w-32">End Date</TableHead>
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
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary"><User className="h-4 w-4" /></div>
                            <span className="text-[11px] font-bold text-slate-700 uppercase">{getResourceName(operation)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-code text-[10px] font-bold text-slate-500">
                          {operation.startDate}
                        </TableCell>
                        <TableCell className="text-center font-code text-[10px] font-bold text-slate-500">
                          {operation.endDate}
                        </TableCell>
                        <TableCell className="text-center">
                          <Select 
                            value={operation.status || 'Pending'} 
                            onValueChange={(val) => handleStatusUpdate(order, operation.id, val)}
                          >
                            <SelectTrigger className={cn(
                              "h-9 border-none rounded-full text-[10px] font-bold uppercase w-full max-w-[160px] mx-auto",
                              getStatusStyles(operation.status || 'Pending')
                            )}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                              {STATUS_OPTIONS.map(opt => {
                                const isCompletedOption = opt === 'Completed';
                                const isReady = isQCReadyForCompletion(order, operation);
                                const isDisabled = isCompletedOption && !isReady;
                                
                                return (
                                  <SelectItem 
                                    key={opt} 
                                    value={opt} 
                                    disabled={isDisabled}
                                    className="text-[10px] font-bold uppercase"
                                  >
                                    {opt} {isDisabled && "(Reports Pending)"}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
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

            {hasReviewTabAccess && (
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
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400">Manual Identity</TableHead>
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
            )}
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
                <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Manual Audit Protocol</h3>
                <p className="text-xs text-slate-500">Technical Matrix Registry for Order #{selectedOrder.id}.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative z-10">
            <div className="lg:col-span-4 space-y-8 flex flex-col min-h-0">
              <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg text-white shadow-lg shadow-primary/20"><Plus className="h-4 w-4" /></div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Protocol Entry</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Component Identification</Label>
                    <Select 
                      value={manualComponentName} 
                      onValueChange={setManualComponentName}
                    >
                      <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase">
                        <SelectValue placeholder="Identify component..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                        {qcSubTasks.length > 0 ? (
                          qcSubTasks.map(st => (
                            <SelectItem key={st.id} value={st.name} className="text-xs font-bold uppercase">{st.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled className="text-[10px] font-bold uppercase">No Routing Sub-tasks</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-widest ml-1">Manual Override</Label>
                      <Input 
                        placeholder="Or enter name manually..." 
                        className="h-10 bg-white border-slate-200 rounded-xl text-xs font-bold mt-1"
                        value={manualComponentName}
                        onChange={(e) => setManualComponentName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <ImageIcon className="h-3.5 w-3.5 text-primary" /> Technical Blueprint
                    </Label>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="initial-drawing-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleDrawingUpload}
                      />
                      <label 
                        htmlFor="initial-drawing-upload"
                        className={cn(
                          "h-24 w-full flex flex-col items-center justify-center gap-2 px-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all border-2 border-dashed",
                          pendingDrawingFile ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-400 hover:border-primary/50"
                        )}
                      >
                        {pendingDrawingFile ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Drawing Matrix Cached
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5" />
                            Attach Blueprint Matrix
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <Button 
                  disabled={!manualComponentName}
                  className="w-full h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl flex gap-3"
                  onClick={() => setCurrentStep('checklist')}
                >
                  Initialize Manual Matrix <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col min-h-0">
              <Card className="flex-1 bg-slate-50/50 border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-inner">
                <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3"><FileBadge className="h-5 w-5 text-[#001F3D]" /><h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-[0.1em]">Compliance Reports Ledger</h3></div>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[9px] font-bold px-3">WO_#{selectedOrder.id}</Badge>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orderReports.map((report) => (
                      <Card key={report.id} className="bg-white border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2"><Badge className={cn("text-[8px] font-bold uppercase", report.status === 'Released' ? "bg-emerald-50 text-white" : "bg-blue-500 text-white")}>{report.status}</Badge></div>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-slate-50 text-[#001F3D]"><FileText className="h-6 w-6" /></div>
                            <div className="min-w-0 flex-1"><p className="text-11px font-bold text-[#001F3D] uppercase truncate">{report.drawingName}</p><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{report.id}</p></div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge className={cn("text-[8px] font-bold uppercase px-3 py-1 rounded-full", report.verdict === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>{report.verdict === 'Pass' ? 'OK' : 'NOT OK'}</Badge>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary" onClick={() => handleEditReport(report)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {canDeleteReport && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => handleDeleteReport(report.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="h-8 rounded-lg text-[8px] font-bold uppercase tracking-widest bg-[#001F3D] hover:bg-black text-white border-none" onClick={() => { handleOpenReportForReview(report); }}>
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {orderReports.length === 0 && (
                      <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-30 text-center">
                        <ArchiveX className="h-12 w-12 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">No Manual Protocols Logged</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'checklist' && selectedOrder && (
        <div className="animate-in fade-in duration-700 px-2">
          <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden min-h-[700px]">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><ClipboardCheck className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Dimensional Matrix Entry</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Manual protocol: {manualComponentName}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-slate-200 text-slate-400 font-code text-[10px] px-4 py-1.5 rounded-full uppercase">Matrix_Entry_Active</Badge>
            </div>

            <Tabs defaultValue="customer" className="w-full flex flex-col flex-1 overflow-hidden">
              <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200 w-fit shrink-0">
                <TabsTrigger value="customer" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm transition-all">Dimension Ledger</TabsTrigger>
                <TabsTrigger value="internal" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm transition-all">Verification Nodes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="m-0 flex-1 overflow-hidden flex flex-col">
                <div className="space-y-6 mb-8 shrink-0">
                  {/* Integrated Blueprint Display */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <h4 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest">Technical Blueprint Attachment</h4>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          id="matrix-drawing-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleDrawingUpload}
                        />
                        <Button variant="ghost" asChild className="h-8 px-4 rounded-xl font-bold uppercase text-[9px] tracking-widest text-primary hover:bg-primary/5">
                          <label htmlFor="matrix-drawing-upload" className="cursor-pointer flex items-center gap-2">
                            <Upload className="h-3.5 w-3.5" /> Replace Drawing
                          </label>
                        </Button>
                      </div>
                    </div>
                    {pendingDrawingFile ? (
                      <div 
                        className="relative w-full h-48 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-inner group cursor-zoom-in"
                        onClick={() => setIsZoomDialogOpen(true)}
                      >
                        <img src={pendingDrawingFile} alt="Technical Blueprint" className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-[#001F3D]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="bg-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
                            <Maximize2 className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-900">Click to Fit Screen</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 text-slate-400 gap-2">
                        <ImageIcon className="h-8 w-8 opacity-20" />
                        <p className="text-[9px] font-bold uppercase tracking-widest">No Technical Drawing Attached</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Balloon Measurement Registry</h3>
                    <Button variant="ghost" onClick={handleAddDimension} className="text-[9px] uppercase font-bold gap-2 text-primary hover:bg-primary/5 h-8 px-4 rounded-xl">
                      <Plus className="h-3.5 w-3.5" /> Append Measurement Row
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="text-[9px] font-bold uppercase text-slate-400 py-4 px-4 w-[100px]">Balloon No.</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-slate-400 py-4 px-4 w-[140px]">Type of Dim</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-slate-400 py-4 px-4 w-[140px]">Instrument</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-center w-[100px]">Target (mm)</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-center w-[100px]">Tolerance</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-center w-[140px]">Limits</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-center w-[120px]">Actual Measured</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-center w-[80px]">Status</TableHead>
                        <TableHead className="text-[9px] font-bold uppercase text-left pl-6">Observations</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dimensions.map((dim, idx) => (
                        <TableRow key={dim.id} className="border-b border-slate-50 h-16 hover:bg-slate-50/30 transition-colors">
                          <TableCell className="px-4">
                            <Input 
                              id={`balloon-${dim.id}`}
                              className="h-10 bg-slate-50/50 border-none font-bold text-xs rounded-xl text-center" 
                              placeholder="e.g. BL-01" 
                              value={dim.balloonNo} 
                              onChange={(e) => handleUpdateDimension(dim.id, 'balloonNo', e.target.value)} 
                            />
                          </TableCell>
                          <TableCell className="px-4">
                            <Select 
                              value={dim.typeOfDim} 
                              onValueChange={(val) => handleUpdateDimension(dim.id, 'typeOfDim', val)}
                            >
                              <SelectTrigger className="h-10 bg-slate-50/50 border-none font-bold text-xs rounded-xl focus:ring-primary/20">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                <SelectItem value="Normal Dim" className="text-xs font-bold uppercase">Normal Dim</SelectItem>
                                <SelectItem value="Angle Dim" className="text-xs font-bold uppercase">Angle Dim</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4">
                            <Select 
                              value={dim.instrument} 
                              onValueChange={(val) => handleUpdateDimension(dim.id, 'instrument', val)}
                            >
                              <SelectTrigger className="h-10 bg-slate-50/50 border-none font-bold text-xs rounded-xl focus:ring-primary/20">
                                <SelectValue placeholder="Instrument" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                {INSTRUMENTS.map(inst => (
                                  <SelectItem key={inst} value={inst} className="text-xs font-bold uppercase">{inst}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              id={`target-${dim.id}`}
                              className="h-10 bg-white border-2 border-primary/10 font-code font-bold text-xs text-center rounded-xl" 
                              value={dim.target} 
                              onChange={(e) => handleUpdateDimension(dim.id, 'target', e.target.value)} 
                              onKeyDown={(e) => handleKeyDown(e, 'target', idx, dim.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              id={`tolerance-${dim.id}`}
                              className="h-10 bg-white border-2 border-primary/10 font-code font-bold text-xs text-center rounded-xl" 
                              value={dim.tolerance} 
                              onChange={(e) => handleUpdateDimension(dim.id, 'tolerance', e.target.value)} 
                              onKeyDown={(e) => handleKeyDown(e, 'tolerance', idx, dim.id)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] font-code font-bold text-slate-600">{dim.upperLimit} / {dim.lowerLimit}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Limits</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input 
                              id={`actual-${dim.id}`}
                              className={cn("h-10 bg-white border-2 font-code font-bold text-sm text-center rounded-xl shadow-inner transition-all", dim.status === 'OK' ? "border-emerald-200 text-emerald-700" : dim.status === 'NOT OK' ? "border-red-200 text-red-700" : "border-primary/10")} 
                              value={dim.actual} 
                              onChange={(e) => handleUpdateDimension(dim.id, 'actual', e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, 'actual', idx, dim.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Badge className={cn("text-[8px] font-bold uppercase w-16 justify-center rounded-full border shadow-sm", dim.status === 'OK' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : dim.status === 'NOT OK' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                                {dim.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="pl-6">
                            <Input 
                              id={`remark-${dim.id}`}
                              placeholder="Notes..." 
                              className="h-10 bg-slate-50/50 border-none text-[10px] rounded-xl font-medium" 
                              value={dim.remark} 
                              onChange={(e) => handleUpdateDimension(dim.id, 'remark', e.target.value)} 
                              onKeyDown={(e) => handleKeyDown(e, 'remark', idx, dim.id)}
                            />
                          </TableCell>
                          <TableCell className="px-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => setDimensions(dimensions.filter(d => d.id !== dim.id))}>
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
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                    {MACHINING_OPS.map((op) => (
                      <div key={op} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-6 transition-all hover:border-primary/20 group">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{op}</span>
                        <div className="flex gap-1.5">
                          {['OK', 'NOT OK', 'NA'].map((st) => (
                            <Button key={st} size="sm" variant="outline" className={cn("rounded-lg h-8 px-3 font-bold text-[9px] uppercase tracking-widest transition-all border-b-2", checks[op] === st ? (st === 'OK' ? "bg-green-50 border-green-500 text-green-700" : st === 'NOT OK' ? "bg-red-50 border-red-500 text-red-700" : "bg-slate-100 border-slate-400 text-slate-700") : "bg-white text-slate-400 border-slate-100")} onClick={() => setChecks(prev => ({ ...prev, [op]: st as any }))}>
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
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">Shortcut: Hit ENTER to move to next field (Target &rarr; Tolerance &rarr; Actual &rarr; Remark &rarr; Next Target)</p>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" className="h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] text-slate-400 px-8" onClick={() => setCurrentStep('upload')}>Abort Entry</Button>
                <Button className="h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] shadow-2xl flex gap-3 px-12" onClick={saveReportDraft}>
                  Generate Compliance Draft <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {(currentStep === 'report' || currentStep === 'review' || currentStep === 'approval') && selectedOrder && (
        <div className="space-y-10 pb-20 max-w-[800px] mx-auto animate-in zoom-in-95 duration-500 px-2 print:max-w-full print:p-0 print:m-0 print:block print:w-full">
          <div className="flex justify-between items-center px-4 print:hidden">
            <Button variant="ghost" onClick={() => setCurrentStep('checklist')} className="rounded-xl gap-3 h-12 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Edit Matrix
            </Button>
            <div className="flex gap-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={handlePrint} 
                className="rounded-xl gap-3 h-12 px-8 font-bold uppercase text-[10px] tracking-widest border-slate-200 shadow-sm"
              >
                <Printer className="h-4 w-4" /> Print Matrix
              </Button>
            </div>
          </div>
          <Card className={cn("bg-white border border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] p-12 space-y-10 transition-all duration-700 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:block", (currentStep === 'review' || currentStep === 'approval') && hasFailures ? "ring-8 ring-red-500/10 border-red-200" : "")}>
            <div className="flex justify-between items-start border-b-2 border-[#001F3D] pb-10 print:pb-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#001F3D] rounded-2xl shadow-xl shadow-primary/20"><ShieldCheck className="h-10 w-10 text-white" /></div>
                  <div>
                    <h1 className="text-3xl font-display font-bold tracking-tighter">BHARAT<span className="text-primary">AXIS</span></h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Precision Engineering & QC Hub</p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-3">
                <h2 className="text-4xl font-display font-bold text-[#001F3D] tracking-tighter uppercase">Inspection Sheet</h2>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn("border-none text-[9px] font-bold px-5 py-1.5 rounded-full", hasFailures ? "bg-red-600 text-white" : "bg-primary text-white")}>
                    {hasFailures ? 'DEVIATION_ALERT' : 'CERTIFIED_LEDGER'}
                  </Badge>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol ID: {manualComponentName}</p>
                </div>
              </div>
            </div>

            {/* Integrated Blueprint Display in Final Report */}
            {activePreviewReport?.drawingFile && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Technical Blueprint Identification</h3>
                <div className="relative w-full border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 min-h-[200px] max-h-[400px]">
                  <img 
                    src={activePreviewReport.drawingFile} 
                    alt="Technical Blueprint" 
                    className="max-w-full max-h-[380px] object-contain shadow-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-8">
              <h3 className="text-xs font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Manual Compliance Matrix</h3>
              <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                <Table className="border-collapse w-full">
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                      <TableHead className="text-[8px] font-bold uppercase border-r border-slate-200 text-[#001F3D] w-[10%]">Balloon No.</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase border-r border-slate-200 text-[#001F3D] w-[12%]">Type of Dim</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase border-r border-slate-200 text-[#001F3D] w-[12%]">Instrument</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-center border-r border-slate-200 text-[#001F3D] w-[10%]">Target (mm)</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-center border-r border-slate-200 text-[#001F3D] w-[12%]">Limits</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-center border-r border-slate-200 text-primary w-[10%]">Actual</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-center border-r border-slate-200 text-[#001F3D] w-[10%]">Verdict</TableHead>
                      <TableHead className="text-[8px] font-bold uppercase text-left pl-4 text-[#001F3D]">Observations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dimensions.map((dim) => (
                      <TableRow key={dim.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="font-bold text-[10px] border-r border-slate-100 text-slate-700 uppercase py-4">{dim.balloonNo}</TableCell>
                        <TableCell className="font-bold text-[10px] border-r border-slate-100 text-slate-700 uppercase py-4">{dim.typeOfDim}</TableCell>
                        <TableCell className="font-bold text-[9px] border-r border-slate-100 text-slate-500 uppercase py-4">{dim.instrument}</TableCell>
                        <TableCell className="text-center font-code text-[10px] border-r border-slate-100 text-slate-900">{dim.target || '0.000'}</TableCell>
                        <TableCell className="text-center font-code text-[9px] border-r border-slate-100 text-slate-500">{dim.upperLimit}/{dim.lowerLimit}</TableCell>
                        <TableCell className="text-center font-code text-[10px] font-bold border-r border-slate-100 text-primary">{dim.actual || '---'}</TableCell>
                        <TableCell className="text-center border-r border-slate-100">
                          <Badge className={cn("text-[7px] font-bold uppercase w-14 justify-center rounded-full", dim.status === 'OK' ? "bg-emerald-50 text-emerald-700" : dim.status === 'NOT OK' ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-400")}>
                            {dim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pl-4 text-[9px] font-medium text-slate-500 uppercase italic truncate max-w-[150px]">{dim.remark || '---'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-40 pt-16 print:pt-10">
              <div className="space-y-8 text-center">
                <div className="h-[1px] bg-slate-300 w-full" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auditor Name</p>
              </div>
              <div className="space-y-8 text-center">
                <div className="h-[1px] bg-slate-300 w-full" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Final Approved by</p>
              </div>
            </div>
          </Card>
          <div className="flex justify-center pt-10 print:hidden gap-6">
            <Button variant="ghost" className="rounded-2xl h-16 px-10 font-bold uppercase text-slate-400" onClick={() => setCurrentStep('upload')}>Return to Hub</Button>
            {currentStep === 'report' ? (
              <Button className="rounded-2xl bg-[#001F3D] hover:bg-black text-white h-16 px-16 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl" onClick={submitForReview}>Transmit for Compliance Review</Button>
            ) : currentStep === 'review' ? (
              <Button className={cn("rounded-2xl h-16 px-16 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl", hasFailures ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700")} onClick={finalApproval}>
                {hasFailures ? 'Force Release with Deviations' : 'Authorize Quality Release'}
              </Button>
            ) : (
              <Button className="rounded-2xl bg-[#001F3D] hover:bg-black text-white h-16 px-16 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl" onClick={() => setCurrentStep('upload')}>Close Review</Button>
            )}
          </div>
        </div>
      )}

      {/* Drawing Attachment Protocol Dialog (Fallback) */}
      <Dialog open={isDrawingDialogOpen} onOpenChange={setIsDrawingDialogOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Finalization Protocol</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Would you like to attach a drawing blueprint to the compliance report?</DialogDescription>
          </DialogHeader>

          <div className="space-y-10">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-primary" /> Technical Blueprint (Optional)
              </Label>
              <div className="relative">
                <input 
                  type="file" 
                  id="final-drawing-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleDrawingUpload}
                />
                <label 
                  htmlFor="final-drawing-upload"
                  className={cn(
                    "h-24 w-full flex flex-col items-center justify-center gap-3 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all border-2 border-dashed",
                    pendingDrawingFile ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-primary/50"
                  )}
                >
                  {pendingDrawingFile ? (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      Drawing Cached Successfully
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      Attach Drawing Matrix
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => commitReportToLedger()}>Skip & Finalize</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl flex gap-3" onClick={() => commitReportToLedger()}>
                Commit & Preview <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* High-Fidelity Fullscreen Fit-to-Screen Viewer */}
      <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
        <DialogContent className="max-w-full w-screen h-screen m-0 rounded-none bg-slate-950 border-none shadow-none p-0 overflow-hidden flex flex-col transition-all duration-500">
          <div className="relative w-full h-full flex flex-col">
            <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0 z-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-lg text-primary shadow-lg shadow-primary/10"><Maximize2 className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">Full-Scale Matrix Viewer</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Protocol Identification: {manualComponentName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsZoomDialogOpen(false)} className="h-12 w-12 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <X className="h-7 w-7" />
              </Button>
            </div>
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden group">
              {pendingDrawingFile && (
                <img 
                  src={pendingDrawingFile} 
                  alt="Fit-to-Screen Technical Blueprint" 
                  className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-700"
                />
              )}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-opacity">
                Matrix fit to screen protocol active
              </div>
            </div>
            <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10 text-center shrink-0">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] animate-pulse">Proprietary Matrix Data • Bharat Axis Pvt Ltd • Plant Control v2.4</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}