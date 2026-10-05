
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
  Maximize2,
  ImageIcon,
  ChevronLeft,
  Trash2,
  ShieldAlert,
  Info
} from 'lucide-react';
import { ProductMaster, Vendor, Machine, SystemUser } from '@/lib/types';
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

export function ProductRegistry({ products, vendors, machines, users }: { products: ProductMaster[], vendors: Vendor[], machines: Machine[], users: SystemUser[] }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // FULL PRODUCT STATE
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
    type: 'Finished Product',
    drawingNumber: '',
    revisionNumber: '00',
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

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === 'Active').length,
    manufacturing: products.filter(p => p.businessUnit === 'Manufacturing').length,
    electrical: products.filter(p => p.businessUnit === 'Electricals').length,
  }), [products]);

  const handleUpdateField = (field: keyof ProductMaster, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate Total Cost
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

      return updated;
    });
  };

  const handleOpenWizard = () => {
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleFinishWizard = () => {
    toast({ title: "Product Node Committed", description: `${formData.name} identity matrix synchronized.` });
    setIsWizardOpen(false);
  };

  const renderStepContent = () => {
    const StepIcon = ONBOARDING_STEPS[wizardStep - 1].icon;

    switch (wizardStep) {
      case 1: // Business Unit
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <Label className="text-[10px] font-black uppercase text-[#001F3D] tracking-widest">Identify Institutional Entity</Label>
            <RadioGroup 
              value={formData.businessUnit} 
              onValueChange={(v: any) => handleUpdateField('businessUnit', v)}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { id: 'Manufacturing', label: 'Ferocious Technologies', desc: 'Precision Tooling & VMC' },
                { id: 'Electricals', label: 'Ferocious Electricals', desc: 'Conduits & Switchgear' }
              ].map(bu => (
                <Label key={bu.id} className={cn(
                  "p-10 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col items-center gap-4 text-center group",
                  formData.businessUnit === bu.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-slate-100 bg-slate-50 hover:border-primary/40"
                )}>
                  <RadioGroupItem value={bu.id} className="sr-only" />
                  <Building2 className={cn("h-12 w-12 mb-2 transition-transform group-hover:scale-110", formData.businessUnit === bu.id ? "text-primary" : "text-slate-300")} />
                  <div className="space-y-1">
                    <span className="text-sm font-black uppercase tracking-tight text-slate-900">{bu.label}</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bu.desc}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 2: // Product Info
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Internal Part Code *</Label>
                <Input placeholder="e.g. FT-MC-001" className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.code} onChange={(e) => handleUpdateField('code', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Product / Name *</Label>
                <Input placeholder="e.g. Injection Mold Cavity" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.name} onChange={(e) => handleUpdateField('name', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Classification</Label>
                <Select value={formData.type} onValueChange={(v) => handleUpdateField('type', v)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {['Raw Material', 'Semi-Finished', 'Finished Product', 'Assembly', 'Consumable', 'Service'].map(t => <SelectItem key={t} value={t} className="text-[10px] font-bold uppercase">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">HSN / SAC Code</Label>
                <Input placeholder="8-Digit Code" className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" value={formData.hsn} onChange={(e) => handleUpdateField('hsn', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Standard UOM</Label>
                <Select value={formData.uom} onValueChange={(v) => handleUpdateField('uom', v)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {['Nos', 'Kg', 'Mtrs', 'Sets', 'Hours'].map(u => <SelectItem key={u} value={u} className="text-[10px] font-bold uppercase">{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Institutional Remarks</Label>
              <Textarea placeholder="Functional description and usage protocols..." className="min-h-[100px] bg-slate-50 border-none rounded-2xl text-xs font-medium" value={formData.description} onChange={(e) => handleUpdateField('description', e.target.value)} />
            </div>
          </div>
        );

      case 3: // Engineering
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Drawing Number</Label>
                <Input placeholder="DWG-XXXXX" className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.drawingNumber} onChange={(e) => handleUpdateField('drawingNumber', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Revision Status</Label>
                <Input placeholder="00" className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" value={formData.revisionNumber} onChange={(e) => handleUpdateField('revisionNumber', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Base Material</Label>
                <Input placeholder="e.g. Stainless Steel" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.material} onChange={(e) => handleUpdateField('material', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Technical Grade</Label>
                <Input placeholder="e.g. SS-304L" className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase" value={formData.materialGrade} onChange={(e) => handleUpdateField('materialGrade', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Net Weight (Kg)</Label>
                <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" value={formData.weight} onChange={(e) => handleUpdateField('weight', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Critical Tolerance</Label>
                <Input placeholder="± 0.005mm" className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" value={formData.tolerance} onChange={(e) => handleUpdateField('tolerance', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Target Industry</Label>
                <Input placeholder="e.g. Aerospace" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.industry} onChange={(e) => handleUpdateField('industry', e.target.value)} />
              </div>
            </div>
          </div>
        );

      case 4: // Manufacturing
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase text-[#001F3D] tracking-widest">Asset Node Requirements</Label>
              <div className="grid grid-cols-3 gap-6">
                {['VMC Required', 'CNC Turning Required', 'Surface Grinding Required', 'Assembly Required', 'Inspection Required'].map(req => (
                  <div key={req} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Checkbox id={req} onCheckedChange={(val) => {
                      const current = formData.machinesRequired || [];
                      handleUpdateField('machinesRequired', val ? [...current, req] : current.filter(r => r !== req));
                    }} checked={formData.machinesRequired?.includes(req)} />
                    <Label htmlFor={req} className="text-[10px] font-bold uppercase text-slate-600 cursor-pointer">{req.replace(' Required', '')}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Cycle Time (Sec)</Label>
                <Input type="number" className="h-16 bg-slate-50 border-none rounded-[1.5rem] font-display font-bold text-2xl text-primary text-center" value={formData.cycleTimeSec} onChange={(e) => handleUpdateField('cycleTimeSec', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Setup Time (Min)</Label>
                <Input type="number" className="h-16 bg-slate-50 border-none rounded-[1.5rem] font-display font-bold text-2xl text-slate-700 text-center" value={formData.setupTimeMin} onChange={(e) => handleUpdateField('setupTimeMin', e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Inspection (Min)</Label>
                <Input type="number" className="h-16 bg-slate-50 border-none rounded-[1.5rem] font-display font-bold text-2xl text-slate-700 text-center" value={formData.inspectionTimeMin} onChange={(e) => handleUpdateField('inspectionTimeMin', e.target.value)} />
              </div>
            </div>
          </div>
        );

      case 5: // Commercial
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Material Cost', key: 'materialCost' },
                { label: 'Machining Cost', key: 'machiningCost' },
                { label: 'Assembly Cost', key: 'assemblyCost' },
                { label: 'Inspection Cost', key: 'inspectionCost' },
                { label: 'Tooling Cost', key: 'toolingCost' },
                { label: 'Packaging Cost', key: 'packagingCost' },
              ].map(cost => (
                <div key={cost.key} className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">{cost.label}</Label>
                  <div className="relative">
                    <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl pl-10 font-bold" value={(formData as any)[cost.key]} onChange={(e) => handleUpdateField(cost.key as any, e.target.value)} />
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>

            <Card className="p-8 bg-[#001F3D] text-white rounded-[2.5rem] border-none shadow-2xl space-y-6 relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
               <div className="relative z-10 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Institutional Cost Center</p>
                    <h4 className="text-4xl font-display font-black text-primary tracking-tighter">₹ {formData.standardCost?.toLocaleString()}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-10 text-right">
                     <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-white/40 uppercase">Selling Price</Label>
                        <Input type="number" className="h-10 bg-white/5 border-white/10 text-emerald-400 font-display font-bold text-lg text-right" value={formData.sellingPrice} onChange={(e) => handleUpdateField('sellingPrice', e.target.value)} />
                     </div>
                     <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-white/40 uppercase">Margin (%)</Label>
                        <p className="text-2xl font-display font-bold text-white">{formData.marginPercent || 0}%</p>
                     </div>
                  </div>
               </div>
            </Card>
          </div>
        );

      case 6: // Market
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Annual Consumption Potential</Label>
                   <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.annualRequirement} onChange={(e) => handleUpdateField('annualRequirement', e.target.value)} />
                </div>
                <div className="space-y-3">
                   <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Forecast Growth Profile</Label>
                   <Select value={formData.forecastGrowth} onValueChange={(v) => handleUpdateField('forecastGrowth', v)}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue placeholder="Identify Momentum" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                         {['High Growth (>20%)', 'Stable (5-10%)', 'Cyclical', 'Declining'].map(g => <SelectItem key={g} value={g} className="text-[10px] font-bold uppercase">{g}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
             </div>
             <Card className="p-8 bg-slate-50 border-slate-200 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-6">
                   <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Competitive Intelligence</h4>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase">Primary Competitor Product</Label>
                      <Input className="h-11 bg-white border-slate-200 rounded-xl font-medium" value={formData.competitorProducts} onChange={(e) => handleUpdateField('competitorProducts', e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase">Competitor Pricing (₹)</Label>
                      <Input type="number" className="h-11 bg-white border-slate-200 rounded-xl font-bold font-display" value={formData.competitorPrice} onChange={(e) => handleUpdateField('competitorPrice', e.target.value)} />
                   </div>
                </div>
             </Card>
          </div>
        );

      case 7: // Outsourcing
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Outsourcing Percentage</Label>
                   <Input type="number" max={100} className="h-16 bg-slate-50 border-none rounded-[1.5rem] font-display font-bold text-2xl text-primary text-center" value={formData.outsourcedPercent} onChange={(e) => handleUpdateField('outsourcedPercent', e.target.value)} />
                </div>
                <div className="space-y-3">
                   <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Est. Annual External Spend</Label>
                   <Input type="number" className="h-16 bg-slate-50 border-none rounded-[1.5rem] font-display font-bold text-2xl text-slate-700 text-center" value={formData.annualOutsourcingValue} onChange={(e) => handleUpdateField('annualOutsourcingValue', e.target.value)} />
                </div>
             </div>
             <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase text-[#001F3D] tracking-widest">Strategic Reason for Outsourcing</Label>
                <div className="grid grid-cols-2 gap-4">
                   {['Machine Not Available', 'Internal Capacity Full', 'Special Process Required', 'Commercial Advantage'].map(reason => (
                     <div key={reason} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Checkbox id={reason} onCheckedChange={(val) => {
                          const current = formData.outsourcingReason || [];
                          handleUpdateField('outsourcingReason', val ? [...current, reason] : current.filter(r => r !== reason));
                        }} checked={formData.outsourcingReason?.includes(reason)} />
                        <Label htmlFor={reason} className="text-[10px] font-bold uppercase text-slate-600 cursor-pointer">{reason}</Label>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );

      case 8: // Partners
        return (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Primary Supply Chain Node</Label>
                   <Select onValueChange={(v) => handleUpdateField('primaryVendorId', v)}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue placeholder="Identify Primary Vendor..." /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl">
                         {vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase py-3">{v.name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-3">
                   <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Average Lead Time (Days)</Label>
                   <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" value={formData.leadTimeDays} onChange={(e) => handleUpdateField('leadTimeDays', e.target.value)} />
                </div>
             </div>
             <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
                   <div>
                      <h4 className="text-lg font-bold text-slate-900 uppercase">Vendor Quality Rating</h4>
                      <p className="text-xs text-slate-400 font-medium">Auto-derived from institutional receipt history.</p>
                   </div>
                </div>
                <span className="text-4xl font-display font-black text-emerald-600">4.8 / 5.0</span>
             </Card>
          </div>
        );

      case 9: // BOM
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {['Assembly', 'Finished Product'].includes(formData.type || '') ? (
              <>
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-widest">Bill of Materials Protocol</h3></div>
                   <Button variant="outline" size="sm" className="rounded-xl text-[9px] font-bold uppercase gap-2" onClick={() => {
                     const current = formData.bom || [];
                     handleUpdateField('bom', [...current, { id: Date.now().toString(), componentId: '', name: '', qty: 1, cost: 0 }]);
                   }}><Plus className="h-3 w-3" /> Append Component</Button>
                </div>
                <Card className="overflow-hidden border border-slate-100 rounded-3xl shadow-inner">
                   <Table>
                      <TableHeader className="bg-slate-50">
                         <TableRow><TableHead className="py-4 px-6 text-[9px] font-black uppercase">Component Node</TableHead><TableHead className="text-center text-[9px] font-black uppercase">Quantity</TableHead><TableHead className="text-right text-[9px] font-black uppercase">Unit Cost</TableHead><TableHead className="w-16"></TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                         {(formData.bom || []).map((item, idx) => (
                           <TableRow key={item.id} className="h-16 border-b border-slate-50">
                              <TableCell className="px-6">
                                 <Select value={item.componentId} onValueChange={(v) => {
                                   const comp = products.find(p => p.id === v);
                                   const updated = [...(formData.bom || [])];
                                   updated[idx] = { ...updated[idx], componentId: v, name: comp?.name || '', cost: comp?.standardCost || 0 };
                                   handleUpdateField('bom', updated);
                                 }}>
                                    <SelectTrigger className="border-none bg-transparent h-10 font-bold uppercase text-[10px] shadow-none"><SelectValue placeholder="Identify Part..." /></SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-2xl">{products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-2">{p.name}</SelectItem>)}</SelectContent>
                                 </Select>
                              </TableCell>
                              <TableCell className="text-center">
                                 <Input type="number" className="h-10 w-24 mx-auto text-center border-none bg-slate-50 font-bold rounded-lg" value={item.qty} onChange={(e) => {
                                   const updated = [...(formData.bom || [])];
                                   updated[idx].qty = Number(e.target.value);
                                   handleUpdateField('bom', updated);
                                 }} />
                              </TableCell>
                              <TableCell className="text-right">
                                 <span className="text-xs font-display font-bold text-primary">₹ {item.cost.toLocaleString()}</span>
                              </TableCell>
                              <TableCell className="text-right px-6">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => {
                                   const updated = (formData.bom || []).filter(b => b.id !== item.id);
                                   handleUpdateField('bom', updated);
                                 }}><Trash2 className="h-4 w-4" /></Button>
                              </TableCell>
                           </TableRow>
                         ))}
                         {(formData.bom || []).length === 0 && (
                           <TableRow><TableCell colSpan={4} className="h-40 text-center opacity-30 text-[10px] font-bold uppercase italic">BOM matrix empty.</TableCell></TableRow>
                         )}
                      </TableBody>
                   </Table>
                </Card>
              </>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center opacity-30 text-center">
                 <ShieldAlert className="h-20 w-20 text-slate-300 mb-6" />
                 <h4 className="text-xl font-display font-bold uppercase tracking-tight">Non-Assembly Node</h4>
                 <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto font-medium">BOM protocol is bypassed for {formData.type} classifications. Only Finished Products or Assemblies require component mapping.</p>
              </div>
            )}
          </div>
        );

      case 10: // Review
        return (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 bg-slate-50 border-slate-200 rounded-3xl space-y-6">
                   <div className="flex justify-between items-center border-b pb-4"><h5 className="text-[10px] font-black uppercase text-slate-400">Technical Identity</h5><Badge variant="outline" className="bg-white border-slate-200 font-bold uppercase text-[8px]">{formData.code}</Badge></div>
                   <div className="grid grid-cols-2 gap-y-4">
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Product Name</p><p className="text-sm font-bold text-slate-800 uppercase">{formData.name}</p></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Drawing / Rev</p><p className="text-sm font-code font-bold text-primary uppercase">{formData.drawingNumber} [R{formData.revisionNumber}]</p></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Material / Grade</p><p className="text-sm font-bold text-slate-800 uppercase">{formData.material} • {formData.materialGrade}</p></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">HSN Code</p><p className="text-sm font-code font-bold text-slate-800 uppercase">{formData.hsn}</p></div>
                   </div>
                </Card>
                <Card className="p-8 bg-[#001F3D] text-white rounded-3xl border-none shadow-2xl space-y-6 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '30px 30px' }} />
                   <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-end"><div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">Standard Cost</p><p className="text-4xl font-display font-black text-primary">₹ {formData.standardCost?.toLocaleString()}</p></div><div className="text-right space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">Yield Margin</p><p className="text-4xl font-display font-black text-emerald-400">{formData.marginPercent}%</p></div></div>
                      <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
                         <div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">BOM Integrity</p><p className="text-xs font-bold uppercase">{(formData.bom || []).length} Components Synced</p></div>
                         <div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">Lead Time</p><p className="text-xs font-bold uppercase">{formData.leadTimeDays || '0'} Operational Days</p></div>
                      </div>
                   </div>
                </Card>
             </div>
             <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-6 animate-pulse">
                <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20"><ShieldCheck className="h-6 w-6" /></div>
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-tight">Institutional Fidelity Verified. Ready for master ledger commit.</p>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Box className="h-4 w-4" />
            Institutional Product registry
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D] uppercase">Product <span className="text-slate-400 font-medium">Intelligence</span></h2>
        </div>
        <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleOpenWizard}>
          <Plus className="h-4 w-4" /> Initialize Product Node
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
        {[
          { label: 'Total Products', val: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Matrix', val: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Manufacturing', val: stats.manufacturing, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Electricals', val: stats.electrical, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-4">{kpi.label}</p>
            <p className={cn("text-3xl font-display font-black", kpi.color)}>{kpi.val}</p>
          </Card>
        ))}
      </div>

      <div className="relative px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search Code, Name or Technical Specification..." 
          className="h-14 pl-14 bg-white border-slate-200 rounded-2xl font-bold uppercase text-[10px] shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden border-none bg-white shadow-2xl rounded-[2rem]">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Identity Code</TableHead>
              <TableHead className="font-bold text-[9px] uppercase text-slate-400">Product Name</TableHead>
              <TableHead className="font-bold text-[9px] uppercase text-slate-400">Classification</TableHead>
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
                <TableCell><Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-100">{p.type}</Badge></TableCell>
                <TableCell className="text-right font-display font-bold text-sm">₹ {p.standardCost?.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Badge className={cn("text-[8px] font-bold uppercase px-3 py-1 rounded-full", p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-10">
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary transition-all group-hover:translate-x-1"><ChevronRight className="h-5 w-5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-slate-900 p-10 border-r border-slate-800 flex flex-col justify-between shrink-0">
              <div className="space-y-12">
                <div className="p-4 bg-primary rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20 relative">
                  <Box className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {ONBOARDING_STEPS.map((s) => {
                    const SIcon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-6 group cursor-pointer relative" onClick={() => setWizardStep(s.id)}>
                        {s.id < 10 && (
                          <div className={cn(
                            "absolute left-4 top-8 w-[1px] h-6 transition-colors",
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
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", wizardStep === s.id ? "text-white" : "text-slate-500")}>{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">PROD_REG_v2.4</p>
            </div>

            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <header className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  {(() => {
                    const CurrentStepIcon = ONBOARDING_STEPS[wizardStep - 1].icon;
                    return <div className="p-4 bg-slate-50 rounded-2xl text-[#001F3D]"><CurrentStepIcon className="h-8 w-8" /></div>;
                  })()}
                  <div>
                    <h3 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{ONBOARDING_STEPS[wizardStep - 1].label}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Onboarding Protocol • Step {wizardStep} of 10</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full text-slate-300 hover:text-red-500"><X className="h-6 w-6" /></Button>
              </header>

              <ScrollArea className="flex-1 p-12">
                 <div className="max-w-3xl mx-auto">
                    {renderStepContent()}
                 </div>
              </ScrollArea>

              <footer className="p-8 border-t border-slate-100 flex justify-between bg-white shrink-0">
                <Button variant="ghost" disabled={wizardStep === 1} className="rounded-xl h-12 px-8 font-bold uppercase text-[10px] text-slate-400" onClick={() => setWizardStep(s => s - 1)}><ChevronLeft className="mr-2 h-4 w-4" /> Previous Matrix</Button>
                <div className="flex gap-4">
                  <Button variant="ghost" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px] text-slate-400" onClick={() => setIsWizardOpen(false)}>Abort</Button>
                  <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-12 font-bold uppercase text-[10px] shadow-xl flex gap-3 group" onClick={() => wizardStep === 10 ? handleFinishWizard() : setWizardStep(s => s + 1)}>
                    {wizardStep === 10 ? 'Commit to Registry' : 'Execute Next Step'} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
