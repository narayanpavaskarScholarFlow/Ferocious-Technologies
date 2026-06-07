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
  ImageIcon, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  Printer,
  TrendingUp,
  DollarSign,
  Briefcase,
  Save,
  Upload,
  Box,
  Compass,
  ShieldCheck,
  Zap,
  Info,
  UserCircle,
  GraduationCap,
  Award,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize,
  Calculator,
  Percent,
  Clock,
  Coins,
  CreditCard,
  Factory,
  Table as TableIcon,
  PieChart as PieChartIcon,
  ArrowUpRight,
  TrendingDown,
  Activity,
  FileCheck,
  Settings2,
  Gauge
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
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
  const [zoom, setZoom] = useState(1);

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
    amortizationSchedule: true,
    turnoverAnalysis: true
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
      annualTargetQty: '2,500',
      imageUrl: 'https://picsum.photos/seed/milling/600/400'
    },
    { 
      id: 'S2', 
      name: 'Mould Design & Prototyping', 
      description: 'End-to-end mould fabrication from DFM analysis to final polishing and testing.', 
      price: '45,000.00',
      annualTargetQty: '24',
      imageUrl: 'https://picsum.photos/seed/edm/600/400'
    },
  ]);

  // 03. Financial Data State
  const [financials, setFinancials] = useState({
    capitalInvestment: 8000000,
    workingCapital: 2000000,
    projectedMonthlyRevenue: 1500000,
    projectedMonthlyExpense: 800000,
    // Granular Loan Details
    loanROI: 9.5,
    loanTenure: 60,
    loanMoratorium: 6,
    // Monthly Expense Breakup
    expenseRent: 150000,
    expenseSalaries: 400000,
    expensePower: 100000,
    expenseMaintenance: 50000,
    expenseConsumables: 100000,
    // Advanced Projection Inputs
    growthTarget: 15,
    targetNetMargin: 20
  });

  // Load saved data when available
  useEffect(() => {
    if (savedStrategy) {
      if (savedStrategy.foundationalData) {
        setFormData(prev => ({ ...prev, ...savedStrategy.foundationalData }));
      }
      if (Array.isArray(savedStrategy.proprietaryProducts)) {
        setProprietaryProducts(savedStrategy.proprietaryProducts);
      }
      if (Array.isArray(savedStrategy.industrialServices)) {
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

  // Financial Computations Engine
  const calculations = useMemo(() => {
    const loanAmt = parseFloat((foundationalData.totalLoanRequirement || '0').replace(/,/g, '')) || 0;
    const monthlyRate = (financials.loanROI / 100) / 12;
    const totalTenure = financials.loanTenure;
    const moratorium = financials.loanMoratorium;
    const activeTenure = totalTenure - moratorium;

    // EMI Calculation (Standard Amortization after moratorium)
    let emi = 0;
    if (activeTenure > 0 && monthlyRate > 0) {
      emi = (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, activeTenure)) / (Math.pow(1 + monthlyRate, activeTenure) - 1);
    } else if (activeTenure > 0) {
      emi = loanAmt / activeTenure;
    }

    // Amortization Schedule Generation
    const schedule: any[] = [];
    let remainingBalance = loanAmt;
    
    for (let m = 1; m <= totalTenure; m++) {
      const isMoratorium = m <= moratorium;
      const interest = remainingBalance * monthlyRate;
      const principal = isMoratorium ? 0 : emi - interest;
      const payment = isMoratorium ? 0 : emi;
      
      remainingBalance = Math.max(0, remainingBalance - principal);
      
      schedule.push({
        month: m,
        payment: payment,
        interest: interest,
        principal: principal,
        balance: remainingBalance,
        status: isMoratorium ? 'Moratorium' : 'Repayment'
      });
    }

    // Revenue Matrix Computation
    const prodPotential = proprietaryProducts.reduce((acc, p) => {
      const price = parseFloat((p.price || '0').replace(/,/g, '')) || 0;
      const qty = parseFloat((p.annualTargetQty || '0').replace(/,/g, '')) || 0;
      return acc + (price * (qty / 12));
    }, 0);

    const svcPotential = industrialServices.reduce((acc, s) => {
      const price = parseFloat((s.price || '0').replace(/,/g, '')) || 0;
      const qty = parseFloat((s.annualTargetQty || '0').replace(/,/g, '')) || 0;
      return acc + (price * (qty / 12));
    }, 0);

    const totalPotential = prodPotential + svcPotential || 1;
    const prodRatio = prodPotential / totalPotential;
    const svcRatio = svcPotential / totalPotential;

    const monthlyOpEx = (financials.expenseRent || 0) + (financials.expenseSalaries || 0) + (financials.expensePower || 0) + (financials.expenseMaintenance || 0) + (financials.expenseConsumables || 0);
    const targetTurnover = (monthlyOpEx + emi) / (1 - ((financials.targetNetMargin || 20) / 100));

    // 5-Year Projection Matrix
    const projections: any[] = [];
    for (let y = 1; y <= 5; y++) {
      const growthFactor = Math.pow(1 + ((financials.growthTarget || 15) / 100), y - 1);
      
      // Ramp-up logic for Year 1 (Months 1-6 focusing on marketing at 30% yield)
      let yearlyRevenue = 0;
      if (y === 1) {
        for (let m = 1; m <= 12; m++) {
          const rampFactor = m <= 6 ? 0.3 + (m * 0.1) : 1.0; 
          yearlyRevenue += targetTurnover * rampFactor;
        }
      } else {
        yearlyRevenue = targetTurnover * 12 * growthFactor;
      }

      const yearlyOpEx = monthlyOpEx * 12 * (1 + (y * 0.05)); 
      const yearlyEMI = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.payment, 0);
      const yearlyInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearlyEBITDA = yearlyRevenue - yearlyOpEx;
      const yearlyNetProfit = yearlyEBITDA - yearlyInterest;

      projections.push({
        year: `Year ${y}`,
        revenue: yearlyRevenue,
        opex: yearlyOpEx,
        interest: yearlyInterest,
        emi: yearlyEMI,
        profit: yearlyNetProfit,
        margin: ((yearlyNetProfit / yearlyRevenue) * 100).toFixed(1)
      });
    }

    const total5YearProfit = projections.reduce((acc, p) => acc + p.profit, 0);
    const totalInvestment = (financials.capitalInvestment || 0) + (financials.workingCapital || 0);
    const roi = totalInvestment > 0 ? (total5YearProfit / totalInvestment) * 100 : 0;

    return {
      emi,
      schedule,
      targetTurnover,
      prodTarget: targetTurnover * prodRatio,
      svcTarget: targetTurnover * svcRatio,
      projections,
      roi
    };
  }, [foundationalData.totalLoanRequirement, financials, proprietaryProducts, industrialServices]);

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
      description: "All financial nodes and schedules have been synchronized." 
    });
  };

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
    newP[idx] = { ...newP[idx], [field]: value || '' };
    setProprietaryProducts(newP);
  };

  const updateService = (idx: number, field: keyof IndustrialService, value: string) => {
    const newS = [...industrialServices];
    newS[idx] = { ...newS[idx], [field]: value || '' };
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
    setFormData(prev => ({ ...prev, [field]: value || '' }));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20 print:pb-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Landmark className="h-4 w-4" />
            Industrial Loan Architect
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            Strategy <span className="text-slate-400 font-medium">Engineer</span>
          </h2>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Generating automated 5-year feasibility projections for financial appraisal.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 rounded-xl border-slate-200 px-8 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm" onClick={() => window.print()}>
             <Printer className="h-4 w-4" /> Export Report
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
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">01. Identity</TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">02. Catalogues</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">03. Financials & Projections</TabsTrigger>
          <TabsTrigger value="display" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">04. Preview</TabsTrigger>
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
                    </div>
                 </div>

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
                          <Input placeholder="27AAAAA0000A1Z5" className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase" value={foundationalData.gstNumber || ''} onChange={(e)=>updateField('gstNumber', e.target.value)} />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">MSME Udyam Number</Label>
                          <Input placeholder="UDYAM-MH-00-0000000" className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase" value={foundationalData.msmeNumber || ''} onChange={(e)=>updateField('msmeNumber', e.target.value)} />
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
                          <Textarea className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-xs font-bold leading-relaxed" value={foundationalData.aboutProject || ''} onChange={(e) => updateField('aboutProject', e.target.value)} />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative h-fit sticky top-24">
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-10">Report Composition Matrix</h3>
                 <div className="space-y-4">
                    {Object.entries(checklist).map(([key, val]) => (
                       <div key={key} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setChecklist({...checklist, [key]: !val})}>
                          <Checkbox checked={val} className="border-white/20 data-[state=checked]:bg-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                            {key === 'productLine' ? 'Proprietary Products' : key === 'licenseGst' ? 'Licenses (GST & MSME)' : key.replace(/([A-Z])/g, ' $1')}
                          </span>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="products" className="m-0 space-y-12 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
              <div className="flex justify-between items-center border-l-4 border-primary pl-6">
                 <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Proprietary Product Matrix</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Items designed for market introduction.</p>
                 </div>
                 <Button variant="ghost" className="text-primary font-bold text-[9px] uppercase" onClick={handleAddProduct}>+ Append Item</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {proprietaryProducts.map((p, idx) => (
                    <div key={p.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-6 group hover:border-primary/20 transition-all">
                       <div className="flex gap-6">
                          <div className="h-28 w-28 rounded-3xl overflow-hidden border border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center">
                             {p.imageUrl ? <Image src={p.imageUrl} alt={p.name || ''} fill className="object-contain p-2" /> : <ImageIcon className="h-10 w-10 text-slate-200" />}
                          </div>
                          <div className="flex-1 space-y-4">
                             <Input placeholder="Product Name..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={p.name || ''} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                             <Input placeholder="Target Market Sector..." className="bg-white border-none h-10 text-[11px] font-medium shadow-sm" value={p.market || ''} onChange={(e) => updateProduct(idx, 'market', e.target.value)} />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[8px] font-bold uppercase text-slate-400">Unit Price (₹)</Label>
                             <Input className="bg-white border-none h-12 text-sm font-display font-bold shadow-sm" value={p.price || ''} onChange={(e) => updateProduct(idx, 'price', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[8px] font-bold uppercase text-slate-400">Annual Projection (Qty)</Label>
                             <Input className="bg-white border-none h-12 text-sm font-display font-bold shadow-sm" value={p.annualTargetQty || ''} onChange={(e) => updateProduct(idx, 'annualTargetQty', e.target.value)} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-12 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                   <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] border-l-4 border-primary pl-4">Valuation Matrix</h3>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Fixed Capital Investment (₹)</Label>
                         <Input type="number" className="h-14 bg-slate-50 border-none rounded-2xl text-xl font-display font-bold text-[#001F3D]" value={financials.capitalInvestment || 0} onChange={(e)=>setFinancials({...financials, capitalInvestment: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Working Capital Reserve (₹)</Label>
                         <Input type="number" className="h-14 bg-slate-50 border-none rounded-2xl text-xl font-display font-bold text-[#001F3D]" value={financials.workingCapital || 0} onChange={(e)=>setFinancials({...financials, workingCapital: Number(e.target.value)})} />
                      </div>
                   </div>
                </Card>

                <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                   <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] border-l-4 border-accent pl-4">LOAN Parameters</h3>
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">ROI (% p.a.)</Label>
                           <Input type="number" step="0.1" className="h-12 bg-slate-50 border-none" value={financials.loanROI || 0} onChange={(e)=>setFinancials({...financials, loanROI: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Tenure (Months)</Label>
                           <Input type="number" className="h-12 bg-slate-50 border-none" value={financials.loanTenure || 0} onChange={(e)=>setFinancials({...financials, loanTenure: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Moratorium Window (Months)</Label>
                         <Input type="number" className="h-12 bg-slate-50 border-none" value={financials.loanMoratorium || 0} onChange={(e)=>setFinancials({...financials, loanMoratorium: Number(e.target.value)})} />
                      </div>
                   </div>
                </Card>

                <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col items-center gap-6">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">EMI Settlement Overview</h4>
                    <div className="text-center space-y-2">
                      <p className="text-5xl font-display font-bold text-primary">₹ {calculations.emi.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Monthly Installment Node</p>
                    </div>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-8">
                 <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] border-l-4 border-emerald-500 pl-4">Monthly Operational Expense (OpEx) Matrix</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {[
                         { k: 'expenseRent', l: 'Rent / Lease' },
                         { k: 'expenseSalaries', l: 'Personnel' },
                         { k: 'expensePower', l: 'Power & Util' },
                         { k: 'expenseMaintenance', l: 'Maintenance' },
                         { k: 'expenseConsumables', l: 'Consumables' },
                       ].map(item => (
                         <div key={item.k} className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">{item.l}</Label>
                            <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={(financials as any)[item.k] || 0} onChange={(e)=>setFinancials({...financials, [item.k]: Number(e.target.value)})} />
                         </div>
                       ))}
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Total Monthly OpEx</Label>
                          <Input readOnly className="h-12 bg-emerald-50 text-emerald-700 border-none rounded-xl font-display font-bold" value={((financials.expenseRent || 0) + (financials.expenseSalaries || 0) + (financials.expensePower || 0) + (financials.expenseMaintenance || 0) + (financials.expenseConsumables || 0)).toLocaleString()} />
                       </div>
                    </div>
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col justify-center gap-6">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                          <span>Required Monthly Turnover</span>
                          <span className="text-emerald-600">₹ {calculations.targetTurnover.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <div className="h-full bg-primary" style={{ width: '100%' }} />
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">* Turnover required to achieve {financials.targetNetMargin}% net margin after all OpEx and EMI commitments.</p>
                    </Card>
                    <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] flex flex-col justify-between">
                       <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Cumulative 5-Year Profit Target</p>
                       <div className="flex items-center justify-between">
                         <h3 className="text-4xl font-display font-bold text-emerald-400">₹ {(calculations.projections.reduce((acc, p) => acc + p.profit, 0)).toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                         <TrendingUp className="h-8 w-8 text-primary" />
                       </div>
                       <Badge className="bg-white/10 text-white w-fit text-[8px] font-bold uppercase mt-4">{calculations.roi.toFixed(1)}% Projected ROI</Badge>
                    </Card>
                 </div>

                 <Card className="p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl"><TrendingUp className="h-7 w-7" /></div>
                          <div>
                            <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Growth & Performance Matrix</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-year industrial forecasting nodes.</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="space-y-2 text-right">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">Yearly Growth (%)</Label>
                             <Input type="number" className="h-10 w-24 bg-slate-50 border-none text-right font-bold text-primary" value={financials.growthTarget} onChange={(e)=>setFinancials({...financials, growthTarget: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2 text-right">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">Target Margin (%)</Label>
                             <Input type="number" className="h-10 w-24 bg-slate-50 border-none text-right font-bold text-primary" value={financials.targetNetMargin} onChange={(e)=>setFinancials({...financials, targetNetMargin: Number(e.target.value)})} />
                          </div>
                       </div>
                    </div>

                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={calculations.projections}>
                             <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                             <YAxis hide />
                             <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', shadow: 'none', backgroundColor: '#001F3D', color: '#fff' }} />
                             <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                             <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fill="transparent" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                       {calculations.projections.map((p, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.year}</p>
                             <p className="text-sm font-display font-bold text-[#001F3D]">₹ {(p.profit / 100000).toFixed(1)}L</p>
                             <Badge className="bg-emerald-50 text-emerald-700 text-[8px] font-bold w-fit">{p.margin}%</Badge>
                          </div>
                       ))}
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-[0.2em] border-l-4 border-accent pl-4">Loan Repayment schedule</h4>
                      <Badge variant="outline" className="bg-slate-50 text-[8px] font-bold uppercase">Amortization_Ledger</Badge>
                   </div>
                   <ScrollArea className="h-[400px]">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="border-b border-slate-100">
                               <th className="py-4 font-bold text-[9px] uppercase text-slate-400">Month</th>
                               <th className="py-4 font-bold text-[9px] uppercase text-slate-400">EMI (₹)</th>
                               <th className="py-4 font-bold text-[9px] uppercase text-slate-400">Principal</th>
                               <th className="py-4 font-bold text-[9px] uppercase text-slate-400">Interest</th>
                               <th className="py-4 font-bold text-[9px] uppercase text-slate-400">Balance</th>
                               <th className="py-4 font-bold text-[9px] uppercase text-slate-400">Phase</th>
                            </tr>
                         </thead>
                         <tbody>
                            {calculations.schedule.map((s) => (
                               <tr key={s.month} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 font-code text-[10px] font-bold text-slate-500">M_{s.month.toString().padStart(2, '0')}</td>
                                  <td className="py-4 font-display font-bold text-[11px] text-slate-700">{s.payment.toLocaleString()}</td>
                                  <td className="py-4 font-display font-bold text-[11px] text-emerald-600">{s.principal.toLocaleString()}</td>
                                  <td className="py-4 font-display font-bold text-[11px] text-red-400">{s.interest.toLocaleString()}</td>
                                  <td className="py-4 font-display font-bold text-[11px] text-[#001F3D]">{s.balance.toLocaleString()}</td>
                                  <td className="py-4">
                                     <Badge className={cn("text-[8px] font-bold uppercase", s.status === 'Moratorium' ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700")}>{s.status}</Badge>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </ScrollArea>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="display" className="m-0 animate-in zoom-in-95 duration-700 print:m-0 print:p-0 flex flex-col gap-8">
           {/* Zoom Controls Hub */}
           <div className="flex items-center justify-center gap-6 p-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full w-fit mx-auto sticky top-6 z-50 no-print shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-10 w-10 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5"><ZoomOut className="h-4 w-4" /></Button>
                <div className="w-16 text-center"><span className="text-[11px] font-bold text-[#001F3D]">{Math.round(zoom * 100)}%</span></div>
                <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-10 w-10 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5"><ZoomIn className="h-4 w-4" /></Button>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <Button variant="ghost" size="sm" onClick={handleResetZoom} className="h-9 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary gap-2"><Maximize className="h-3.5 w-3.5" /> Reset</Button>
           </div>

           <div className="overflow-x-auto overflow-y-visible pb-20 hide-scrollbar flex justify-center">
             <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '100%', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} className="print:transform-none">
                <div className="max-w-[1000px] mx-auto space-y-16 print:max-w-none print:w-full">
                  <Card className="p-16 md:p-24 bg-white border border-slate-200 shadow-2xl rounded-[3rem] space-y-20 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
                     
                     {/* Cover Page */}
                     <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-12 border-b-2 border-slate-100 pb-20 relative">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] no-print"><Landmark className="h-96 w-96 text-[#001F3D]" /></div>
                        <div className="space-y-6 relative z-10">
                           <div className="flex justify-center mb-16">
                             <div className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden group shadow-2xl bg-white flex items-center justify-center p-4">
                                <Image src={brandLogo} alt="Logo" fill className="object-contain p-4" data-ai-hint="lion technology logo" />
                             </div>
                           </div>
                           <div className="space-y-4">
                              <Badge className="bg-primary text-white border-none px-8 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] mb-4">Official Submission</Badge>
                              <h1 className="text-7xl font-display font-bold tracking-tighter text-[#001F3D] uppercase leading-none">Feasibility <br />Strategic Report</h1>
                              <div className="h-1.5 w-32 bg-red-600 mx-auto rounded-full mt-8" />
                           </div>
                           <div className="pt-12">
                              <p className="text-2xl font-headline font-bold text-slate-400 uppercase tracking-[0.4em] mb-2">{foundationalData.projectName || '---'}</p>
                              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{foundationalData.location || '---'}</p>
                           </div>
                        </div>
                        <div className="pt-20 grid grid-cols-2 gap-20 w-full max-w-2xl text-left border-t border-slate-50 mt-auto relative z-10">
                           <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Submitted by</p><h4 className="text-lg font-bold text-[#001F3D] uppercase">{foundationalData.promoterName}</h4></div>
                           <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Date</p><h4 className="text-lg font-bold text-[#001F3D] uppercase">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h4></div>
                        </div>
                     </div>

                     {/* Section 04: Financial Matrix */}
                     {checklist.financialProjections && (
                       <div className="space-y-16 pt-20 page-break">
                          <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">04</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Capital & Loan Analysis</h3></div>
                          <div className="grid grid-cols-2 gap-12">
                             <div className="p-10 bg-slate-900 text-white rounded-[2.5rem] space-y-10 relative overflow-hidden">
                                <div className="space-y-2 relative z-10"><p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Loan Capital Requirement</p><h3 className="text-5xl font-display font-bold text-white">₹ {foundationalData.totalLoanRequirement}</h3></div>
                                <div className="space-y-4 pt-10 border-t border-white/10">
                                   <div className="flex justify-between text-[10px] uppercase font-bold text-white/40"><span>Interest Rate (ROI)</span><span className="text-white">{financials.loanROI}% p.a.</span></div>
                                   <div className="flex justify-between text-[10px] uppercase font-bold text-white/40"><span>Moratorium Period</span><span className="text-white">{financials.loanMoratorium} Months</span></div>
                                   <div className="flex justify-between text-[10px] uppercase font-bold text-white/40"><span>Monthly EMI Protocol</span><span className="text-primary">₹ {calculations.emi.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                                </div>
                             </div>
                             <div className="space-y-8">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-6">Cumulative 5-Year Projected ROI</h4>
                                <div className="p-10 border-2 border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                                   <span className="text-6xl font-display font-bold text-emerald-600">{calculations.roi.toFixed(1)}%</span>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Yield Target</p>
                                </div>
                             </div>
                          </div>
                       </div>
                     )}

                     {/* Section 05: 5-Year Growth Matrix */}
                     {checklist.financialProjections && (
                       <div className="space-y-16 pt-20 page-break">
                          <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">05</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">5-Year Growth Projections</h3></div>
                          <div className="border border-slate-200 rounded-[2rem] overflow-hidden">
                             <table className="w-full text-left">
                                <thead className="bg-slate-50"><tr className="border-b-2 border-slate-200"><th className="p-6 font-bold text-[9px] uppercase">Timeline Node</th><th className="p-6 font-bold text-[9px] uppercase">Revenue (₹)</th><th className="p-6 font-bold text-[9px] uppercase">OpEx (₹)</th><th className="p-6 font-bold text-[9px] uppercase">Loan Servicing (₹)</th><th className="p-6 font-bold text-[9px] uppercase">Net Profit (₹)</th><th className="p-6 font-bold text-[9px] uppercase text-center">Margin</th></tr></thead>
                                <tbody>
                                   {calculations.projections.map(p => (
                                     <tr key={p.year} className="border-b border-slate-100">
                                        <td className="p-6 font-bold text-xs text-slate-500 uppercase">{p.year}</td>
                                        <td className="p-6 font-display font-bold text-sm text-[#001F3D]">₹ {p.revenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                        <td className="p-6 font-display font-bold text-xs text-red-400">{p.opex.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                        <td className="p-6 font-display font-bold text-xs text-slate-400">{p.emi.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                        <td className="p-6 font-display font-bold text-sm text-emerald-600">₹ {p.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                        <td className="p-6 text-center"><Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold">{p.margin}%</Badge></td>
                                     </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                          <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-6">
                             <Zap className="h-6 w-6 text-primary shrink-0" />
                             <p className="text-xs text-slate-500 leading-relaxed text-justify font-medium"><b>Strategic Note on Year 1:</b> Projections factor in a 6-month marketing focus period. Revenue yield starts at 40% in Month 01 and ramps up sequentially to 100% by Month 07 to reflect industrial customer acquisition cycles.</p>
                          </div>
                       </div>
                     )}

                     {/* Section 06: Amortization Schedule */}
                     {checklist.amortizationSchedule && (
                       <div className="space-y-16 pt-20 page-break">
                          <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">06</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Loan Repayment Matrix</h3></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             <div className="space-y-8">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Year 1 Recovery Protocol</h4>
                                <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden">
                                   <table className="w-full text-left">
                                      <thead className="bg-slate-50"><tr className="border-b-2 border-slate-200"><th className="p-4 text-[8px] font-bold uppercase">Month</th><th className="p-4 text-[8px] font-bold uppercase">EMI</th><th className="p-4 text-[8px] font-bold uppercase">Closing Balance</th></tr></thead>
                                      <tbody>
                                         {calculations.schedule.slice(0, 12).map(s => (
                                           <tr key={s.month} className="border-b border-slate-100"><td className="p-4 text-[10px] font-bold text-slate-400 uppercase">M_{s.month.toString().padStart(2, '0')}</td><td className="p-4 text-[10px] font-bold text-[#001F3D]">₹ {s.payment.toLocaleString()}</td><td className="p-4 text-[10px] font-medium text-slate-500">₹ {s.balance.toLocaleString()}</td></tr>
                                         ))}
                                      </tbody>
                                   </table>
                                </div>
                             </div>
                             <div className="space-y-8">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Target Turnover Structure</h4>
                                <div className="p-8 bg-slate-900 text-white rounded-[2rem] space-y-8">
                                   <div className="space-y-2"><p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Monthly Yield Mandate</p><p className="text-3xl font-display font-bold">₹ {calculations.targetTurnover.toLocaleString(undefined, {maximumFractionDigits: 0})}</p></div>
                                   <div className="pt-8 border-t border-white/10 space-y-6">
                                      <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">Proprietary Products (Split)</span><span className="text-sm font-bold">₹ {calculations.prodTarget.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">Industrial Services (Split)</span><span className="text-sm font-bold">₹ {calculations.svcTarget.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                     )}

                     {/* Footer */}
                     <div className="pt-32 border-t-2 border-slate-900 flex flex-col md:flex-row justify-between items-end gap-10">
                        <div className="space-y-4 text-left"><div className="h-16 w-16 bg-white rounded-2xl relative p-2 shadow-xl"><Image src={brandLogo} alt="Logo" fill className="object-contain p-2" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase">End of Strategic Report</p><p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-1">FEROCIOUS_TECH_STRAT_SYNC_2.4</p></div></div>
                        <div className="text-right space-y-8 w-full md:w-80"><div className="space-y-12"><div className="h-[1px] bg-slate-200 w-full" /><div className="space-y-1"><p className="text-xs font-bold text-[#001F3D] uppercase">{foundationalData.promoterName}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Lead Strategist Node</p></div></div></div>
                     </div>

                  </Card>
                </div>
             </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
