"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Factory, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  Activity, 
  Cpu, 
  User, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Settings2,
  Gauge,
  History,
  Trash2,
  Edit3
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProductionBatch, Order, Machine, SystemUser } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface ProductionPlannerProps {
  batches: ProductionBatch[];
  orders: Order[];
  machines: Machine[];
  users: SystemUser[];
  onSaveBatch: (batch: ProductionBatch) => void;
  onDeleteBatch: (id: string) => void;
}

export function ProductionPlanner({ batches, orders, machines, users, onSaveBatch, onDeleteBatch }: ProductionPlannerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  
  const [formData, setFormData] = useState({
    orderId: '',
    partName: '',
    machineId: '',
    operatorId: '',
    targetQty: 0,
    actualQty: 0,
    scrapQty: 0,
    cycleTimeSec: 0,
    cavities: 1,
    status: 'Setup' as any
  });

  const filteredBatches = useMemo(() => {
    return batches.filter(b => 
      b.partName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [batches, searchTerm]);

  const stats = useMemo(() => {
    const totalTarget = batches.reduce((acc, b) => acc + b.targetQty, 0);
    const totalActual = batches.reduce((acc, b) => acc + b.actualQty, 0);
    const totalScrap = batches.reduce((acc, b) => acc + b.scrapQty, 0);
    const avgEfficiency = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    
    return {
      totalTarget,
      totalActual,
      totalScrap,
      avgEfficiency: avgEfficiency.toFixed(1),
      runningCount: batches.filter(b => b.status === 'Running').length
    };
  }, [batches]);

  const handleEdit = (batch: ProductionBatch) => {
    setEditingBatch(batch);
    setFormData({
      orderId: batch.orderId,
      partName: batch.partName,
      machineId: batch.machineId,
      operatorId: batch.operatorId,
      targetQty: batch.targetQty,
      actualQty: batch.actualQty,
      scrapQty: batch.scrapQty,
      cycleTimeSec: batch.cycleTimeSec,
      cavities: batch.cavities,
      status: batch.status
    });
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!formData.partName || !formData.machineId || !formData.targetQty) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Identity, machine, and target qty are mandatory." });
      return;
    }

    const machine = machines.find(m => m.id === formData.machineId);
    const operator = users.find(u => u.id === formData.operatorId);

    const batch: ProductionBatch = {
      id: editingBatch?.id || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: formData.orderId,
      partName: formData.partName,
      machineId: formData.machineId,
      machineName: machine?.name || 'Unknown Asset',
      operatorId: formData.operatorId,
      operatorName: operator?.name || 'Unassigned',
      targetQty: Number(formData.targetQty),
      actualQty: Number(formData.actualQty),
      scrapQty: Number(formData.scrapQty),
      cycleTimeSec: Number(formData.cycleTimeSec),
      cavities: Number(formData.cavities),
      status: formData.status,
      startTime: editingBatch?.startTime || new Date().toISOString(),
      lastSync: new Date().toISOString()
    };

    onSaveBatch(batch);
    toast({ title: "Batch Synchronized", description: `Production thread ${batch.id} is now ${batch.status}.` });
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingBatch(null);
    setFormData({
      orderId: '',
      partName: '',
      machineId: '',
      operatorId: '',
      targetQty: 0,
      actualQty: 0,
      scrapQty: 0,
      cycleTimeSec: 0,
      cavities: 1,
      status: 'Setup'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <Factory className="h-3.5 w-3.5" />
            High-Volume Production Matrix
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Planning & <span className="text-slate-400 font-medium">Tracking</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Batch lifecycle management and high-fidelity yield telemetry.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button 
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-10 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
            onClick={() => { resetForm(); setIsAddOpen(true); }}
           >
             <Plus className="h-3.5 w-3.5" /> Initialize Batch
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-primary/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Active Production Threads</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-[#001F3D]">{stats.runningCount}</p>
            <Activity className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-emerald-500/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Total MTD Yield</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-emerald-600">{stats.totalActual.toLocaleString()}</p>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-amber-500/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Yield Efficiency Index</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-[#001F3D]">{stats.avgEfficiency}%</p>
            <Gauge className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-red-500/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Scrap Rate Matrix</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-red-600">{stats.totalScrap.toLocaleString()}</p>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="batches" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-6 h-12 inline-flex border border-slate-200 shadow-sm gap-1">
          <TabsTrigger value="batches" className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">Active Batches</TabsTrigger>
          <TabsTrigger value="cycle" className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">Cycle Time Analysis</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">Production Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="m-0 space-y-6">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-[1.5rem]">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Filter matrix..." className="pl-9 h-10 bg-white border-slate-200 text-xs font-bold uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Badge variant="outline" className="bg-white text-[9px] font-bold uppercase tracking-widest h-9 px-4">Live Protocols: {filteredBatches.length}</Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-6">Batch Identity</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Target Part</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Asset / Resource</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Cycle Time</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[180px]">Yield Index</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center">State</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => {
                    const progress = Math.min((batch.actualQty / batch.targetQty) * 100, 100);
                    return (
                      <TableRow key={batch.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group transition-colors">
                        <TableCell className="px-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#001F3D]">{batch.id}</span>
                            <span className="text-[9px] text-slate-400 font-code uppercase">WO_#{batch.orderId || '---'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] font-bold text-slate-700 uppercase">{batch.partName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary"><Cpu className="h-4 w-4" /></div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-700 uppercase">{batch.machineName}</span>
                              <span className="text-[9px] text-slate-400 font-medium">Ops: {batch.operatorName}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold font-code text-primary">{batch.cycleTimeSec}s</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{batch.cavities} Cavities</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold text-[#001F3D]">{batch.actualQty} / {batch.targetQty} <span className="text-slate-400 ml-1">Units</span></span>
                              <span className="text-[9px] font-bold text-red-500">Scrap: {batch.scrapQty}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <Progress value={progress} className="h-full rounded-full transition-all duration-1000" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn(
                            "text-[9px] font-bold uppercase px-3 py-1 rounded-full",
                            batch.status === 'Running' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            batch.status === 'Setup' ? "bg-blue-50 text-blue-700 border-blue-100" :
                            batch.status === 'Completed' ? "bg-slate-100 text-slate-400 border-slate-200" :
                            "bg-red-50 text-red-700 border-red-100"
                          )}>
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary" onClick={() => handleEdit(batch)}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => onDeleteBatch(batch.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredBatches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30 py-10">
                          <div className="p-8 bg-slate-50 rounded-[2rem] mb-6">
                            <Gauge className="h-16 w-16 text-slate-300" />
                          </div>
                          <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Planning Matrix Offline</p>
                          <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto font-medium">No production threads detected. Initialize a batch protocol to begin yield tracking.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cycle" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-[1.5rem] text-center opacity-40">
            <Gauge className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#001F3D]">Cycle Time Optimization Matrix</p>
            <p className="text-[10px] text-slate-400 mt-2">AI Analyzing historical OEE and theoretical throughput...</p>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-[1.5rem] text-center opacity-40">
            <History className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#001F3D]">Historical Production Ledger</p>
            <p className="text-[10px] text-slate-400 mt-2">Immutable audit trail of completed production lots.</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-8 overflow-y-auto hide-scrollbar flex-1">
            <DialogHeader className="mb-8 flex flex-row justify-between items-start">
              <div>
                <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                  <Settings2 className="h-4 w-4" />
                  Production Protocol Setup
                </div>
                <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">
                  {editingBatch ? 'Modify Protocol' : 'Initialize Batch'}
                </DialogTitle>
              </div>
              <Badge className="bg-slate-100 text-slate-400 border-none font-code text-[10px] px-4 py-1.5 h-fit uppercase">{formData.status}</Badge>
            </DialogHeader>

            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Work Order Link</Label>
                  <Select value={formData.orderId} onValueChange={(val) => setFormData({...formData, orderId: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner">
                      <SelectValue placeholder="Select master order..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      {orders.map(o => (
                        <SelectItem key={o.id} value={o.id} className="text-xs font-bold uppercase">WO #{o.id} - {o.customer}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Part / Item Identity</Label>
                  <Input 
                    placeholder="e.g. Injection Mold Component X" 
                    className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner"
                    value={formData.partName}
                    onChange={(e) => setFormData({...formData, partName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Asset Node (Machine)</Label>
                  <Select value={formData.machineId} onValueChange={(val) => setFormData({...formData, machineId: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner">
                      <SelectValue placeholder="Identify asset..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      {machines.map(m => (
                        <SelectItem key={m.id} value={m.id} className="text-xs font-bold uppercase">{m.name} ({m.mcNumber})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Command Lead (Operator)</Label>
                  <Select value={formData.operatorId} onValueChange={(val) => setFormData({...formData, operatorId: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner">
                      <SelectValue placeholder="Assign operator..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id} className="text-xs font-bold uppercase">{u.name} ({u.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Target Yield</Label>
                  <Input 
                    type="number"
                    className="h-12 bg-slate-50 border-none rounded-xl text-lg font-display font-bold text-[#001F3D] shadow-inner"
                    value={formData.targetQty}
                    onChange={(e) => setFormData({...formData, targetQty: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Actual Yield</Label>
                  <Input 
                    type="number"
                    className="h-12 bg-emerald-50/50 border-none rounded-xl text-lg font-display font-bold text-emerald-700 shadow-inner"
                    value={formData.actualQty}
                    onChange={(e) => setFormData({...formData, actualQty: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Rejected (Scrap)</Label>
                  <Input 
                    type="number"
                    className="h-12 bg-red-50/50 border-none rounded-xl text-lg font-display font-bold text-red-700 shadow-inner"
                    value={formData.scrapQty}
                    onChange={(e) => setFormData({...formData, scrapQty: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Cycle Time (Sec)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold pl-10 shadow-inner"
                      value={formData.cycleTimeSec}
                      onChange={(e) => setFormData({...formData, cycleTimeSec: Number(e.target.value)})}
                    />
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Cavity Count</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold pl-10 shadow-inner"
                      value={formData.cavities}
                      onChange={(e) => setFormData({...formData, cavities: Number(e.target.value)})}
                    />
                    <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Operational State</Label>
                  <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      <SelectItem value="Setup" className="text-xs font-bold uppercase">Setup / Ready</SelectItem>
                      <SelectItem value="Running" className="text-xs font-bold uppercase text-emerald-600">Production Active</SelectItem>
                      <SelectItem value="Paused" className="text-xs font-bold uppercase text-amber-600">Hold / Internal</SelectItem>
                      <SelectItem value="Completed" className="text-xs font-bold uppercase text-slate-400">Run Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Sync: Nominal</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsAddOpen(false)}>Abort</Button>
              <Button className="h-11 px-10 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl flex gap-3 group" onClick={handleSave}>
                {editingBatch ? 'Update Protocol' : 'Commit to Matrix'}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
