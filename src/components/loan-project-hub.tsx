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
  Scale,
  Edit3,
  User,
  Star,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
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
import { doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

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

  // DEEP FINANCIAL ENGINE
  const calculations = useMemo(() => {
    const monthlyOpEx = (financials.expenseRent || 0) + (financials.expensePower || 0) + (financials.expenseMaintenance || 0) + (financials.expenseSalary || 0);
    const workingCapitalValue = monthlyOpEx * 3;
    const loanAmt = parseFloat((foundationalData.totalLoanRequirement || '0').replace(/,/g, '')) || 0;
    const entrepreneurAmt = financials.entrepreneurContribution || 0;
    
    // Total Project Cost: LOAN + Entrepreneur + Working Capital
    const totalProjectCost = loanAmt + entrepreneurAmt + workingCapitalValue;
    
    const loanPct = totalProjectCost > 0 ? (loanAmt / totalProjectCost) * 100 : 0;
    const entrepreneurPct = totalProjectCost > 0 ? (entrepreneurAmt / totalProjectCost) * 100 : 0;

    // EMI Scheduling
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
    const depreciationRate = 0.15; // 15% on machinery/fixed assets
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

      const yearOpEx = monthlyOpEx * 12 * (1 + (y * 0.05)); // 5% inflation
      const yearEBITDA = yearRevenue - yearOpEx;
      const yearDepreciation = Math.max(0, (fixedAssetsAtCost - accumulatedDepreciation) * depreciationRate);
      accumulatedDepreciation += yearDepreciation;
      
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearPBT = yearEBITDA - yearDepreciation - yearInterest;
      const yearTax = yearPBT > 0 ? yearPBT * 0.25 : 0;
      const yearPAT = yearPBT - yearTax;
      
      currentTNW += yearPAT * 0.8; // Assume 20% drawings
      const yearTermLoan = schedule[y * 12 - 1]?.balance || 0;
      const yearCurrentLiabilities = workingCapitalValue * (1 + (y * 0.1)); 
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
        currentAssets: yearRevenue * 0.15 
      });

      cashFlow.push({
        year: `Year ${y}`,
        inflow: yearPAT + yearDepreciation,
        financing: -(schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0)),
        closingCash: (yearPAT + yearDepreciation) - (yearRevenue * 0.05)
      });
    }

    return {
      monthlyOpEx,
      workingCapitalValue,
      totalProjectCost,
      loanAmt,
      entrepreneurAmt,
      loanPct,
      entrepreneurPct,
      emi,
      schedule,
      targetTurnover,
      projections,
      balanceSheet,
      cashFlow,
      roi: (projections.reduce((acc, p) => acc + p.pat, 0) / totalProjectCost * 100)
    };
  }, [foundationalData.totalLoanRequirement, financials]);

  const handleImageUpload = (idx: number, type: 'product' | 'service', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') {
          const newP = [...proprietaryProducts];
          newP[idx].imageUrl = reader.result as string;
          setProprietaryProducts(newP);
        } else {
          const newS = [...industrialServices];
          newS[idx].imageUrl = reader.result as string;
          setIndustrialServices(newS);
        }
        toast({ title: "Visual Artifact Matrixed", description: "Image converted to data URI and synchronized." });
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (field === 'qty' || field === 'rate') item.total = (Number(item.qty) || 0) * (Number(item.rate) || 0);
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
            Strategic Financial Architect
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
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">01. Identity</TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">02. Catalogues</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">03. Projections</TabsTrigger>
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
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Primary metadata for institutional feasibility ledger.</p>
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
                       <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Regulatory & Compliance</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official licensing and MSME identifiers.</p></div>
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
                       <div key={key} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setChecklist({...checklist, [key as keyof typeof checklist]: !val})}>
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
                 <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Proprietary Product Matrix</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">High-fidelity items designed for institutional scale.</p></div>
                 <Button className="bg-[#001F3D] text-white font-bold text-[9px] uppercase h-10 px-6 rounded-xl" onClick={() => setProprietaryProducts([...proprietaryProducts, { id: Date.now().toString(), name: '', market: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])}>+ Append Product</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {proprietaryProducts.map((p, idx) => (
                    <div key={p.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-6 relative">
                       <div className="flex gap-6">
                          <div className="h-28 w-28 rounded-3xl overflow-hidden border-2 border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center group">
                             {p.imageUrl ? (
                               <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-2" />
                             ) : (
                               <ImageIcon className="h-10 w-10 text-slate-200" />
                             )}
                             <input type="file" id={`p-img-${p.id}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(idx, 'product', e)} />
                             <label htmlFor={`p-img-${p.id}`} className="absolute inset-0 bg-[#001F3D]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                <Upload className="h-6 w-6 text-white" />
                             </label>
                          </div>
                          <div className="flex-1 space-y-4">
                             <Input placeholder="Product Name..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={p.name || ''} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                             <Input placeholder="Annual Projection (Qty)..." className="bg-white border-none h-10 text-[11px] font-medium shadow-sm" value={p.annualTargetQty || ''} onChange={(e) => updateProduct(idx, 'annualTargetQty', e.target.value)} />
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-200 hover:text-red-500" onClick={() => setProprietaryProducts(proprietaryProducts.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
              <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-6">
                 <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Industrial Services Matrix</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Specialized technical operations for B2B sub-systems.</p></div>
                 <Button className="bg-[#001F3D] text-white font-bold text-[9px] uppercase h-10 px-6 rounded-xl" onClick={() => setIndustrialServices([...industrialServices, { id: Date.now().toString(), name: '', description: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])}>+ Append Service</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {industrialServices.map((s, idx) => (
                    <div key={s.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-6 relative">
                       <div className="flex gap-6">
                          <div className="h-28 w-28 rounded-3xl overflow-hidden border-2 border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center group">
                             {s.imageUrl ? (
                               <img src={s.imageUrl} alt="" className="h-full w-full object-contain p-2" />
                             ) : (
                               <Settings2 className="h-10 w-10 text-slate-200" />
                             )}
                             <input type="file" id={`s-img-${s.id}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(idx, 'service', e)} />
                             <label htmlFor={`s-img-${s.id}`} className="absolute inset-0 bg-[#001F3D]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                <Upload className="h-6 w-6 text-white" />
                             </label>
                          </div>
                          <div className="flex-1 space-y-4">
                             <Input placeholder="Service Identity..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={s.name || ''} onChange={(e) => updateService(idx, 'name', e.target.value)} />
                             <Input placeholder="Annual Projection (Qty)..." className="bg-white border-none h-10 text-[11px] font-medium shadow-sm" value={s.annualTargetQty || ''} onChange={(e) => updateService(idx, 'annualTargetQty', e.target.value)} />
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-200 hover:text-red-500" onClick={() => setIndustrialServices(industrialServices.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
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
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                             <YAxis hide />
                             <ChartTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', shadow: 'none', backgroundColor: '#001F3D', color: '#fff'}} />
                             <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'}} />
                             <Bar dataKey="revenue" name="Gross Sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="ebitda" name="EBITDA" fill="#10b981" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="pat" name="PAT" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="flex items-center gap-3 text-emerald-600 font-bold text-xs uppercase tracking-widest"><Scale className="h-4 w-4" /> TOL/TNW Ratio Trendline</div>
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} />
                             <YAxis tick={{fontSize: 10, fontWeight: 700}} />
                             <ChartTooltip />
                             <Line type="monotone" dataKey="ratio" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="flex items-center gap-3 text-rose-500 font-bold text-xs uppercase tracking-widest"><TrendingUp className="h-4 w-4" /> Net Profit Margin Trend</div>
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} />
                             <YAxis tick={{fontSize: 10, fontWeight: 700}} unit="%" />
                             <ChartTooltip />
                             <Area type="monotone" dataKey="margin" stroke="#f43f5e" fill="#fef2f2" strokeWidth={3} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                       <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Clock className="h-6 w-6" /></div>
                       <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">OpEx Matrix</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Recurring monthly liabilities.</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Rent Hub (₹)</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.expenseRent ?? 0} onChange={(e)=>setFinancials({...financials, expenseRent: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Salary Ledger (₹)</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.expenseSalary ?? 0} onChange={(e)=>setFinancials({...financials, expenseSalary: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Power Node (₹)</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.expensePower ?? 0} onChange={(e)=>setFinancials({...financials, expensePower: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Maintenance (₹)</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.expenseMaintenance ?? 0} onChange={(e)=>setFinancials({...financials, expenseMaintenance: Number(e.target.value)})} /></div>
                    </div>
                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex justify-between items-center">
                       <div className="flex items-center gap-3"><Receipt className="h-5 w-5 text-primary" /><span className="text-[10px] font-bold uppercase text-[#001F3D]">Monthly EMI (Auto)</span></div>
                       <span className="text-lg font-display font-bold text-primary">₹ {calculations.emi.toLocaleString()}</span>
                    </div>
                 </Card>

                 <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-6">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Factory className="h-6 w-6" /></div>
                          <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Investment Matrix</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">One-time capital expenditures.</p></div>
                       </div>
                       <Button variant="ghost" className="text-primary font-bold text-[9px] uppercase tracking-widest gap-2" onClick={()=>setIsMachineryBreakupOpen(true)}><Edit3 className="h-3.5 w-3.5" /> Edit Breakup</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="space-y-2 col-span-2"><Label className="text-[9px] font-bold uppercase text-slate-500">Plant & Machinery (Total)</Label><Input readOnly className="bg-slate-100 font-bold" value={(financials.investMachinery ?? 0).toLocaleString()} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-500">Advance (₹)</Label><Input type="number" className="bg-slate-50" value={financials.investAdvance ?? 0} onChange={(e)=>setFinancials({...financials, investAdvance: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-500">Civil (₹)</Label><Input type="number" className="bg-slate-50" value={financials.investCivil ?? 0} onChange={(e)=>setFinancials({...financials, investCivil: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-500">Software (₹)</Label><Input type="number" className="bg-slate-50" value={financials.investSoftware ?? 0} onChange={(e)=>setFinancials({...financials, investSoftware: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-500">System (₹)</Label><Input type="number" className="bg-slate-50" value={financials.investSystem ?? 0} onChange={(e)=>setFinancials({...financials, investSystem: Number(e.target.value)})} /></div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-12">
                 <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '60px 60px' }} />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
                       <div className="space-y-6">
                          <div><p className="text-[10px] font-bold uppercase text-white/40 tracking-[0.4em]">LOAN CAPITAL</p><div className="flex items-center gap-3 mt-2"><DollarSign className="h-6 w-6 text-primary" /><Input className="bg-white/5 border-none h-14 text-3xl font-display font-bold text-white shadow-inner p-0" value={foundationalData.totalLoanRequirement || ''} onChange={(e)=>setFormData({...foundationalData, totalLoanRequirement: e.target.value})} /></div></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div><Label className="text-[8px] font-bold text-white/40 uppercase">ROI (%)</Label><Input type="number" className="bg-white/5 border-none h-10 text-xs font-bold" value={financials.loanROI ?? 0} onChange={(e)=>setFinancials({...financials, loanROI: Number(e.target.value)})} /></div>
                             <div><Label className="text-[8px] font-bold text-white/40 uppercase">TENURE (MO)</Label><Input type="number" className="bg-white/5 border-none h-10 text-xs font-bold" value={financials.loanTenure ?? 0} onChange={(e)=>setFinancials({...financials, loanTenure: Number(e.target.value)})} /></div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div><p className="text-[10px] font-bold uppercase text-white/40 tracking-[0.4em]">ENTREPRENEUR INVEST</p><div className="flex items-center gap-3 mt-2"><User className="h-6 w-6 text-emerald-400" /><Input type="number" className="bg-white/5 border-none h-14 text-3xl font-display font-bold text-white shadow-inner p-0" value={financials.entrepreneurContribution ?? 0} onChange={(e)=>setFinancials({...financials, entrepreneurContribution: Number(e.target.value)})} /></div></div>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-4 py-1.5 rounded-full text-[9px] font-bold uppercase">EQUITY NODE ACTIVE</Badge>
                       </div>

                       <div className="space-y-6">
                          <div><p className="text-[10px] font-bold uppercase text-white/40 tracking-[0.4em]">WORKING CAPITAL</p><div className="flex items-center gap-3 mt-2"><Cpu className="h-6 w-6 text-amber-400" /><p className="text-3xl font-display font-bold text-white">₹ {calculations.workingCapitalValue.toLocaleString()}</p></div></div>
                          <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-bold uppercase px-3">3.0X OPEX MULTIPLIER</Badge>
                       </div>

                       <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col justify-between">
                          <p className="text-[10px] font-bold uppercase text-primary tracking-[0.4em]">TOTAL PROJECT COST</p>
                          <p className="text-4xl font-display font-bold text-white tracking-tighter">₹ {calculations.totalProjectCost.toLocaleString()}</p>
                       </div>
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
                <Printer className="h-4 w-4" /> Export institutional PDF
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
                              <Image src={brandLogo || defaultBrandLogo} alt="Logo" fill className="object-contain p-4" />
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

                   {/* Section 01: About Project */}
                   {checklist.aboutProject && (
                     <div className="space-y-8 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">01</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Executive Summary</h3></div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{foundationalData.aboutProject}</p>
                     </div>
                   )}

                   {/* Section 02: Vision & Mission */}
                   {(checklist.vision || checklist.mission) && (
                     <div className="grid grid-cols-2 gap-12 page-break">
                        {checklist.vision && (
                          <div className="space-y-6">
                             <div className="flex items-center gap-4"><Target className="h-6 w-6 text-primary" /><h4 className="text-lg font-bold uppercase tracking-tight">Our Vision</h4></div>
                             <p className="text-xs text-slate-500 italic leading-relaxed">"{foundationalData.vision}"</p>
                          </div>
                        )}
                        {checklist.mission && (
                          <div className="space-y-6">
                             <div className="flex items-center gap-4"><Compass className="h-6 w-6 text-primary" /><h4 className="text-lg font-bold uppercase tracking-tight">Our Mission</h4></div>
                             <p className="text-xs text-slate-500 italic leading-relaxed">"{foundationalData.mission}"</p>
                          </div>
                        )}
                     </div>
                   )}

                   {/* Section 03: About Us */}
                   {checklist.aboutUs && (
                     <div className="space-y-8 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">03</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Organizational Profile</h3></div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{foundationalData.aboutUs}</p>
                     </div>
                   )}

                   {/* Section 04: Product & Service Catalogue */}
                   {(checklist.productLine || checklist.services) && (
                     <div className="space-y-12 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">04</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Industrial Capability Matrix</h3></div>
                        
                        {checklist.productLine && proprietaryProducts.length > 0 && (
                          <div className="space-y-8">
                             <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Proprietary Product Line</h4>
                             <div className="grid grid-cols-2 gap-8">
                                {proprietaryProducts.map(p => (
                                  <div key={p.id} className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col bg-slate-50/50">
                                     <div className="aspect-video relative bg-white flex items-center justify-center p-4">
                                        {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-12 w-12 text-slate-100" />}
                                     </div>
                                     <div className="p-5 space-y-2">
                                        <p className="text-[11px] font-bold text-[#001F3D] uppercase">{p.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.annualTargetQty} Projected Units / Year</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}

                        {checklist.services && industrialServices.length > 0 && (
                          <div className="space-y-8">
                             <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 border-l-4 border-emerald-500 pl-4">Technical Service Nodes</h4>
                             <div className="grid grid-cols-2 gap-8">
                                {industrialServices.map(s => (
                                  <div key={s.id} className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col bg-slate-50/50">
                                     <div className="aspect-video relative bg-white flex items-center justify-center p-4">
                                        {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-full w-full object-contain" /> : <Settings2 className="h-12 w-12 text-slate-100" />}
                                     </div>
                                     <div className="p-5 space-y-2">
                                        <p className="text-[11px] font-bold text-[#001F3D] uppercase">{s.name}</p>
                                        <p className="text-[9px] text-slate-500 leading-relaxed font-medium">{s.description}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>
                   )}

                   {/* Section 05: Entrepreneur Details */}
                   {checklist.entrepreneurDetails && (
                     <div className="space-y-8 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">05</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Promoter Technical Profile</h3></div>
                        <div className="p-10 border border-slate-200 rounded-3xl space-y-8 bg-slate-50/30">
                           <div className="flex items-center gap-8 border-b border-slate-200 pb-8">
                              <div className="h-24 w-24 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 shadow-sm"><UserCircle className="h-16 w-16" /></div>
                              <div className="space-y-2">
                                 <h4 className="text-xl font-bold text-[#001F3D] uppercase">{foundationalData.promoterName}</h4>
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{foundationalData.qualification}</p>
                                 <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1 rounded-full text-[10px] font-bold uppercase">{foundationalData.experience}</Badge>
                              </div>
                           </div>
                           <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{foundationalData.promoterNarrative}"</p>
                        </div>
                     </div>
                   )}

                   {/* Section 06: Road Map */}
                   {checklist.roadMapNextFiveYears && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">06</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Road Map for next five years</h3></div>
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

                   {/* Section 08: CGTMSE Section */}
                   {checklist.cgtmseScheme && (
                      <div className="space-y-10 pt-20 page-break">
                         <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-lg">08</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">CGTMSE Scheme Protocol</h3></div>
                         <Card className="p-10 border-2 border-slate-900 rounded-none space-y-8 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                               <div className="space-y-4">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Coverage Matrix</h4>
                                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">The Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) provides collateral-free credit justification. The scheme covers up to 85% of the loan value for micro-enterprises and women-owned entities.</p>
                               </div>
                               <div className="space-y-4">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Zap className="h-4 w-4" /> Scheme Multipliers</h4>
                                  <ul className="text-[10px] font-bold text-slate-500 space-y-2 uppercase">
                                     <li className="flex justify-between border-b pb-2"><span>Limit Capacity</span> <span>₹ 500.00 Lakhs</span></li>
                                     <li className="flex justify-between border-b pb-2"><span>Guarantee Scope</span> <span>75% - 85%</span></li>
                                     <li className="flex justify-between border-b pb-2"><span>Risk Coverage</span> <span>Hybrid Available</span></li>
                                  </ul>
                               </div>
                            </div>
                            <div className="p-6 bg-white border border-slate-200 text-center">
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Note: Annual Guarantee Fee (AGF) will be synchronized with institutional norms.</p>
                            </div>
                         </Card>
                      </div>
                   )}
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
                            <td className="p-4"><Input placeholder="e.g. VMC HAAS VF-2" className="h-10 bg-transparent border-none text-[11px] font-bold uppercase" value={item.name || ''} onChange={(e)=>updateMachineryItem(idx, 'name', e.target.value)} /></td>
                            <td className="p-4"><Input type="number" className="h-10 bg-transparent border-none text-center text-xs font-bold" value={item.qty ?? 1} onChange={(e)=>updateMachineryItem(idx, 'qty', e.target.value)} /></td>
                            <td className="p-4"><Input type="number" className="h-10 bg-transparent border-none text-right text-xs font-display font-bold" value={item.rate ?? 0} onChange={(e)=>updateMachineryItem(idx, 'rate', e.target.value)} /></td>
                            <td className="p-4 text-right"><span className="text-[11px] font-display font-bold text-[#001F3D]">₹ {(item.total ?? 0).toLocaleString()}</span></td>
                            <td className="p-4"><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => setMachineryItems(machineryItems.filter((_, i)=>i !== idx))}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
             <div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Gross Quotation Value</p><p className="text-2xl font-display font-bold text-primary">₹ {(financials.investMachinery ?? 0).toLocaleString()}</p></div>
             <Button className="h-12 px-10 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl" onClick={() => setIsMachineryBreakupOpen(false)}>Commit Breakup Matrix <ChevronRight className="h-3.5 w-3.5 ml-2" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawing Zoom Protocol Dialog */}
      <Dialog open={zoom > 1} onOpenChange={() => setZoom(1)}>
        <DialogContent className="max-w-5xl bg-black/90 border-none shadow-2xl p-0 overflow-hidden rounded-[2rem] flex flex-col h-[90vh]">
          <div className="flex justify-between items-center p-6 text-white bg-slate-950 border-b border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest">High-Fidelity Document Viewer</h3>
            <Button variant="ghost" size="icon" onClick={() => setZoom(1)} className="text-white hover:bg-white/10 rounded-full"><X className="h-6 w-6" /></Button>
          </div>
          <ScrollArea className="flex-1 p-10">
            <div className="flex justify-center">
               {/* This is a visual zoom simulation for the preview report */}
               <div className="bg-white shadow-2xl p-20 min-h-[297mm] space-y-16" style={{ width: '210mm' }}>
                  {/* Content would normally be re-rendered here at full size */}
                  <p className="text-center text-slate-400 font-bold uppercase tracking-widest pt-40">Matrix Fit to Scroll Active</p>
               </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
