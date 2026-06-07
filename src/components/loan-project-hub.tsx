"use client";

import { useState, useMemo, useEffect } from 'react';
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
  History,
  FileCheck,
  Zap,
  Info,
  UserCircle,
  GraduationCap,
  Award,
  Shield,
  Layers
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
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const CHART_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

interface ProprietaryProduct {
  id: string;
  name: string;
  market: string;
  price: string;
  annualTargetQty: string;
  imageUrl: string;
}

interface IndustrialService {
  id: string;
  name: string;
  description: string;
  price: string;
  annualTargetQty: string;
  imageUrl: string;
}

interface LoanProjectHubProps {
  brandLogo?: string;
}

export function LoanProjectHub({ brandLogo = '' }: LoanProjectHubProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');

  // Firestore Persistence Node
  const strategyRef = useMemoFirebase(() => doc(db, 'settings', 'loan_strategy'), [db]);
  const { data: savedStrategy } = useDoc<any>(strategyRef);

  // 01. Input Matrix State
  const [checklist, setChecklist] = useState({
    aboutProject: true,
    aboutUs: true,
    vision: true,
    mission: true,
    entrepreneurDetails: true,
    productLine: true,
    services: true,
    financialProjections: true,
    machineList: true,
    licenseGst: true,
  });

  const [foundationalData, setFormData] = useState({
    projectName: 'Precision VMC Machining & Tool Room Hub',
    promoterName: 'Jayant Patil',
    location: 'Pune, Maharashtra',
    totalLoanRequirement: '50,00,000',
    aboutProject: 'A specialized facility designed to scale the production of proprietary high-precision components and provide high-fidelity VMC machining services to Tier 1 aerospace and automotive clients.',
    aboutUs: 'Ferocious Tech is an emerging industrial leader in precision engineering, focused on technical excellence and automated manufacturing protocols.',
    vision: 'To establish Ferocious Tech as the global benchmark for precision machining and innovative industrial tool-room solutions.',
    mission: 'Providing exceptional technical value through specialized engineering, uncompromising quality releases, and innovative product development.',
    qualification: 'B.E. Mechanical / MBA Operations',
    experience: '15+ Years in Tool Room & VMC Operations',
    promoterNarrative: 'Highly technical leadership with a proven track record in precision engineering and industrial process automation. Dedicated to establishing excellence in VMC machining protocols.',
    gstNumber: '27AAAAA0000A1Z5',
    msmeNumber: 'UDYAM-MH-00-0000000',
  });

  // 02. Product Line State
  const [proprietaryProducts, setProprietaryProducts] = useState<ProprietaryProduct[]>([
    { 
      id: '1', 
      name: 'Precision Curved Conduit Connector', 
      market: 'Electrical / Construction', 
      price: '45.00',
      annualTargetQty: '50,000',
      imageUrl: 'https://picsum.photos/seed/conduit/600/400' 
    },
    { 
      id: '2', 
      name: 'VMC Machined Engine Plate', 
      market: 'Automotive Tier 1', 
      price: '1,800.00',
      annualTargetQty: '1,200',
      imageUrl: 'https://picsum.photos/seed/engineplate/600/400' 
    },
  ]);

  const [industrialServices, setIndustrialServices] = useState<IndustrialService[]>([
    { 
      id: 'S1', 
      name: 'High-Precision VMC Job-Work', 
      description: 'Specialized 3-axis and 4-axis VMC machining services for complex aerospace geometries.', 
      price: '1,250.00',
      annualTargetQty: '2,500 Hours',
      imageUrl: 'https://picsum.photos/seed/milling/600/400'
    },
    { 
      id: 'S2', 
      name: 'Mould Design & Prototyping', 
      description: 'End-to-end mould fabrication from DFM analysis to final polishing and testing.', 
      price: '45,000.00',
      annualTargetQty: '24 Moulds',
      imageUrl: 'https://picsum.photos/seed/edm/600/400'
    },
  ]);

  // 03. Financial Data State
  const [financials, setFinancials] = useState({
    capitalInvestment: 8000000,
    workingCapital: 2000000,
    projectedMonthlyRevenue: 1500000,
    projectedMonthlyExpense: 800000,
  });

  // Load saved data when available
  useEffect(() => {
    if (savedStrategy) {
      if (savedStrategy.foundationalData) {
        setFormData(prev => ({ ...prev, ...savedStrategy.foundationalData }));
      }
      if (savedStrategy.proprietaryProducts) {
        setProprietaryProducts(savedStrategy.proprietaryProducts);
      }
      if (savedStrategy.industrialServices) {
        setIndustrialServices(savedStrategy.industrialServices);
      }
      if (savedStrategy.financials) {
        setFinancials(prev => ({ ...prev, ...savedStrategy.financials }));
      }
      if (savedStrategy.checklist) {
        setChecklist(prev => ({ ...prev, ...savedStrategy.checklist }));
      }
    }
  }, [savedStrategy]);

  const handleSaveStrategy = () => {
    const data = {
      foundationalData,
      proprietaryProducts,
      industrialServices,
      financials,
      checklist,
      updatedAt: new Date().toISOString()
    };
    setDocumentNonBlocking(strategyRef, data, { merge: true });
    toast({ 
      title: "Strategy Matrix Committed", 
      description: "All data nodes have been synchronized with the master ledger." 
    });
  };

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
    annualTargetQty: '0',
    imageUrl: 'https://picsum.photos/seed/default/600/400' 
  }]);

  const handleAddService = () => setIndustrialServices([...industrialServices, { 
    id: `SVC-${Date.now()}`, 
    name: '', 
    description: '', 
    price: '0.00', 
    annualTargetQty: '0',
    imageUrl: 'https://picsum.photos/seed/service/600/400' 
  }]);

  const updateProduct = (idx: number, field: keyof ProprietaryProduct, value: string) => {
    const newP = [...proprietaryProducts];
    newP[idx] = { ...newP[idx], [field]: value };
    setProprietaryProducts(newP);
  };

  const updateService = (idx: number, field: keyof IndustrialService, value: string) => {
    const newS = [...industrialServices];
    newS[idx] = { ...newS[idx], [field]: value };
    setIndustrialServices(newS);
  };

  const handleProductImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProduct(idx, 'imageUrl', reader.result as string);
        toast({ title: "Visual Matrix Cached", description: "Product image initialized for report." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleServiceImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateService(idx, 'imageUrl', reader.result as string);
        toast({ title: "Service Artifact Cached", description: "Visual node synchronized." });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20 print:pb-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 no-print">
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
           <Button 
            className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3"
            onClick={handleSaveStrategy}
           >
             <Save className="h-4 w-4" /> Commit Strategy
           </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:block">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2 no-print">
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            01. Input Matrix
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            02. Product Line
          </TabsTrigger>
          <TabsTrigger value="financials" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            03. Financials
          </TabsTrigger>
          <TabsTrigger value="display" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            04. Final Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500 no-print">
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
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.projectName || ''} onChange={(e)=>updateField('projectName', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Promoter / Applicant Node</Label>
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.promoterName || ''} onChange={(e)=>updateField('promoterName', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Proposed Operational Base (Location)</Label>
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.location || ''} onChange={(e)=>updateField('location', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Loan Capital Requirement (₹)</Label>
                          <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold text-primary text-xl font-display" value={foundationalData.totalLoanRequirement || ''} onChange={(e)=>updateField('totalLoanRequirement', e.target.value)} />
                       </div>
                    </div>
                 </div>

                 {/* Regulatory Section */}
                 <div className="space-y-10 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-6">
                       <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Shield className="h-6 w-6" /></div>
                       <div>
                          <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Regulatory & Compliance</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official licensing and taxation identifiers.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">GST Identification Number</Label>
                          <Input placeholder="e.g. 27AAAAA0000A1Z5" className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase" value={foundationalData.gstNumber || ''} onChange={(e)=>updateField('gstNumber', e.target.value)} />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">MSME Udyam Number</Label>
                          <Input placeholder="e.g. UDYAM-MH-00-0000000" className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase" value={foundationalData.msmeNumber || ''} onChange={(e)=>updateField('msmeNumber', e.target.value)} />
                       </div>
                    </div>
                 </div>

                 {/* Entrepreneur Section */}
                 <div className="space-y-10 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-6">
                       <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><UserCircle className="h-6 w-6" /></div>
                       <div>
                          <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Entrepreneur / Promoter Profile</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Professional pedigree and industrial expertise.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2"><GraduationCap className="h-3 w-3" /> Educational Qualification</Label>
                          <Input placeholder="e.g. B.E. Mechanical" className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.qualification || ''} onChange={(e)=>updateField('qualification', e.target.value)} />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2"><Award className="h-3 w-3" /> Total Experience</Label>
                          <Input placeholder="e.g. 15 Years in Tooling" className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.experience || ''} onChange={(e)=>updateField('experience', e.target.value)} />
                       </div>
                       <div className="md:col-span-2 space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Promoter Background & Narrative</Label>
                          <Textarea 
                            className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                            placeholder="Detail the promoter's technical journey and project motivation..."
                            value={foundationalData.promoterNarrative || ''}
                            onChange={(e) => updateField('promoterNarrative', e.target.value)}
                          />
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
                            value={foundationalData.aboutProject || ''}
                            onChange={(e) => updateField('aboutProject', e.target.value)}
                          />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">About Us (Firm Profile)</Label>
                          <Textarea 
                            className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                            placeholder="History, technical expertise, and team pedigree..."
                            value={foundationalData.aboutUs || ''}
                            onChange={(e) => updateField('aboutUs', e.target.value)}
                          />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Vision Statement</Label>
                             <Textarea 
                               className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                               placeholder="The long-term aspiration and target node..."
                               value={foundationalData.vision || ''}
                               onChange={(e) => updateField('vision', e.target.value)}
                             />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Mission Statement</Label>
                             <Textarea 
                               className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed focus-visible:ring-primary/20" 
                               placeholder="Primary functional purpose and core protocols..."
                               value={foundationalData.mission || ''}
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
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                               {key === 'productLine' ? 'Proprietary Products' : 
                                key === 'services' ? 'Industrial Services' : 
                                key === 'entrepreneurDetails' ? 'Entrepreneur Details' :
                                key === 'licenseGst' ? 'Licenses (GST & MSME)' :
                                key.replace(/([A-Z])/g, ' $1')}
                             </span>
                          </div>
                       ))}
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="products" className="m-0 space-y-12 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <div className="grid grid-cols-1 gap-12">
              <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                 <div className="flex justify-between items-center border-l-4 border-primary pl-6">
                    <div>
                       <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Proprietary Product Matrix</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Industrial items designed and manufactured for market introduction.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 font-bold text-[9px] uppercase tracking-widest gap-2" onClick={handleSaveStrategy}>
                         <Save className="h-3.5 w-3.5" /> Save Matrix Nodes
                      </Button>
                      <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-primary font-bold text-[9px] uppercase hover:bg-primary/5" onClick={handleAddProduct}>
                         <Plus className="h-4 w-4 mr-2" /> Append New Item
                      </Button>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {proprietaryProducts.map((p, idx) => (
                       <div key={p.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-8 group hover:border-primary/20 transition-all">
                          <div className="flex gap-6">
                             <div className="h-28 w-28 rounded-3xl overflow-hidden border border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center">
                                {p.imageUrl ? (
                                  <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-2" />
                                ) : (
                                  <ImageIcon className="h-10 w-10 text-slate-200" />
                                )}
                             </div>
                             <div className="flex-1 space-y-4">
                                <Input placeholder="Product Name..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={p.name || ''} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                                <Input placeholder="Target Market Sector..." className="bg-white border-none h-10 text-[11px] font-medium shadow-sm" value={p.market || ''} onChange={(e) => updateProduct(idx, 'market', e.target.value)} />
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Unit Price (₹)</Label>
                                <div className="relative">
                                   <Input placeholder="0.00" className="bg-white border-none h-12 text-sm font-display font-bold pl-8 shadow-sm" value={p.price || ''} onChange={(e) => updateProduct(idx, 'price', e.target.value)} />
                                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Annual Projection (Qty)</Label>
                                <div className="relative">
                                   <Input placeholder="e.g. 5,000" className="bg-white border-none h-12 text-sm font-display font-bold pl-8 shadow-sm" value={p.annualTargetQty || ''} onChange={(e) => updateProduct(idx, 'annualTargetQty', e.target.value)} />
                                   <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                </div>
                             </div>
                             <div className="col-span-2 space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Technical Image Artifact</Label>
                                <div className="relative">
                                  <input 
                                    type="file" 
                                    id={`product-img-${p.id}`} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleProductImageUpload(idx, e)}
                                  />
                                  <label 
                                    htmlFor={`product-img-${p.id}`}
                                    className={cn(
                                      "h-12 w-full flex items-center gap-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all border border-dashed",
                                      p.imageUrl?.startsWith('data:') ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-400 hover:border-primary/50"
                                    )}
                                  >
                                    <Upload className="h-4 w-4" />
                                    {p.imageUrl?.startsWith('data:') ? "Image Cached" : "Upload Photo"}
                                  </label>
                                </div>
                             </div>
                             <div className="col-span-2 flex justify-end">
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 font-bold uppercase text-[9px] gap-2 rounded-lg" onClick={() => setProprietaryProducts(proprietaryProducts.filter(i => i.id !== p.id))}>
                                  <Trash2 className="h-3.5 w-3.5" /> Purge Node
                                </Button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

              <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                 <div className="flex justify-between items-center border-l-4 border-accent pl-6">
                    <div>
                       <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Industrial Services Matrix</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">B2B Job-work and tool-room manufacturing capacities.</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-accent font-bold text-[9px] uppercase hover:bg-accent/5" onClick={handleAddService}>
                       <Plus className="h-4 w-4 mr-2" /> Add Service Node
                    </Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {industrialServices.map((s, idx) => (
                       <div key={s.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-8 group hover:border-accent/20 transition-all">
                          <div className="flex gap-6">
                             <div className="h-28 w-28 rounded-3xl overflow-hidden border border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center">
                                {s.imageUrl ? (
                                  <Image src={s.imageUrl} alt={s.name} fill className="object-contain p-2" />
                                ) : (
                                  <ImageIcon className="h-10 w-10 text-slate-200" />
                                )}
                             </div>
                             <div className="flex-1 space-y-4">
                                <Input placeholder="Service Name..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={s.name || ''} onChange={(e) => updateService(idx, 'name', e.target.value)} />
                                <Textarea placeholder="Technical Service Description..." className="bg-white border-none min-h-[60px] text-[11px] font-medium shadow-sm resize-none" value={s.description || ''} onChange={(e) => updateService(idx, 'description', e.target.value)} />
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Unit Price / Rate (₹)</Label>
                                <div className="relative">
                                   <Input placeholder="0.00" className="bg-white border-none h-12 text-sm font-display font-bold pl-8 shadow-sm" value={s.price || ''} onChange={(e) => updateService(idx, 'price', e.target.value)} />
                                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Annual Target Projection</Label>
                                <div className="relative">
                                   <Input placeholder="e.g. 2,000 Hours" className="bg-white border-none h-12 text-sm font-display font-bold pl-8 shadow-sm" value={s.annualTargetQty || ''} onChange={(e) => updateService(idx, 'annualTargetQty', e.target.value)} />
                                   <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                </div>
                             </div>
                             <div className="col-span-2 space-y-2">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Technical Image Artifact</Label>
                                <div className="relative">
                                  <input 
                                    type="file" 
                                    id={`service-img-${s.id}`} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleServiceImageUpload(idx, e)}
                                  />
                                  <label 
                                    htmlFor={`service-img-${s.id}`}
                                    className={cn(
                                      "h-12 w-full flex items-center gap-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all border border-dashed",
                                      s.imageUrl?.startsWith('data:') ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-400 hover:border-accent/50"
                                    )}
                                  >
                                    <Upload className="h-4 w-4" />
                                    {s.imageUrl?.startsWith('data:') ? "Artifact Cached" : "Upload Visual"}
                                  </label>
                                </div>
                             </div>
                             <div className="col-span-2 flex justify-end">
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 font-bold uppercase text-[9px] gap-2 rounded-lg" onClick={() => setIndustrialServices(industrialServices.filter(i => i.id !== s.id))}>
                                  <Trash2 className="h-3.5 w-3.5" /> Purge Service Node
                                </Button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-4 p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                 <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] border-l-4 border-primary pl-4">Valuation Matrix</h3>
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Fixed Capital (Machinery/Land)</Label>
                       <div className="relative">
                          <Input type="number" className="h-16 bg-slate-50 border-none rounded-2xl text-2xl font-display font-bold text-[#001F3D] pl-10 shadow-inner" value={financials.capitalInvestment ?? 0} onChange={(e)=>setFinancials({...financials, capitalInvestment: Number(e.target.value)})} />
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Working Capital Reserve</Label>
                       <div className="relative">
                          <Input type="number" className="h-16 bg-slate-50 border-none rounded-2xl text-2xl font-display font-bold text-[#001F3D] pl-10 shadow-inner" value={financials.workingCapital ?? 0} onChange={(e)=>setFinancials({...financials, workingCapital: Number(e.target.value)})} />
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Proj. Monthly Revenue</Label>
                       <div className="relative">
                          <Input type="number" className="h-16 bg-emerald-50 text-emerald-700 border-none rounded-2xl text-2xl font-display font-bold pl-10 shadow-inner" value={financials.projectedMonthlyRevenue ?? 0} onChange={(e)=>setFinancials({...financials, projectedMonthlyRevenue: Number(e.target.value)})} />
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

        <TabsContent value="display" className="m-0 animate-in zoom-in-95 duration-700 print:m-0 print:p-0">
           <div className="max-w-[1000px] mx-auto space-y-16 print:max-w-none print:w-full">
             <Card className="p-16 md:p-24 bg-white border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] space-y-20 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
                
                {/* Formal Cover Page Matrix */}
                <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-12 border-b-2 border-slate-100 pb-20 relative">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.03] no-print">
                      <Landmark className="h-96 w-96 text-[#001F3D]" />
                   </div>
                   
                   <div className="space-y-6 relative z-10">
                      <div className="flex justify-center mb-16">
                        <div className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden group shadow-2xl bg-white flex items-center justify-center p-4">
                           <Image 
                            src={brandLogo} 
                            alt="Ferocious Tech Logo" 
                            fill 
                            className="object-contain p-4"
                            data-ai-hint="lion technology logo"
                           />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                         <Badge className="bg-primary text-white border-none px-8 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] mb-4">Official Submission</Badge>
                         <h1 className="text-7xl font-display font-bold tracking-tighter text-[#001F3D] uppercase leading-none">
                            Project Feasibility <br />Report
                         </h1>
                         <div className="h-1.5 w-32 bg-red-600 mx-auto rounded-full mt-8" />
                      </div>
                      
                      <div className="pt-12">
                         <p className="text-2xl font-headline font-bold text-slate-400 uppercase tracking-[0.4em] mb-2">{foundationalData.projectName || '---'}</p>
                         <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{foundationalData.location || '---'}</p>
                      </div>
                   </div>

                   <div className="pt-20 grid grid-cols-2 gap-20 w-full max-w-2xl text-left border-t border-slate-50 mt-auto relative z-10">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Submitted by</p>
                        <h4 className="text-lg font-bold text-[#001F3D] uppercase tracking-tight">{foundationalData.promoterName || '---'}</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">FEROCIOUS TECH INDUSTRIAL GROUP</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Submission Date</p>
                        <h4 className="text-lg font-bold text-[#001F3D] uppercase tracking-tight">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h4>
                        <Badge variant="outline" className="mt-2 border-slate-200 text-slate-400 font-code text-[9px] uppercase">Ref: FT_STRAT_2.4</Badge>
                      </div>
                   </div>
                </div>

                {/* Section 01: Strategic Narrative Hub */}
                <div className="space-y-16 pt-20">
                   <div className="flex items-center gap-6">
                      <div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">01</div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Executive Summary & Vision</h3>
                   </div>

                   <div className="space-y-12">
                      {checklist.aboutProject && (
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-6">The Initiative</h4>
                           <p className="text-sm text-slate-600 font-medium leading-relaxed indent-12 text-justify">{foundationalData.aboutProject || '---'}</p>
                        </div>
                      )}
                      
                      {checklist.aboutUs && (
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-6">Organizational Pedigree</h4>
                           <p className="text-sm text-slate-600 font-medium leading-relaxed indent-12 text-justify">{foundationalData.aboutUs || '---'}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                         {checklist.vision && (
                           <div className="p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                              <Compass className="h-12 w-12 text-[#001F3D] opacity-10 absolute top-6 right-6" />
                              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Future Node (Vision)</h5>
                              <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{foundationalData.vision || '---'}"</p>
                           </div>
                         )}
                         {checklist.mission && (
                           <div className="p-10 bg-[#001F3D] text-white rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                              <ShieldCheck className="h-12 w-12 text-white opacity-10 absolute top-6 right-6" />
                              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Core Protocol (Mission)</h5>
                              <p className="text-sm font-bold text-white/90 leading-relaxed italic">"{foundationalData.mission || '---'}"</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Section 01.5: Entrepreneur Details */}
                {checklist.entrepreneurDetails && (
                  <div className="space-y-16 pt-20">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">1.5</div>
                        <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Promoter & Entrepreneur Profile</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="md:col-span-1 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center gap-6">
                          <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#001F3D] border-4 border-slate-200">
                             <UserCircle className="h-12 w-12" />
                          </div>
                          <div>
                             <h4 className="text-lg font-bold text-[#001F3D] uppercase">{foundationalData.promoterName || '---'}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Entrepreneur</p>
                          </div>
                          <div className="w-full space-y-3">
                             <Badge variant="outline" className="w-full h-8 justify-center rounded-xl bg-white border-slate-200 text-slate-600 text-[8px] font-bold uppercase">{foundationalData.qualification || '---'}</Badge>
                             <Badge variant="outline" className="w-full h-8 justify-center rounded-xl bg-white border-slate-200 text-slate-600 text-[8px] font-bold uppercase">{foundationalData.experience || '---'}</Badge>
                          </div>
                       </div>
                       <div className="md:col-span-2 p-10 bg-[#001F3D] text-white rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Award className="h-40 w-40" /></div>
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6">Promoter Professional Narrative</h4>
                          <p className="text-sm text-white/90 leading-relaxed font-medium italic indent-8">
                            "{foundationalData.promoterNarrative || '---'}"
                          </p>
                       </div>
                    </div>
                  </div>
                )}

                {/* Section Compliance: License & Registrations */}
                {checklist.licenseGst && (
                  <div className="space-y-16 pt-20">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">C</div>
                        <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Compliance & Registration Matrix</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center gap-6">
                          <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Shield className="h-8 w-8" /></div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GSTIN Identification</p>
                             <h4 className="text-lg font-code font-bold text-[#001F3D] mt-1">{foundationalData.gstNumber || '---'}</h4>
                          </div>
                       </div>
                       <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center gap-6">
                          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600"><FileText className="h-8 w-8" /></div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MSME Udyam Registration</p>
                             <h4 className="text-lg font-code font-bold text-[#001F3D] mt-1">{foundationalData.msmeNumber || '---'}</h4>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {/* Section 02: Marketable Assets (Product Catalogue) */}
                {checklist.productLine && (
                  <div className="space-y-16 pt-20">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">02</div>
                        <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Proprietary Product Catalogue</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {proprietaryProducts.map(p => (
                          <div key={p.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex flex-col gap-5 shadow-md hover:shadow-xl transition-all group border-b-4 border-b-slate-200">
                              <div className="aspect-square w-full rounded-2xl overflow-hidden relative border shadow-inner bg-slate-50 flex items-center justify-center p-3">
                                {p.imageUrl ? (
                                  <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-4 mix-blend-multiply" />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-slate-200" />
                                )}
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                    <h5 className="text-[11px] font-bold text-[#001F3D] uppercase tracking-tight leading-tight line-clamp-2 min-h-[2.4em]">{p.name || 'Undefined Node'}</h5>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-1.5 mt-1">
                                      <Box className="h-2 w-2 text-primary" /> {p.market || '---'}
                                    </p>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <div className="flex justify-between items-end">
                                      <div className="flex flex-col">
                                        <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Unit Price</span>
                                        <span className="text-sm font-display font-bold text-primary tracking-tight">₹ {p.price || '0.00'}</span>
                                      </div>
                                      <div className="text-right flex flex-col">
                                        <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Annual Projection</span>
                                        <span className="text-[10px] font-bold text-slate-700">{p.annualTargetQty || '0'} <span className="text-[8px] font-medium text-slate-400">Units</span></span>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="h-6 w-full justify-center text-[7px] font-bold border-slate-100 bg-slate-50 text-slate-400 uppercase">Production Ready</Badge>
                                </div>
                              </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Section 03: Industrial Services Matrix (Detailed Catalogue Style) */}
                {checklist.services && (
                  <div className="space-y-16 pt-20">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">03</div>
                        <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Industrial Services Catalogue</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {industrialServices.map((s, idx) => (
                          <div key={s.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-start group shadow-sm hover:shadow-md transition-all">
                            <div className="h-32 w-32 bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shrink-0 flex items-center justify-center relative">
                                {s.imageUrl ? (
                                  <Image src={s.imageUrl} alt={s.name} fill className="object-contain p-2" />
                                ) : (
                                  <Layers className="h-8 w-8 text-[#001F3D] opacity-20" />
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-lg font-bold text-[#001F3D] uppercase tracking-tight">{s.name || 'Undefined Protocol'}</h5>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Service ID: {s.id}</p>
                                  </div>
                                  <div className="text-right space-y-1">
                                     <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Rate Projection</span>
                                     <p className="text-xl font-display font-bold text-primary">₹ {s.price || '0.00'}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed text-justify">{s.description || '---'}</p>
                                <div className="pt-4 border-t border-slate-200/50 flex justify-between items-center">
                                   <div className="flex items-center gap-3">
                                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Capacity Target:</span>
                                      <Badge className="bg-[#001F3D] text-white border-none rounded-full px-4 h-7 text-[9px] font-bold uppercase">{s.annualTargetQty || '0'}</Badge>
                                   </div>
                                   <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase">Revenue Generation Ready</Badge>
                                </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Section 04: Financial Feasibility Matrix */}
                <div className="space-y-16 pt-20 page-break">
                   <div className="flex items-center gap-6">
                      <div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">04</div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Financial Intelligence Matrix</h3>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-6">Capital Allocation</h4>
                         <div className="p-10 bg-slate-900 text-white rounded-[2.5rem] space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign className="h-32 w-32" /></div>
                            <div className="space-y-2 relative z-10">
                               <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Total Loan Requirement</p>
                               <h3 className="text-5xl font-display font-bold text-white tracking-tighter">₹ {foundationalData.totalLoanRequirement || '0'}</h3>
                            </div>
                            <div className="space-y-6 pt-10 border-t border-white/10 relative z-10">
                               <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Fixed Asset Investment</span>
                                  <span className="text-sm font-bold text-white">₹ {(financials.capitalInvestment ?? 0).toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Working Capital Reserve</span>
                                  <span className="text-sm font-bold text-white">₹ {(financials.workingCapital ?? 0).toLocaleString()}</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-6">Revenue Yield Curve</h4>
                         <div className="h-64 w-full bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={pnlChartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                  <YAxis hide />
                                  <Bar dataKey="rev" fill="#001F3D" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="exp" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="flex justify-center gap-10">
                            <div className="flex items-center gap-3"><div className="h-2 w-6 rounded-full bg-[#001F3D]" /><span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span></div>
                            <div className="flex items-center gap-3"><div className="h-2 w-6 rounded-full bg-[#f43f5e]" /><span className="text-[10px] font-bold text-slate-400 uppercase">Expense</span></div>
                         </div>
                      </div>
                   </div>

                   <div className="p-10 border-2 border-slate-100 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-3">
                         <Info className="h-4 w-4 text-primary" />
                         <p className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest">Feasibility Disclosure</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed text-justify">
                         The figures presented in this matrix represent precision industrial projections based on current market dynamics in the VMC machining sector. The estimated <b className="text-[#001F3D]">monthly revenue node of ₹ {(financials.projectedMonthlyRevenue ?? 0).toLocaleString()}</b> is synchronized with projected machine utilization rates of 85% OEE across the proposed asset fleet.
                      </p>
                   </div>
                </div>

                {/* Final Footer Protocol */}
                <div className="pt-32 border-t-2 border-slate-900 flex flex-col md:flex-row justify-between items-end gap-10">
                   <div className="space-y-4 text-left">
                      <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden p-2 relative">
                        <Image 
                          src={brandLogo} 
                          alt="Ferocious Tech Logo" 
                          fill
                          className="object-contain p-2"
                          data-ai-hint="lion technology logo"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of Report</p>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-1">FEROCIOUS_TECH_PROTOCOL_SYNC_2.4</p>
                      </div>
                   </div>

                   <div className="text-right space-y-8 w-full md:w-80">
                      <div className="space-y-12">
                         <div className="h-[1px] bg-slate-200 w-full" />
                         <div className="space-y-1">
                            <p className="text-xs font-bold text-[#001F3D] uppercase tracking-widest">{foundationalData.promoterName || '---'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory node</p>
                         </div>
                      </div>
                   </div>
                </div>

             </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
