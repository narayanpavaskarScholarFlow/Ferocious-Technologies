
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Box, 
  Building2, 
  Ruler, 
  Factory, 
  DollarSign, 
  Target, 
  Truck, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Check,
  TrendingUp,
  Settings2,
  ImageIcon,
  ChevronLeft,
  Trash2,
  ShieldAlert,
  Info,
  Upload,
  Cpu,
  Monitor,
  Hammer,
  ClipboardCheck,
  FileText,
  Zap,
  AlertCircle,
  Award
} from 'lucide-react';
import Image from 'next/image';
import { ProductMaster, Vendor, Machine, SystemUser, PermissionLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const ONBOARDING_STEPS = [
  { id: 1, label: 'Business Unit', icon: Building2, desc: 'Identify Entity' },
  { id: 2, label: 'Product Info', icon: Box, desc: 'Classify Output' },
  { id: 3, label: 'Engineering', icon: Ruler, desc: 'Technical Specs' },
  { id: 4, label: 'Manufacturing', icon: Factory, desc: 'Process Timing' },
  { id: 5, label: 'Commercial', icon: DollarSign, desc: 'Cost & Price' },
  { id: 6, label: 'Market', icon: TrendingUp, desc: 'Intelligence' },
  { id: 7, label: 'Outsourcing', icon: Target, desc: 'Strategy' },
  { id: 8, label: 'Partners', icon: Truck, desc: 'Vendor Link' },
  { id: 9, label: 'BOM', icon: Layers, desc: 'Bill of Materials' },
  { id: 10, label: 'Review', icon: ShieldCheck, desc: 'Final Commit' },
];

export function ProductRegistry({ 
  products, 
  vendors, 
  machines, 
  users, 
  onSaveProduct 
}: { 
  products: ProductMaster[], 
  vendors: Vendor[], 
  machines: Machine[], 
  users: SystemUser[],
  onSaveProduct: (p: ProductMaster) => void 
}) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const [formData, setFormData] = useState<Partial<ProductMaster>>({
    id: '',
    code: '',
    name: '',
    description: '',
    hsn: '',
    gstRate: 18,
    uom: 'Nos',
    saleRate: 0,
    purchaseRate: 0,
    status: 'Active',
    businessUnit: 'Manufacturing',
    category: 'Component',
    subCategory: '',
    type: 'Finished Product',
    drawingNumber: '',
    revisionNumber: '00',
    customerPartNumber: '',
    internalPartNumber: '',
    material: '',
    materialGrade: '',
    weight: '',
    tolerance: '',
    surfaceFinish: '',
    application: '',
    industry: '',
    machinesRequired: [],
    cycleTimeSec: 0,
    setupTimeMin: 0,
    inspectionTimeMin: 0,
    assemblyTimeMin: 0,
    materialCost: 0,
    machiningCost: 0,
    toolingCost: 0,
    inspectionCost: 0,
    assemblyCost: 0,
    packagingCost: 0,
    standardCost: 0,
    sellingPrice: 0,
    marketPrice: 0,
    marginPercent: 0,
    annualRequirement: 0,
    targetIndustry: '',
    competitorProducts: '',
    competitorPrice: 0,
    forecastGrowth: '',
    outsourcedPercent: 0,
    annualOutsourcingValue: 0,
    outsourcingReason: [],
    bom: [],
    imageUrls: []
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const handleOpenWizard = () => {
    setFormData({
      id: '',
      code: '',
      name: '',
      description: '',
      hsn: '',
      gstRate: 18,
      uom: 'Nos',
      saleRate: 0,
      purchaseRate: 0,
      status: 'Active',
      businessUnit: 'Manufacturing',
      category: 'Component',
      subCategory: '',
      type: 'Finished Product',
      drawingNumber: '',
      revisionNumber: '00',
      customerPartNumber: '',
      internalPartNumber: '',
      material: '',
      materialGrade: '',
      weight: '',
      tolerance: '',
      surfaceFinish: '',
      application: '',
      industry: '',
      machinesRequired: [],
      cycleTimeSec: 0,
      setupTimeMin: 0,
      inspectionTimeMin: 0,
      assemblyTimeMin: 0,
      materialCost: 0,
      machiningCost: 0,
      toolingCost: 0,
      inspectionCost: 0,
      assemblyCost: 0,
      packagingCost: 0,
      standardCost: 0,
      sellingPrice: 0,
      marketPrice: 0,
      marginPercent: 0,
      annualRequirement: 0,
      targetIndustry: '',
      competitorProducts: '',
      competitorPrice: 0,
      forecastGrowth: '',
      outsourcedPercent: 0,
      annualOutsourcingValue: 0,
      outsourcingReason: [],
      bom: [],
      imageUrls: []
    });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleUpdateField = (field: keyof ProductMaster, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (['materialCost', 'machiningCost', 'toolingCost', 'inspectionCost', 'assemblyCost', 'packagingCost'].includes(field as string)) {
        updated.standardCost = 
          (Number(updated.materialCost) || 0) + 
          (Number(updated.machiningCost) || 0) + 
          (Number(updated.toolingCost) || 0) + 
          (Number(updated.inspectionCost) || 0) + 
          (Number(updated.assemblyCost) || 0) + 
          (Number(updated.packagingCost) || 0);
        
        if (updated.sellingPrice && updated.sellingPrice > 0) {
          updated.marginPercent = Math.round(((updated.sellingPrice - (updated.standardCost || 0)) / updated.sellingPrice) * 100);
        }
      }

      if (field === 'sellingPrice' && updated.standardCost) {
        updated.marginPercent = Math.round(((Number(value) - (updated.standardCost || 0)) / Number(value)) * 100);
      }

      return updated;
    });
  };

  const handleFinishWizard = () => {
    if (!formData.name || !formData.code) {
      toast({ variant: "destructive", title: "Protocol Refused", description: "Product Name and Code are mandatory." });
      return;
    }
    const finalProduct = {
      ...formData,
      id: formData.id || `PROD-${Date.now()}`,
      updatedAt: new Date().toISOString()
    } as ProductMaster;

    onSaveProduct(finalProduct);
    toast({ title: "Product Ledger Synchronized", description: `${formData.name} committed to matrix.` });
    setIsWizardOpen(false);
  };

  const handleAddBOMItem = () => {
    const newItem = { id: `BOM-${Date.now()}`, componentId: '', name: '', qty: 1, cost: 0, type: 'Purchased' as any };
    handleUpdateField('bom', [...(formData.bom || []), newItem]);
  };

  const handleRemoveBOMItem = (id: string) => {
    handleUpdateField('bom', (formData.bom || []).filter(i => i.id !== id));
  };

  const renderStepContent = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] ml-2 text-center block">Step 01: Identification Matrix</Label>
            <RadioGroup value={formData.businessUnit ?? 'Manufacturing'} onValueChange={(v: any) => handleUpdateField('businessUnit', v)} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { id: 'Manufacturing', label: 'Ferocious Technologies', desc: 'Precision VMC & Tool Room', icon: Factory },
                { id: 'Electricals', label: 'Ferocious Electricals', desc: 'Conduits & Switchgear', icon: Zap }
              ].map(bu => {
                const Icon = bu.icon;
                return (
                  <Label key={bu.id} className={cn("p-12 rounded-[3.5rem] border-2 transition-all cursor-pointer flex flex-col items-center gap-6 text-center group", formData.businessUnit === bu.id ? "border-[#001F3D] bg-blue-50/30 ring-8 ring-blue-50/50 shadow-2xl scale-[1.02]" : "border-slate-100 bg-white hover:border-[#001F3D]/20")}>
                    <RadioGroupItem value={bu.id} className="sr-only" />
                    <div className={cn("p-6 rounded-[2rem] transition-all duration-700", formData.businessUnit === bu.id ? "bg-[#001F3D] text-white shadow-xl shadow-blue-900/20" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-400")}>
                       <Icon className="h-14 w-14" />
                    </div>
                    <div className="space-y-2">
                       <span className="text-lg font-display font-black uppercase tracking-tight text-[#001F3D]">{bu.label}</span>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">{bu.desc}</p>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        );
      case 2:
        return (
          <div className="space-y-12 animate-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
            <Card className="p-10 border-slate-200/60 shadow-xl rounded-[3rem] space-y-10 relative overflow-hidden bg-white">
               <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Core Product Registry</h4>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Internal Protocol Code *</Label><Input placeholder="FT-VMC-XXXX" className="h-14 bg-slate-50/50 border-none rounded-2xl font-black font-code text-primary shadow-inner" value={formData.code ?? ''} onChange={(e) => handleUpdateField('code', e.target.value)} /></div>
                 <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Visual Identity Name *</Label><Input placeholder="e.g. Mold Cavity Block" className="h-14 bg-slate-50/50 border-none rounded-2xl font-black uppercase shadow-inner text-[#001F3D]" value={formData.name ?? ''} onChange={(e) => handleUpdateField('name', e.target.value)} /></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Classification</Label>
                   <Select value={formData.type ?? ''} onValueChange={(v) => handleUpdateField('type', v)}><SelectTrigger className="h-12 bg-white border-2 border-slate-100 rounded-xl font-black uppercase text-[10px] shadow-sm"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-slate-100 shadow-2xl">{['Finished Product', 'Raw Material', 'Semi-Finished', 'Assembly', 'Service'].map(t => <SelectItem key={t} value={t} className="text-[10px] font-bold uppercase py-3">{t}</SelectItem>)}</SelectContent></Select>
                 </div>
                 <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Category Hub</Label><Input className="h-12 bg-white border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase shadow-sm" value={formData.category ?? ''} onChange={(e) => handleUpdateField('category', e.target.value)} /></div>
                 <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">HSN/SAC Protocol</Label><Input className="h-12 bg-white border-2 border-slate-100 rounded-xl font-black text-center text-xs shadow-sm" value={formData.hsn ?? ''} onChange={(e) => handleUpdateField('hsn', e.target.value)} /></div>
               </div>
               <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Technical Transcription</Label><Textarea placeholder="Define technical objectives and functional scope..." className="min-h-[140px] bg-slate-50/30 border-none rounded-[2rem] text-xs font-medium leading-relaxed p-8 shadow-inner resize-none" value={formData.description ?? ''} onChange={(e) => handleUpdateField('description', e.target.value)} /></div>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="p-8 border-slate-200/60 shadow-xl bg-white rounded-[2.5rem] space-y-8">
                 <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Blueprints & Controls</h4>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Drawing Identifier</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-black font-code text-primary shadow-inner" value={formData.drawingNumber ?? ''} onChange={(e) => handleUpdateField('drawingNumber', e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Revision Sequence</Label><Input className="h-12 bg-slate-50 border-none rounded-xl text-center font-code font-black text-slate-700" value={formData.revisionNumber ?? ''} onChange={(e) => handleUpdateField('revisionNumber', e.target.value)} /></div>
                 </div>
              </Card>
              <Card className="p-8 border-slate-200/60 shadow-xl bg-white rounded-[2.5rem] space-y-8">
                 <div className="flex items-center gap-3 border-l-4 border-indigo-600 pl-4">
                    <Ruler className="h-5 w-5 text-indigo-600" />
                    <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Material Fidelity</h4>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Grade Specification</Label><Input placeholder="e.g. OHNS, D2, P20" className="h-12 bg-slate-50 border-none rounded-xl font-black uppercase" value={formData.materialGrade ?? ''} onChange={(e) => handleUpdateField('materialGrade', e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Tolerance Baseline</Label><Input placeholder="± 0.005mm" className="h-12 bg-slate-50 border-none rounded-xl font-code text-center font-bold text-emerald-600 shadow-inner" value={formData.tolerance ?? ''} onChange={(e) => handleUpdateField('tolerance', e.target.value)} /></div>
                 </div>
              </Card>
            </div>
            <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem]">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Net Weight (KG)</Label><Input type="number" className="h-11 bg-slate-50 border-none rounded-xl text-center font-black" value={formData.weight ?? ''} onChange={(e) => handleUpdateField('weight', e.target.value)} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Surface protocol</Label><Input placeholder="Ra 0.8" className="h-11 bg-slate-50 border-none rounded-xl font-bold" value={formData.surfaceFinish ?? ''} onChange={(e) => handleUpdateField('surfaceFinish', e.target.value)} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Institutional Sector</Label><Input placeholder="Aerospace" className="h-11 bg-slate-50 border-none rounded-xl font-bold" value={formData.industry ?? ''} onChange={(e) => handleUpdateField('industry', e.target.value)} /></div>
               </div>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="space-y-12 animate-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
            <Card className="p-10 border-slate-200 bg-white shadow-xl rounded-[3rem] space-y-10">
              <div className="flex items-center gap-3 border-l-4 border-primary pl-6">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Master Route Authorization</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {['VMC Required', 'CNC Turning Required', 'Surface Grinding Required', 'VMM Required', 'Assembly Required', 'Inspection Required'].map(req => (
                  <div key={req} className={cn("flex items-center space-x-3 p-5 rounded-2xl border transition-all cursor-pointer", formData.machinesRequired?.includes(req) ? "bg-blue-50/50 border-primary/30" : "bg-white border-slate-100 hover:bg-slate-50")}>
                    <Checkbox id={req} onCheckedChange={(v) => {
                      const current = formData.machinesRequired || [];
                      const updated = v ? [...current, req] : current.filter(m => m !== req);
                      handleUpdateField('machinesRequired', updated);
                    }} checked={formData.machinesRequired?.includes(req)} />
                    <Label htmlFor={req} className="text-[10px] font-bold uppercase text-[#001F3D] cursor-pointer">{req}</Label>
                  </div>
                ))}
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { label: 'Cycle Velocity (Sec)', field: 'cycleTimeSec' },
                 { label: 'Setup Temporal (Min)', field: 'setupTimeMin' },
                 { label: 'Audit Window (Min)', field: 'inspectionTimeMin' }
               ].map(time => (
                 <Card key={time.field} className="p-8 bg-slate-900 text-white border-none shadow-2xl rounded-[2rem] flex flex-col items-center justify-center gap-4 text-center group hover:scale-[1.05] transition-all">
                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{time.label}</Label>
                    <Input type="number" className="h-16 w-full bg-transparent border-none text-4xl font-display font-black text-primary text-center p-0 focus-visible:ring-0" value={(formData as any)[time.field] ?? ''} onChange={(e) => handleUpdateField(time.field as any, e.target.value)} />
                    <div className="h-1 w-8 bg-primary/20 rounded-full" />
                 </Card>
               ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-12 animate-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <Card className="lg:col-span-7 p-10 bg-white border-slate-200 shadow-2xl rounded-[3rem] space-y-10">
                 <div className="flex items-center gap-3 border-l-4 border-[#001F3D] pl-6"><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Yield Breakdown</h4></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { label: 'Material Cost', field: 'materialCost', color: 'text-slate-500' },
                     { label: 'Machining Cost', field: 'machiningCost', color: 'text-slate-500' },
                     { label: 'Assembly Cost', field: 'assemblyCost', color: 'text-slate-500' },
                     { label: 'Inspection Cost', field: 'inspectionCost', color: 'text-slate-500' },
                     { label: 'Tooling Yield', field: 'toolingCost', color: 'text-slate-500' },
                     { label: 'Packaging Node', field: 'packagingCost', color: 'text-slate-500' },
                   ].map(cost => (
                     <div key={cost.field} className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group transition-all hover:bg-white hover:shadow-lg">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 group-hover:text-primary"><DollarSign className="h-3 w-3" /> {cost.label}</Label>
                       <Input type="number" className="h-10 bg-transparent border-none text-lg font-display font-black text-[#001F3D] p-0" value={(formData as any)[cost.field] ?? ''} onChange={(e) => handleUpdateField(cost.field as any, e.target.value)} placeholder="0.00" />
                     </div>
                   ))}
                 </div>
              </Card>
              <div className="lg:col-span-5 space-y-8">
                 <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[3rem] flex flex-col justify-between relative overflow-hidden h-full min-h-[500px]">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
                    <div className="space-y-12 relative z-10">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-2">Institutional Standard Cost</p>
                          <div className="flex items-baseline gap-4">
                             <h4 className="text-6xl font-display font-black text-primary tracking-tighter">₹ {(formData.standardCost || 0).toLocaleString()}</h4>
                             <span className="text-xs font-bold text-white/40">/ BASE</span>
                          </div>
                       </div>
                       
                       <div className="space-y-4 pt-10 border-t border-white/5">
                          <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Proposed Settlement Price (₹)</Label>
                          <div className="relative group">
                             <Input type="number" className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl text-center text-3xl font-display font-black text-white focus-visible:ring-primary shadow-2xl transition-all" value={formData.sellingPrice ?? ''} onChange={(e) => handleUpdateField('sellingPrice', e.target.value)} />
                             <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-[#001F3D] font-black uppercase text-[8px] border-none shadow-xl">COMMERCIAL_COMMIT</Badge>
                          </div>
                       </div>

                       <div className="pt-8 flex justify-between items-end">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Net Profit Matrix</p>
                             <div className="flex items-center gap-4">
                                <span className={cn("text-5xl font-display font-black tracking-tighter", (formData.marginPercent ?? 0) >= 20 ? "text-emerald-400" : "text-amber-400")}>{formData.marginPercent ?? 0}%</span>
                                <Badge className="bg-white/10 text-white/60 border-none text-[8px] font-bold uppercase px-3 h-6">Live Yield</Badge>
                             </div>
                          </div>
                          <div className="text-right space-y-1 opacity-40">
                             <p className="text-[8px] font-bold uppercase">Benchmark</p>
                             <p className="text-lg font-display font-bold">25.0%</p>
                          </div>
                       </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20 overflow-hidden"><div className="h-full bg-primary animate-pulse" style={{ width: `${Math.min(formData.marginPercent ?? 0, 100)}%` }} /></div>
                 </Card>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Current Demand', field: 'projectedDemand', icon: Target },
                { label: 'Annual Load', field: 'annualRequirement', icon: CalendarDays },
                { label: 'Potential Hub', field: 'potentialAnnualRequirement', icon: TrendingUp },
              ].map(kpi => (
                <Card key={kpi.field} className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col items-center text-center gap-6 group hover:border-primary/40 transition-all">
                   <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all"><kpi.icon className="h-8 w-8" /></div>
                   <div className="space-y-3 w-full">
                      <Label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">{kpi.label}</Label>
                      <Input type="number" className="h-12 bg-slate-50/50 border-none rounded-xl text-center text-2xl font-display font-black text-[#001F3D] shadow-inner" value={(formData as any)[kpi.field] ?? ''} onChange={(e) => handleUpdateField(kpi.field as any, e.target.value)} />
                   </div>
                </Card>
              ))}
            </div>
            <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[3rem] space-y-8">
               <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-6"><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Competitor Intelligence Node</h4></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Benchmark Product</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.competitorProducts ?? ''} onChange={(e) => handleUpdateField('competitorProducts', e.target.value)} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Market Price Delta (₹)</Label><div className="relative"><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl pl-10 font-bold" value={formData.competitorPrice ?? ''} onChange={(e) => handleUpdateField('competitorPrice', e.target.value)} /><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /></div></div>
               </div>
               <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Growth Forecast</Label><Input placeholder="Define expected YOY trajectory..." className="h-12 bg-slate-50 border-none rounded-xl font-medium" value={formData.forecastGrowth ?? ''} onChange={(e) => handleUpdateField('forecastGrowth', e.target.value)} /></div>
            </Card>
          </div>
        );
      case 9:
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
            <div className="flex justify-between items-center px-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-black text-[#001F3D] uppercase tracking-tight">Institutional BOM Protocol</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill of Materials Registry v2.4</p>
              </div>
              <Button onClick={handleAddBOMItem} className="rounded-2xl h-12 px-10 bg-[#001F3D] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-xl flex gap-3 transition-all transform hover:scale-[1.02]"><Plus className="h-4 w-4" /> Append Component Node</Button>
            </div>
            <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[3rem]">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                    <TableHead className="py-6 px-10 font-black text-[10px] uppercase text-[#001F3D] w-20 text-center">Seq.</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-[#001F3D]">Component Identification</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase text-[#001F3D] w-32">Qty Node</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase text-[#001F3D] w-48 px-10">Institutional Cost (₹)</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.bom || []).map((item, idx) => (
                    <TableRow key={item.id} className="h-24 border-b border-slate-50 hover:bg-slate-50/30 transition-all group">
                      <TableCell className="text-center font-display font-black text-slate-200 group-hover:text-primary transition-colors">{(idx + 1).toString().padStart(2, '0')}</TableCell>
                      <TableCell className="p-4"><Input className="h-11 bg-slate-50/50 border-none rounded-xl font-black text-sm uppercase px-6 focus-visible:ring-primary/20 shadow-inner" placeholder="Identify Sub-Component..." value={item.name ?? ''} onChange={(e) => {
                        const newBom = [...(formData.bom || [])];
                        newBom[idx].name = e.target.value;
                        handleUpdateField('bom', newBom);
                      }} /></TableCell>
                      <TableCell className="text-center p-4"><Input type="number" className="h-11 w-24 mx-auto bg-slate-50/50 border-none text-center font-black text-lg text-[#001F3D] rounded-xl shadow-inner" value={item.qty ?? ''} onChange={(e) => {
                        const newBom = [...(formData.bom || [])];
                        newBom[idx].qty = Number(e.target.value);
                        handleUpdateField('bom', newBom);
                      }} /></TableCell>
                      <TableCell className="text-right p-4 px-10"><div className="relative w-40 ml-auto"><Input type="number" className="h-11 bg-slate-50/50 border-none text-right font-display font-black text-lg text-primary rounded-xl pl-10 shadow-inner" value={item.cost ?? ''} onChange={(e) => {
                        const newBom = [...(formData.bom || [])];
                        newBom[idx].cost = Number(e.target.value);
                        handleUpdateField('bom', newBom);
                      }} /><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-200" /></div></TableCell>
                      <TableCell className="text-center px-4"><Button variant="ghost" size="icon" onClick={() => handleRemoveBOMItem(item.id)} className="text-slate-200 hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-5 w-5" /></Button></TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50/50 border-t-2 border-[#001F3D]">
                    <TableCell colSpan={3} className="px-10 py-6 text-right font-black text-[11px] uppercase text-slate-400 tracking-widest">Aggregate BOM Value</TableCell>
                    <TableCell className="text-right px-10 font-display font-black text-2xl text-[#001F3D]">₹ {(formData.bom || []).reduce((acc, i) => acc + (i.qty * i.cost), 0).toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </div>
        );
      case 10:
        return (
          <div className="space-y-12 animate-in zoom-in-95 duration-700 max-w-4xl mx-auto">
            <Card className="p-12 bg-[#001F3D] text-white border-none shadow-[0_48px_96px_-24px_rgba(0,0,0,0.2)] rounded-[4rem] space-y-12 relative overflow-hidden group">
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '50px 50px' }} />
               <div className="flex justify-between items-center border-b border-white/10 pb-8 relative z-10">
                  <div>
                     <p className="text-[11px] font-black uppercase text-white/30 tracking-[0.5em] mb-3">Institutional Identity</p>
                     <h2 className="text-5xl font-display font-black tracking-tighter uppercase leading-none">{formData.name}</h2>
                  </div>
                  <div className="text-right">
                     <Badge className="bg-primary text-[#001F3D] font-black text-sm uppercase px-6 h-10 border-none shadow-2xl">{formData.code}</Badge>
                     <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-4">Registry Node: FT_MATRIX_v2.4</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                  <div className="space-y-2"><p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Business Unit</p><p className="text-xs font-black uppercase">{formData.businessUnit}</p></div>
                  <div className="space-y-2"><p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Material Grade</p><p className="text-xs font-black uppercase text-primary">{formData.materialGrade}</p></div>
                  <div className="space-y-2"><p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Weight Protocol</p><p className="text-xs font-black uppercase">{formData.weight} KG</p></div>
                  <div className="space-y-2"><p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Tolerance Node</p><p className="text-xs font-black uppercase text-emerald-400 font-code">{formData.tolerance}</p></div>
               </div>

               <div className="p-12 bg-white text-[#001F3D] rounded-[3rem] shadow-2xl relative z-10 flex items-center justify-between group/total overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-full bg-slate-50 translate-x-20 group-hover/total:translate-x-12 transition-transform duration-1000 -skew-x-12" />
                  <div className="space-y-3 relative z-10">
                     <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Total Valuation Protocol</p>
                     <div className="flex items-baseline gap-4">
                        <span className="text-7xl font-display font-black tracking-tighter text-[#001F3D]">₹ {(formData.standardCost || 0).toLocaleString()}</span>
                        <span className="text-lg font-bold text-slate-300">/ {formData.uom}</span>
                     </div>
                  </div>
                  <div className="text-right space-y-2 relative z-10">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Margin Sync</p>
                     <p className={cn("text-6xl font-display font-black tracking-tighter transition-all duration-700", (formData.marginPercent ?? 0) >= 20 ? "text-emerald-500" : "text-amber-500")}>{formData.marginPercent ?? 0}%</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-6 relative z-10 opacity-30 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Fidelity Protocol Verified</span></div>
                  <div className="flex items-center gap-2"><Award className="h-4 w-4" /><span className="text-[9px] font-bold uppercase tracking-widest">Industrial Compliance ISO_9001</span></div>
               </div>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body overflow-x-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.4em]"><Box className="h-4 w-4" />Institutional Product Master</div>
          <h2 className="text-4xl font-display font-black text-[#001F3D] uppercase tracking-tight">Product <span className="text-slate-400 font-medium">Intelligence</span></h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Central technical repository for all manufactured nodes.</p>
        </div>
        <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl px-10 font-black uppercase text-[10px] tracking-widest shadow-2xl flex gap-3 group transition-all transform hover:scale-[1.02]" onClick={handleOpenWizard}>
          <Plus className="h-4 w-4" /> Initialize Product Node <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </header>

      <Card className="overflow-hidden border-none bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[3rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search matrix identity or account..." className="pl-12 h-12 bg-white border-slate-200 rounded-2xl text-[11px] font-black uppercase shadow-sm focus-visible:ring-primary/20" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-11 px-8 uppercase tracking-widest rounded-xl shadow-sm">{filteredProducts.length} Product Nodes Sync'd</Badge>
        </div>
        <Table>
          <TableHeader className="bg-white border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-10 py-8 font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Identity Code</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Visual Reference</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Product Node Identity</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Standard Cost</TableHead>
              <TableHead className="text-center font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">State</TableHead>
              <TableHead className="text-right px-10 w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(p => (
              <TableRow key={p.id} className="h-28 border-b border-slate-50 hover:bg-slate-50 transition-all group cursor-pointer">
                <TableCell className="px-10 font-code font-black text-[13px] text-primary tracking-tight">{p.code}</TableCell>
                <TableCell className="w-24">
                  <div className="h-16 w-16 rounded-2xl bg-slate-50 border-2 border-white shadow-xl overflow-hidden flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    {p.imageUrls && p.imageUrls.length > 0 ? (
                      <img src={p.imageUrls[0]} alt={p.name} className="object-cover h-full w-full" />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-slate-200" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex flex-col gap-1.5">
                      <span className="text-[15px] font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors leading-none">{p.name}</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{p.type} • {p.businessUnit}</span>
                   </div>
                </TableCell>
                <TableCell className="text-right">
                   <div className="flex flex-col items-end gap-1">
                      <span className="font-display font-black text-xl text-[#001F3D]">₹ {p.standardCost?.toLocaleString()}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">Valuation Node</span>
                   </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={cn(
                    "text-[9px] font-black uppercase px-6 py-2 rounded-full border shadow-sm transition-all",
                    p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  )}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-10">
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl opacity-0 group-hover:opacity-100 transition-all bg-white shadow-xl border border-slate-100 transform group-hover:translate-x-2"><ChevronRight className="h-6 w-6 text-primary" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-80 text-center">
                  <div className="flex flex-col items-center justify-center opacity-10 py-10 scale-125">
                    <Box className="h-24 w-24 mb-6" />
                    <p className="text-2xl font-display font-black uppercase tracking-tight">Identity Matrix Offline</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Initialize product node to generate registry</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-7xl h-[92vh] bg-white border-none shadow-2xl rounded-[4rem] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="sr-only"><DialogTitle>Product Wizard</DialogTitle><DialogDescription>Step-by-step product onboarding</DialogDescription></DialogHeader>
          <div className="flex-1 flex overflow-hidden">
            {/* SIDEBAR NAVIGATION (STYLING REFINED) */}
            <div className="w-[340px] bg-slate-900 p-12 border-r border-slate-800 flex flex-col justify-between shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
              <div className="space-y-12 relative z-10">
                <div className="p-5 bg-primary rounded-[2rem] w-fit shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)]"><Box className="h-10 w-10 text-[#001F3D]" /></div>
                <div className="space-y-5">
                  {ONBOARDING_STEPS.map((s) => (
                    <div key={s.id} className="flex items-center gap-6 group cursor-pointer relative" onClick={() => setWizardStep(s.id)}>
                      {s.id < 10 && <div className={cn("absolute left-4 top-10 w-[1px] h-6 transition-all duration-700", wizardStep > s.id ? "bg-emerald-500" : "bg-slate-700/50")} />}
                      <div className={cn("h-9 w-9 rounded-2xl flex items-center justify-center text-[11px] font-black border-2 transition-all duration-700 z-10", wizardStep === s.id ? "bg-white border-white text-slate-900 scale-125 shadow-2xl" : wizardStep > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-800/50 border-slate-700 text-slate-500")}>{wizardStep > s.id ? <Check className="h-4 w-4" /> : s.id}</div>
                      <div className="flex flex-col">
                        <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 leading-none", wizardStep === s.id ? "text-white" : "text-slate-500")}>{s.label}</span>
                        <span className="text-[7px] text-slate-600 uppercase font-black tracking-[0.3em] mt-2 group-hover:text-slate-500 transition-colors">{s.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] relative z-10">
                PRODUCT_MASTER_WIZARD_v2.4
              </div>
            </div>

            {/* CONTENT AREA (STYLING REFINED) */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <header className="p-12 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/30">
                <div>
                  <h3 className="text-4xl font-display font-black text-[#001F3D] uppercase tracking-tighter">{ONBOARDING_STEPS[wizardStep - 1].label} <span className="text-slate-300 font-medium">Matrix</span></h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2 animate-pulse">Node Authorization Step {wizardStep} / 10</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full h-14 w-14 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"><X className="h-10 w-10" /></Button>
              </header>
              <ScrollArea className="flex-1">
                <div className="p-12 md:p-16 lg:p-24 flex flex-col items-center">
                   <div className="w-full max-w-5xl">
                      {renderStepContent()}
                   </div>
                </div>
              </ScrollArea>
              <footer className="p-10 md:p-12 border-t border-slate-100 flex justify-between bg-slate-50/50 backdrop-blur-xl shrink-0 z-20">
                <Button variant="ghost" disabled={wizardStep === 1} className="rounded-[1.5rem] h-16 px-12 font-black uppercase text-[11px] tracking-[0.2em] text-slate-400 hover:text-[#001F3D] transition-all" onClick={() => setWizardStep(s => s - 1)}><ChevronLeft className="mr-3 h-6 w-6" /> Protocol Prev</Button>
                <div className="flex gap-6">
                  <Button variant="ghost" className="rounded-[1.5rem] h-16 px-12 font-black uppercase text-[11px] tracking-[0.2em] text-slate-400" onClick={() => setIsWizardOpen(false)}>Abort Onboarding</Button>
                  <Button className="h-16 bg-[#001F3D] hover:bg-black text-white rounded-[1.5rem] px-20 font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,31,61,0.3)] flex gap-4 group transition-all transform active:scale-95" onClick={() => wizardStep === 10 ? handleFinishWizard() : setWizardStep(s => s + 1)}>
                    {wizardStep === 10 ? 'Synchronize Identity Matrix' : 'Next Node Authorization'} <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                  </Button>
                </div>
              </footer>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
