"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize,
  Calculator,
  Clock,
  Factory,
  Table as TableIcon,
  PieChart as PieChartIcon,
  Activity,
  FileCheck,
  Settings2,
  Gauge,
  Workflow,
  X,
  HardHat,
  Construction,
  Monitor,
  Cpu,
  Receipt,
  FileBarChart,
  Scale
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
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

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

interface MachineryItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  total: number;
}

interface LoanProjectHubProps {
  brandLogo?: string;
}

export function LoanProjectHub({ brandLogo = '' }: LoanProjectHubProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');
  const [zoom, setZoom] = useState(1);
  const [isTurnoverBreakupOpen, setIsTurnoverBreakupOpen] = useState(false);
  const [isMachineryBreakupOpen, setIsMachineryBreakupOpen] = useState(false);

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
    oneTimeInvestment: true,
    amortizationSchedule: true,
    roadMapNextFiveYears: true,
    cgtmseScheme: true
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

  const [machineryItems, setMachineryItems] = useState<MachineryItem[]>([
    { id: 'M1', name: 'VMC 3-Axis Center', qty: 1, rate: 4500000, total: 4500000 },
  ]);

  const [financials, setFinancials] = useState({
    loanROI: 9.5,
    loanTenure: 60,
    loanMoratorium: 6,
    expenseRent: 150000,
    expensePower: 100000,
    expenseMaintenance: 50000,
    expenseSalary: 100000,
    investMachinery: 4500000,
    investCivil: 1000000,
    investElectrical: 500000,
    investFurniture: 300000,
    investPreOp: 200000,
    investSoftware: 200000,
    investSystem: 150000,
    investAdvance: 400000,
    yearlyGrowthTargets: [0, 15, 15, 15, 15],
    targetNetMargin: 20,
    entrepreneurContribution: 1000000,
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (savedStrategy && !isDataLoaded) {
      if (savedStrategy.foundationalData) setFormData(prev => ({ ...prev, ...savedStrategy.foundationalData }));
      if (Array.isArray(savedStrategy.proprietaryProducts)) setProprietaryProducts(savedStrategy.proprietaryProducts);
      if (Array.isArray(savedStrategy.industrialServices)) setIndustrialServices(savedStrategy.industrialServices);
      if (Array.isArray(savedStrategy.machineryItems)) setMachineryItems(savedStrategy.machineryItems);
      if (savedStrategy.financials) setFinancials(prev => ({ ...prev, ...savedStrategy.financials }));
      if (savedStrategy.checklist) setChecklist(prev => ({ ...prev, ...savedStrategy.checklist }));
      setIsDataLoaded(true);
    }
  }, [savedStrategy, isDataLoaded]);

  const handleSaveStrategy = useCallback((silent = false) => {
    const data = {
      foundationalData,
      proprietaryProducts,
      industrialServices,
      machineryItems,
      financials,
      checklist,
      updatedAt: new Date().toISOString()
    };
    setDocumentNonBlocking(strategyRef, data, { merge: true });
    if (!silent) toast({ title: "Strategy Matrix Committed", description: "All financial nodes and schedules synchronized." });
  }, [foundationalData, proprietaryProducts, industrialServices, machineryItems, financials, checklist, strategyRef, toast]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const timeout = setTimeout(() => handleSaveStrategy(true), 2000);
    return () => clearTimeout(timeout);
  }, [foundationalData, proprietaryProducts, industrialServices, machineryItems, financials, checklist, isDataLoaded, handleSaveStrategy]);

  // COMPLETE FINANCIAL ENGINE
  const calculations = useMemo(() => {
    const monthlyOpEx = (financials.expenseRent || 0) + (financials.expensePower || 0) + (financials.expenseMaintenance || 0) + (financials.expenseSalary || 0);
    const workingCapitalValue = monthlyOpEx * 3;
    const loanAmt = parseFloat((foundationalData.totalLoanRequirement || '0').replace(/,/g, '')) || 0;
    const entrepreneurAmt = financials.entrepreneurContribution || 0;
    const totalProjectCost = loanAmt + entrepreneurAmt + workingCapitalValue;
    const loanPct = totalProjectCost > 0 ? (loanAmt / totalProjectCost) * 100 : 0;
    const entrepreneurPct = totalProjectCost > 0 ? (entrepreneurAmt / totalProjectCost) * 100 : 0;

    const monthlyRate = (financials.loanROI / 100) / 12;
    const totalTenure = financials.loanTenure;
    const moratorium = financials.loanMoratorium;
    const activeTenure = totalTenure - moratorium;

    let emi = 0;
    if (activeTenure > 0 && monthlyRate > 0) {
      emi = (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, activeTenure)) / (Math.pow(1 + monthlyRate, activeTenure) - 1);
    } else if (activeTenure > 0) {
      emi = loanAmt / activeTenure;
    }

    const schedule: any[] = [];
    let remainingBalance = loanAmt;
    for (let m = 1; m <= totalTenure; m++) {
      const isMoratorium = m <= moratorium;
      const interest = remainingBalance * monthlyRate;
      const principal = isMoratorium ? 0 : emi - interest;
      remainingBalance = Math.max(0, remainingBalance - principal);
      schedule.push({ month: m, payment: isMoratorium ? 0 : emi, interest, principal, balance: remainingBalance, status: isMoratorium ? 'Moratorium' : 'Repayment' });
    }

    const targetTurnover = (monthlyOpEx + emi) / (1 - ((financials.targetNetMargin || 20) / 100));

    // 5-Year Projection Matrix
    const projections: any[] = [];
    const balanceSheet: any[] = [];
    const cashFlow: any[] = [];

    let currentTNW = entrepreneurAmt;
    let currentCapacityRevenue = targetTurnover * 12;
    let accumulatedDepreciation = 0;
    const depreciationRate = 0.15; // 15% on machinery
    const fixedAssetsAtCost = (financials.investMachinery || 0) + (financials.investCivil || 0) + (financials.investElectrical || 0) + (financials.investFurniture || 0);

    for (let y = 1; y <= 5; y++) {
      const growth = financials.yearlyGrowthTargets?.[y-1] ?? (y === 1 ? 0 : 15);
      const revMultiplier = 1 + (growth / 100);
      
      let yearRevenue = 0;
      if (y === 1) {
        for (let m = 1; m <= 12; m++) yearRevenue += targetTurnover * (m <= 6 ? 0.4 + (m * 0.1) : 1.0);
        yearRevenue *= revMultiplier;
        currentCapacityRevenue = targetTurnover * 12 * revMultiplier;
      } else {
        yearRevenue = currentCapacityRevenue * revMultiplier;
        currentCapacityRevenue = yearRevenue;
      }

      const yearOpEx = monthlyOpEx * 12 * (1 + (y * 0.05));
      const yearEBITDA = yearRevenue - yearOpEx;
      const yearDepreciation = fixedAssetsAtCost * depreciationRate;
      accumulatedDepreciation += yearDepreciation;
      
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearPBT = yearEBITDA - yearDepreciation - yearInterest;
      const yearTax = yearPBT > 0 ? yearPBT * 0.25 : 0;
      const yearPAT = yearPBT - yearTax;
      
      currentTNW += yearPAT * 0.8; // Assume 20% drawings
      const yearTermLoan = schedule[y * 12 - 1]?.balance || 0;
      const yearCurrentLiabilities = yearOpEx / 12; // 1 month opex as liabilities
      const yearTOL = yearTermLoan + yearCurrentLiabilities;

      projections.push({
        year: `Year ${y}`,
        revenue: yearRevenue,
        ebitda: yearEBITDA,
        ebit: yearEBITDA - yearDepreciation,
        pbt: yearPBT,
        pat: yearPAT,
        margin: (yearPAT / yearRevenue * 100).toFixed(1),
        tol: yearTOL,
        tnw: currentTNW,
        ratio: (yearTOL / currentTNW).toFixed(2)
      });

      balanceSheet.push({
        year: `Year ${y}`,
        tnw: currentTNW,
        loan: yearTermLoan,
        currentLiabilities: yearCurrentLiabilities,
        totalSources: currentTNW + yearTermLoan + yearCurrentLiabilities,
        netFixedAssets: Math.max(0, fixedAssetsAtCost - accumulatedDepreciation),
        currentAssets: yearRevenue * 0.15 // 15% of revenue as current assets
      });

      cashFlow.push({
        year: `Year ${y}`,
        inflow: yearPAT + yearDepreciation,
        financing: -(schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0)),
        closingCash: (yearPAT + yearDepreciation) - (yearRevenue * 0.05) // simplified
      });
    }

    return {
      workingCapitalValue,
      totalProjectCost,
      loanAmt,
      entrepreneurAmt,
      loanPct,
      entrepreneurPct,
      emi,
      monthlyOpEx,
      schedule,
      targetTurnover,
      projections,
      balanceSheet,
      cashFlow,
      roi: (projections.reduce((acc, p) => acc + p.pat, 0) / totalProjectCost * 100)
    };
  }, [foundationalData.totalLoanRequirement, financials, proprietaryProducts, industrialServices]);

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

  const updateMachineryItem = (idx: number, field: keyof MachineryItem, value: any) => {
    const updated = [...machineryItems];
    const item = { ...updated[idx], [field]: value };
    if (field === 'qty' || field === 'rate') item.total = (item.qty || 0) * (item.rate || 0);
    updated[idx] = item;
    setMachineryItems(updated);
    const grandTotal = updated.reduce((acc, i) => acc + i.total, 0);
    setFinancials(prev => ({ ...prev, investMachinery: grandTotal }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20 print:pb-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Landmark className="h-4 w-4" />
            Project Financial Architect
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            Strategy <span className="text-slate-400 font-medium">Engineer</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 rounded-xl border-slate-200 px-8 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm" onClick={() => window.print()}>
             <Printer className="h-4 w-4" /> Export Report
           </Button>
           <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={() => handleSaveStrategy()}>
             <Save className="h-4 w-4" /> Commit Strategy
           </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:block">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2 no-print">
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">01. Identity</TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">02. Catalogues</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">03. Projections</TabsTrigger>
          <TabsTrigger value="display" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">04. Report Preview</TabsTrigger>
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
                       <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Proposed Project Name</Label><Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.projectName || ''} onChange={(e)=>setFormData({...foundationalData, projectName: e.target.value})} /></div>
                       <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Promoter / Applicant Node</Label><Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.promoterName || ''} onChange={(e)=>setFormData({...foundationalData, promoterName: e.target.value})} /></div>
                    </div>

                    <div className="space-y-4"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Project Abstract</Label><Textarea className="bg-slate-50 border-none min-h-[100px] text-xs font-medium rounded-2xl" value={foundationalData.aboutProject || ''} onChange={(e)=>setFormData({...foundationalData, aboutProject: e.target.value})} /></div>
                 </div>

                 <div className="space-y-10 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-6">
                       <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Shield className="h-6 w-6" /></div>
                       <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Regulatory & Compliance</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official licensing and taxation identifiers.</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">GST Identification</Label><Input placeholder="27AAAAA0000A1Z5" className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase" value={foundationalData.gstNumber || ''} onChange={(e)=>setFormData({...foundationalData, gstNumber: e.target.value})} /></div>
                       <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">MSME Udyam Number</Label><Input placeholder="UDYAM-MH-00-0000000" className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase" value={foundationalData.msmeNumber || ''} onChange={(e)=>setFormData({...foundationalData, msmeNumber: e.target.value})} /></div>
                    </div>
                 </div>
              </Card>

              <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative h-fit sticky top-24">
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-10">Report Composition Matrix</h3>
                 <div className="space-y-4">
                    {Object.entries(checklist).map(([key, val]) => (
                       <div key={key} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setChecklist({...checklist, [key]: !val})}>
                          <Checkbox checked={val} className="border-white/20 data-[state=checked]:bg-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{key.replace(/([A-Z])/g, ' $1')}</span>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="products" className="m-0 space-y-12 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
              <div className="flex justify-between items-center border-l-4 border-primary pl-6">
                 <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Proprietary Product Matrix</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Items designed for market introduction.</p></div>
                 <Button className="bg-[#001F3D] text-white font-bold text-[9px] uppercase h-10 px-6 rounded-xl" onClick={() => setProprietaryProducts([...proprietaryProducts, { id: Date.now().toString(), name: '', market: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])}>+ Append Item</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {proprietaryProducts.map((p, idx) => (
                    <div key={p.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-6">
                       <div className="flex gap-6">
                          <div className="h-28 w-28 rounded-3xl overflow-hidden border-2 border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center">
                             {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-2" /> : <ImageIcon className="h-10 w-10 text-slate-200" />}
                          </div>
                          <div className="flex-1 space-y-4">
                             <Input placeholder="Product Name..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={p.name} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                             <Input placeholder="Market Sector..." className="bg-white border-none h-10 text-[11px] font-medium shadow-sm" value={p.market} onChange={(e) => updateProduct(idx, 'market', e.target.value)} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-12 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-widest"><FileBarChart className="h-4 w-4" /> Projected Sales & Profitability</div>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                             <YAxis hide />
                             <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', shadow: 'none', backgroundColor: '#001F3D', color: '#fff'}} />
                             <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'}} />
                             <Bar dataKey="revenue" name="Gross Sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="ebitda" name="EBITDA" fill="#10b981" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="pat" name="Profit After Tax" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="flex items-center gap-3 text-emerald-600 font-bold text-xs uppercase tracking-widest"><Scale className="h-4 w-4" /> TOL/TNW Ratio Trendline</div>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} />
                             <YAxis tick={{fontSize: 10, fontWeight: 700}} />
                             <Tooltip />
                             <Line type="monotone" dataKey="ratio" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="flex items-center gap-3 text-rose-500 font-bold text-xs uppercase tracking-widest"><TrendingUp className="h-4 w-4" /> Net Profit Margin Trend</div>
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} />
                             <YAxis tick={{fontSize: 10, fontWeight: 700}} unit="%" />
                             <Tooltip />
                             <Area type="monotone" dataKey="margin" stroke="#f43f5e" fill="#fef2f2" strokeWidth={3} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-12 space-y-8">
                 <Card className="p-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.3em] mb-10 border-l-4 border-primary pl-6">Projected Income Statement (5-Year Matrix)</h3>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50"><tr className="border-b border-slate-200"><th className="p-5 text-[9px] font-bold uppercase">Particulars (₹ Actuals)</th>{calculations.projections.map(p => <th key={p.year} className="p-5 text-[9px] font-bold uppercase text-right">{p.year}</th>)}</tr></thead>
                          <tbody>
                             <tr className="border-b border-slate-100"><td className="p-5 font-bold text-[11px] uppercase">Income (Gross Sales)</td>{calculations.projections.map(p => <td key={p.year} className="p-5 text-[11px] font-display font-bold text-right">{p.revenue.toLocaleString()}</td>)}</tr>
                             <tr className="border-b border-slate-100"><td className="p-5 text-[10px] text-slate-500 uppercase">Operational Expenses</td>{calculations.projections.map((p, i) => <td key={i} className="p-5 text-[10px] font-medium text-right text-red-400">({(p.revenue - p.ebitda).toLocaleString()})</td>)}</tr>
                             <tr className="border-b border-slate-100 bg-slate-50/30"><td className="p-5 font-bold text-[11px] text-emerald-600 uppercase">EBITDA</td>{calculations.projections.map(p => <td key={p.year} className="p-5 text-[11px] font-display font-bold text-right text-emerald-600">{p.ebitda.toLocaleString()}</td>)}</tr>
                             <tr className="border-b border-slate-100"><td className="p-5 text-[10px] text-slate-500 uppercase">EBIT</td>{calculations.projections.map(p => <td key={p.year} className="p-5 text-[10px] font-medium text-right">{p.ebit.toLocaleString()}</td>)}</tr>
                             <tr className="border-b border-slate-100"><td className="p-5 text-[10px] text-slate-500 uppercase">Profit Before Tax (PBT)</td>{calculations.projections.map(p => <td key={p.year} className="p-5 text-[10px] font-medium text-right">{p.pbt.toLocaleString()}</td>)}</tr>
                             <tr className="bg-[#001F3D] text-white"><td className="p-5 font-bold text-[12px] uppercase">Profit After Tax (PAT)</td>{calculations.projections.map(p => <td key={p.year} className="p-5 text-[12px] font-display font-bold text-right text-emerald-400">₹ {p.pat.toLocaleString()}</td>)}</tr>
                          </tbody>
                       </table>
                    </div>
                 </Card>

                 <Card className="p-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.3em] mb-10 border-l-4 border-emerald-500 pl-6">Projected Balance Sheet (Sources of Funds)</h3>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50"><tr className="border-b border-slate-200"><th className="p-5 text-[9px] font-bold uppercase">Particulars (₹ Actuals)</th>{calculations.balanceSheet.map(b => <th key={b.year} className="p-5 text-[9px] font-bold uppercase text-right">{b.year}</th>)}</tr></thead>
                          <tbody>
                             <tr><td colSpan={6} className="p-5 bg-blue-50/50 text-[10px] font-bold uppercase text-primary tracking-widest">A. Own Funds (TNW)</td></tr>
                             <tr className="border-b border-slate-100"><td className="p-5 text-[10px] text-slate-600 uppercase pl-10">Total Equity / Net Worth</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-5 text-[10px] font-bold text-right">{b.tnw.toLocaleString()}</td>)}</tr>
                             <tr><td colSpan={6} className="p-5 bg-emerald-50/50 text-[10px] font-bold uppercase text-emerald-700 tracking-widest">B. Long Term Liabilities</td></tr>
                             <tr className="border-b border-slate-100"><td className="p-5 text-[10px] text-slate-600 uppercase pl-10">Term Loan from Bank</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-5 text-[10px] font-bold text-right">{b.loan.toLocaleString()}</td>)}</tr>
                             <tr><td colSpan={6} className="p-5 bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-widest">C. Current Liabilities</td></tr>
                             <tr className="border-b border-slate-100"><td className="p-5 text-[10px] text-slate-600 uppercase pl-10">Provisions & Creditors</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-5 text-[10px] font-bold text-right">{b.currentLiabilities.toLocaleString()}</td>)}</tr>
                             <tr className="bg-slate-900 text-white"><td className="p-5 font-bold text-[12px] uppercase">Total Sources of Funds</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-5 text-[12px] font-display font-bold text-right">₹ {b.totalSources.toLocaleString()}</td>)}</tr>
                          </tbody>
                       </table>
                    </div>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="display" className="m-0 animate-in zoom-in-95 duration-700 print:m-0 print:p-0 flex flex-col gap-8">
           <div className="flex items-center justify-center gap-6 p-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full w-fit mx-auto sticky top-6 z-50 no-print shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <Button variant="ghost" onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))} className="h-10 w-10 rounded-full"><ZoomOut className="h-4 w-4" /></Button>
              <span className="text-[11px] font-bold text-[#001F3D]">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" onClick={() => setZoom(Math.min(zoom + 0.1, 2))} className="h-10 w-10 rounded-full"><ZoomIn className="h-4 w-4" /></Button>
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <Button onClick={() => window.print()} className="bg-[#001F3D] text-white rounded-full h-10 px-8 font-bold text-[10px] uppercase tracking-widest gap-2">
                <Printer className="h-4 w-4" /> Print Document
              </Button>
           </div>

           <div className="overflow-x-auto pb-20 hide-scrollbar flex justify-center bg-slate-100/50 p-10 min-h-screen">
             <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm' }} className="print:transform-none print:w-full">
                <div className="bg-white shadow-[0_0_80px_rgba(0,0,0,0.1)] p-20 min-h-[297mm] space-y-16 print:shadow-none print:p-12">
                   
                   {/* Cover Page */}
                   <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-12 border-b-2 border-slate-900 pb-20 relative page-break">
                      <div className="space-y-6">
                        <div className="flex justify-center mb-16">
                           <div className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white flex items-center justify-center p-4">
                              <Image src={brandLogo} alt="Logo" fill className="object-contain p-4" />
                           </div>
                        </div>
                        <Badge className="bg-primary text-white border-none px-8 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] mb-4">CONFIDENTIAL STRATEGIC REPORT</Badge>
                        <h1 className="text-6xl font-display font-bold tracking-tighter text-[#001F3D] uppercase leading-none">Techno-Economic <br />Feasibility Analysis</h1>
                        <div className="h-1.5 w-32 bg-red-600 mx-auto rounded-full mt-8" />
                      </div>
                      <div className="pt-20 grid grid-cols-2 gap-20 w-full max-w-2xl text-left border-t border-slate-100 pt-12">
                         <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project Entity</p><h4 className="text-lg font-bold text-[#001F3D] uppercase">{foundationalData.projectName}</h4></div>
                         <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submission Date</p><h4 className="text-lg font-bold text-[#001F3D] uppercase">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h4></div>
                      </div>
                   </div>

                   {/* Section 06: Income Statement */}
                   {checklist.roadMapNextFiveYears && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">06</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Projected Income Statement</h3></div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium italic">Consolidated 5-year revenue yield and profitability matrix factoring in industrial ramp-up and compound growth.</p>
                        <div className="border-2 border-slate-900 rounded-none overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b-2 border-slate-900">
                                 <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Particulars (₹ In Actuals)</th>{calculations.projections.map(p => <th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}</tr>
                              </thead>
                              <tbody>
                                 <tr className="border-b border-slate-200 font-bold"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Income from Operations</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{p.revenue.toLocaleString()}</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] text-slate-600 uppercase border-r border-slate-200">EBITDA</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{p.ebitda.toLocaleString()}</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] text-slate-600 uppercase border-r border-slate-200">Profit Before Tax</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{p.pbt.toLocaleString()}</td>)}</tr>
                                 <tr className="bg-slate-100 font-bold"><td className="p-4 text-[11px] uppercase border-r border-slate-900">Profit After Tax (PAT)</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[11px] text-right border-r border-slate-200 last:border-0">₹ {p.pat.toLocaleString()}</td>)}</tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}

                   {/* Section 07: Balance Sheet */}
                   <div className="space-y-10 pt-20 page-break">
                      <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">07</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Projected Balance Sheet</h3></div>
                      <div className="border-2 border-slate-900 rounded-none overflow-hidden">
                         <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b-2 border-slate-900">
                               <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Sources of Funds (₹)</th>{calculations.balanceSheet.map(b => <th key={b.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{b.year}</th>)}</tr>
                            </thead>
                            <tbody>
                               <tr><td colSpan={6} className="p-3 bg-slate-50 text-[9px] font-bold uppercase border-b border-slate-200">A. Own Funds</td></tr>
                               <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200 pl-8">Total Own Capital (TNW)</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{b.tnw.toLocaleString()}</td>)}</tr>
                               <tr><td colSpan={6} className="p-3 bg-slate-50 text-[9px] font-bold uppercase border-b border-slate-200">B. Long Term Liabilities</td></tr>
                               <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200 pl-8">Bank Term Loan</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{b.loan.toLocaleString()}</td>)}</tr>
                               <tr><td colSpan={6} className="p-3 bg-slate-50 text-[9px] font-bold uppercase border-b border-slate-200">C. Current Liabilities</td></tr>
                               <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200 pl-8">Provisions & Payables</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{b.currentLiabilities.toLocaleString()}</td>)}</tr>
                               <tr className="bg-slate-900 text-white font-bold"><td className="p-4 text-[11px] uppercase border-r border-white/20">Total Sources of Funds</td>{calculations.balanceSheet.map(b => <td key={b.year} className="p-4 text-[11px] text-right border-r border-white/20 last:border-0">₹ {b.totalSources.toLocaleString()}</td>)}</tr>
                            </tbody>
                         </table>
                      </div>
                   </div>

                </div>
             </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* Machinery Breakup Matrix Dialog */}
      <Dialog open={isMachineryBreakupOpen} onOpenChange={setIsMachineryBreakupOpen}>
        <DialogContent className="max-w-4xl h-[85vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="p-8 bg-[#001F3D] text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20"><Factory className="h-8 w-8" /></div>
              <div><h3 className="text-2xl font-display font-bold uppercase tracking-tight">Plant & Machinery Breakup</h3><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Capital Expenditure Quotation Ledger v2.4</p></div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMachineryBreakupOpen(false)} className="text-white/40 hover:text-white hover:bg-white/10 rounded-full"><X className="h-6 w-6" /></Button>
          </div>
          <ScrollArea className="flex-1 p-10">
            <div className="space-y-10">
              <div className="flex justify-between items-center px-1"><h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Asset Itemization Matrix</h4><Button variant="ghost" size="sm" className="h-8 text-primary font-bold text-[9px] uppercase tracking-widest gap-2 hover:bg-primary/5" onClick={() => setMachineryItems([...machineryItems, { id: `M-${Date.now()}`, name: '', qty: 1, rate: 0, total: 0 }])}><Plus className="h-3.5 w-3.5" /> Append Asset Node</Button></div>
              <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/80"><tr className="border-b border-slate-100"><th className="p-5 font-bold text-[9px] uppercase text-slate-400">Asset Identity / Specification</th><th className="p-5 font-bold text-[9px] uppercase text-slate-400 text-center w-24">Qty</th><th className="p-5 font-bold text-[9px] uppercase text-slate-400 text-right w-40">Unit Rate (₹)</th><th className="p-5 font-bold text-[9px] uppercase text-slate-400 text-right w-40">Net Value (₹)</th><th className="p-5 w-12"></th></tr></thead>
                    <tbody>
                       {machineryItems.map((item, idx) => (
                         <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 group">
                            <td className="p-4"><Input placeholder="e.g. VMC HAAS VF-2" className="h-10 bg-transparent border-none text-[11px] font-bold uppercase" value={item.name} onChange={(e)=>updateMachineryItem(idx, 'name', e.target.value)} /></td>
                            <td className="p-4"><Input type="number" className="h-10 bg-transparent border-none text-center text-xs font-bold" value={item.qty} onChange={(e)=>updateMachineryItem(idx, 'qty', Number(e.target.value))} /></td>
                            <td className="p-4"><Input type="number" className="h-10 bg-transparent border-none text-right text-xs font-display font-bold" value={item.rate} onChange={(e)=>updateMachineryItem(idx, 'rate', Number(e.target.value))} /></td>
                            <td className="p-4 text-right"><span className="text-[11px] font-display font-bold text-[#001F3D]">₹ {item.total.toLocaleString()}</span></td>
                            <td className="p-4"><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => setMachineryItems(machineryItems.filter((_, i)=>i !== idx))}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
             <div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Gross Quotation Value</p><p className="text-2xl font-display font-bold text-primary">₹ {financials.investMachinery.toLocaleString()}</p></div>
             <Button className="h-12 px-10 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl" onClick={() => setIsMachineryBreakupOpen(false)}>Commit Breakup Matrix <ChevronRight className="h-3.5 w-3.5 ml-2" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
