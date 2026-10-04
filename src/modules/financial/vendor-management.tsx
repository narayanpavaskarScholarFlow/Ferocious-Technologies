
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  ClipboardList, 
  Info, 
  Receipt, 
  Archive, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Landmark, 
  Timer, 
  Hammer, 
  Zap,
  ChevronRight,
  Search,
  ShoppingCart,
  LayoutGrid,
  FileCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Target,
  FileText
} from 'lucide-react';
import { Vendor, BillingRecord, Order, Machine, PermissionLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart as ReChartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';

function PieChart({ className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
  );
}

function Wallet({ className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
  );
}

interface VendorManagementProps {
  vendors: Vendor[];
  billing: BillingRecord[];
  orders: Order[];
  machines: Machine[];
  onSaveVendor: (vendor: Vendor) => void;
}

export function VendorManagement({ vendors, billing, orders, machines, onSaveVendor }: VendorManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('intelligence');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // FINANCIAL INTELLIGENCE ENGINE
  const biMetrics = useMemo(() => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.status === 'Active').length;
    const totalBusiness = billing.filter(r => r.type === 'purchase_order' || r.type === 'purchase_invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalInvoiced = billing.filter(r => r.type === 'purchase_invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPayments = billing.filter(r => r.type === 'outward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = totalInvoiced - totalPayments;
    
    // Outsourcing vs In-house
    const totalInHouseValue = orders.reduce((acc, o) => acc + (parseFloat(o.targetBudget || '0') || 0), 0);
    const totalOutsourcedValue = billing.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outsourcingRatio = totalOutsourcedValue / (totalInHouseValue + totalOutsourcedValue || 1);

    // Machine-wise Outsourcing Analysis (Mock extraction from items)
    const machineOutsourcing = [
      { name: 'VMC Work', value: 450000, color: '#3b82f6' },
      { name: 'CNC Turning', value: 280000, color: '#10b981' },
      { name: 'Grinding', value: 350000, color: '#f59e0b' },
      { name: 'Heat Treatment', value: 120000, color: '#8b5cf6' },
    ];

    return { 
      totalVendors, 
      activeVendors, 
      totalBusiness, 
      outstanding, 
      totalInHouseValue, 
      totalOutsourcedValue, 
      outsourcingRatio: Math.round(outsourcingRatio * 100),
      machineOutsourcing
    };
  }, [vendors, billing, orders]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendors, searchTerm]);

  const selectedVendorData = useMemo(() => {
    if (!selectedVendorId) return null;
    const vendor = vendors.find(v => v.id === selectedVendorId);
    if (!vendor) return null;

    const vBilling = billing.filter(r => r.customerId === vendor.id || r.customerName === vendor.name);
    const vBusiness = vBilling.reduce((acc, r) => acc + (r.amount || 0), 0);
    const vOutstanding = vBilling.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);
    
    // Performance Mock Score
    const score = Math.round(90 - (Math.random() * 20));
    const grade = score > 85 ? 'A+' : score > 75 ? 'A' : score > 60 ? 'B' : 'C';

    return { ...vendor, business: vBusiness, outstanding: vOutstanding, score, grade };
  }, [selectedVendorId, vendors, billing]);

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendorId(vendor.id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Truck className="h-4 w-4" />
            Supply Chain Intelligence Center
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Vendor <span className="text-slate-400 font-medium">Performance</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Consolidated matrix of procurement efficiency and outsourcing yield.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search partner directory..." 
              className="h-11 pl-10 rounded-xl bg-white border-slate-200 text-[11px] font-bold uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-[#001F3D] hover:bg-black text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase shadow-xl" onClick={() => setIsAddOpen(true)}>
             <Plus className="h-4 w-4 mr-2" /> Onboard Partner
          </Button>
        </div>
      </header>

      {/* STRATEGIC KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Business (Ext)</p>
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShoppingCart className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-display font-black text-slate-900">₹ {(biMetrics.totalBusiness / 100000).toFixed(1)}L</p>
          <Badge variant="outline" className="mt-4 border-none text-[8px] font-bold uppercase bg-blue-50 text-blue-600 w-fit">MTD Sync Active</Badge>
        </Card>
        
        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-red-500/50 transition-all">
          <div className="flex justify-between items-start mb-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding Payables</p>
             <div className="p-2 bg-red-50 rounded-lg text-red-600"><Landmark className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-display font-black text-red-600">₹ {(biMetrics.outstanding / 100000).toFixed(1)}L</p>
          <div className="flex justify-between text-[8px] font-bold uppercase mt-4">
             <span className="text-slate-400">Avg Settlement</span>
             <span className="text-red-500">42 Days</span>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between items-start mb-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Partner Nodes</p>
             <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Users className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{biMetrics.activeVendors} / {biMetrics.totalVendors}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-4 uppercase">Approved List</p>
        </Card>

        <Card className="p-6 bg-[#1E293B] text-white border-none shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="flex justify-between items-start mb-4 relative z-10">
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Outsourcing Ratio</p>
             <div className="p-2 bg-white/10 rounded-lg text-primary"><TrendingUp className="h-4 w-4" /></div>
          </div>
          <div className="relative z-10 flex items-center justify-between">
             <p className="text-4xl font-display font-black text-white">{biMetrics.outsourcingRatio}%</p>
             <div className="text-right">
                <p className="text-[7px] font-bold text-white/30 uppercase">In-house Load</p>
                <p className="text-[10px] font-bold text-emerald-400">{100 - biMetrics.outsourcingRatio}%</p>
             </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="intelligence" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            <ShieldCheck className="h-4 w-4 mr-2" /> Vendor Matrix
          </TabsTrigger>
          <TabsTrigger value="outsourcing" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            <Zap className="h-4 w-4 mr-2" /> Outsourcing Analytics
          </TabsTrigger>
          <TabsTrigger value="investment" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            <BarChart3 className="h-4 w-4 mr-2" /> Investment ROI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="m-0 space-y-8 animate-in fade-in duration-500">
           <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><ClipboardList className="h-6 w-6" /></div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Performance Ledger</h3>
                 </div>
              </div>
              <Table>
                 <TableHeader className="bg-white border-b border-slate-100">
                    <TableRow>
                       <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-6 px-8">Partner Identity</TableHead>
                       <TableHead className="font-bold text-[9px] uppercase text-slate-400">Classification</TableHead>
                       <TableHead className="font-bold text-[9px] uppercase text-slate-400">Performance</TableHead>
                       <TableHead className="font-bold text-[9px] uppercase text-slate-400">FY Business (₹)</TableHead>
                       <TableHead className="font-bold text-[9px] uppercase text-slate-400">Outstanding</TableHead>
                       <TableHead className="text-right px-10"></TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {filteredVendors.map((vendor) => {
                      const score = Math.round(90 - (Math.random() * 20));
                      const grade = score > 85 ? 'A+' : score > 75 ? 'A' : score > 60 ? 'B' : 'C';
                      return (
                        <TableRow key={vendor.id} className="hover:bg-slate-50/50 border-slate-50 h-20 transition-all group">
                           <TableCell className="px-8 cursor-pointer" onClick={() => setSelectedVendorId(vendor.id)}>
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{vendor.name}</span>
                                 <span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">ID: {vendor.id}</span>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge variant="outline" className="text-[9px] font-bold uppercase px-3 py-1 bg-white border-slate-100">{vendor.type}</Badge>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-3">
                                 <Badge className={cn("text-[9px] font-bold uppercase px-2 py-0.5", grade.startsWith('A') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{grade}</Badge>
                                 <div className="flex-1 min-w-[100px] h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${score}%` }} />
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell>
                              <span className="text-sm font-display font-bold text-slate-900">₹ {(Math.random() * 500000).toLocaleString()}</span>
                           </TableCell>
                           <TableCell>
                              <span className="text-sm font-display font-black text-rose-600">₹ {(Math.random() * 100000).toLocaleString()}</span>
                           </TableCell>
                           <TableCell className="text-right px-10">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleEdit(vendor)}>
                                 <ChevronRight className="h-5 w-5 text-slate-300" />
                              </Button>
                           </TableCell>
                        </TableRow>
                      );
                    })}
                 </TableBody>
              </Table>
           </Card>
        </TabsContent>

        <TabsContent value="outsourcing" className="m-0 space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-7 p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                 <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Machine-Wise Outsource Matrix</h3>
                 </div>
                 <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                       <ReChartsPieChart>
                          <Pie
                             data={biMetrics.machineOutsourcing}
                             cx="50%" cy="50%"
                             innerRadius={80}
                             outerRadius={110}
                             paddingAngle={8}
                             dataKey="value"
                          >
                             {biMetrics.machineOutsourcing.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <ChartTooltip />
                       </ReChartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Outsource</span>
                       <span className="text-2xl font-display font-black text-[#001F3D]">₹ 1.2M</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-50">
                    {biMetrics.machineOutsourcing.map(item => (
                      <div key={item.name} className="space-y-1 text-center">
                         <p className="text-[7px] font-bold text-slate-400 uppercase">{item.name}</p>
                         <p className="text-sm font-bold text-slate-800">₹ {(item.value / 1000).toFixed(0)}K</p>
                      </div>
                    ))}
                 </div>
              </Card>

              <div className="lg:col-span-5 space-y-6">
                 <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8">Capacity Split Matrix</h4>
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <div className="flex justify-between items-end"><span className="text-[10px] font-bold uppercase text-white/60">In-House Production</span><span className="text-xl font-display font-bold text-emerald-400">{100 - biMetrics.outsourcingRatio}%</span></div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${100 - biMetrics.outsourcingRatio}%` }} /></div>
                       </div>
                       <div className="space-y-3">
                          <div className="flex justify-between items-end"><span className="text-[10px] font-bold uppercase text-white/60">Outsourced Yield</span><span className="text-xl font-display font-bold text-primary">{biMetrics.outsourcingRatio}%</span></div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${biMetrics.outsourcingRatio}%` }} /></div>
                       </div>
                    </div>
                    <div className="mt-12 p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                       <ShieldCheck className="h-5 w-5 text-emerald-400" />
                       <p className="text-[9px] text-white/40 font-medium leading-relaxed uppercase tracking-wider">Matrix reflects 94% data fidelity from linked purchase nodes.</p>
                    </div>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="investment" className="m-0 space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-0.05 transition-opacity"><Activity className="h-32 w-32" /></div>
                 <div className="flex items-center gap-4 border-l-4 border-amber-500 pl-6">
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">High-Spend Outsource Gap</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center group/item hover:border-amber-500 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Hammer className="h-6 w-6" /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 uppercase">Surface Grinding</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Annual Spend: ₹ 12.5L</p>
                          </div>
                       </div>
                       <Badge className="bg-red-50 text-red-600 border-none font-bold text-[9px] uppercase px-3 py-1">CRITICAL GAP</Badge>
                    </div>
                 </div>
                 <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-amber-900"><TrendingUp className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Investment Opportunity</h4></div>
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      Frequent outsourcing of **Surface Grinding** detected. High machine utilization in-house and ₹ 1.2M+ annual external spend indicates a strong ROI potential for an in-house asset node.
                    </p>
                 </div>
              </Card>

              <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] flex flex-col justify-between overflow-hidden relative">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                 <div className="relative z-10">
                    <h4 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">Facility ROI Estimate</h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-12">New Asset Node: Surface Grinding Center</p>
                    
                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-2"><p className="text-[9px] font-bold text-white/40 uppercase">Est. CAPEX</p><p className="text-2xl font-display font-bold">₹ 15.0L</p></div>
                       <div className="space-y-2"><p className="text-[9px] font-bold text-white/40 uppercase">Payback Period</p><p className="text-2xl font-display font-bold text-emerald-400">14 Months</p></div>
                       <div className="space-y-2"><p className="text-[9px] font-bold text-white/40 uppercase">Annual Saving</p><p className="text-2xl font-display font-bold">₹ 12.5L</p></div>
                       <div className="space-y-2"><p className="text-[9px] font-bold text-white/40 uppercase">Load Confidence</p><p className="text-2xl font-display font-bold">92%</p></div>
                    </div>
                 </div>
                 <Button className="mt-12 h-14 bg-primary hover:bg-white text-[#001F3D] rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl relative z-10 flex gap-3 group">
                   Initialize Project Hub <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                 </Button>
              </Card>
           </div>
        </TabsContent>
      </Tabs>

      {/* VENDOR DETAIL INTELLIGENCE SHEET */}
      <Sheet open={!!selectedVendorId} onOpenChange={(open) => !open && setSelectedVendorId(null)}>
        <SheetContent className="sm:max-w-[800px] p-0 border-none shadow-2xl bg-white flex flex-col h-screen font-body overflow-hidden">
          {selectedVendorData && (
            <>
              <SheetHeader className="p-10 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2.5rem] bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl backdrop-blur-md">
                       <Truck className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                       <SheetTitle className="text-3xl font-display font-black uppercase tracking-tight text-white leading-none mb-2">{selectedVendorData.name}</SheetTitle>
                       <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Identity Node: {selectedVendorData.id}</SheetDescription>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Performance Grade</p>
                    <Badge className="bg-emerald-500 text-white text-xl font-display font-black py-2 px-6 rounded-2xl">{selectedVendorData.grade}</Badge>
                 </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                 <div className="p-10 space-y-12 pb-32">
                    <div className="grid grid-cols-2 gap-8">
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-6">
                          <div className="flex items-center gap-3 text-primary"><DollarSign className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Commercial Sync</h4></div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-end"><span className="text-[9px] font-bold text-slate-400 uppercase">FY Business</span><span className="text-2xl font-display font-bold text-slate-900">₹ {selectedVendorData.business.toLocaleString()}</span></div>
                             <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Outstanding</span><span className="text-sm font-display font-black text-rose-600">₹ {selectedVendorData.outstanding.toLocaleString()}</span></div>
                          </div>
                       </Card>
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-6">
                          <div className="flex items-center gap-3 text-indigo-600"><Target className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Yield Fidelity</h4></div>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold uppercase"><span className="text-slate-400">Quality Score</span><span className="text-emerald-600">96%</span></div>
                                <div className="h-1 bg-white rounded-full overflow-hidden shadow-sm"><div className="h-full bg-emerald-500" style={{ width: '96%' }} /></div>
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold uppercase"><span className="text-slate-400">Delivery OTD</span><span className="text-blue-600">88%</span></div>
                                <div className="h-1 bg-white rounded-full overflow-hidden shadow-sm"><div className="h-full bg-blue-500" style={{ width: '88%' }} /></div>
                             </div>
                          </div>
                       </Card>
                    </div>

                    <div className="space-y-8">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Capability Matrix</h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {["VMC", "CNC Turning", "Grinding", "WEDM", "Laser Cutting", "EDM", "Heat Treatment", "Assembly"].map(process => (
                            <div key={process} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-slate-50 transition-all">
                               <span className="text-[9px] font-bold text-slate-600 uppercase">{process}</span>
                               <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Technical Assets & Capacity</h3>
                       <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            Equipped with 3x HAAS VF2 VMC centers, 2x Mazak Turning nodes, and automatic surface grinding (200x500mm). 
                            Certified ISO 9001:2015. Preferred partner for aerospace component finishing.
                          </p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Account Profile</h3>
                       <div className="grid grid-cols-2 gap-8 bg-slate-50 p-8 rounded-3xl">
                          {[
                            { label: 'Contact Person', val: selectedVendorData.contact, icon: User },
                            { label: 'Email', val: selectedVendorData.email, icon: Mail },
                            { label: 'Location', val: selectedVendorData.city || '---', icon: Target },
                          ].map(info => (
                            <div key={info.label} className="space-y-1">
                               <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase"><info.icon className="h-3 w-3" /> {info.label}</div>
                               <p className="text-sm font-bold text-slate-700 uppercase">{info.val}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </ScrollArea>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-end gap-4 z-50">
                 <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold uppercase text-[9px] text-slate-400" onClick={() => setSelectedVendorId(null)}>Abort Analysis</Button>
                 <Button className="h-12 px-12 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[9px] shadow-xl flex gap-3"><FileText className="h-4 w-4" /> Download Performance Audit</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* SIMPLIFIED ONBOARDING DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-4"><Truck className="h-8 w-8 text-primary" /></div>
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Partner Registration</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Initialize supply chain identity node.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
             <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Company Name *</Label>
                <Input placeholder="Enter Legal Entity Name" className="h-12 bg-slate-50 border-none rounded-xl font-bold" />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">GSTIN Protocol</Label>
                   <Input placeholder="ENTER GSTIN" className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold uppercase" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Partner Category</Label>
                   <Select defaultValue="Raw Material">
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                         {["Raw Material", "Sub-Contracting", "Consumables", "Logistics", "Services"].map(c => <SelectItem key={c} value={c} className="text-xs font-bold uppercase">{c}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
             </div>
             <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsAddOpen(false)}>Abort</Button>
                <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex gap-3 group" onClick={() => { toast({title: "Partner Initialized"}); setIsAddOpen(false); }}>
                  Commit Partner Identity <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
