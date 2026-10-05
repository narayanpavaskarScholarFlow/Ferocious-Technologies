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
    bom: []
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
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
      bom: []
    });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleUpdateField = (field: keyof ProductMaster, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Automatic Commercial Calculations
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
    const activeStep = ONBOARDING_STEPS[wizardStep - 1];
    
    switch (wizardStep) {
      case 1: // BUSINESS UNIT
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2">Identity Matrix Selection</Label>
            <RadioGroup 
              value={formData.businessUnit} 
              onValueChange={(v: any) => handleUpdateField('businessUnit', v)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                { id: 'Manufacturing', label: 'Ferocious Technologies', desc: 'Precision VMC & Tool Room', icon: Factory },
                { id: 'Electricals', label: 'Ferocious Electricals', desc: 'Conduits & Switchgear', icon: Zap }
              ].map(bu => {
                const Icon = bu.icon;
                return (
                  <Label key={bu.id} className={cn(
                    "p-10 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col items-center gap-4 text-center group",
                    formData.businessUnit === bu.id ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-2xl" : "border-slate-100 bg-slate-50 hover:border-primary/40"
                  )}>
                    <RadioGroupItem value={bu.id} className="sr-only" />
                    <Icon className={cn("h-12 w-12 mb-2 transition-transform group-hover:scale-110", formData.businessUnit === bu.id ? "text-primary" : "text-slate-300")} />
                    <div className="space-y-1">
                      <span className="text-sm font-black uppercase tracking-tight text-slate-900">{bu.label}</span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bu.desc}</p>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        );

      case 2: // PRODUCT INFO
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Master Product Code *</Label>
                <Input placeholder="FT-VMC-XXXX" className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.code ?? ''} onChange={(e) => handleUpdateField('code', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Display Identity *</Label>
                <Input placeholder="e.g. Mold Cavity Block" className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase" value={formData.name ?? ''} onChange={(e) => handleUpdateField('name', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <Label className="text-[9px] font-bold uppercase text-slate-500">Classification</Label>
                 <Select value={formData.type ?? ''} onValueChange={(v) => handleUpdateField('type', v)}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {['Finished Product', 'Raw Material', 'Semi-Finished', 'Assembly', 'Service'].map(t => <SelectItem key={t} value={t} className="text-[10px] font-bold uppercase">{t}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="text-[9px] font-bold uppercase text-slate-500">Category Node</Label>
                 <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.category ?? ''} onChange={(e) => handleUpdateField('category', e.target.value)} />
               </div>
               <div className="space-y-2">
                 <Label className="text-[9px] font-bold uppercase text-slate-500">HSN/SAC Node</Label>
                 <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" value={formData.hsn ?? ''} onChange={(e) => handleUpdateField('hsn', e.target.value)} />
               </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Functional Description</Label>
              <Textarea placeholder="Technical overview..." className="min-h-[120px] bg-slate-50 border-none rounded-2xl text-xs font-medium" value={formData.description ?? ''} onChange={(e) => handleUpdateField('description', e.target.value)} />
            </div>
          </div>
        );

      case 3: // ENGINEERING
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Drawing Protocol Number</Label>
                  <div className="relative">
                    <Input className="h-12 bg-slate-50 border-none rounded-xl pl-10 font-bold" value={formData.drawingNumber ?? ''} onChange={(e) => handleUpdateField('drawingNumber', e.target.value)} />
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Revision Node</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl text-center font-code font-bold" value={formData.revisionNumber ?? ''} onChange={(e) => handleUpdateField('revisionNumber', e.target.value)} />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Material Grade</Label>
                  <Input placeholder="e.g. OHNS, D2, P20" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.materialGrade ?? ''} onChange={(e) => handleUpdateField('materialGrade', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Tolerance Spec</Label>
                  <Input placeholder="± 0.005mm" className="h-12 bg-slate-50 border-none rounded-xl font-code" value={formData.tolerance ?? ''} onChange={(e) => handleUpdateField('tolerance', e.target.value)} />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Weight (KG)</Label>
                  <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-center" value={formData.weight ?? ''} onChange={(e) => handleUpdateField('weight', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Surface Finish</Label>
                  <Input placeholder="Ra 0.8" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.surfaceFinish ?? ''} onChange={(e) => handleUpdateField('surfaceFinish', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Target Industry</Label>
                  <Input placeholder="Automotive" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.industry ?? ''} onChange={(e) => handleUpdateField('industry', e.target.value)} />
                </div>
             </div>
          </div>
        );

      case 4: // MANUFACTURING
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resource Route Required</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {['VMC Required', 'CNC Turning Required', 'Surface Grinding Required', 'VMM Required', 'Assembly Required', 'Inspection Required'].map(req => (
                  <div key={req} className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <Checkbox id={req} />
                    <Label htmlFor={req} className="text-[10px] font-bold uppercase text-slate-600">{req}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Est. Cycle Time (Sec)</Label>
                <Input type="number" className="h-14 bg-slate-50 border-none text-2xl font-display font-black text-primary text-center rounded-2xl" value={formData.cycleTimeSec ?? ''} onChange={(e) => handleUpdateField('cycleTimeSec', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Est. Setup Time (Min)</Label>
                <Input type="number" className="h-14 bg-slate-50 border-none text-2xl font-display font-black text-primary text-center rounded-2xl" value={formData.setupTimeMin ?? ''} onChange={(e) => handleUpdateField('setupTimeMin', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Inspection Window (Min)</Label>
                <Input type="number" className="h-14 bg-slate-50 border-none text-2xl font-display font-black text-primary text-center rounded-2xl" value={formData.inspectionTimeMin ?? ''} onChange={(e) => handleUpdateField('inspectionTimeMin', e.target.value)} />
              </div>
            </div>
          </div>
        );

      case 5: // COMMERCIAL
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Material Cost', field: 'materialCost' },
                    { label: 'Machining Cost', field: 'machiningCost' },
                    { label: 'Assembly Cost', field: 'assemblyCost' },
                    { label: 'Inspection Cost', field: 'inspectionCost' },
                    { label: 'Tooling Cost', field: 'toolingCost' },
                    { label: 'Packaging Cost', field: 'packagingCost' },
                  ].map(cost => (
                    <div key={cost.field} className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-slate-500">{cost.label} (₹)</Label>
                       <div className="relative">
                         <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl pl-10 font-bold" value={(formData as any)[cost.field] ?? ''} onChange={(e) => handleUpdateField(cost.field as any, e.target.value)} />
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       </div>
                    </div>
                  ))}
                </div>
                <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '30px 30px' }} />
                   <div className="space-y-8 relative z-10">
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Standard Cost Baseline</p>
                        <h4 className="text-4xl font-display font-black text-primary tracking-tighter">₹ {(formData.standardCost || 0).toLocaleString()}</h4>
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[9px] font-bold uppercase text-white/40">Selling Price Protocol</Label>
                         <Input type="number" className="h-14 bg-white/5 border-white/10 text-white font-display text-2xl font-bold" value={formData.sellingPrice ?? ''} onChange={(e) => handleUpdateField('sellingPrice', e.target.value)} />
                      </div>
                      <div className="flex justify-between items-end border-t border-white/10 pt-6">
                         <div className="space-y-1"><p className="text-[8px] font-bold text-white/30 uppercase">Calculated Margin</p><p className="text-2xl font-display font-bold text-emerald-400">{formData.marginPercent ?? 0}%</p></div>
                         <div className="text-right space-y-1"><p className="text-[8px] font-bold text-white/30 uppercase">Target Matrix</p><p className="text-sm font-bold text-white/60">25%</p></div>
                      </div>
                   </div>
                </Card>
             </div>
          </div>
        );

      case 6: // MARKET
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500">Current Demand</Label>
                <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.projectedDemand ?? ''} onChange={(e) => handleUpdateField('projectedDemand', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500">Annual Requirement</Label>
                <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.annualRequirement ?? ''} onChange={(e) => handleUpdateField('annualRequirement', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500">Potential Demand</Label>
                <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.potentialAnnualRequirement ?? ''} onChange={(e) => handleUpdateField('potentialAnnualRequirement', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Target Industry</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.targetIndustry ?? ''} onChange={(e) => handleUpdateField('targetIndustry', e.target.value)} />
               </div>
               <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Target Customer</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.targetCustomerType ?? ''} onChange={(e) => handleUpdateField('targetCustomerType', e.target.value)} />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Competitor Product</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.competitorProducts ?? ''} onChange={(e) => handleUpdateField('competitorProducts', e.target.value)} />
               </div>
               <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Competitor Price</Label>
                  <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.competitorPrice ?? ''} onChange={(e) => handleUpdateField('competitorPrice', e.target.value)} />
               </div>
               <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Forecast Growth</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.forecastGrowth ?? ''} onChange={(e) => handleUpdateField('forecastGrowth', e.target.value)} />
               </div>
            </div>
          </div>
        );

      case 7: // OUTSOURCING
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-500">Outsourcing %</Label>
                   <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.outsourcedPercent ?? ''} onChange={(e) => handleUpdateField('outsourcedPercent', e.target.value)} />
                </div>
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-500">Annual Outsourcing Value (₹)</Label>
                   <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.annualOutsourcingValue ?? ''} onChange={(e) => handleUpdateField('annualOutsourcingValue', e.target.value)} />
                </div>
             </div>
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reason For Outsourcing</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'Machine Not Available', label: 'Machine Not Available' },
                    { id: 'Capacity Full', label: 'Capacity Full' },
                    { id: 'Special Process', label: 'Special Process' },
                    { id: 'Commercial Advantage', label: 'Commercial Advantage' },
                  ].map(reason => (
                    <div key={reason.id} className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <Checkbox 
                        id={reason.id} 
                        checked={formData.outsourcingReason?.includes(reason.id)}
                        onCheckedChange={(checked) => {
                          const current = formData.outsourcingReason || [];
                          const updated = checked 
                            ? [...current, reason.id] 
                            : current.filter(r => r !== reason.id);
                          handleUpdateField('outsourcingReason', updated);
                        }}
                      />
                      <Label htmlFor={reason.id} className="text-[10px] font-bold uppercase text-slate-600">{reason.label}</Label>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        );

      case 8: // PARTNERS
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-400">Primary Vendor</Label>
                   <Select value={formData.primaryVendorId ?? ''} onValueChange={(v) => handleUpdateField('primaryVendorId', v)}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue placeholder="Identify Vendor..." /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl">
                        {vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase py-2">{v.name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-400">Backup Vendor</Label>
                   <Select value={formData.backupVendorId ?? ''} onValueChange={(v) => handleUpdateField('backupVendorId', v)}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue placeholder="Identify Backup..." /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl">
                        {vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase py-2">{v.name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-500">Lead Time (Days)</Label>
                   <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.leadTime ?? ''} onChange={(e) => handleUpdateField('leadTime', e.target.value)} />
                </div>
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-500">MOQ</Label>
                   <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.moq ?? ''} onChange={(e) => handleUpdateField('moq', e.target.value)} />
                </div>
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-slate-500">Payment Terms</Label>
                   <Input placeholder="e.g. 30 Days" className="h-12 bg-slate-50 border-none rounded-xl" value={formData.paymentTerms ?? ''} onChange={(e) => handleUpdateField('paymentTerms', e.target.value)} />
                </div>
             </div>
          </div>
        );

      case 9: // BOM
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
             {['Assembly', 'Finished Product'].includes(formData.type || '') ? (
               <>
                 <div className="flex justify-between items-center px-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-l-4 border-primary pl-4">Bill of Materials Protocol</h3>
                    <Button onClick={handleAddBOMItem} variant="outline" size="sm" className="rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest gap-2"><Plus className="h-4 w-4" /> Append Component</Button>
                 </div>
                 <div className="overflow-hidden border border-slate-200 rounded-3xl bg-white shadow-sm">
                    <Table>
                       <TableHeader className="bg-slate-50/50">
                          <TableRow>
                             <TableHead className="py-5 px-8 font-bold text-[9px] uppercase">Component Identity</TableHead>
                             <TableHead className="text-center font-bold text-[9px] uppercase">Qty</TableHead>
                             <TableHead className="text-center font-bold text-[9px] uppercase">Revision</TableHead>
                             <TableHead className="text-right font-bold text-[9px] uppercase">Unit Cost</TableHead>
                             <TableHead className="text-right px-8"></TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {(formData.bom || []).map((item, idx) => (
                            <TableRow key={item.id} className="h-20 border-b border-slate-50">
                               <TableCell className="px-8"><Input className="h-10 bg-slate-50/50 border-none font-bold text-xs" placeholder="Component Name" value={item.name ?? ''} onChange={(e) => {
                                 const newBom = [...(formData.bom || [])];
                                 newBom[idx].name = e.target.value;
                                 handleUpdateField('bom', newBom);
                               }} /></TableCell>
                               <TableCell className="text-center"><Input type="number" className="h-10 w-20 mx-auto bg-slate-50/50 border-none text-center font-bold" value={item.qty ?? ''} onChange={(e) => {
                                 const newBom = [...(formData.bom || [])];
                                 newBom[idx].qty = Number(e.target.value);
                                 handleUpdateField('bom', newBom);
                               }} /></TableCell>
                               <TableCell className="text-center"><Input className="h-10 w-20 mx-auto bg-slate-50/50 border-none text-center font-code" value={item.revision ?? ''} onChange={(e) => {
                                 const newBom = [...(formData.bom || [])];
                                 newBom[idx].revision = e.target.value;
                                 handleUpdateField('bom', newBom);
                               }} /></TableCell>
                               <TableCell className="text-right"><Input type="number" className="h-10 w-32 ml-auto bg-slate-50/50 border-none text-right font-display font-bold" value={item.cost ?? ''} onChange={(e) => {
                                 const newBom = [...(formData.bom || [])];
                                 newBom[idx].cost = Number(e.target.value);
                                 handleUpdateField('bom', newBom);
                               }} /></TableCell>
                               <TableCell className="text-right px-8"><Button variant="ghost" size="icon" onClick={() => handleRemoveBOMItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
               </>
             ) : (
               <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center border-4 border-dashed border-slate-200 rounded-[3rem]">
                  <Layers className="h-16 w-16 mb-6 text-slate-300" />
                  <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase">BOM Not Required</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">This node is classified as a single component. BOM protocol is only active for Assembly or Finished Product nodes.</p>
               </div>
             )}
          </div>
        );

      case 10: // REVIEW
        return (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 bg-slate-900 text-white border-none rounded-[2rem] space-y-6">
                   <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <h5 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Master Identity</h5>
                      <Badge className="bg-primary text-[#001F3D] font-bold text-[10px] border-none">{formData.code}</Badge>
                   </div>
                   <div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Product Display Name</p><p className="text-xl font-display font-bold uppercase">{formData.name}</p></div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">Business Unit</p><p className="text-xs font-bold">{formData.businessUnit}</p></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">Classification</p><p className="text-xs font-bold">{formData.type}</p></div>
                   </div>
                </Card>
                <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-6">
                   <div className="flex justify-between items-center border-b pb-4"><h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Technical Matrix</h5><button onClick={() => setWizardStep(3)} className="text-primary font-bold text-[10px] uppercase hover:underline">Edit Node</button></div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Drawing</p><p className="text-sm font-bold text-slate-700">{formData.drawingNumber}</p></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Revision</p><p className="text-sm font-bold text-slate-700">{formData.revisionNumber}</p></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Material</p><p className="text-sm font-bold text-slate-700">{formData.materialGrade}</p></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Weight</p><p className="text-sm font-bold text-slate-700">{formData.weight} KG</p></div>
                   </div>
                </Card>
             </div>
             <Card className="p-10 bg-primary text-[#001F3D] border-none shadow-2xl rounded-[2.5rem] flex items-center justify-between">
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F3D]/60">Standard Valuation Node</p>
                   <div className="flex items-baseline gap-4">
                      <span className="text-6xl font-display font-black tracking-tighter">₹ {(formData.standardCost || 0).toLocaleString()}</span>
                      <span className="text-lg font-bold text-[#001F3D]/60">/ {formData.uom}</span>
                   </div>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[10px] font-black uppercase text-[#001F3D]/60 tracking-widest">Calculated Margin</p>
                   <p className="text-5xl font-display font-black">{formData.marginPercent ?? 0}%</p>
                </div>
             </Card>
          </div>
        );

      default:
        return (
          <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center animate-pulse">
            <p className="text-sm font-bold uppercase tracking-widest">Matrix Construction...</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Box className="h-4 w-4" />
            Institutional Product Registry
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D] uppercase">Product <span className="text-slate-400 font-medium">Intelligence</span></h2>
        </div>
        <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3 group" onClick={handleOpenWizard}>
          <Plus className="h-4 w-4" /> Initialize Product Node <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </header>

      <Card className="overflow-hidden border-none bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Filter registry matrix..." className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
           </div>
           <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-8 px-4 uppercase tracking-widest">
            {filteredProducts.length} Product Nodes Sync'd
          </Badge>
        </div>
        <Table>
          <TableHeader className="bg-white border-b border-slate-100">
            <TableRow>
              <TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Identity Code</TableHead>
              <TableHead className="font-bold text-[9px] uppercase text-slate-400">Product Name</TableHead>
              <TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Standard Cost</TableHead>
              <TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">Status</TableHead>
              <TableHead className="text-right px-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(p => (
              <TableRow key={p.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all group">
                <TableCell className="px-10 font-code font-bold text-xs text-primary">{p.code}</TableCell>
                <TableCell><span className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{p.name}</span></TableCell>
                <TableCell className="text-right font-display font-bold text-sm">₹ {p.standardCost?.toLocaleString()}</TableCell>
                <TableCell className="text-center"><Badge variant="outline" className={cn("text-[8px] font-bold uppercase px-3 py-1 rounded-full", p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}>{p.status}</Badge></TableCell>
                <TableCell className="text-right px-10"><Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary transition-all group-hover:translate-x-1"><ChevronRight className="h-5 w-5" /></Button></TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow><TableCell colSpan={5} className="h-64 text-center opacity-30 text-[10px] font-black uppercase tracking-widest italic">Registry Matrix Offline</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-6xl h-[92vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-slate-900 p-10 border-r border-slate-800 flex flex-col justify-between shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '30px 30px' }} />
              <div className="space-y-12 relative z-10">
                <div className="p-4 bg-primary rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20 relative">
                  <Box className="h-8 w-8 text-[#001F3D]" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {ONBOARDING_STEPS.map((s) => (
                    <div key={s.id} className="flex items-center gap-6 group cursor-pointer relative" onClick={() => setWizardStep(s.id)}>
                      {s.id < 10 && (
                        <div className={cn(
                          "absolute left-4 top-8 w-[1px] h-6 transition-colors duration-500",
                          wizardStep > s.id ? "bg-emerald-500" : "bg-slate-700"
                        )} />
                      )}
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10",
                        wizardStep === s.id ? "bg-white border-white text-slate-900 scale-110 shadow-lg shadow-white/10" : 
                        wizardStep > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                      )}>
                        {wizardStep > s.id ? <Check className="h-4 w-4" /> : s.id}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 leading-none", wizardStep === s.id ? "text-white" : "text-slate-500")}>{s.label}</span>
                        <span className="text-[7px] text-slate-600 uppercase font-black tracking-tighter mt-1">{s.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em] relative z-10">ONBOARD_v2.4</p>
            </div>

            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <header className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div>
                    <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">
                      {ONBOARDING_STEPS[wizardStep - 1].label} Matrix
                    </DialogTitle>
                    <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Institutional Onboarding Protocol • Node {wizardStep} of 10
                    </DialogDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full h-12 w-12 text-slate-300 hover:text-red-500 transition-colors"><X className="h-8 w-8" /></Button>
              </header>

              <ScrollArea className="flex-1 p-10 md:p-14">
                 <div className="max-w-4xl mx-auto">
                    {renderStepContent()}
                 </div>
              </ScrollArea>

              <footer className="p-8 md:p-10 border-t border-slate-100 flex justify-between bg-slate-50/50 shrink-0">
                <Button variant="ghost" disabled={wizardStep === 1} className="rounded-xl h-14 px-10 font-bold uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setWizardStep(s => s - 1)}><ChevronLeft className="mr-3 h-5 w-5" /> Previous Node</Button>
                <div className="flex gap-4">
                  <Button variant="ghost" className="rounded-xl h-14 px-10 font-bold uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setIsWizardOpen(false)}>Abort Protocol</Button>
                  <Button className="h-14 bg-[#001F3D] hover:bg-black text-white rounded-xl px-16 font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3 group" onClick={() => wizardStep === 10 ? handleFinishWizard() : setWizardStep(s => s + 1)}>
                    {wizardStep === 10 ? 'Synchronize Matrix' : 'Proceed to Next Node'} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
