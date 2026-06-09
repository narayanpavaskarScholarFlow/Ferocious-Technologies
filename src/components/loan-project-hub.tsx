"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Maximize2,
  RefreshCw,
  Globe,
  Palette,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownLeft
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
  Legend,
  Cell
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function LoanProjectHub({ brandLogo = '' }: LoanProjectHubProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');
  const [activeEditingSection, setActiveEditingSection] = useState<string>('aboutUs');
  const [zoom, setZoom] = useState(1);
  const [isMachineryBreakupOpen, setIsMachineryBreakupOpen] = useState(false);

  // Firestore Persistence Node
  const strategyRef = useMemoFirebase(() => doc(db, 'settings', 'loan_strategy'), [db]);
  const { data: savedStrategy } = useDoc<any>(strategyRef);

  // 01. Input Matrix State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    aboutUs: true,
    vision: true,
    mission: true,
    entrepreneurDetails: true,
    productLine: true,
    services: true,
    marketAnalysis: true,
    toolingMarketAnalysis: true,
    roadMapNextFiveYears: true,
    cgtmseScheme: true,
    financialProjections: true,
    oneTimeInvestment: true,
    amortizationSchedule: true,
    cashFlowStatement: true,
    keyRatios: true,
    mpbfCalculation: true,
    dscrMatrix: true
  });

  const [foundationalData, setFormData] = useState({
    projectName: 'Precision VMC Machining & Tool Room Hub',
    promoterName: 'Jayant Patil',
    location: 'Pune, Maharashtra',
    totalLoanRequirement: '50,00,000',
    aboutUs: 'Ferocious Tech is an emerging industrial leader in precision engineering, focused on technical excellence and automated manufacturing protocols.',
    vision: 'To establish Ferocious Tech as the global benchmark for precision machining and innovative industrial tool-room solutions.',
    mission: 'Providing exceptional technical value through specialized engineering, uncompromising quality releases, and innovative product development.',
    qualification: 'B.E. Mechanical / MBA Operations',
    experience: '15+ Years in Tool Room & VMC Operations',
    promoterNarrative: 'Highly technical leadership with a proven track record in precision engineering and industrial process automation. Dedicated to establishing excellence in VMC machining protocols.',
    marketAnalysisDetails: "India's electrical sector is witnessing an unprecedented surge, driven by the government's mandate for 100% rural electrification, railway modernization (Kavach system), and the rapid expansion of EV charging infrastructure. Electrical conductive products, including copper and aluminum-based precision components, form the backbone of this transformation. Global supply chain shifts are creating significant opportunities for localized production of silver-plated contacts for high-voltage switchgear and specialized alloys for 5G telecommunication hardware.",
    toolingMarketAnalysisDetails: "The Indian Tooling Industry is the strategic foundation of the manufacturing sector, valued at approximately ₹18,500 Crores. With the expansion of localized manufacturing in Electronics (Mobile Phones), Aerospace, and Automotive sectors, the demand for specialized jigs, fixtures, and high-fidelity molds has reached an inflection point. Demand is particularly acute for high-cavity hot runner molds for consumer electronics and multi-stage progressive press tools for the next generation of electric vehicle chassis components.",
    cgtmseNotes: "The project identifies the CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises) as the primary credit risk mitigation matrix. This allow for a collateral-free loan facility based on the viability of the manufacturing node. Guarantee fee (AGF) will be serviced as per the annual schedule mandated by the Trust, ensuring the loan node remains covered under the global security umbrella."
  });

  const [proprietaryProducts, setProprietaryProducts] = useState<ProprietaryProduct[]>([
    { id: '1', name: 'Precision Curved Conduit Connector', market: 'Electrical / Construction', price: '45.00', annualTargetQty: '50,000', imageUrl: 'https://picsum.photos/seed/conduit/600/400' },
    { id: '2', name: 'VMC Machined Engine Plate', market: 'Automotive Tier 1', price: '1,800.00', annualTargetQty: '1,200', imageUrl: 'https://picsum.photos/seed/engineplate/600/400' },
    { id: '3', name: 'High-Purity Copper Busbar', market: 'Switchgear / Energy', price: '2,500.00', annualTargetQty: '800', imageUrl: 'https://picsum.photos/seed/copper/600/400' },
  ]);

  const [industrialServices, setIndustrialServices] = useState<IndustrialService[]>([
    { id: 'S1', name: 'High-Precision VMC Job-Work', description: 'Specialized 3-axis and 4-axis VMC machining services for complex aerospace geometries.', price: '1,250.00', annualTargetQty: '2,500', imageUrl: 'https://picsum.photos/seed/milling/600/400' },
    { id: 'S2', name: 'Mould Design & Prototyping', description: 'End-to-end mould fabrication from Dfm analysis to final polishing and testing.', price: '45,000.00', annualTargetQty: '24', imageUrl: 'https://picsum.photos/seed/edm/600/400' },
    { id: 'S3', name: 'Jig & Fixture Certification', description: 'CMM verified fixture manufacturing for Tier 1 assembly lines.', price: '15,000.00', annualTargetQty: '48', imageUrl: 'https://picsum.photos/seed/jig/600/400' },
  ]);

  const [machineryItems, setMachineryItems] = useState<MachineryItem[]>([
    { id: 'M1', name: 'VMC 3-Axis Center', qty: 1, rate: 4500000, total: 4500000 },
  ]);

  const [financials, setFinancials] = useState({
    loanROI: 9.5,
    loanTenure: 60,
    loanMoratorium: 6,
    expenseRent: 150000,
    expensePersonnel: 100000, 
    expensePower: 100000,
    expenseMaintenance: 50000,
    expenseConsumables: 80000,
    investMachinery: 4500000,
    investCivil: 1000000,
    investElectrical: 500000,
    investFurniture: 300000,
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
    const monthlyOpEx = (financials.expenseRent || 0) + (financials.expensePersonnel || 0) + (financials.expensePower || 0) + (financials.expenseMaintenance || 0) + (financials.expenseConsumables || 0);
    const workingCapitalValue = monthlyOpEx * 3;
    const loanAmt = parseFloat((foundationalData.totalLoanRequirement || '0').replace(/,/g, '')) || 0;
    const entrepreneurAmt = financials.entrepreneurContribution || 0;
    
    const totalProjectCost = loanAmt + entrepreneurAmt + workingCapitalValue;
    
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

    const projections: any[] = [];
    const balanceSheet: any[] = [];
    const cashFlow: any[] = [];
    const loanRepayment: any[] = [];

    let currentTNW = entrepreneurAmt;
    let currentCapacityRevenue = targetTurnover * 12;
    let accumulatedDepreciation = 0;
    const depreciationRate = 0.15;
    const fixedAssetsAtCost = (financials.investMachinery || 0) + (financials.investCivil || 0) + (financials.investElectrical || 0) + (financials.investFurniture || 0) + (financials.investSoftware || 0) + (financials.investSystem || 0) + (financials.investAdvance || 0);

    let openingCash = workingCapitalValue * 0.2;

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
      const yearDepreciation = Math.max(0, (fixedAssetsAtCost - accumulatedDepreciation) * depreciationRate);
      accumulatedDepreciation += yearDepreciation;
      
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearPrincipal = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0);
      const yearPBT = yearEBITDA - yearDepreciation - yearInterest;
      const yearTax = yearPBT > 0 ? yearPBT * 0.25 : 0;
      const yearPAT = yearPBT - yearTax;
      
      currentTNW += yearPAT * 0.8;
      const yearTermLoan = schedule[Math.min(y * 12, schedule.length) - 1]?.balance || 0;
      const yearCurrentLiabilities = workingCapitalValue * (1 + (y * 0.1)); 
      const yearTOL = yearTermLoan + yearCurrentLiabilities;

      const dscr = (yearPAT + yearDepreciation + yearInterest) / (yearInterest + yearPrincipal || 1);

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
        ratio: (yearTOL / currentTNW).toFixed(2),
        dscr: dscr.toFixed(2),
        growth: growth
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

      const opProfitBeforeWC = yearPAT + yearInterest + yearDepreciation;
      const changeInCL = yearCurrentLiabilities * 0.1;
      const financingActivities = -yearInterest - yearPrincipal;
      const closingCash = openingCash + opProfitBeforeWC + changeInCL + financingActivities;

      cashFlow.push({
        year: `Year ${y}`,
        npat: yearPAT,
        interest: yearInterest,
        depreciation: yearDepreciation,
        opProfit: opProfitBeforeWC,
        clChange: changeInCL,
        loanRepayment: -yearPrincipal,
        openingCash,
        closingCash
      });

      loanRepayment.push({
        year: `Year ${y}`,
        opening: (schedule[(y-1)*12]?.balance + (y === 0 ? 0 : schedule[(y-1)*12]?.principal)) || (y === 1 ? loanAmt : 0),
        interest: yearInterest,
        principal: yearPrincipal,
        closing: yearTermLoan
      });

      openingCash = closingCash;
    }

    const currentAssets = targetTurnover * 12 * 0.25;
    const currentLiabilitiesExclBank = workingCapitalValue * 0.3;
    const wcGap = currentAssets - currentLiabilitiesExclBank;
    const mpbf = wcGap * 0.75;

    return {
      monthlyOpEx,
      workingCapitalValue,
      totalProjectCost,
      loanAmt,
      entrepreneurAmt,
      emi,
      schedule,
      targetTurnover,
      projections,
      balanceSheet,
      cashFlow,
      loanRepayment,
      mpbf,
      roi: (projections.reduce((acc, p) => acc + p.pat, 0) / totalProjectCost * 100)
    };
  }, [foundationalData.totalLoanRequirement, financials, foundationalData.targetNetMargin]);

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

  const renderActiveEditor = () => {
    switch(activeEditingSection) {
      case 'aboutUs':
        return (
          <div className="space-y-6">
            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">About Us / Industrial Narrative</Label>
            <Textarea 
              className="bg-slate-50 border-none min-h-[250px] text-xs font-medium rounded-2xl p-6 leading-relaxed" 
              placeholder="Enter comprehensive company narrative..."
              value={foundationalData.aboutUs || ''} 
              onChange={(e)=>setFormData({...foundationalData, aboutUs: e.target.value})} 
            />
          </div>
        );
      case 'vision':
        return (
          <div className="space-y-6">
            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Corporate Vision</Label>
            <Textarea 
              className="bg-slate-50 border-none min-h-[150px] text-sm italic font-medium rounded-2xl p-6" 
              placeholder="What is your long-term goal?"
              value={foundationalData.vision || ''} 
              onChange={(e)=>setFormData({...foundationalData, vision: e.target.value})} 
            />
          </div>
        );
      case 'mission':
        return (
          <div className="space-y-6">
            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Corporate Mission</Label>
            <Textarea 
              className="bg-slate-50 border-none min-h-[150px] text-sm italic font-medium rounded-2xl p-6" 
              placeholder="How will you achieve your vision?"
              value={foundationalData.mission || ''} 
              onChange={(e)=>setFormData({...foundationalData, mission: e.target.value})} 
            />
          </div>
        );
      case 'entrepreneurDetails':
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Promoter Name</Label>
                <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.promoterName || ''} onChange={(e)=>setFormData({...foundationalData, promoterName: e.target.value})} />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Location / Node</Label>
                <Input className="h-14 bg-slate-50 border-none rounded-2xl font-bold" value={foundationalData.location || ''} onChange={(e)=>setFormData({...foundationalData, location: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Qualification</Label>
                <Input className="h-14 bg-slate-50 border-none rounded-2xl" value={foundationalData.qualification || ''} onChange={(e)=>setFormData({...foundationalData, qualification: e.target.value})} />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Experience (Years)</Label>
                <Input className="h-14 bg-slate-50 border-none rounded-2xl" value={foundationalData.experience || ''} onChange={(e)=>setFormData({...foundationalData, experience: e.target.value})} />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Professional Narrative</Label>
              <Textarea className="bg-slate-50 border-none min-h-[120px] rounded-2xl" value={foundationalData.promoterNarrative || ''} onChange={(e)=>setFormData({...foundationalData, promoterNarrative: e.target.value})} />
            </div>
          </div>
        );
      case 'marketAnalysis':
        return (
          <div className="space-y-6">
            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Electrical Conductive Market Details</Label>
            <Textarea 
              className="bg-slate-50 border-none min-h-[350px] text-xs font-medium rounded-2xl p-6 leading-relaxed" 
              value={foundationalData.marketAnalysisDetails || ''} 
              onChange={(e)=>setFormData({...foundationalData, marketAnalysisDetails: e.target.value})} 
            />
          </div>
        );
      case 'toolingMarketAnalysis':
        return (
          <div className="space-y-6">
            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Tooling, Jig & Fixture Market Details</Label>
            <Textarea 
              className="bg-slate-50 border-none min-h-[350px] text-xs font-medium rounded-2xl p-6 leading-relaxed" 
              value={foundationalData.toolingMarketAnalysisDetails || ''} 
              onChange={(e)=>setFormData({...foundationalData, toolingMarketAnalysisDetails: e.target.value})} 
            />
          </div>
        );
      case 'cgtmseScheme':
        return (
          <div className="space-y-6">
            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">CGTMSE Scheme Protocol Notes</Label>
            <Textarea 
              className="bg-slate-50 border-none min-h-[200px] text-xs font-medium rounded-2xl p-6 leading-relaxed" 
              value={foundationalData.cgtmseNotes || ''} 
              onChange={(e)=>setFormData({...foundationalData, cgtmseNotes: e.target.value})} 
            />
          </div>
        );
      case 'productLine':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proprietary Product Matrix</h4>
              <div className="flex gap-2">
                <Button onClick={() => setProprietaryProducts([...proprietaryProducts, { id: Date.now().toString(), name: '', market: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])} variant="outline" size="sm" className="h-8 text-[9px] uppercase font-bold">+ Append Item</Button>
                <Button onClick={() => handleSaveStrategy()} className="h-8 text-[9px] uppercase font-bold bg-[#001F3D] hover:bg-black text-white gap-2"><Save className="h-3 w-3" /> Save Matrix</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {proprietaryProducts.map((p, i) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4 relative">
                  <div className="h-24 w-full bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-2" /> : <ImageIcon className="h-6 w-6 text-slate-200" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Product Name..." className="h-8 text-[11px] font-bold bg-white border-none" value={p.name || ''} onChange={(e)=>updateProduct(i, 'name', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Price (₹)..." className="h-7 text-[9px] bg-white border-none" value={p.price || ''} onChange={(e)=>updateProduct(i, 'price', e.target.value)} />
                      <Input placeholder="Annual Qty..." className="h-7 text-[9px] bg-white border-none" value={p.annualTargetQty || ''} onChange={(e)=>updateProduct(i, 'annualTargetQty', e.target.value)} />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-slate-300 hover:text-red-500" onClick={()=>setProprietaryProducts(proprietaryProducts.filter((_, idx)=>idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
            <div className="pt-10 flex justify-center border-t border-slate-100 mt-10">
              <Button onClick={() => handleSaveStrategy()} className="h-14 bg-[#001F3D] hover:bg-black text-white px-12 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3">
                <Save className="h-5 w-5" /> Commit Matrix to Ledger
              </Button>
            </div>
          </div>
        );
      case 'services':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industrial Services Matrix</h4>
              <div className="flex gap-2">
                <Button onClick={() => setIndustrialServices([...industrialServices, { id: Date.now().toString(), name: '', description: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])} variant="outline" size="sm" className="h-8 text-[9px] uppercase font-bold">+ Append Node</Button>
                <Button onClick={() => handleSaveStrategy()} className="h-8 text-[9px] uppercase font-bold bg-[#001F3D] hover:bg-black text-white gap-2"><Save className="h-3 w-3" /> Save Matrix</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {industrialServices.map((s, i) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4 relative">
                  <div className="h-24 w-full bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-full w-full object-contain p-2" /> : <Settings2 className="h-6 w-6 text-slate-200" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Service Identity..." className="h-8 text-[11px] font-bold bg-white border-none" value={s.name || ''} onChange={(e)=>updateService(i, 'name', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Rate (₹)..." className="h-7 text-[9px] bg-white border-none" value={s.price || ''} onChange={(e)=>updateService(i, 'price', e.target.value)} />
                      <Input placeholder="Target Count..." className="h-7 text-[9px] bg-white border-none" value={s.annualTargetQty || ''} onChange={(e)=>updateService(i, 'annualTargetQty', e.target.value)} />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-slate-300 hover:text-red-500" onClick={()=>setIndustrialServices(industrialServices.filter((_, idx)=>idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
            <div className="pt-10 flex justify-center border-t border-slate-100 mt-10">
              <Button onClick={() => handleSaveStrategy()} className="h-14 bg-[#001F3D] hover:bg-black text-white px-12 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3">
                <Save className="h-5 w-5" /> Commit Matrix to Ledger
              </Button>
            </div>
          </div>
        );
      case 'roadMapNextFiveYears':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Road Map Strategy Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live yield trajectory based on compounded growth nodes.</p>
              </div>
            </div>
            
            <div className="border-2 border-slate-900 overflow-hidden rounded-sm shadow-xl">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b-2 border-slate-900">
                     <tr>
                        <th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Particulars (₹ Actuals)</th>
                        {calculations.projections.map(p => <th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b border-slate-200 font-bold">
                        <td className="p-4 text-[10px] uppercase border-r border-slate-200">Income from Operations</td>
                        {calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(p.revenue || 0).toLocaleString()}</td>)}
                     </tr>
                     <tr className="border-b border-slate-100">
                        <td className="p-4 text-[10px] text-slate-600 uppercase border-r border-slate-200">EBITDA</td>
                        {calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(p.ebitda || 0).toLocaleString()}</td>)}
                     </tr>
                     <tr className="bg-slate-100 font-bold">
                        <td className="p-4 text-[11px] uppercase border-r border-slate-900">Profit After Tax (PAT)</td>
                        {calculations.projections.map(p => <td key={p.year} className="p-4 text-[11px] text-right border-r border-slate-200 last:border-0 text-emerald-600">₹ {(p.pat || 0).toLocaleString()}</td>)}
                     </tr>
                  </tbody>
               </table>
            </div>

            <div className="grid grid-cols-5 gap-4 mt-8">
              {financials.yearlyGrowthTargets.map((gt, i) => (
                <div key={i} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <Label className="text-[8px] font-bold uppercase text-slate-400">Year {i+1} Growth %</Label>
                  <Input 
                    type="number" 
                    value={gt} 
                    onChange={(e) => {
                      const newTargets = [...financials.yearlyGrowthTargets];
                      newTargets[i] = Number(e.target.value);
                      setFinancials({...financials, yearlyGrowthTargets: newTargets});
                    }}
                    className="h-10 bg-white border-none font-display font-bold text-center text-lg shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case 'oneTimeInvestment':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-l-4 border-primary pl-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Factory className="h-6 w-6" /></div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Asset Matrix Editor</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">One-time capital expenditure nodes.</p>
                  </div>
               </div>
               <Button variant="ghost" size="sm" className="text-primary font-bold text-[9px] uppercase tracking-widest gap-2" onClick={()=>setIsMachineryBreakupOpen(true)}><Edit3 className="h-3.5 w-3.5" /> Edit Breakdown</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Plant & Machinery</Label><Input readOnly className="bg-slate-100/50 h-12 font-bold" value={(financials.investMachinery || 0).toLocaleString()} /></div>
               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Civil / Interior</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.investCivil || 0} onChange={(e)=>setFinancials({...financials, investCivil: Number(e.target.value)})} /></div>
               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Electrical</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.investElectrical || 0} onChange={(e)=>setFinancials({...financials, investElectrical: Number(e.target.value)})} /></div>
               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Furniture</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.investFurniture || 0} onChange={(e)=>setFinancials({...financials, investFurniture: Number(e.target.value)})} /></div>
               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Software</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.investSoftware || 0} onChange={(e)=>setFinancials({...financials, investSoftware: Number(e.target.value)})} /></div>
               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">System</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.investSystem || 0} onChange={(e)=>setFinancials({...financials, investSystem: Number(e.target.value)})} /></div>
               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Advance</Label><Input type="number" className="bg-slate-50 h-12 rounded-xl" value={financials.investAdvance || 0} onChange={(e)=>setFinancials({...financials, investAdvance: Number(e.target.value)})} /></div>
            </div>
          </div>
        );
      case 'cashFlowStatement':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><RefreshCcw className="h-6 w-6" /></div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Cash Flow Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">CMA Ledger: Operating & Financing Activity Reconciliations.</p>
              </div>
            </div>
            <div className="border-2 border-slate-900 overflow-hidden rounded-sm">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b-2 border-slate-900">
                     <tr>
                        <th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Particulars (₹ Actual)</th>
                        {calculations.cashFlow.map(c => <th key={c.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{c.year}</th>)}
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 text-[10px] font-bold uppercase text-primary">A. Operating Activities</td></tr>
                     <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Net Profit After Tax</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(c.npat || 0).toLocaleString()}</td>)}</tr>
                     <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Depreciation Node</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(c.depreciation || 0).toLocaleString()}</td>)}</tr>
                     <tr className="bg-slate-100 font-bold"><td className="p-4 text-[10px] uppercase border-r border-slate-900">Operating Profit before WC</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(c.opProfit || 0).toLocaleString()}</td>)}</tr>
                     <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 text-[10px] font-bold uppercase text-rose-500">B. Financing Activities</td></tr>
                     <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Loan Principal Settlement</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0 text-rose-600">{(c.loanRepayment || 0).toLocaleString()}</td>)}</tr>
                     <tr className="bg-[#001F3D] text-white font-bold h-16">
                        <td className="p-4 text-[11px] uppercase border-r border-white/10">Closing Cash Balance</td>
                        {calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[11px] text-right border-r border-white/10 last:border-0 text-emerald-400">₹ {(c.closingCash || 0).toLocaleString()}</td>)}
                     </tr>
                  </tbody>
               </table>
            </div>
          </div>
        );
      case 'keyRatios':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Scale className="h-6 w-6" /></div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Key Ratios Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">CMA Feasibility & Solvency Analytics.</p>
              </div>
            </div>
            <div className="border-2 border-slate-900 overflow-hidden rounded-sm">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b-2 border-slate-900">
                     <tr>
                        <th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Ratio Metric</th>
                        {calculations.projections.map(p => <th key={p.year} className="p-4 text-[9px] font-bold uppercase text-center border-r border-slate-200 last:border-0">{p.year}</th>)}
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b border-slate-100 h-16"><td className="p-4 text-[10px] uppercase font-bold text-slate-500 border-r border-slate-200">Debt-Equity (TOL/TNW)</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-center font-code font-bold border-r border-slate-200 last:border-0">{p.ratio}</td>)}</tr>
                     <tr className="border-b border-slate-100 h-16"><td className="p-4 text-[10px] uppercase font-bold text-slate-500 border-r border-slate-200">Net Profit Margin (%)</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-center font-code font-bold text-emerald-600 border-r border-slate-200 last:border-0">{p.margin}%</td>)}</tr>
                     <tr className="h-16"><td className="p-4 text-[10px] uppercase font-bold text-slate-500 border-r border-slate-200">DSCR Ledger</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-center font-code font-bold text-primary border-r border-slate-200 last:border-0">{p.dscr}</td>)}</tr>
                  </tbody>
               </table>
            </div>
          </div>
        );
      case 'mpbfCalculation':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-6">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Calculator className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">MPBF Calculation Method</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Maximum Permissible Bank Finance (Method 1).</p>
                </div>
             </div>
             <Card className="p-10 border-2 border-slate-900 rounded-none bg-slate-50/30 space-y-6">
                <div className="space-y-4">
                   <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase"><span>A. Total Current Assets (Projected)</span> <span>₹ {(calculations.targetTurnover * 12 * 0.25 || 0).toLocaleString()}</span></div>
                   <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase"><span>B. Current Liabilities (Excl. Bank)</span> <span>₹ {(calculations.workingCapitalValue * 0.3 || 0).toLocaleString()}</span></div>
                   <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase text-primary"><span>C. Working Capital Gap (A - B)</span> <span>₹ {((calculations.targetTurnover * 12 * 0.25 || 0) - (calculations.workingCapitalValue * 0.3 || 0)).toLocaleString()}</span></div>
                   <div className="flex justify-between pt-6 text-2xl font-display font-bold uppercase text-[#001F3D]"><span>Max Bank Finance (75% of C)</span> <span className="text-emerald-600">₹ {(calculations.mpbf || 0).toLocaleString()}</span></div>
                </div>
             </Card>
          </div>
        );
      case 'amortizationSchedule':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 border-l-4 border-rose-500 pl-6">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><Clock className="h-6 w-6" /></div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Loan Repayment Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fiscal Year principal and interest settlement nodes.</p>
              </div>
            </div>
            <div className="border-2 border-slate-900 overflow-hidden rounded-sm">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b-2 border-slate-900">
                     <tr>
                        <th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Period</th>
                        <th className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200">Opening Balance</th>
                        <th className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200">Interest Node</th>
                        <th className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200">Principal</th>
                        <th className="p-4 text-[9px] font-bold uppercase text-right">Closing Node</th>
                     </tr>
                  </thead>
                  <tbody>
                     {calculations.loanRepayment.map(r => (
                       <tr key={r.year} className="border-b border-slate-100 h-16">
                          <td className="p-4 text-[10px] font-bold uppercase border-r border-slate-200">{r.year}</td>
                          <td className="p-4 text-[10px] text-right border-r border-slate-200">{(r.opening || 0).toLocaleString()}</td>
                          <td className="p-4 text-[10px] text-right border-r border-slate-200 text-rose-500">{(r.interest || 0).toLocaleString()}</td>
                          <td className="p-4 text-[10px] text-right border-r border-slate-200 text-emerald-600">{(r.principal || 0).toLocaleString()}</td>
                          <td className="p-4 text-[10px] font-bold text-right text-[#001F3D]">{(r.closing || 0).toLocaleString()}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-20 text-center opacity-30 flex flex-col items-center gap-6">
            <Monitor className="h-16 w-16" />
            <p className="text-sm font-bold uppercase tracking-widest">Select a feasibility node from the sidebar to initialize the strategic editor.</p>
          </div>
        );
    }
  };

  const currentProjectedPAT = useMemo(() => {
    return calculations.projections[0]?.pat || 0;
  }, [calculations]);

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
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">01. Identity Matrix</TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">02. Catalogues</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">03. Projections</TabsTrigger>
          <TabsTrigger value="display" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">04. Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <Card className="p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-12">
                   <div className="space-y-10">
                      <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                         <div className="p-3 bg-primary/10 rounded-2xl text-primary"><FileText className="h-6 w-6" /></div>
                         <div>
                            <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Project Foundational Identity</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Active Section Editor: <span className="text-primary">{activeEditingSection.replace(/([A-Z])/g, ' $1').toUpperCase()}</span></p>
                         </div>
                      </div>

                      {renderActiveEditor()}
                   </div>
                </Card>
              </div>

              <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative h-fit sticky top-24">
                 <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-10 relative z-10">Report Composition Matrix</h3>
                 <div className="space-y-4 relative z-10">
                    {Object.entries(checklist).map(([key, val]) => (
                       <div 
                        key={key} 
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                          activeEditingSection === key ? "bg-white/10 border-white/30 shadow-lg" : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                        onClick={() => setActiveEditingSection(key)}
                       >
                          <Checkbox 
                            checked={val} 
                            className="border-white/20 data-[state=checked]:bg-primary" 
                            onCheckedChange={() => setChecklist({...checklist, [key]: !val})}
                            onClick={(e) => e.stopPropagation()} 
                          />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest transition-colors",
                            activeEditingSection === key ? "text-white" : "text-white/60 group-hover:text-white"
                          )}>
                            {key.replace(/([A-Z])/g, ' $1').replace('market Analysis', 'Conductive Market').replace('tooling Market Analysis', 'Tooling Market').replace('dscr Matrix', 'DSCR Matrix')}
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
                 <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Proprietary Product Matrix</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">High-fidelity items designed for institutional scale.</p></div>
                 <div className="flex gap-2">
                    <Button className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase h-10 px-6 rounded-xl" onClick={() => setProprietaryProducts([...proprietaryProducts, { id: Date.now().toString(), name: '', market: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])}>+ Append Product</Button>
                    <Button className="bg-[#001F3D] hover:bg-black text-white font-bold text-[9px] uppercase h-10 px-8 rounded-xl shadow-xl gap-2" onClick={() => handleSaveStrategy()}><Save className="h-3.5 w-3.5" /> Save Matrix</Button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {proprietaryProducts.map((p, idx) => (
                    <div key={p.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-6 relative">
                       <div className="flex flex-col gap-6 text-center">
                          <div className="aspect-square w-[70%] mx-auto rounded-3xl overflow-hidden border-2 border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center group">
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
                          <div className="space-y-4">
                             <Input placeholder="Product Name..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={p.name || ''} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                             <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Price (₹)..." className="bg-white border-none h-10 text-[10px] font-medium shadow-sm" value={p.price || ''} onChange={(e) => updateProduct(idx, 'price', e.target.value)} />
                                <Input placeholder="Annual Qty..." className="bg-white border-none h-10 text-[10px] font-medium shadow-sm" value={p.annualTargetQty || ''} onChange={(e) => updateProduct(idx, 'annualTargetQty', e.target.value)} />
                             </div>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-200 hover:text-red-500" onClick={() => setProprietaryProducts(proprietaryProducts.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                 ))}
              </div>
              <div className="pt-10 flex justify-center border-t border-slate-100 mt-10">
                <Button onClick={() => handleSaveStrategy()} className="h-14 bg-[#001F3D] hover:bg-black text-white px-12 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3">
                  <Save className="h-5 w-5" /> Commit Matrix to Ledger
                </Button>
              </div>
           </Card>

           <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
              <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-6">
                 <div><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Industrial Services Matrix</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Specialized technical operations for B2B sub-systems.</p></div>
                 <div className="flex gap-2">
                    <Button className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase h-10 px-6 rounded-xl" onClick={() => setIndustrialServices([...industrialServices, { id: Date.now().toString(), name: '', description: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])}>+ Append Service</Button>
                    <Button className="bg-[#001F3D] hover:bg-black text-white font-bold text-[9px] uppercase h-10 px-8 rounded-xl shadow-xl gap-2" onClick={() => handleSaveStrategy()}><Save className="h-3.5 w-3.5" /> Save Matrix</Button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {industrialServices.map((s, idx) => (
                    <div key={s.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-6 relative">
                       <div className="flex flex-col gap-6 text-center">
                          <div className="aspect-square w-[70%] mx-auto rounded-3xl overflow-hidden border-2 border-white shadow-xl relative shrink-0 bg-white flex items-center justify-center group">
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
                          <div className="space-y-4">
                             <Input placeholder="Service Identity..." className="bg-white border-none h-12 text-sm font-bold shadow-sm" value={s.name || ''} onChange={(e) => updateService(idx, 'name', e.target.value)} />
                             <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Rate (₹)..." className="bg-white border-none h-10 text-[10px] font-medium shadow-sm" value={s.price || ''} onChange={(e) => updateService(idx, 'price', e.target.value)} />
                                <Input placeholder="Target Count..." className="bg-white border-none h-10 text-[10px] font-medium shadow-sm" value={s.annualTargetQty || ''} onChange={(e) => updateService(idx, 'annualTargetQty', e.target.value)} />
                             </div>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-200 hover:text-red-500" onClick={() => setIndustrialServices(industrialServices.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                 ))}
              </div>
              <div className="pt-10 flex justify-center border-t border-slate-100 mt-10">
                <Button onClick={() => handleSaveStrategy()} className="h-14 bg-[#001F3D] hover:bg-black text-white px-12 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3">
                  <Save className="h-5 w-5" /> Commit Matrix to Ledger
                </Button>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-12 animate-in slide-in-from-bottom-2 duration-500 no-print">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                 <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-widest border-l-4 border-primary pl-4">
                       <Calculator className="h-4 w-4" /> Valuation & Funding Matrix
                    </div>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Total Project Cost (₹)</Label>
                          <Input readOnly className="h-12 bg-slate-50 border-none font-display font-bold text-lg" value={(calculations.totalProjectCost || 0).toLocaleString()} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-500">Loan Capital Node (₹)</Label>
                          <Input className="h-12 bg-slate-50 border-none font-bold" value={foundationalData.totalLoanRequirement || ''} onChange={(e)=>setFormData({...foundationalData, totalLoanRequirement: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-500">Entrepreneur Invest Node (₹)</Label>
                          <Input type="number" className="h-12 bg-slate-50 border-none font-bold" value={financials.entrepreneurContribution || 0} onChange={(e)=>setFinancials({...financials, entrepreneurContribution: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2 pt-4 border-t">
                          <Label className="text-[9px] font-bold uppercase text-emerald-600 flex justify-between">Working Capital Reserve (₹)</Label>
                          <Input readOnly className="h-12 bg-emerald-50/30 border-none font-bold text-emerald-700" value={(calculations.workingCapitalValue || 0).toLocaleString()} />
                       </div>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3 text-rose-500 font-bold text-[10px] uppercase tracking-widest border-l-4 border-rose-500 pl-4">
                       <Receipt className="h-4 w-4" /> Loan Parameters
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-500">ROI (%)</Label><Input type="number" className="bg-slate-50 h-11" value={financials.loanROI || 0} onChange={(e)=>setFinancials({...financials, loanROI: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-500">Tenure (M)</Label><Input type="number" className="bg-slate-50 h-11" value={financials.loanTenure || 0} onChange={(e)=>setFinancials({...financials, loanTenure: Number(e.target.value)})} /></div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-8 space-y-8">
                 <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-8">
                    <div className="flex justify-between items-center border-l-4 border-primary pl-4">
                       <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-widest">
                          <Factory className="h-4 w-4" /> One-Time Investment Matrix
                       </div>
                       <Button variant="ghost" size="sm" className="text-primary font-bold text-[9px] uppercase tracking-widest gap-2" onClick={()=>setIsMachineryBreakupOpen(true)}><Edit3 className="h-3.5 w-3.5" /> Edit Breakup</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Plant & Machinery</Label><Input readOnly className="bg-slate-100/50 h-11 font-bold" value={(financials.investMachinery || 0).toLocaleString()} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Civil / Interior</Label><Input type="number" className="bg-slate-50 h-11" value={financials.investCivil || 0} onChange={(e)=>setFinancials({...financials, investCivil: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Electrical</Label><Input type="number" className="bg-slate-50 h-11" value={financials.investElectrical || 0} onChange={(e)=>setFinancials({...financials, investElectrical: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Furniture</Label><Input type="number" className="bg-slate-50 h-11" value={financials.investFurniture || 0} onChange={(e)=>setFinancials({...financials, investFurniture: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Software</Label><Input type="number" className="bg-slate-50 h-11" value={financials.investSoftware || 0} onChange={(e)=>setFinancials({...financials, investSoftware: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">System</Label><Input type="number" className="bg-slate-50 h-11" value={financials.investSystem || 0} onChange={(e)=>setFinancials({...financials, investSystem: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Advance</Label><Input type="number" className="bg-slate-50 h-11" value={financials.investAdvance || 0} onChange={(e)=>setFinancials({...financials, investAdvance: Number(e.target.value)})} /></div>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-8">
                    <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-widest border-l-4 border-emerald-500 pl-4">
                       <Clock className="h-4 w-4" /> Monthly OpEx Matrix
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Rent / Lease</Label><Input type="number" className="bg-slate-50 h-11" value={financials.expenseRent || 0} onChange={(e)=>setFinancials({...financials, expenseRent: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Salary</Label><Input type="number" className="bg-slate-50 h-11" value={financials.expensePersonnel || 0} onChange={(e)=>setFinancials({...financials, expensePersonnel: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Power & Util</Label><Input type="number" className="bg-slate-50 h-11" value={financials.expensePower || 0} onChange={(e)=>setFinancials({...financials, expensePower: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-slate-400">Maintenance</Label><Input type="number" className="bg-slate-50 h-11" value={financials.expenseMaintenance || 0} onChange={(e)=>setFinancials({...financials, expenseMaintenance: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-emerald-600">Monthly EMI (Debt Service)</Label><Input readOnly className="bg-emerald-50/50 border-none font-bold text-emerald-700 h-11" value={(calculations.emi || 0).toLocaleString()} /></div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-12">
                 <Card className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-8">
                    <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                       <div className="p-3 bg-white rounded-2xl text-primary shadow-sm"><Activity className="h-6 w-6" /></div>
                       <div>
                          <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Growth & Performance Matrix</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Year-by-year yield trajectory.</p>
                       </div>
                    </div>

                    <div className="border-2 border-slate-900 overflow-hidden rounded-sm shadow-xl bg-white mb-10">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b-2 border-slate-900">
                          <tr>
                            <th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Fiscal Metrics (₹ Actuals)</th>
                            {calculations.projections.map(p => <th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-200 font-bold">
                            <td className="p-4 text-[10px] uppercase border-r border-slate-200">Income from Operations</td>
                            {calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(p.revenue || 0).toLocaleString()}</td>)}
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="p-4 text-[10px] text-slate-600 uppercase border-r border-slate-200">EBITDA</td>
                            {calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(p.ebitda || 0).toLocaleString()}</td>)}
                          </tr>
                          <tr className="bg-slate-100 font-bold">
                            <td className="p-4 text-[11px] uppercase border-r border-slate-900">Profit After Tax (PAT)</td>
                            {calculations.projections.map(p => <td key={p.year} className="p-4 text-[11px] text-right border-r border-slate-200 last:border-0 text-emerald-600">₹ {(p.pat || 0).toLocaleString()}</td>)}
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                       {[0, 1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-primary/50 transition-all">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">Year {i + 1} (%)</Label>
                             <Input 
                                type="number" 
                                className="h-10 bg-slate-50 border-none text-center font-display font-bold text-lg" 
                                value={financials.yearlyGrowthTargets[i] || 0} 
                                onChange={(e) => {
                                   const newTargets = [...financials.yearlyGrowthTargets];
                                   newTargets[i] = Number(e.target.value);
                                   setFinancials({...financials, yearlyGrowthTargets: newTargets});
                                }} 
                             />
                          </div>
                       ))}
                    </div>

                    <div className="h-[250px] w-full mt-10">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                             <YAxis hide />
                             <ChartTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', shadow: 'none', backgroundColor: '#001F3D', color: '#fff'}} />
                             <Bar dataKey="growth" name="Target Growth %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-widest"><FileBarChart className="h-4 w-4" /> Projected Sales & Profitability</div>
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={calculations.projections}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                             <YAxis hide />
                             <ChartTooltip cursor={{fill: '#f8fafc'}} />
                             <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 700}} />
                             <Bar dataKey="revenue" name="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
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

              <div className="lg:col-span-12 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-6">
                       <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-widest border-l-4 border-primary pl-4">
                          <Calculator className="h-4 w-4" /> MPBF Calculation (Method 1)
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase text-slate-500">
                             <span>A. Total Current Assets (Projected)</span>
                             <span className="text-slate-900">₹ {(calculations.targetTurnover * 12 * 0.25 || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase text-slate-500">
                             <span>B. Current Liabilities (Excl. Bank)</span>
                             <span className="text-slate-900">₹ {(calculations.workingCapitalValue * 0.3 || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase text-primary">
                             <span>C. Working Capital Gap (A - B)</span>
                             <span>₹ {((calculations.targetTurnover * 12 * 0.25 || 0) - (calculations.workingCapitalValue * 0.3 || 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-4 text-xl font-display font-bold uppercase text-[#001F3D]">
                             <span>Maximum Bank Finance (75%)</span>
                             <span className="text-emerald-600">₹ {(calculations.mpbf || 0).toLocaleString()}</span>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-6">
                       <div className="flex items-center gap-3 text-rose-500 font-bold text-xs uppercase tracking-widest border-l-4 border-rose-500 pl-4">
                          <Activity className="h-4 w-4" /> DSCR Matrix (Average)
                       </div>
                       <div className="flex flex-col items-center justify-center h-full py-6">
                          <span className="text-6xl font-display font-bold text-[#001F3D] tracking-tighter">
                             {(calculations.projections.reduce((acc, p) => acc + parseFloat(p.dscr), 0) / 5 || 0).toFixed(2)}
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Average Debt Service Coverage Ratio</p>
                          <Badge className="bg-emerald-50 text-emerald-700 border-none mt-6 px-6 py-2 uppercase font-bold text-[10px]">Robust Serviceability</Badge>
                       </div>
                    </Card>
                 </div>

                 <Card className="overflow-hidden border border-slate-200 bg-white shadow-xl rounded-[2.5rem]">
                    <div className="p-6 border-b bg-slate-50/50 flex items-center gap-3">
                       <Scale className="h-5 w-5 text-primary" />
                       <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-widest">Key Ratios & Feasibility Matrix</h3>
                    </div>
                    <Table>
                       <TableHeader>
                          <TableRow className="bg-white">
                             <TableHead className="font-bold text-[9px] uppercase py-4 px-8">Ratio Component</TableHead>
                             {calculations.projections.map(p => <TableHead key={p.year} className="text-center font-bold text-[9px] uppercase">{p.year}</TableHead>)}
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          <TableRow className="h-16 border-b border-slate-50">
                             <TableCell className="px-8 font-bold text-[11px] uppercase text-slate-500">TOL / TNW Ratio</TableCell>
                             {calculations.projections.map(p => <TableCell key={p.year} className="text-center font-code text-xs font-bold text-slate-700">{p.ratio}</TableCell>)}
                          </TableRow>
                          <TableRow className="h-16 border-b border-slate-50">
                             <TableCell className="px-8 font-bold text-[11px] uppercase text-slate-500">Net Profit Margin (%)</TableCell>
                             {calculations.projections.map(p => <TableCell key={p.year} className="text-center font-code text-xs font-bold text-emerald-600">{p.margin}%</TableCell>)}
                          </TableRow>
                          <TableRow className="h-16 border-b border-slate-50">
                             <TableCell className="px-8 font-bold text-[11px] uppercase text-slate-500">DSCR Analysis</TableCell>
                             {calculations.projections.map(p => <TableCell key={p.year} className="text-center font-code text-xs font-bold text-primary">{p.dscr}</TableCell>)}
                          </TableRow>
                       </TableBody>
                    </Table>
                 </Card>

                 <Card className="overflow-hidden border border-slate-200 bg-white shadow-xl rounded-[2.5rem]">
                    <div className="p-6 border-b bg-slate-50/50 flex items-center gap-3">
                       <RefreshCcw className="h-5 w-5 text-primary" />
                       <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-widest">5-Year Cash Flow Statement</h3>
                    </div>
                    <Table>
                       <TableHeader>
                          <TableRow className="bg-white">
                             <TableHead className="font-bold text-[9px] uppercase py-4 px-8">Particulars (₹ Actual)</TableHead>
                             {calculations.cashFlow.map(c => <TableHead key={c.year} className="text-right font-bold text-[9px] uppercase pr-8">{c.year}</TableHead>)}
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          <TableRow className="bg-slate-50/30"><TableCell colSpan={6} className="px-8 py-2 text-[10px] font-bold text-primary uppercase">A. Operating Activities</TableCell></TableRow>
                          <TableRow className="h-14"><TableCell className="px-10 text-[10px] uppercase text-slate-500">Net Profit After Tax</TableCell>{calculations.cashFlow.map(c => <TableCell key={c.year} className="text-right pr-8 font-code text-xs">{(c.npat || 0).toLocaleString()}</TableCell>)}</TableRow>
                          <TableRow className="h-14"><TableCell className="px-10 text-[10px] uppercase text-slate-500">Interest Node</TableCell>{calculations.cashFlow.map(c => <TableCell key={c.year} className="text-right pr-8 font-code text-xs">{(c.interest || 0).toLocaleString()}</TableCell>)}</TableRow>
                          <TableRow className="h-14 border-b border-slate-100"><TableCell className="px-10 text-[10px] uppercase text-slate-500">Depreciation</TableCell>{calculations.cashFlow.map(c => <TableCell key={c.year} className="text-right pr-8 font-code text-xs">{(c.depreciation || 0).toLocaleString()}</TableCell>)}</TableRow>
                          <TableRow className="h-16 font-bold bg-slate-50/50"><TableCell className="px-8 text-[11px] uppercase">Op. Profit before WC</TableCell>{calculations.cashFlow.map(c => <TableCell key={c.year} className="text-right pr-8 font-code text-xs text-[#001F3D]">{(c.opProfit || 0).toLocaleString()}</TableCell>)}</TableRow>
                          <TableRow className="bg-slate-50/30"><TableCell colSpan={6} className="px-8 py-2 text-[10px] font-bold text-rose-500 uppercase">B. Financing Activities</TableCell></TableRow>
                          <TableRow className="h-14 border-b border-slate-100"><td className="px-10 text-[10px] uppercase text-slate-500">Loan Principal Settlement</td>{calculations.cashFlow.map(c => <td key={c.year} className="text-right pr-8 font-code text-xs text-rose-600">{(c.loanRepayment || 0).toLocaleString()}</td>)}</TableRow>
                          <TableRow className="h-20 bg-[#001F3D] text-white"><TableCell className="px-8 text-[11px] font-bold uppercase">Closing Cash Flow Balance</TableCell>{calculations.cashFlow.map(c => <TableCell key={c.year} className="text-right pr-8 font-display text-sm font-bold text-emerald-400">₹ {(c.closingCash || 0).toLocaleString()}</TableCell>)}</TableRow>
                       </TableBody>
                    </Table>
                 </Card>

                 <Card className="overflow-hidden border border-slate-200 bg-white shadow-xl rounded-[2.5rem]">
                    <div className="p-6 border-b bg-slate-50/50 flex items-center gap-3">
                       <Clock className="h-5 w-5 text-primary" />
                       <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-widest">Term Loan Repayment Schedule</h3>
                    </div>
                    <Table>
                       <TableHeader>
                          <TableRow className="bg-white">
                             <TableHead className="font-bold text-[9px] uppercase py-4 px-8">Fiscal Year</TableHead>
                             <TableHead className="text-right font-bold text-[9px] uppercase">Opening Balance</TableHead>
                             <TableHead className="text-right font-bold text-[9px] uppercase">Interest (₹)</TableHead>
                             <TableHead className="text-right font-bold text-[9px] uppercase">Principal (₹)</TableHead>
                             <TableHead className="text-right font-bold text-[9px] uppercase pr-8">Closing Balance</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {calculations.loanRepayment.map(r => (
                             <TableRow key={r.year} className="h-16 border-b border-slate-50 hover:bg-slate-50/30">
                                <TableCell className="px-8 font-bold text-[11px] uppercase text-slate-500">{r.year}</TableCell>
                                <TableCell className="text-right font-code text-xs">{(r.opening || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-code text-xs text-rose-500">{(r.interest || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-code text-xs text-emerald-600">{(r.principal || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-code text-xs font-bold text-[#001F3D] pr-8">{(r.closing || 0).toLocaleString()}</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
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
                   
                   <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-12 border-b-2 border-slate-900 pb-20 relative page-break">
                      <div className="flex justify-center mb-16">
                         <div className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white flex items-center justify-center p-4">
                            <Image src={brandLogo || 'https://picsum.photos/seed/ferocious-logo/400/400'} alt="Logo" fill className="object-contain p-4" />
                         </div>
                      </div>
                      <Badge className="bg-primary text-white border-none px-8 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] mb-4">CONFIDENTIAL STRATEGIC REPORT</Badge>
                      <h1 className="text-6xl font-display font-bold tracking-tighter text-[#001F3D] uppercase leading-none">Techno-Economic <br />Feasibility Analysis</h1>
                      <div className="h-1.5 w-32 bg-red-600 mx-auto rounded-full mt-8" />
                      <div className="pt-20 grid grid-cols-2 gap-20 w-full max-w-2xl text-left border-t border-slate-100 pt-12">
                         <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project Entity</p><h4 className="text-lg font-bold text-[#001F3D] uppercase">{foundationalData.projectName}</h4></div>
                         <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submission Date</p><h4 className="text-lg font-bold text-[#001F3D] uppercase">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h4></div>
                      </div>
                   </div>

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

                   {checklist.aboutUs && (
                     <div className="space-y-8 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">02</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Industrial Context (About Us)</h3></div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{foundationalData.aboutUs}</p>
                     </div>
                   )}

                   {(checklist.productLine || checklist.services) && (
                     <div className="space-y-12 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">03</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Industrial Capability Matrix</h3></div>
                        
                        {checklist.productLine && proprietaryProducts.length > 0 && (
                          <div className="space-y-8">
                             <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Proprietary Product Line</h4>
                             <div className="grid grid-cols-4 gap-8">
                                {proprietaryProducts.map(p => (
                                  <div key={p.id} className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col bg-slate-50/50">
                                     <div className="aspect-video relative bg-white flex items-center justify-center p-4">
                                        {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-12 w-12 text-slate-100" />}
                                     </div>
                                     <div className="p-5 space-y-2">
                                        <p className="text-[11px] font-bold text-[#001F3D] uppercase">{p.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.annualTargetQty} Units/Year</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                             
                             <div className="mt-8 border-2 border-slate-900 rounded-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                   <thead className="bg-slate-50 border-b-2 border-slate-900">
                                      <tr>
                                         <th className="p-3 text-[9px] font-bold uppercase border-r border-slate-200">Si No.</th>
                                         <th className="p-3 text-[9px] font-bold uppercase border-r border-slate-200">Part Name</th>
                                         <th className="p-3 text-[9px] font-bold uppercase border-r border-slate-200 text-right">Price Per Part (₹)</th>
                                         <th className="p-3 text-[9px] font-bold uppercase text-right">Target Annual Qty</th>
                                      </tr>
                                   </thead>
                                   <tbody>
                                      {proprietaryProducts.map((p, idx) => (
                                        <tr key={p.id} className="border-b border-slate-100">
                                           <td className="p-3 text-[10px] border-r border-slate-200">{(idx + 1).toString().padStart(2, '0')}</td>
                                           <td className="p-3 text-[10px] font-bold uppercase border-r border-slate-200">{p.name}</td>
                                           <td className="p-3 text-[10px] text-right border-r border-slate-200">₹ {parseFloat(p.price).toLocaleString()}</td>
                                           <td className="p-3 text-[10px] text-right">{p.annualTargetQty}</td>
                                        </tr>
                                      ))}
                                   </tbody>
                                </table>
                             </div>
                          </div>
                        )}
                        
                        {checklist.services && industrialServices.length > 0 && (
                          <div className="space-y-8 pt-8">
                             <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 border-l-4 border-emerald-500 pl-4">Industrial Technical Services</h4>
                             <div className="grid grid-cols-4 gap-8">
                                {industrialServices.map(s => (
                                  <div key={s.id} className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col bg-slate-50/50">
                                     <div className="aspect-video relative bg-white flex items-center justify-center p-4">
                                        {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-full w-full object-contain" /> : <Settings2 className="h-12 w-12 text-slate-100" />}
                                     </div>
                                     <div className="p-5 space-y-2">
                                        <p className="text-[11px] font-bold text-[#001F3D] uppercase">{s.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{s.annualTargetQty} Units/Year</p>
                                     </div>
                                  </div>
                                ))}
                             </div>

                             <div className="mt-8 border-2 border-slate-900 rounded-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                   <thead className="bg-slate-50 border-b-2 border-slate-900">
                                      <tr>
                                         <th className="p-3 text-[9px] font-bold uppercase border-r border-slate-200">Si No.</th>
                                         <th className="p-3 text-[9px] font-bold uppercase border-r border-slate-200">Service Identity</th>
                                         <th className="p-3 text-[9px] font-bold uppercase border-r border-slate-200 text-right">Unit Rate (₹)</th>
                                         <th className="p-3 text-[9px] font-bold uppercase text-right">Target Annual Count</th>
                                      </tr>
                                   </thead>
                                   <tbody>
                                      {industrialServices.map((s, idx) => (
                                        <tr key={s.id} className="border-b border-slate-100">
                                           <td className="p-3 text-[10px] border-r border-slate-200">{(idx + 1).toString().padStart(2, '0')}</td>
                                           <td className="p-3 text-[10px] font-bold uppercase border-r border-slate-200">{s.name}</td>
                                           <td className="p-3 text-[10px] text-right border-r border-slate-200">₹ {parseFloat(s.price).toLocaleString()}</td>
                                           <td className="p-3 text-[10px] text-right">{s.annualTargetQty}</td>
                                        </tr>
                                      ))}
                                   </tbody>
                                </table>
                             </div>
                          </div>
                        )}
                     </div>
                   )}

                   {checklist.entrepreneurDetails && (
                     <div className="space-y-10 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">04</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Entrepreneur Profile</h3></div>
                        <Card className="p-10 border-2 border-slate-900 rounded-none bg-slate-50/30 space-y-8">
                           <div className="flex items-center gap-6">
                              <div className="h-20 w-20 rounded-full bg-[#001F3D] text-white flex items-center justify-center text-3xl font-bold">{foundationalData.promoterName?.charAt(0)}</div>
                              <div>
                                 <h4 className="text-2xl font-display font-bold uppercase">{foundationalData.promoterName}</h4>
                                 <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{foundationalData.qualification}</p>
                              </div>
                           </div>
                           <div className="space-y-4 pt-4 border-t border-slate-200">
                              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Professional Narrative</h5>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">{foundationalData.promoterNarrative}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-10 pt-4 border-t border-slate-200">
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Industrial Exposure</p><p className="text-sm font-bold text-[#001F3D]">{foundationalData.experience}</p></div>
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Network Node</p><p className="text-sm font-bold text-[#001F3D]">{foundationalData.location}</p></div>
                           </div>
                        </Card>
                     </div>
                   )}

                   {checklist.marketAnalysis && (
                     <div className="space-y-10 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">05</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Electrical Conductive Product Market Analysis</h3></div>
                        <div className="space-y-8">
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">{foundationalData.marketAnalysisDetails}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-8 border-2 border-slate-900 rounded-none bg-slate-50/30">
                               <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#001F3D] mb-6 border-l-4 border-[#001F3D] pl-4">Current Market Landscape (FY24-25)</h4>
                               <div className="space-y-4">
                                  <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Total Addressable Market</span><span className="text-sm font-bold">₹ 14,500 Cr</span></div>
                                  <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Organized Sector Share</span><span className="text-sm font-bold">62%</span></div>
                                  <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Projected Annual Growth</span><span className="text-sm font-bold text-emerald-600">12.5% CAGR</span></div>
                               </div>
                            </Card>

                            <Card className="p-8 border-2 border-slate-900 rounded-none bg-slate-900 text-white">
                               <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6 border-l-4 border-primary pl-4">Next 5 Years Forecast (₹ Cr)</h4>
                               <div className="space-y-4">
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 1 (FY26)</span><span className="text-sm font-bold text-emerald-400">16,240</span></div>
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 2 (FY27)</span><span className="text-sm font-bold text-emerald-400">18,180</span></div>
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 3 (FY28)</span><span className="text-sm font-bold text-emerald-400">20,360</span></div>
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 4 (FY29)</span><span className="text-sm font-bold text-emerald-400">22,800</span></div>
                                  <div className="flex justify-between pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 5 (FY30)</span><span className="text-sm font-bold text-emerald-400">25,500</span></div>
                               </div>
                            </Card>
                          </div>
                        </div>
                     </div>
                   )}

                   {checklist.toolingMarketAnalysis && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">06</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Special Tooling, Die & Mold Market Analysis</h3></div>
                        <div className="space-y-8">
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">{foundationalData.toolingMarketAnalysisDetails}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-8 border-2 border-slate-900 rounded-none bg-slate-50/30">
                               <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#001F3D] mb-6 border-l-4 border-[#001F3D] pl-4">Market Identity (FY24-25)</h4>
                               <div className="space-y-4">
                                  <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Tooling Sector Valuation</span><span className="text-sm font-bold">₹ 18,500 Cr</span></div>
                                  <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Organized Unit Density</span><span className="text-sm font-bold">35%</span></div>
                                  <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Sector Growth Rate</span><span className="text-sm font-bold text-emerald-600">11.8% CAGR</span></div>
                               </div>
                            </Card>

                            <Card className="p-8 border-2 border-slate-900 rounded-none bg-slate-900 text-white">
                               <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6 border-l-4 border-primary pl-4">Growth Matrix (₹ Cr)</h4>
                               <div className="space-y-4">
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 1 (FY26)</span><span className="text-sm font-bold text-emerald-400">20,680</span></div>
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 2 (FY27)</span><span className="text-sm font-bold text-emerald-400">23,120</span></div>
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 3 (FY28)</span><span className="text-sm font-bold text-emerald-400">25,850</span></div>
                                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 4 (FY29)</span><span className="text-sm font-bold text-emerald-400">28,900</span></div>
                                  <div className="flex justify-between pb-2"><span className="text-[10px] font-bold text-white/40 uppercase">Year 5 (FY30)</span><span className="text-sm font-bold text-emerald-400">32,300</span></div>
                               </div>
                            </Card>
                          </div>
                        </div>
                     </div>
                   )}

                   {checklist.roadMapNextFiveYears && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">07</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Road Map for next five years</h3></div>
                        <div className="border-2 border-slate-900 overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b-2 border-slate-900">
                                 <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Particulars (₹ Actuals)</th>{calculations.projections.map(p => <th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}</tr>
                              </thead>
                              <tbody>
                                 <tr className="border-b border-slate-200 font-bold"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Income from Operations</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(p.revenue || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] text-slate-600 uppercase border-r border-slate-200">EBITDA</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200 last:border-0">{(p.ebitda || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="bg-slate-100 font-bold"><td className="p-4 text-[11px] uppercase border-r border-slate-900">Profit After Tax (PAT)</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[11px] text-right border-r border-slate-200 last:border-0">₹ {(p.pat || 0).toLocaleString()}</td>)}</tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}

                   {checklist.cgtmseScheme && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">08</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">CGTMSE Scheme Protocol</h3></div>
                        <Card className="p-10 border-2 border-slate-900 rounded-none space-y-10">
                           <div className="grid grid-cols-3 gap-6">
                              <div className="p-6 bg-slate-50 border border-slate-200 space-y-4">
                                 <div className="p-2 bg-[#001F3D] rounded-lg text-white w-fit"><ShieldCheck className="h-4 w-4" /></div>
                                 <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#001F3D]">Guarantee Cover</h5>
                                 <p className="text-xl font-display font-bold text-emerald-600">85%</p>
                              </div>
                              <div className="p-6 bg-slate-50 border border-slate-200 space-y-4">
                                 <div className="p-2 bg-[#001F3D] rounded-lg text-white w-fit"><Zap className="h-4 w-4" /></div>
                                 <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#001F3D]">Loan Limit</h5>
                                 <p className="text-xl font-display font-bold text-primary">₹5.0 Cr</p>
                              </div>
                              <div className="p-6 bg-slate-50 border border-slate-200 space-y-4">
                                 <div className="p-2 bg-[#001F3D] rounded-lg text-white w-fit"><FileCheck className="h-4 w-4" /></div>
                                 <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#001F3D]">Hybrid Security</h5>
                                 <p className="text-xl font-display font-bold text-blue-600">Active</p>
                              </div>
                           </div>
                           <div className="space-y-6">
                              <p className="text-sm text-slate-600 leading-relaxed">{foundationalData.cgtmseNotes}</p>
                           </div>
                        </Card>
                     </div>
                   )}

                   {checklist.cashFlowStatement && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">09</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">CMA Data: Cash Flow Statement</h3></div>
                        <div className="border-2 border-slate-900 overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b-2 border-slate-900">
                                 <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Particulars (₹ In Actual)</th>{calculations.cashFlow.map(c => <th key={c.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{c.year}</th>)}</tr>
                              </thead>
                              <tbody>
                                 <tr className="bg-slate-100"><td colSpan={6} className="p-3 text-[10px] font-bold uppercase text-primary">A. Cash Flow from Operating Activities</td></tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">- Net Profit After Tax</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200">{(c.npat || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">- Add: Interest Expense</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200">{(c.interest || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">- Add: Depreciation</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200">{(c.depreciation || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="bg-slate-50 font-bold border-b border-slate-900"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Operating Profit before WC</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200">{(c.opProfit || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="bg-slate-100"><td colSpan={6} className="p-3 text-[10px] font-bold uppercase text-primary">B. Cash Flow from Financing Activities</td></tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">- Loan Repaid (Principal)</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200">{(c.loanRepayment || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Add: Opening Cash Balance</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[10px] text-right border-r border-slate-200">{(c.openingCash || 0).toLocaleString()}</td>)}</tr>
                                 <tr className="bg-[#001F3D] text-white font-bold"><td className="p-4 text-[11px] uppercase border-r border-white/20">Closing Cash Balance</td>{calculations.cashFlow.map(c => <td key={c.year} className="p-4 text-[11px] text-right border-r border-white/20">₹ {(c.closingCash || 0).toLocaleString()}</td>)}</tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}

                   {checklist.keyRatios && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">10</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Key Ratios & Feasibility</h3></div>
                        <div className="border-2 border-slate-900 overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b-2 border-slate-900">
                                 <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Ratio Matrix</th>{calculations.projections.map(p => <th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}</tr>
                              </thead>
                              <tbody>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Debt-Equity (TOL/TNW)</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200">{p.ratio || '0.00'}</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">Net Profit Margin (%)</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200">{p.margin || '0.0'}%</td>)}</tr>
                                 <tr className="border-b border-slate-100"><td className="p-4 text-[10px] uppercase border-r border-slate-200">DSCR</td>{calculations.projections.map(p => <td key={p.year} className="p-4 text-[10px] text-right border-r border-slate-200">{p.dscr || '0.00'}</td>)}</tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}

                   {checklist.mpbfCalculation && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">11</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">MPBF Calculation</h3></div>
                        <Card className="p-10 border-2 border-slate-900 rounded-none bg-slate-50/30 space-y-6">
                           <p className="text-xs font-bold uppercase text-slate-500">Method 1: 75% of Working Capital Gap</p>
                           <div className="space-y-4">
                              <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase"><span>A. Total Current Assets (Projected)</span> <span>₹ {(calculations.targetTurnover * 12 * 0.25 || 0).toLocaleString()}</span></div>
                              <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase"><span>B. Current Liabilities (Excl. Bank)</span> <span>₹ {(calculations.workingCapitalValue * 0.3 || 0).toLocaleString()}</span></div>
                              <div className="flex justify-between border-b pb-2 text-[11px] font-bold uppercase text-primary"><span>C. Working Capital Gap (A - B)</span> <span>₹ {((calculations.targetTurnover * 12 * 0.25 || 0) - (calculations.workingCapitalValue * 0.3 || 0)).toLocaleString()}</span></div>
                              <div className="flex justify-between pt-4 text-lg font-display font-bold uppercase text-[#001F3D]"><span>D. Maximum Permissible Bank Finance (75% of C)</span> <span>₹ {(calculations.mpbf || 0).toLocaleString()}</span></div>
                           </div>
                        </Card>
                     </div>
                   )}

                   {checklist.amortizationSchedule && (
                     <div className="space-y-10 pt-20 page-break">
                        <div className="flex items-center gap-6"><div className="h-10 w-10 rounded-xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">12</div><h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Term Loan Repayment Schedule</h3></div>
                        <div className="border-2 border-slate-900 overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b-2 border-slate-900">
                                 <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Period</th><th className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200">Opening Balance</th><th className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200">Interest Node</th><th className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200">Principal Repayment</th><th className="p-4 text-[9px] font-bold uppercase text-right">Closing Balance</th></tr>
                              </thead>
                              <tbody>
                                 {calculations.loanRepayment.map(r => (
                                   <tr key={r.year} className="border-b border-slate-100">
                                      <td className="p-4 text-[10px] font-bold uppercase border-r border-slate-200">{r.year}</td>
                                      <td className="p-4 text-[10px] text-right border-r border-slate-200">{(r.opening || 0).toLocaleString()}</td>
                                      <td className="p-4 text-[10px] text-right border-r border-slate-200">{(r.interest || 0).toLocaleString()}</td>
                                      <td className="p-4 text-[10px] text-right border-r border-slate-200">{(r.principal || 0).toLocaleString()}</td>
                                      <td className="p-4 text-[10px] font-bold text-right">{(r.closing || 0).toLocaleString()}</td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isMachineryBreakupOpen} onOpenChange={setIsMachineryBreakupOpen}>
        <DialogContent className="max-w-4xl h-[85vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-8 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0 space-y-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20"><Factory className="h-8 w-8" /></div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-display font-bold uppercase tracking-tight text-white">Plant & Machinery Breakup</DialogTitle>
                <DialogDescription className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Capital Expenditure Quotation Ledger v2.4</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
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
             <div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Gross Quotation Value</p><p className="text-2xl font-display font-bold text-primary">₹ {(financials.investMachinery || 0).toLocaleString()}</p></div>
             <Button className="h-12 px-10 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl" onClick={() => setIsMachineryBreakupOpen(false)}>Commit Breakup Matrix <ChevronRight className="h-3.5 w-3.5 ml-2" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
