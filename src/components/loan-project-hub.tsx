
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
  Save,
  Upload,
  Box,
  Compass,
  ShieldCheck,
  Zap,
  UserCircle,
  Shield,
  ZoomIn,
  ZoomOut,
  Calculator,
  Clock,
  Factory,
  Table as TableIcon,
  Activity,
  FileCheck,
  Settings2,
  Gauge,
  X,
  Receipt,
  FileBarChart,
  Scale,
  Edit3,
  Maximize2,
  RefreshCcw,
  Hammer,
  ShieldAlert,
  Info,
  BarChart3,
  LineChart as LineChartIcon,
  ClipboardList,
  Check,
  Building2,
  CreditCard,
  Briefcase,
  Monitor
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

// Define the absolute sequence for the report
const REPORT_SEQUENCE = [
  { id: 'executiveSummary', label: '01. Executive Summary' },
  { id: 'aboutCompany', label: '02. About Company' },
  { id: 'visionMission', label: '03. Vision & Mission' },
  { id: 'promoterProfile', label: '04. Promoter / Entrepreneur Profile' },
  { id: 'projectDetails', label: '05. Project Details' },
  { id: 'productServices', label: '06. Product & Services' },
  { id: 'marketAnalysis', label: '07. Market Analysis (combined)' },
  { id: 'swotAnalysis', label: '08. SWOT Analysis' },
  { id: 'businessModel', label: '09. Business Model' },
  { id: 'operationsPlan', label: '10. Operations / Production Plan' },
  { id: 'locationAnalysis', label: '11. Location Analysis' },
  { id: 'orgStructure', label: '12. Organizational Structure' },
  { id: 'marketingStrategy', label: '13. Marketing Strategy' },
  { id: 'techIntegration', label: '14. Technology Integration (Firebase)' },
  { id: 'projectCost', label: '15. Project Cost (One-Time Investment)' },
  { id: 'meansOfFinance', label: '16. Means of Finance' },
  { id: 'workingCapitalRequirement', label: '17. Working Capital Requirement' },
  { id: 'financialProjections', label: '18. Financial Projections' },
  { id: 'cashFlowStatement', label: '19. Cash Flow Statement' },
  { id: 'turnoverAnalysis', label: '20. Turnover Analysis' },
  { id: 'breakevenAnalysis', label: '21. Break-even Analysis' },
  { id: 'dscrMatrix', label: '22. DSCR Matrix' },
  { id: 'keyRatios', label: '23. Key Ratios' },
  { id: 'mpbfCalculation', label: '24. MPBF Calculation' },
  { id: 'amortizationSchedule', label: '25. Amortization Schedule' },
  { id: 'riskMitigation', label: '26. Risk & Mitigation' },
  { id: 'govtSchemes', label: '27. Government Schemes (CGTMSE)' },
  { id: 'licensesRegistrations', label: '28. Licenses & Registrations' },
  { id: 'roadmap', label: '29. Roadmap (5 Years)' },
  { id: 'conclusion', label: '30. Conclusion' }
];

export function LoanProjectHub({ brandLogo = '' }: LoanProjectHubProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');
  const [activeEditingSection, setActiveEditingSection] = useState<string>('executiveSummary');
  const [zoom, setZoom] = useState(1);
  const [isMachineryBreakupOpen, setIsMachineryBreakupOpen] = useState(false);
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  const [pendingDrawingFile, setPendingDrawingFile] = useState<string | undefined>();

  // Firestore Persistence Node
  const strategyRef = useMemoFirebase(() => doc(db, 'settings', 'loan_strategy'), [db]);
  const { data: savedStrategy } = useDoc<any>(strategyRef);

  // Initialize checklist based on sequence
  const initialChecklist: Record<string, boolean> = {};
  REPORT_SEQUENCE.forEach(item => { initialChecklist[item.id] = true; });

  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);

  const [foundationalData, setFormData] = useState({
    projectName: 'Precision VMC Machining & Tool Room Hub',
    businessFirmName: 'Ferocious Tech',
    businessIndustry: 'Manufacturing',
    natureOfBusiness: 'Manufacturing and service',
    legalConstitution: 'Proprietorship',
    businessAddress: 'Plot No. 42, Industrial Area Phase II, Pune',
    pinCode: '411026',
    contactPhone: '+91 98765 43210',
    typeOfLoanNeeded: 'MSME Loan',
    promoterName: 'Jayant Patil',
    location: 'Pune, Maharashtra',
    totalLoanRequirement: '45,00,000',
    executiveSummary: 'This feasibility study outlines the establishment of a precision manufacturing node focused on high-accuracy industrial outputs.',
    aboutCompany: 'Ferocious Tech is an emerging industrial leader in precision engineering, focused on technical excellence and automated manufacturing protocols.',
    visionMission: 'VISION: To establish Ferocious Tech as the global benchmark for precision machining.\nMISSION: Providing exceptional technical value through specialized engineering.',
    promoterProfile: 'Jayant Patil - B.E. Mechanical / MBA Operations. 15+ Years in Tool Room & VMC Operations. Highly technical leadership with a proven track record in precision engineering.',
    marketAnalysis: "India's electrical sector is witnessing an unprecedented surge. The Indian Tooling Industry is valued at approximately ₹18,500 Crores.",
    swotAnalysis: "STRENGTHS: High technical expertise, Advanced VMC fleet.\nWEAKNESSES: New establishment phase.\nOPPORTUNITIES: EV sector growth.\nTHREATS: Raw material price volatility.",
    businessModel: "Revenue-driven B2B model focusing on high-precision job work and proprietary industrial connectors.",
    operationsPlan: "Multi-shift precision machining utilizing 3-axis and 4-axis VMC centers with integrated QC cycles.",
    locationAnalysis: "Strategically located in Pune's industrial belt, providing seamless access to Tier 1 supply chains and skilled labor.",
    orgStructure: "Lean organizational matrix consisting of a Promoter, Shift Supervisors, VMC Operators, and Quality Leads.",
    marketingStrategy: "Direct industrial liaison, digital cataloging, and exhibition presence at IMTEX and related trade nodes.",
    techIntegration: "System uses Firebase and Next.js for real-time manufacturing execution system (MES) and inventory synchronization.",
    riskMitigation: "Comprehensive insurance coverage, multi-vendor raw material sourcing, and dynamic debt-service reserves.",
    govtSchemes: "The project identifies the CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises) as the primary credit risk mitigation matrix.",
    licensesRegistrations: "Udyam Registration, GST, ISO 9001:2015 compliance, and local municipal NOCs verified.",
    conclusion: "Based on the Techno-Economic analysis, the project demonstrates high viability with strong debt-service coverage and technical stability."
  });

  const [proprietaryProducts, setProprietaryProducts] = useState<ProprietaryProduct[]>([
    { id: '1', name: 'Precision Curved Conduit Connector', market: 'Electrical / Construction', price: '45.00', annualTargetQty: '50,000', imageUrl: 'https://picsum.photos/seed/conduit/600/400' },
    { id: '2', name: 'VMC Machined Engine Plate', market: 'Automotive Tier 1', price: '1,800.00', annualTargetQty: '1,200', imageUrl: 'https://picsum.photos/seed/engineplate/600/400' },
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
    loanROI: 10.75,
    loanTenure: 84, // 7 Years
    loanMoratorium: 6, // 6 Months
    expenseRent: 35000,
    expensePower: 20000,
    expenseMaintenance: 50000,
    expenseConsumables: 100000,
    investMachinery: 6000000,
    investCivil: 150000,
    investElectrical: 50000,
    investFurniture: 30000,
    investPreOp: 200000,
    investSoftware: 200000,
    investSystem: 150000,
    investShedAdvance: 400000,
    investMoulds: 500000,
    yearlyGrowthTargets: [0, 15, 15, 15, 15],
    targetNetMargin: 20,
    entrepreneurContribution: 700000,
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
    if (!silent) toast({ title: "Strategy Matrix Committed", description: "All strategic nodes synchronized with master ledger." });
  }, [foundationalData, proprietaryProducts, industrialServices, machineryItems, financials, checklist, strategyRef, toast]);

  // Financial Engine
  const calculations = useMemo(() => {
    const fixedAssetsAtCost = (financials.investMachinery || 0) + 
                            (financials.investCivil || 0) + 
                            (financials.investElectrical || 0) + 
                            (financials.investFurniture || 0) + 
                            (financials.investPreOp || 0) +
                            (financials.investMoulds || 0) +
                            (financials.investShedAdvance || 0);
    
    const monthlyOpExBase = (financials.expenseRent || 0) + 
                           (financials.expensePower || 0) + 
                           (financials.expenseMaintenance || 0) + 
                           (financials.expenseConsumables || 0);
    
    const workingCapitalValue = monthlyOpExBase * 3;
    const totalProjectCost = fixedAssetsAtCost + workingCapitalValue;
    const totalLoanAmt = totalProjectCost * 0.9;
    const entrepreneurAmt = totalProjectCost * 0.1;

    const monthlyRate = (financials.loanROI / 100) / 12;
    const totalTenure = financials.loanTenure;
    const moratorium = financials.loanMoratorium;
    const activeRepaymentTenure = totalTenure - moratorium;

    let emi = 0;
    if (activeRepaymentTenure > 0 && monthlyRate > 0) {
      emi = (totalLoanAmt * monthlyRate * Math.pow(1 + monthlyRate, activeRepaymentTenure)) / (Math.pow(1 + monthlyRate, activeRepaymentTenure) - 1);
    }

    const annualProductRevenue = proprietaryProducts.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (parseInt(p.annualTargetQty.replace(/,/g, '')) || 0), 0);
    const annualServiceRevenue = industrialServices.reduce((acc, s) => acc + (parseFloat(s.price) || 0) * (parseInt(s.annualTargetQty.replace(/,/g, '')) || 0), 0);
    const totalCapacityAnnualRevenue = annualProductRevenue + annualServiceRevenue;

    const schedule: any[] = [];
    let remainingBalance = totalLoanAmt;
    for (let m = 1; m <= totalTenure; m++) {
      const isMoratorium = m <= moratorium;
      const interest = remainingBalance * monthlyRate;
      const principal = isMoratorium ? 0 : emi - interest;
      remainingBalance = Math.max(0, remainingBalance - principal);
      schedule.push({ month: m, payment: isMoratorium ? 0 : emi, interest, principal, balance: remainingBalance });
    }

    const projections: any[] = [];
    const cashFlow: any[] = [];
    const loanRepayment: any[] = [];

    let currentTNW = entrepreneurAmt;
    let accumulatedDepreciation = 0;
    const depreciationRate = 0.15;
    let openingCash = workingCapitalValue * 0.2;

    for (let y = 1; y <= 5; y++) {
      const growth = financials.yearlyGrowthTargets?.[y-1] ?? (y === 1 ? 0 : 15);
      const revMultiplier = Math.pow(1 + (growth / 100), y - 1);
      
      const yearRevenue = y === 1 ? (totalCapacityAnnualRevenue * 0.7) : (totalCapacityAnnualRevenue * revMultiplier);
      const yearOpExBase = monthlyOpExBase * 12 * (1 + (y * 0.05));
      const yearDepreciation = Math.max(0, (fixedAssetsAtCost - accumulatedDepreciation) * depreciationRate);
      accumulatedDepreciation += yearDepreciation;
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearPrincipal = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0);
      
      const yearEBITDA = yearRevenue - yearOpExBase;
      const yearPBT = yearEBITDA - yearDepreciation - yearInterest;
      const yearPAT = yearPBT > 0 ? yearPBT * 0.25 : 0;
      
      currentTNW += yearPAT * 0.8;
      const yearTermLoan = schedule[Math.min(y * 12, schedule.length) - 1]?.balance || 0;
      const yearCurrentLiabilities = workingCapitalValue * (1 + (y * 0.1)); 
      const yearTOL = yearTermLoan + yearCurrentLiabilities;
      const dscr = (yearPAT + yearDepreciation + yearInterest) / (yearInterest + yearPrincipal || 1);

      projections.push({
        year: `Year ${y}`,
        revenue: yearRevenue,
        ebitda: yearEBITDA,
        pat: yearPAT,
        margin: (yearPAT / yearRevenue * 100).toFixed(1),
        ratio: (yearTOL / currentTNW).toFixed(2),
        dscr: dscr.toFixed(2)
      });

      cashFlow.push({
        year: `Year ${y}`,
        npat: yearPAT,
        interest: yearInterest,
        depreciation: yearDepreciation,
        opProfit: yearPAT + yearInterest + yearDepreciation,
        loanRepayment: -yearPrincipal,
        closingCash: openingCash + (yearPAT + yearInterest + yearDepreciation) - yearPrincipal
      });

      loanRepayment.push({
        year: `Year ${y}`,
        opening: schedule[(y-1)*12]?.balance || (y === 1 ? totalLoanAmt : 0),
        interest: yearInterest,
        principal: yearPrincipal,
        closing: yearTermLoan
      });

      openingCash = cashFlow[y-1].closingCash;
    }

    const avgDSCR = projections.reduce((acc, p) => acc + parseFloat(p.dscr), 0) / 5;
    const total5YearProfit = projections.reduce((acc, p) => acc + p.pat, 0);

    return {
      monthlyOpEx: monthlyOpExBase,
      workingCapitalValue,
      totalProjectCost,
      loanAmt: totalLoanAmt,
      entrepreneurAmt,
      emi,
      projections,
      cashFlow,
      loanRepayment,
      avgDSCR: avgDSCR.toFixed(2),
      fixedCapital: fixedAssetsAtCost,
      mpbf: (totalCapacityAnnualRevenue * 0.25 * 0.75),
      total5YearProfit
    };
  }, [financials, proprietaryProducts, industrialServices]);

  const handleUpdateDimension = (idx: number, field: string, value: any) => {
    const updated = [...machineryItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'qty' || field === 'rate') updated[idx].total = updated[idx].qty * updated[idx].rate;
    setMachineryItems(updated);
    setFinancials(prev => ({ ...prev, investMachinery: updated.reduce((acc, i) => acc + i.total, 0) }));
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

  const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden print:visible">
      <div className="relative w-[20%] aspect-square">
         {brandLogo && <Image src={brandLogo} alt="Corporate Identity Watermark" fill className="object-contain" />}
      </div>
    </div>
  );

  const renderActiveEditor = () => {
    switch(activeEditingSection) {
      case 'projectCost':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex justify-between items-center"><h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Asset Matrix</h3><Button variant="ghost" size="sm" className="text-primary font-bold text-[9px] uppercase" onClick={()=>setIsMachineryBreakupOpen(true)}><Edit3 className="h-3.5 w-3.5 mr-2" /> Edit Breakup</Button></div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2"><Label className="text-[8px] font-bold text-slate-400 uppercase">Machinery</Label><Input readOnly className="bg-slate-100 h-11" value={financials.investMachinery.toLocaleString()} /></div>
                <div className="space-y-2"><Label className="text-[8px] font-bold text-slate-400 uppercase">Shed Advance</Label><Input type="number" className="h-11" value={financials.investShedAdvance} onChange={(e)=>setFinancials({...financials,investShedAdvance:Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label className="text-[8px] font-bold text-slate-400 uppercase">Mould Manufacturing</Label><Input type="number" className="h-11" value={financials.investMoulds} onChange={(e)=>setFinancials({...financials,investMoulds:Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label className="text-[8px] font-bold text-slate-400 uppercase">Civil</Label><Input type="number" className="h-11" value={financials.investCivil} onChange={(e)=>setFinancials({...financials,investCivil:Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label className="text-[8px] font-bold text-slate-400 uppercase">Electrical</Label><Input type="number" className="h-11" value={financials.investElectrical} onChange={(e)=>setFinancials({...financials,investElectrical:Number(e.target.value)})} /></div>
             </div>
          </div>
        );
      case 'productServices':
        return (
          <div className="space-y-12">
             <div className="space-y-8">
               <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase text-slate-400">Proprietary Products</h4><Button size="sm" variant="ghost" onClick={() => setProprietaryProducts([...proprietaryProducts, { id: Date.now().toString(), name: '', market: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])}>+ Add</Button></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {proprietaryProducts.map((p, idx) => (
                   <Card key={p.id} className="p-4 bg-slate-50 relative"><Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-slate-300" onClick={()=>setProprietaryProducts(proprietaryProducts.filter((_,i)=>i!==idx))}><Trash2 className="h-3 w-3" /></Button><Input value={p.name} onChange={(e)=>updateProduct(idx,'name',e.target.value)} className="h-8 mb-2 font-bold" placeholder="Product Name" /><div className="grid grid-cols-2 gap-2"><Input value={p.price} onChange={(e)=>updateProduct(idx,'price',e.target.value)} placeholder="Price" /><Input value={p.annualTargetQty} onChange={(e)=>updateProduct(idx,'annualTargetQty',e.target.value)} placeholder="Qty" /></div></Card>
                 ))}
               </div>
             </div>
             <div className="space-y-8">
               <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase text-slate-400">Industrial Services</h4><Button size="sm" variant="ghost" onClick={() => setIndustrialServices([...industrialServices, { id: Date.now().toString(), name: '', description: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])}>+ Add</Button></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {industrialServices.map((s, idx) => (
                   <Card key={s.id} className="p-4 bg-slate-50 relative"><Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-slate-300" onClick={()=>setIndustrialServices(industrialServices.filter((_,i)=>i!==idx))}><Trash2 className="h-3 w-3" /></Button><Input value={s.name} onChange={(e)=>updateService(idx,'name',e.target.value)} className="h-8 mb-2 font-bold" placeholder="Service Name" /><div className="grid grid-cols-2 gap-2"><Input value={s.price} onChange={(e)=>updateService(idx,'price',e.target.value)} placeholder="Rate" /><Input value={s.annualTargetQty} onChange={(e)=>updateService(idx,'annualTargetQty',e.target.value)} placeholder="Jobs" /></div></Card>
                 ))}
               </div>
             </div>
          </div>
        );
      case 'roadmap':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="border-2 border-slate-900 overflow-x-auto rounded-sm bg-white shadow-xl">
                <table className="w-full text-left min-w-[800px]">
                   <thead className="bg-slate-50 border-b-2 border-slate-900">
                      <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Particulars</th>{calculations.projections.map(p=><th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}</tr>
                   </thead>
                   <tbody>
                      <tr className="border-b font-bold"><td className="p-4 text-[10px] uppercase border-r">Income from Operations</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-[10px] text-right border-r last:border-0">{(p.revenue||0).toLocaleString('en-IN')}</td>)}</tr>
                      <tr className="border-b"><td className="p-4 text-[10px] uppercase border-r">EBITDA</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-[10px] text-right border-r last:border-0">{(p.ebitda||0).toLocaleString('en-IN')}</td>)}</tr>
                      <tr className="bg-slate-50 font-bold"><td className="p-4 text-[11px] uppercase border-r border-slate-900">Profit After Tax (PAT)</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-[11px] text-right border-r last:border-0 text-emerald-600">₹ {(p.pat||0).toLocaleString('en-IN')}</td>)}</tr>
                   </tbody>
                </table>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {financials.yearlyGrowthTargets.map((gt, i)=>(
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border"><Label className="text-[8px] font-bold text-slate-400 uppercase">Year {i+1} %</Label><Input type="number" value={gt} onChange={(e)=>{const nt=[...financials.yearlyGrowthTargets];nt[i]=Number(e.target.value);setFinancials({...financials,yearlyGrowthTargets:nt})}} className="h-10 bg-white border-none font-bold text-center" /></div>
                ))}
             </div>
          </div>
        );
      default: return <Textarea className="bg-slate-50 border-none min-h-[300px] rounded-2xl p-6" value={(foundationalData as any)[activeEditingSection]} onChange={(e)=>setFormData({...foundationalData, [activeEditingSection]: e.target.value})} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20 print:pb-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Landmark className="h-4 w-4" /> Strategic Architect
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#001F3D]">Strategy <span className="text-slate-400 font-medium">Engineer</span></h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
           <Button variant="outline" className="h-12 rounded-xl border-slate-200 px-8 font-bold text-[10px] uppercase tracking-widest gap-2 flex-1 sm:flex-none" onClick={() => window.print()}><Printer className="h-4 w-4" /> Export Report</Button>
           <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3 flex-1 sm:flex-none" onClick={() => handleSaveStrategy()}><Save className="h-4 w-4" /> Commit Strategy</Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full no-print">
        <div className="overflow-x-auto pb-4">
          <TabsList className="bg-slate-100 p-1.5 rounded-full mb-2 h-14 inline-flex border border-slate-200 shadow-sm gap-2 min-w-max">
            <TabsTrigger value="input" className="rounded-full px-6 md:px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">01. Identity Matrix</TabsTrigger>
            <TabsTrigger value="financials" className="rounded-full px-6 md:px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Financial Projection</TabsTrigger>
            <TabsTrigger value="display" className="rounded-full px-6 md:px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">04. Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="input" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                 <Card className="p-6 md:p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-10">
                    <div className="flex items-center gap-4 border-l-4 border-primary pl-4 md:pl-6">
                       <div className="p-3 bg-primary/10 rounded-2xl text-primary"><FileText className="h-6 w-6" /></div>
                       <h3 className="text-lg md:text-xl font-display font-bold text-[#001F3D] uppercase">Project Foundational Identity</h3>
                    </div>
                    {renderActiveEditor()}
                 </Card>
              </div>
              <Card className="lg:col-span-4 p-6 md:p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] h-fit sticky top-24">
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-8">Report Matrix</h3>
                 <ScrollArea className="max-h-[600px] pr-4">
                  <div className="space-y-3">
                      {REPORT_SEQUENCE.map((item) => (
                        <div key={item.id} className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer", activeEditingSection === item.id ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10")} onClick={() => setActiveEditingSection(item.id)}>
                            <Checkbox checked={checklist[item.id]} className="border-white/20" onCheckedChange={() => setChecklist({...checklist, [item.id]: !checklist[item.id]})} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", activeEditingSection === item.id ? "text-white" : "text-white/60")}>{item.label}</span>
                        </div>
                      ))}
                  </div>
                 </ScrollArea>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-10 animate-in slide-in-from-bottom-2 duration-500">
           <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
              <div className="flex items-center justify-between border-l-4 border-purple-500 pl-6">
                 <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Executive Summary Snapshot</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Project vitals and institutional funding nodes.</p>
                 </div>
                 <Badge className="bg-purple-50 text-purple-700 border-none text-[8px] font-bold px-4 py-1.5 rounded-full">SYSTEM_READY</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Project Cost</p>
                    <p className="text-xl font-display font-bold text-[#001F3D]">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-2">Term Loan (90%)</p>
                    <p className="text-xl font-display font-bold text-primary">₹ {calculations.loanAmt.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Equity Contribution</p>
                    <p className="text-xl font-display font-bold text-emerald-600">₹ {calculations.entrepreneurAmt.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <p className="text-[8px] font-bold text-purple-400 uppercase tracking-widest mb-2">Average DSCR</p>
                    <p className="text-xl font-display font-bold text-purple-700">{calculations.avgDSCR}</p>
                 </div>
              </div>
           </Card>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                 <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] border-l-4 border-primary pl-4">Valuation & Funding Matrix</h3>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Total Project Cost (₹)</Label>
                          <div className="p-5 bg-slate-50 rounded-2xl font-display font-bold text-xl md:text-2xl text-[#001F3D] shadow-inner border border-slate-100">
                             {calculations.totalProjectCost.toLocaleString('en-IN')}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Loan Capital Node (₹)</Label>
                          <div className="relative">
                             <Input readOnly className="h-14 bg-white border-2 border-slate-100 rounded-2xl font-display font-bold text-lg text-primary" value={calculations.loanAmt.toLocaleString('en-IN', {maximumFractionDigits:0})} />
                             <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/10 text-primary text-[8px]">90.0%</Badge>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Entrepreneur Invest Node (₹)</Label>
                          <div className="relative">
                             <Input readOnly className="h-14 bg-white border-2 border-slate-100 rounded-2xl font-display font-bold text-lg text-slate-700" value={calculations.entrepreneurAmt.toLocaleString('en-IN', {maximumFractionDigits:0})} />
                             <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 text-slate-400 text-[8px]">10.0%</Badge>
                          </div>
                       </div>
                    </div>
                 </Card>

                 <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] border-l-4 border-red-500 pl-4">Loan Parameters</h3>
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">ROI (% P.A.)</Label>
                             <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.loanROI} onChange={(e)=>setFinancials({...financials, loanROI: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">Tenure (Months)</Label>
                             <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.loanTenure} onChange={(e)=>setFinancials({...financials, loanTenure: Number(e.target.value)})} />
                          </div>
                       </div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-8 space-y-8">
                 <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] border-l-4 border-emerald-600 pl-4">Monthly Operational Expense (OpEx) Matrix</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Rent</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.expenseRent} onChange={(e)=>setFinancials({...financials, expenseRent: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Power</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.expensePower} onChange={(e)=>setFinancials({...financials, expensePower: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Maintenance</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.expenseMaintenance} onChange={(e)=>setFinancials({...financials, expenseMaintenance: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Consumables</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.expenseConsumables} onChange={(e)=>setFinancials({...financials, expenseConsumables: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Monthly EMI</Label><div className="h-12 bg-slate-100 rounded-xl flex items-center px-4 font-display font-bold text-primary shadow-inner">₹ {calculations.emi.toLocaleString('en-IN', {maximumFractionDigits:0})}</div></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Total Monthly OpEx</Label><div className="h-12 bg-emerald-50 rounded-xl flex items-center px-4 font-display font-bold text-emerald-700 shadow-inner">₹ {(calculations.monthlyOpEx + calculations.emi).toLocaleString('en-IN', {maximumFractionDigits: 0})}</div></div>
                    </div>
                 </Card>

                 <div className="space-y-6 pt-10">
                    <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-4 md:pl-6"><h3 className="text-lg md:text-xl font-display font-bold text-[#001F3D] uppercase">5-Year Cash Flow Statement</h3></div>
                    <div className="border border-slate-200 overflow-x-auto rounded-[1.5rem] bg-white shadow-xl">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr><th className="p-6 text-[9px] font-bold uppercase text-slate-400 border-r w-[20%]">Particulars</th>{calculations.projections.map(p=><th key={p.year} className="p-6 text-[9px] font-bold uppercase text-right border-r last:border-0">{p.year}</th>)}</tr>
                        </thead>
                        <tbody>
                          <tr className="bg-[#001F3D] text-white"><td className="p-6 px-6 text-[12px] font-bold uppercase tracking-widest border-r border-white/10">Closing Cash Flow Balance</td>{calculations.cashFlow.map(c=><td key={c.year} className="p-6 text-[14px] font-display font-bold text-emerald-400 text-right border-r border-white/10 last:border-0">₹ {(c.closingCash||0).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        </tbody>
                      </table>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="display" className="m-0 flex flex-col items-center overflow-x-hidden">
           <div className="flex flex-wrap justify-center gap-4 p-4 bg-white/80 backdrop-blur-xl border rounded-3xl md:rounded-full sticky top-6 z-50 shadow-xl no-print mx-4">
              <div className="flex items-center gap-2">
                <button onClick={()=>setZoom(Math.max(zoom-0.1, 0.5))} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ZoomOut className="h-4 w-4" /></button>
                <span className="flex items-center text-[11px] font-bold w-10 justify-center">{Math.round(zoom*100)}%</span>
                <button onClick={()=>setZoom(Math.min(zoom+0.1, 2))} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ZoomIn className="h-4 w-4" /></button>
              </div>
              <div className="w-px bg-slate-200 h-8 hidden sm:block" />
              <Button className="bg-[#001F3D] text-white rounded-full h-10 px-6 md:px-8 font-bold text-[10px] uppercase" onClick={()=>window.print()}><Printer className="h-4 w-4 mr-2" /> Print PDF</Button>
           </div>

           <div className="w-full overflow-x-auto pb-20 px-4 scrollbar-hide">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm' }} className="mx-auto print:transform-none print:w-full">
                <div className="bg-white shadow-2xl p-10 md:p-20 min-h-[297mm] space-y-16 print:p-12 print:shadow-none relative">
                   
                   {/* Cover Page */}
                   <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-12 border-b-2 border-slate-900 pb-20 page-break relative z-10">
                      <Watermark />
                      <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border flex items-center justify-center p-4">
                         <Image src={brandLogo || 'https://picsum.photos/seed/ferocious-logo-v2/400/400'} alt="Logo" fill className="object-contain p-4" />
                      </div>
                      <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-[#001F3D] uppercase leading-none">Techno-Economic <br />Feasibility Analysis</h1>
                      <div className="h-1.5 w-24 md:w-32 bg-red-600 mx-auto rounded-full mt-8" />
                      <div className="pt-20 grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-20 w-full max-w-2xl text-left border-t border-slate-100">
                         <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project Entity</p><h4 className="text-base md:text-lg font-bold text-[#001F3D] uppercase">{foundationalData.projectName}</h4></div>
                         <div className="sm:text-right"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submission Date</p><h4 className="text-base md:text-lg font-bold text-[#001F3D] uppercase">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h4></div>
                      </div>
                   </div>

                   {/* Render Sequence Sections */}
                   {REPORT_SEQUENCE.map((section) => (
                     checklist[section.id] && (
                       <div key={section.id} className="space-y-8 page-break relative z-10 py-10 min-h-[297mm]">
                         <Watermark />
                         <h2 className="text-2xl md:text-3xl font-display font-bold text-[#8B5CF6] tracking-tight uppercase border-b-2 border-[#8B5CF6] pb-2">{section.label}</h2>
                         
                         <div className="space-y-6">
                            {/* Specialized Renders for specific IDs */}
                            {section.id === 'projectCost' && (
                              <div className="space-y-6">
                                <div className="overflow-x-auto border-2 border-slate-900 rounded-sm">
                                  <table className="w-full text-left min-w-[500px]">
                                    <thead className="bg-slate-50 border-b border-slate-900"><tr className="text-[10px] font-bold uppercase"><th className="p-3 border-r border-slate-900">Expenditure</th><th className="p-3 text-right">Amount (₹)</th></tr></thead>
                                    <tbody className="text-xs">
                                      <tr className="border-b border-slate-300"><td className="p-3 border-r border-slate-900 font-medium">Plant & Machinery</td><td className="p-3 text-right font-bold">₹ {financials.investMachinery.toLocaleString('en-IN')}</td></tr>
                                      <tr className="border-b border-slate-300"><td className="p-3 border-r border-slate-900 font-medium">Shed Advance</td><td className="p-3 text-right font-bold">₹ {financials.investShedAdvance.toLocaleString('en-IN')}</td></tr>
                                      <tr className="border-b border-slate-300"><td className="p-3 border-r border-slate-900 font-medium">Moulds & Tooling</td><td className="p-3 text-right font-bold">₹ {financials.investMoulds.toLocaleString('en-IN')}</td></tr>
                                      <tr className="border-b border-slate-300"><td className="p-3 border-r border-slate-900 font-medium">Civil & Electrical</td><td className="p-3 text-right font-bold">₹ {(financials.investCivil + financials.investElectrical).toLocaleString('en-IN')}</td></tr>
                                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-900"><td className="p-3 border-r border-slate-900 uppercase">Total Project Cost</td><td className="p-3 text-right">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</td></tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {section.id === 'meansOfFinance' && (
                              <div className="overflow-x-auto border-2 border-slate-900 rounded-sm">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                  <thead className="bg-slate-50 border-b-2 border-slate-900"><tr className="text-[10px] font-bold uppercase text-[#3B82F6]"><th className="p-4 border-r border-slate-900">Source</th><th className="p-4 text-center border-r border-slate-900 w-24">Share</th><th className="p-4 text-right">Amount (₹)</th></tr></thead>
                                  <tbody className="text-xs">
                                    <tr className="border-b border-slate-300"><td className="p-4 border-r border-slate-900 font-medium">Bank Loan (90%)</td><td className="p-4 text-center border-r border-slate-900">90%</td><td className="p-4 text-right">₹ {calculations.loanAmt.toLocaleString('en-IN')}</td></tr>
                                    <tr className="border-b border-slate-300"><td className="p-4 border-r border-slate-900 font-medium">Promoter Equity (10%)</td><td className="p-4 text-center border-r border-slate-900">10%</td><td className="p-4 text-right">₹ {calculations.entrepreneurAmt.toLocaleString('en-IN')}</td></tr>
                                    <tr className="bg-slate-100 font-black"><td className="p-4 border-r border-slate-900 text-right uppercase">Total Capital Node</td><td className="p-4 text-center border-r border-slate-900">100%</td><td className="p-4 text-right">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</td></tr>
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {section.id === 'cashFlowStatement' && (
                              <div className="border border-slate-200 overflow-x-auto rounded-xl bg-white shadow-xl">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                  <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 text-[9px] font-bold uppercase border-r">Particulars</th>{calculations.projections.map(p=><th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r last:border-0">{p.year}</th>)}</tr></thead>
                                  <tbody>
                                    <tr className="bg-[#001F3D] text-white"><td className="p-4 px-6 text-[10px] font-bold uppercase border-r border-white/10">Closing Cash Flow</td>{calculations.cashFlow.map(c=><td key={c.year} className="p-4 text-[12px] font-display font-bold text-emerald-400 text-right border-r border-white/10 last:border-0">₹ {(c.closingCash||0).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {section.id === 'amortizationSchedule' && (
                              <div className="border border-slate-200 overflow-x-auto rounded-xl bg-white shadow-xl">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                  <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 text-[9px] font-bold uppercase border-r">Year</th><th className="p-4 text-right border-r">Opening</th><th className="p-4 text-right border-r text-red-600">Interest</th><th className="p-4 text-right border-r text-red-600">Principal</th><th className="p-4 text-right">Closing</th></tr></thead>
                                  <tbody>
                                    {calculations.loanRepayment.map((lr) => (
                                      <tr key={lr.year} className="border-b border-slate-50"><td className="p-4 text-[10px] font-bold uppercase border-r">{lr.year}</td><td className="p-4 text-right border-r">{(lr.opening||0).toLocaleString('en-IN')}</td><td className="p-4 text-right border-r text-red-600">{(lr.interest||0).toLocaleString('en-IN')}</td><td className="p-4 text-right border-r text-red-600">{(lr.principal||0).toLocaleString('en-IN')}</td><td className="p-4 text-right font-bold">{(lr.closing||0).toLocaleString('en-IN')}</td></tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {section.id === 'roadmap' && (
                               <div className="border-2 border-slate-900 overflow-x-auto rounded-sm bg-white shadow-xl">
                                  <table className="w-full text-left min-w-[800px]">
                                     <thead className="bg-slate-50 border-b-2 border-slate-900">
                                        <tr><th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Particulars</th>{calculations.projections.map(p=><th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}</tr>
                                     </thead>
                                     <tbody>
                                        <tr className="border-b font-bold"><td className="p-4 text-[10px] uppercase border-r">Income from Operations</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-[10px] text-right border-r last:border-0">{(p.revenue||0).toLocaleString('en-IN')}</td>)}</tr>
                                        <tr className="bg-slate-100 font-bold"><td className="p-4 text-[11px] uppercase border-r border-slate-900">Profit After Tax (PAT)</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-[11px] text-right border-r last:border-0 text-emerald-600">₹ {(p.pat||0).toLocaleString('en-IN')}</td>)}</tr>
                                     </tbody>
                                  </table>
                               </div>
                            )}

                            {section.id === 'productServices' && (
                              <div className="space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                  {proprietaryProducts.map(p => (
                                    <div key={p.id} className="p-4 bg-slate-50 border rounded-xl"><p className="text-[10px] font-bold uppercase">{p.name}</p><p className="text-[8px] text-primary font-bold mt-1">₹ {parseFloat(p.price).toLocaleString()}</p></div>
                                  ))}
                                  {industrialServices.map(s => (
                                    <div key={s.id} className="p-4 bg-blue-50 border border-blue-100 rounded-xl"><p className="text-[10px] font-bold uppercase">{s.name}</p><p className="text-[8px] text-blue-600 font-bold mt-1">₹ {parseFloat(s.price).toLocaleString()}</p></div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Standard Text Content for other nodes */}
                            {!['projectCost', 'meansOfFinance', 'cashFlowStatement', 'amortizationSchedule', 'roadmap', 'productServices'].includes(section.id) && (
                              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{(foundationalData as any)[section.id] || "Metadata protocol active. Awaiting strategic input matrix."}</p>
                              </div>
                            )}
                         </div>
                       </div>
                     )
                   ))}

                </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isMachineryBreakupOpen} onOpenChange={setIsMachineryBreakupOpen}>
        <DialogContent className="max-w-4xl h-[85vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 md:p-8 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0 space-y-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20"><Factory className="h-6 w-6 md:h-8 md:w-8" /></div>
              <div className="text-left">
                <DialogTitle className="text-xl md:text-2xl font-display font-bold uppercase tracking-tight text-white">Plant & Machinery Breakup</DialogTitle>
                <DialogDescription className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Capital Expenditure Quotation Ledger v2.4</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6 md:p-10">
            <div className="space-y-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-slate-50"><tr><th className="p-4 text-[9px] uppercase font-bold text-slate-400">Asset</th><th className="p-4 text-[9px] uppercase font-bold text-slate-400 text-center">Qty</th><th className="p-4 text-[9px] uppercase font-bold text-slate-400 text-right">Rate</th><th className="p-4 text-[9px] uppercase font-bold text-slate-400 text-right">Total</th><th className="p-4 w-12"></th></tr></thead>
                  <tbody>
                     {machineryItems.map((item, i)=>(
                       <tr key={item.id} className="border-b group">
                          <td className="p-2"><Input value={item.name} onChange={(e)=>handleUpdateDimension(i,'name',e.target.value)} className="bg-transparent border-none text-[11px] font-bold" /></td>
                          <td className="p-2"><Input type="number" value={item.qty} onChange={(e)=>handleUpdateDimension(i,'qty',Number(e.target.value))} className="bg-transparent border-none text-center" /></td>
                          <td className="p-2"><Input type="number" value={item.rate} onChange={(e)=>handleUpdateDimension(i,'rate',Number(e.target.value))} className="bg-transparent border-none text-right" /></td>
                          <td className="p-2 text-right font-bold">₹ {item.total.toLocaleString()}</td>
                          <td className="p-2"><Button variant="ghost" size="icon" onClick={()=>setMachineryItems(machineryItems.filter((_,idx)=>idx!==i))}><Trash2 className="h-4 w-4" /></Button></td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" className="w-full h-12 dashed rounded-xl font-bold uppercase text-[9px] tracking-widest" onClick={()=>setMachineryItems([...machineryItems, {id:`M-${Date.now()}`, name:'', qty:1, rate:0, total:0}])}>+ Append Asset Node</Button>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 md:p-8 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Gross Val</p>
              <p className="text-xl md:text-2xl font-bold text-primary">₹ {financials.investMachinery.toLocaleString()}</p>
            </div>
            <Button className="h-12 px-10 bg-[#001F3D] text-white rounded-xl w-full sm:w-auto" onClick={()=>setIsMachineryBreakupOpen(false)}>Commit Matrix</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
        <DialogContent className="max-w-full w-screen h-screen m-0 rounded-none bg-slate-950 border-none shadow-none p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 bg-slate-900/50 border-b flex items-center justify-between shrink-0"><DialogTitle className="text-white uppercase font-bold text-sm">Blueprint Viewer</DialogTitle><Button variant="ghost" size="icon" onClick={()=>setIsZoomDialogOpen(false)} className="text-white"><X className="h-6 w-6" /></Button></DialogHeader>
          <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto">{pendingDrawingFile && <img src={pendingDrawingFile} alt="" className="max-w-full max-h-full object-contain" />}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
