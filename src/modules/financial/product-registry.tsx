
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
  Info,
  Upload
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
    switch (wizardStep) {
      case 1:
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
      case 2:
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
          </div>
        );
      case 10:
        return (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 bg-slate-50 border-slate-200 rounded-3xl space-y-6">
                   <div className="flex justify-between items-center border-b pb-4"><h5 className="text-[10px] font-black uppercase text-slate-400">Technical Identity</h5><Badge variant="outline" className="bg-white border-slate-200 font-bold uppercase text-[8px]">{formData.code}</Badge></div>
                   <div className="grid grid-cols-2 gap-y-4">
                      <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Product Name</p><p className="text-sm font-bold text-slate-800 uppercase">{formData.name}</p></div>
                   </div>
                </Card>
             </div>
          </div>
        );
      default:
        return <div className="py-20 text-center opacity-30 uppercase font-bold text-xs tracking-widest">Matrix Segment v2.4 Construction...</div>;
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

      <Card className="overflow-hidden border-none bg-white shadow-2xl rounded-[2rem]">
        <Table>
          <TableHeader className="bg-slate-50/80">
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
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Product Onboarding Wizard</DialogTitle>
            <DialogDescription>Step-by-step institutional product registration matrix.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-slate-900 p-10 border-r border-slate-800 flex flex-col justify-between shrink-0">
              <div className="space-y-12">
                <div className="p-4 bg-primary rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20 relative">
                  <Box className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {ONBOARDING_STEPS.map((s) => (
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
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", wizardStep === s.id ? "text-white" : "text-slate-500")}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">PROD_REG_v2.4</p>
            </div>

            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <header className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
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
