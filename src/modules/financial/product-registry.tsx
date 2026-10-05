
"use client";

import { useState, useMemo } from 'react';
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
  LayoutGrid,
  Settings2,
  Info,
  Maximize2
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

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(p => p.status === 'Active').length,
      manufacturing: products.filter(p => p.businessUnit === 'Manufacturing').length,
      electrical: products.filter(p => p.businessUnit === 'Electricals').length,
    };
  }, [products]);

  const handleOpenWizard = () => {
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleFinishWizard = () => {
    toast({ title: "Product Node Committed", description: "Identity matrix synchronized with master registry." });
    setIsWizardOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
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
              <TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Standard Rate</TableHead>
              <TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">Status</TableHead>
              <TableHead className="text-right px-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(p => (
              <TableRow key={p.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all">
                <TableCell className="px-10 font-code font-bold text-xs text-primary">{p.code}</TableCell>
                <TableCell><span className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{p.name}</span></TableCell>
                <TableCell><Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-100">{p.type}</Badge></TableCell>
                <TableCell className="text-right font-display font-bold text-sm">₹ {p.saleRate.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Badge className={cn("text-[8px] font-bold uppercase px-3 py-1 rounded-full", p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-10">
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow><TableCell colSpan={6} className="h-40 text-center opacity-30 text-[10px] font-bold uppercase italic">No product nodes discovered.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 10-STEP PRODUCT WIZARD */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-slate-900 p-10 border-r border-slate-800 flex flex-col justify-between shrink-0">
              <div className="space-y-12">
                <div className="p-4 bg-primary rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20">
                  <Box className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-6">
                  {ONBOARDING_STEPS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-6 group cursor-pointer" onClick={() => setWizardStep(s.id)}>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500",
                          wizardStep === s.id ? "bg-white border-white text-slate-900 scale-125" : 
                          wizardStep > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                        )}>
                          {wizardStep > s.id ? <Check className="h-4 w-4" /> : s.id}
                        </div>
                        <div className="flex flex-col">
                          <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", wizardStep === s.id ? "text-white" : "text-slate-500")}>{s.label}</span>
                          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{s.desc}</span>
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
                    const CurrentIcon = ONBOARDING_STEPS[wizardStep - 1].icon;
                    return <div className="p-4 bg-slate-50 rounded-2xl text-[#001F3D]"><CurrentIcon className="h-8 w-8" /></div>;
                  })()}
                  <div>
                    <h3 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{ONBOARDING_STEPS[wizardStep - 1].label}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Step {wizardStep} of 10 • Protocol Initialization</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsWizardOpen(false)} className="rounded-full text-slate-300 hover:text-red-500"><X className="h-6 w-6" /></Button>
              </header>

              <ScrollArea className="flex-1 p-12">
                 <div className="max-w-3xl mx-auto space-y-12">
                    {wizardStep === 1 && (
                       <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                          <Label className="text-[10px] font-black uppercase text-[#001F3D] tracking-widest">Business Unit Identification</Label>
                          <RadioGroup defaultValue="Manufacturing" className="grid grid-cols-2 gap-6">
                             {['Manufacturing', 'Electricals'].map(bu => (
                               <Label key={bu} className="p-10 rounded-[2rem] border-2 border-slate-100 bg-slate-50 hover:border-primary transition-all cursor-pointer flex flex-col items-center gap-4 text-center">
                                  <RadioGroupItem value={bu} className="sr-only" />
                                  <Building2 className="h-10 w-10 mb-2" />
                                  <span className="text-xs font-black uppercase">{bu}</span>
                               </Label>
                             ))}
                          </RadioGroup>
                       </div>
                    )}
                    {wizardStep > 1 && (
                       <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                          <Maximize2 className="h-16 w-16 mb-4" />
                          <p className="text-sm font-bold uppercase tracking-widest">Awaiting Technical Input Nodes...</p>
                       </div>
                    )}
                 </div>
              </ScrollArea>

              <footer className="p-8 border-t border-slate-100 flex justify-between bg-white shrink-0">
                <Button variant="ghost" disabled={wizardStep === 1} className="rounded-xl h-12 px-8 font-bold uppercase text-[10px]" onClick={() => setWizardStep(s => s - 1)}>Back</Button>
                <div className="flex gap-4">
                  <Button variant="ghost" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px] text-slate-400" onClick={() => setIsWizardOpen(false)}>Abort</Button>
                  <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-12 font-bold uppercase text-[10px] shadow-xl flex gap-3 group" onClick={() => wizardStep === 10 ? handleFinishWizard() : setWizardStep(s => s + 1)}>
                    {wizardStep === 10 ? 'Commit to Registry' : 'Next Step'} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
