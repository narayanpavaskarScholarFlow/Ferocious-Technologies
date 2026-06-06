
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Landmark, 
  FileText, 
  Target, 
  PieChart as PieIcon, 
  LineChart as LineIcon,
  ImageIcon, 
  Layout, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  TrendingUp,
  DollarSign,
  Briefcase,
  Factory,
  Cpu,
  Save,
  Upload,
  BarChart3,
  Box,
  Tags,
  Compass,
  Rocket,
  ShieldCheck,
  Building2,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

const CHART_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

interface ProprietaryProduct {
  id: string;
  name: string;
  market: string;
  price: string;
  imageUrl: string;
}

export function LoanProjectHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');

  // 01. Input Matrix State
  const [checklist, setChecklist] = useState({
    firmProfile: true,
    aboutProject: true,
    aboutUs: true,
    vision: true,
    mission: true,
    objectives: true,
    marketAnalysis: false,
    machineList: false,
    financialProjections: false,
    licenseGst: false,
  });

  const [foundationalData, setFormData] = useState({
    projectName: 'Precision VMC Machining & Tool Room Hub',
    promoterName: 'Ferocious Tech Strategy Team',
    location: 'Pune, Maharashtra',
    totalLoanRequirement: '50,00,000',
    aboutProject: 'A specialized facility designed to scale the production of proprietary high-precision components and provide high-fidelity VMC machining services to Tier 1 aerospace and automotive clients.',
    aboutUs: 'Ferocious Tech is an emerging industrial leader in precision engineering, focused on technical excellence and automated manufacturing protocols.',
    vision: 'To establish Ferocious Tech as the global benchmark for precision machining and innovative industrial tool-room solutions.',
    mission: 'Providing exceptional technical value through specialized engineering, uncompromising quality releases, and innovative product development.',
  });

  // 02. Product Line State
  const [proprietaryProducts, setProprietaryProducts] = useState<ProprietaryProduct[]>([
    { 
      id: '1', 
      name: 'Precision Curved Conduit Connector', 
      market: 'Electrical / Construction', 
      price: '45.00',
      imageUrl: 'https://picsum.photos/seed/conduit/600/400' 
    },
    { 
      id: '2', 
      name: 'VMC Machined Engine Plate', 
      market: 'Automotive Tier 1', 
      price: '1,800.00',
      imageUrl: 'https://picsum.photos/seed/engineplate/600/400' 
    },
  ]);

  const [services, setServices] = useState([
    { id: '1', name: 'VMC Custom Machining', capacity: '2000 hours/year' },
    { id: '2', name: 'Mould Design & Fabrication', capacity: '12 moulds/year' },
  ]);

  // 03. Financial Data State
  const [financials, setFinancials] = useState({
    capitalInvestment: 8000000,
    workingCapital: 2000000,
    projectedMonthlyRevenue: 1500000,
    projectedMonthlyExpense: 800000,
  });

  const financialChartData = useMemo(() => [
    { name: 'Fixed Assets', value: financials.capitalInvestment },
    { name: 'Working Cap', value: financials.workingCapital },
  ], [financials]);

  const pnlChartData = useMemo(() => [
    { month: 'Month 1', rev: financials.projectedMonthlyRevenue * 0.7, exp: financials.projectedMonthlyExpense },
    { month: 'Month 2', rev: financials.projectedMonthlyRevenue * 0.85, exp: financials.projectedMonthlyExpense },
    { month: 'Month 3', rev: financials.projectedMonthlyRevenue, exp: financials.projectedMonthlyExpense },
    { month: 'Month 4', rev: financials.projectedMonthlyRevenue * 1.1, exp: financials.projectedMonthlyExpense },
  ], [financials]);

  const handleAddProduct = () => setProprietaryProducts([...proprietaryProducts, { 
    id: Date.now().toString(), 
    name: '', 
    market: '', 
    price: '0.00', 
    imageUrl: 'https://picsum.photos/seed/default/600/400' 
  }]);
  const handleAddService = () => setServices([...services, { id: Date.now().toString(), name: '', capacity: '' }]);

  const updateProduct = (idx: number, field: keyof ProprietaryProduct, value: string) => {
    const newP = [...proprietaryProducts];
    newP[idx] = { ...newP[idx], [field]: value };
    setProprietaryProducts(newP);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 print:hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Landmark className="h-4 w-4" />
            Bank Loan Strategy Protocol
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            Project <span className="text-slate-400 font-medium">Architect</span>
          </h2>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Generating high-fidelity feasibility studies for financial institutions.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 rounded-xl border-slate-200 px-8 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm" onClick={() => window.print()}>
             <Printer className="h-4 w-4" /> Print Protocol
           </Button>
           <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3">
             <Save className="h-4 w-4" /> Commit Strategy
           </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:block">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2 print:hidden">
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">
            01. Input Matrix
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">
            02. Product Line
          </TabsTrigger>
          <TabsTrigger value="financials" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">
            03. Financials
          </TabsTrigger>
          <TabsTrigger value="visuals" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">
            04. Design Matrix
          </TabsTrigger>
          <TabsTrigger value="display" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">
            05. Final Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500 print:hidden">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-12">
                 <div className="space-y-10">
                    <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                       <div className="p-3 bg-primary/10 rounded-2xl text-primary"><FileText className="h-6 w-6" /></div>
                       <div>
                          <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Project Foundational Identity</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Primary metadata for the feasibility ledger.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Proposed Project Name</Label>
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.projectName} onChange={(e)=>updateField('projectName', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Promoter / Applicant Node</Label>
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.promoterName} onChange={(e)=>updateField('promoterName', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Proposed Operational Base (Location)</Label>
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.location} onChange={(e)=>updateField('location', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Loan Capital Requirement (₹)</Label>
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold text-primary text-xl font-display" value={foundationalData.totalLoanRequirement} onChange={(e)=>updateField('totalLoanRequirement', e.target.value)} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-10 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
                       <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Target className="h-6 w-6" /></div>
                       <div>
                          <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Strategic Narrative Hub</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed organizational and functional descriptors.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">About Project</Label>
                          <Textarea 
                            className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                            placeholder="Detailed technical description of the proposed project..."
                            value={foundationalData.aboutProject}
                            onChange={(e) => updateField('aboutProject', e.target.value)}
                          />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">About Us (Firm Profile)</Label>
                          <Textarea 
                            className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                            placeholder="History, technical expertise, and team pedigree..."
                            value={foundationalData.aboutUs}
                            onChange={(e) => updateField('aboutUs', e.target.value)}
                          />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Vision Statement</Label>
                             <Textarea 
                               className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                               placeholder="The long-term aspiration and target node..."
                               value={foundationalData.vision}
                               onChange={(e) => updateField('vision', e.target.value)}
                             />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Mission Statement</Label>
                             <Textarea 
                               className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                               placeholder="Primary functional purpose and core protocols..."
                               value={foundationalData.mission}
                               onChange={(e) => updateField('mission', e.target.value)}
                             />
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>

              <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden h-fit sticky top-24">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                 <div className="relative z-10 space-y-8">
                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40">Report Composition Matrix</h3>
                    <div className="space-y-4">
                       {Object.entries(checklist).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setChecklist({...checklist, [key]: !val})}>
                             <Checkbox checked={val} className="border-white/20 data-[state=checked]:bg-primary" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{key.replace(/([A-Z])/g, ' $1')}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="products" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500 print:hidden">
           <div className="grid grid-cols-1 gap-8">
              <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                 <div className="flex justify-between items-center border-l-4 border-primary pl-6">
                    <div>
                       <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Proprietary Product Matrix</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Industrial items designed and manufactured for market introduction.</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-primary font-bold text-[9px] uppercase hover:bg-primary/5" onClick={handleAddProduct}>
                       <Plus className="h-4 w-4 mr-2" /> Append New Item
                    </Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {proprietaryProducts.map((p, idx) => (
                       <div key={p.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col gap-6 group hover:border-primary/20 transition-all">
                          <div className="flex gap-4">
                             <div className="h-24 w-24 rounded-2xl overflow-hidden border border-white shadow-md relative shrink-0">
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                             </div>
                             <div className="flex-1 space-y-3">
                                <Input placeholder="Product Name..." className="bg-white border-none h-11 text-xs font-bold" value={p.name} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                                <Input placeholder="Target Market Sector..." className="bg-white border-none h-11 text-[10px] font-medium" value={p.market} onChange={(e) => updateProduct(idx, 'market', e.target.value)} />
                             </div>
                          </div>
                          <div className="flex gap-4 items-end">
                             <div className="flex-1 space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Unit Price (₹)</Label>
                                <div className="relative">
                                   <Input placeholder="0.00" className="bg-white border-none h-11 text-sm font-display font-bold pl-8" value={p.price} onChange={(e) => updateProduct(idx, 'price', e.target.value)} />
                                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                                </div>
                             </div>
                             <div className="flex-1 space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Image Artifact URL</Label>
                                <Input placeholder="URL..." className="bg-white border-none h-11 text-[9px] font-code" value={p.imageUrl} onChange={(e) => updateProduct(idx, 'imageUrl', e.target.value)} />
                             </div>
                             <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => setProprietaryProducts(proprietaryProducts.filter(i => i.id !== p.id))}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

              <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                 <div className="flex justify-between items-center border-l-4 border-accent pl-6">
                    <div>
                       <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Industrial Services Matrix</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">B2B Job-work and tool-room manufacturing capacities.</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-accent font-bold text-[9px] uppercase hover:bg-accent/5" onClick={handleAddService}>
                       <Plus className="h-4 w-4 mr-2" /> Add Service Node
                    </Button>
                 </div>
                 <div className="space-y-4">
                    {services.map((s, idx) => (
                       <div key={s.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl group">
                          <Input placeholder="Service Description..." className="bg-white border-none h-12 text-xs font-bold" value={s.name} onChange={(e) => {
                             const newS = [...services];
                             newS[idx].name = e.target.value;
                             setServices(newS);
                          }} />
                          <Input placeholder="Annual Capacity Output..." className="bg-white border-none h-12 text-xs font-bold" value={s.capacity} onChange={(e) => {
                             const newS = [...services];
                             newS[idx].capacity = e.target.value;
                             setServices(newS);
                          }} />
                          <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => setServices(services.filter(i => i.id !== s.id))}><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500 print:hidden">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-4 p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                 <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] border-l-4 border-primary pl-4">Valuation Matrix</h3>
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Fixed Capital (Machinery/Land)</Label>
                       <div className="relative">
                          <Input type="number" className="h-16 bg-slate-50 border-none rounded-2xl text-2xl font-display font-bold text-[#001F3D] pl-10 shadow-inner" value={financials.capitalInvestment} onChange={(e)=>setFinancials({...financials, capitalInvestment: Number(e.target.value)})} />
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Working Capital Reserve</Label>
                       <div className="relative">
                          <Input type="number" className="h-16 bg-slate-50 border-none rounded-2xl text-2xl font-display font-bold text-[#001F3D] pl-10 shadow-inner" value={financials.workingCapital} onChange={(e)=>setFinancials({...financials, workingCapital: Number(e.target.value)})} />
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Proj. Monthly Revenue</Label>
                       <div className="relative">
                          <Input type="number" className="h-16 bg-emerald-50 text-emerald-700 border-none rounded-2xl text-2xl font-display font-bold pl-10 shadow-inner" value={financials.projectedMonthlyRevenue} onChange={(e)=>setFinancials({...financials, projectedMonthlyRevenue: Number(e.target.value)})} />
                          <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-300" />
                       </div>
                    </div>
                 </div>
              </Card>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col items-center gap-6">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Asset Allocation Matrix</h4>
                    <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie data={financialChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {financialChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                             </Pie>
                             <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6">
                       {financialChartData.map((item, i) => (
                          <div key={item.name} className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                             <span className="text-[9px] font-bold uppercase text-slate-400">{item.name}</span>
                          </div>
                       ))}
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col gap-6">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Revenue Projections (90-Day Sync)</h4>
                    <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={pnlChartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                             <YAxis hide />
                             <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', shadow: 'none' }} />
                             <Bar dataKey="rev" fill="#6366f1" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="exp" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="visuals" className="m-0 animate-in slide-in-from-bottom-2 duration-500 print:hidden">
           <Card className="p-20 flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50 text-center group hover:bg-white hover:border-primary/20 transition-all">
              <div className="p-8 bg-white rounded-3xl shadow-xl mb-6 group-hover:scale-110 transition-transform"><ImageIcon className="h-16 w-16 text-primary" /></div>
              <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Visual Artifact Registry</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm">Upload high-resolution photography of machining assets, existing products, and strategic workshop layouts for bank inspection.</p>
              <Button className="mt-8 h-12 px-10 rounded-xl bg-[#001F3D] font-bold uppercase text-[10px] tracking-widest gap-3 shadow-xl">
                 <Upload className="h-4 w-4" /> Initialize Upload Protocol
              </Button>
           </Card>
        </TabsContent>

        <TabsContent value="display" className="m-0 animate-in zoom-in-95 duration-700 print:p-0">
           <Card className="p-16 md:p-20 bg-white border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] max-w-[1000px] mx-auto space-y-16 print:shadow-none print:border-none print:max-w-none print:p-0">
              {/* Cover Page */}
              <div className="text-center space-y-8 border-b-2 border-[#001F3D] pb-16">
                 <div className="flex justify-center mb-10">
                    <div className="p-5 bg-[#001F3D] rounded-[2rem] shadow-2xl"><Landmark className="h-12 w-12 text-white" /></div>
                 </div>
                 <h1 className="text-5xl font-display font-bold tracking-tighter text-[#001F3D] uppercase leading-none">Project Feasibility Report</h1>
                 <p className="text-xl font-headline font-bold text-slate-400 uppercase tracking-[0.4em]">{foundationalData.projectName}</p>
                 <div className="pt-10 flex flex-col items-center gap-2">
                    <Badge className="bg-primary text-white border-none px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Master Strategy Matrix v2.4</Badge>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-4">Submitted by: <span className="text-[#001F3D]">{foundationalData.promoterName}</span></p>
                 </div>
              </div>

              {/* Strategic Narrative Hub (New) */}
              <div className="space-y-12">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Strategic Narrative</h4>
                 
                 <div className="grid grid-cols-1 gap-10">
                    {checklist.aboutProject && (
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                           <Rocket className="h-4 w-4 text-[#001F3D]" />
                           <h5 className="text-sm font-bold text-[#001F3D] uppercase tracking-wider">About Project</h5>
                         </div>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed indent-8">{foundationalData.aboutProject}</p>
                      </div>
                    )}
                    
                    {checklist.aboutUs && (
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                           <Building2 className="h-4 w-4 text-[#001F3D]" />
                           <h5 className="text-sm font-bold text-[#001F3D] uppercase tracking-wider">About Us</h5>
                         </div>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed indent-8">{foundationalData.aboutUs}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {checklist.vision && (
                         <div className="p-8 bg-[#001F3D] text-white rounded-[2rem] space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Compass className="h-10 w-10" /></div>
                            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Vision Node</h5>
                            <p className="text-xs font-bold leading-relaxed">{foundationalData.vision}</p>
                         </div>
                       )}
                       {checklist.mission && (
                         <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck className="h-10 w-10 text-[#001F3D]" /></div>
                            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Mission Protocol</h5>
                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{foundationalData.mission}</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Summary Ledger */}
              <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Firm Profile Summary</h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center py-3 border-b border-slate-50"><span className="text-[9px] font-bold text-slate-400 uppercase">Entity ID</span><span className="text-xs font-bold text-slate-800">FEROCIOUS_TECH_OP_1</span></div>
                       <div className="flex justify-between items-center py-3 border-b border-slate-50"><span className="text-[9px] font-bold text-slate-400 uppercase">Location Node</span><span className="text-xs font-bold text-slate-800">{foundationalData.location}</span></div>
                       <div className="flex justify-between items-center py-3 border-b border-slate-50"><span className="text-[9px] font-bold text-slate-400 uppercase">Strategic Lead</span><span className="text-xs font-bold text-slate-800">{foundationalData.promoterName}</span></div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Valuation Summary</h4>
                    <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Loan Requirement</p>
                       <p className="text-4xl font-display font-bold text-[#001F3D]">₹ {foundationalData.totalLoanRequirement}</p>
                       <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-white font-bold text-[8px] uppercase">ROI Yield Sync: 84%</Badge>
                    </div>
                 </div>
              </div>

              {/* Proprietary Product Catalog */}
              <div className="space-y-8">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Proprietary Product Portfolio</h4>
                 <div className="grid grid-cols-2 gap-6">
                    {proprietaryProducts.map(p => (
                       <Card key={p.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex gap-6 items-center shadow-sm">
                          <div className="h-24 w-24 rounded-2xl overflow-hidden relative border shadow-inner shrink-0">
                             <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 space-y-2">
                             <h5 className="text-sm font-bold text-[#001F3D] uppercase tracking-tight line-clamp-1">{p.name || 'Undefined Node'}</h5>
                             <div className="flex items-center gap-2">
                                <Box className="h-3 w-3 text-slate-300" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{p.market}</span>
                             </div>
                             <div className="flex items-center gap-2 pt-2">
                                <Tags className="h-3 w-3 text-primary" />
                                <span className="text-sm font-display font-bold text-primary">₹ {p.price} / unit</span>
                             </div>
                          </div>
                       </Card>
                    ))}
                 </div>
              </div>

              {/* Industrial Services Matrix */}
              <div className="space-y-8">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent border-l-4 border-accent pl-4">Manufacturing Service Nodes</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map(s => (
                       <div key={s.id} className="p-6 bg-[#001F3D] text-white rounded-3xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Cpu className="h-10 w-10" /></div>
                          <p className="text-[8px] font-bold uppercase text-white/40 mb-2">Service ID: {s.id}</p>
                          <h5 className="text-sm font-bold uppercase tracking-tight">{s.name || 'Protocol Neutral'}</h5>
                          <p className="text-[10px] font-bold text-primary mt-3 uppercase tracking-widest">Capacity: {s.capacity}</p>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-24 border-t border-slate-100 flex justify-between items-end italic opacity-40 text-[9px] font-bold uppercase tracking-widest">
                 <span>Ferocious Tech Strategy Protocol</span>
                 <span>Generated via Architect Matrix v2.4</span>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
