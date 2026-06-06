
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  User, 
  Shield, 
  Settings, 
  Users, 
  ShieldCheck, 
  LayoutGrid, 
  ShoppingCart, 
  Layers, 
  Boxes, 
  CreditCard, 
  ClipboardList, 
  LineChart, 
  Package, 
  Truck, 
  Calendar,
  Monitor,
  Edit3,
  Unlock,
  UserCircle,
  BrainCircuit,
  Cpu,
  Zap,
  Factory,
  GraduationCap,
  Palette,
  PanelLeft,
  Box,
  AlignLeft,
  AlignCenter,
  CaseSensitive,
  Settings2,
  Contact,
  TableProperties,
  QrCode,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Hash,
  ChevronRight,
  ShieldAlert,
  Network,
  Phone,
  ListOrdered,
  FileText,
  Receipt,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Search,
  Filter,
  X,
  Kanban,
  PackageCheck,
  Maximize2,
  Trash2,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemUser, PermissionLevel, UISettings, ViewType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { UserManagement } from './user-management';

const THEME_COLORS = [
  { name: 'Classic Navy', value: '243 75% 59%', color: 'bg-[#6366f1]' },
  { name: 'Emerald Forest', value: '142 71% 45%', color: 'bg-[#10b981]' },
  { name: 'Cyber Crimson', value: '346 84% 61%', color: 'bg-[#f43f5e]' },
  { name: 'Deep Amber', value: '38 92% 50%', color: 'bg-[#f59e0b]' },
  { name: 'Royal Violet', value: '262 83% 58%', color: 'bg-[#8b5cf6]' },
  { name: 'Stealth Grey', value: '215 25% 27%', color: 'bg-[#334155]' },
];

const ACCESS_NODES: { id: ViewType | string; label: string; category: string; icon: any }[] = [
  { id: 'overview', label: 'Command Matrix', category: 'Strategic Hub', icon: LayoutGrid },
  { id: 'external-matrix', label: 'Integrated Hub', category: 'Strategic Hub', icon: Globe },
  { id: 'agile', label: 'Agile Kanban', category: 'Strategic Hub', icon: Kanban },
  { id: 'smart-quote', label: 'AI Quoting Assistant', category: 'Strategic Hub', icon: BrainCircuit },
  { id: 'sqcdp', label: 'Performance Analytics', category: 'Strategic Hub', icon: LineChart },
  { id: 'team-matrix', label: 'My Team Matrix', category: 'Strategic Hub', icon: Users },
  { id: 'orders', label: 'Master Orders', category: 'Production Management', icon: ShoppingCart },
  { id: 'production-planner', label: 'Mass Production', category: 'Production Management', icon: Factory },
  { id: 'gantt', label: 'Visual Timeline', category: 'Production Management', icon: LayoutGrid },
  { id: 'operations', label: 'Operational Spreadsheet', category: 'Production Management', icon: Layers },
  { id: 'weekly-plan', label: 'Master Schedule', category: 'Production Management', icon: Calendar },
  { id: 'work-log', label: 'Daily Work Logs', category: 'Production Management', icon: ClipboardList },
  { id: 'quality', label: 'Quality Hub', category: 'Quality Hub', icon: ShieldCheck },
  { id: 'training', label: 'Training Matrix', category: 'Quality Hub', icon: GraduationCap },
  { id: 'delivery', label: 'Dispatch Ledger', category: 'Commercial Operations', icon: PackageCheck },
  { id: 'customer-orders', label: 'Customer Identity', category: 'Commercial Operations', icon: Contact },
  { id: 'inventory', label: 'Stock Ledger', category: 'Commercial Operations', icon: Boxes },
  { id: 'billing', label: 'Financial Hub (Main)', category: 'Commercial Operations', icon: CreditCard },
  { id: 'billing-quotation', label: 'Financial: Quotation', category: 'Commercial Operations', icon: FileText },
  { id: 'billing-invoice', label: 'Financial: Invoice', category: 'Commercial Operations', icon: Receipt },
  { id: 'billing-po', label: 'Financial: Purchase Order', category: 'Commercial Operations', icon: ShoppingCart },
  { id: 'billing-dc', label: 'Financial: Delivery Challan', category: 'Commercial Operations', icon: PackageCheck },
  { id: 'billing-proforma', label: 'Financial: Proforma', category: 'Commercial Operations', icon: Building2 },
  { id: 'billing-inward', label: 'Financial: Inward', category: 'Commercial Operations', icon: ArrowDownLeft },
  { id: 'billing-outward', label: 'Financial: Outward', category: 'Commercial Operations', icon: ArrowUpRight },
  { id: 'billing-bank', label: 'Financial: Bank Ledger', category: 'Commercial Operations', icon: Landmark },
  { id: 'billing-edit', label: 'Financial: Global Edit', category: 'Commercial Operations', icon: Edit3 },
  { id: 'billing-delete', label: 'Financial: Global Delete', category: 'Commercial Operations', icon: Trash2 },
  { id: 'vendor', label: 'Supply Chain Partner', category: 'Commercial Operations', icon: Truck },
  { id: 'machine-utilization', label: 'Asset Fleet', category: 'Resources & Assets', icon: Cpu },
  { id: 'hr', label: 'HR Command Hub', category: 'Resources & Assets', icon: Users },
  { id: 'settings', label: 'Control Center', category: 'System Governance', icon: Settings },
];

interface ProfileSettingsProps {
  currentUser: string | null;
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
  onDeleteUser: (userId: string) => void;
  uiSettings: UISettings;
  onUpdateUISettings: (settings: UISettings) => void;
  currentUserData: SystemUser | null;
  onNavigateToDetail?: (userId: string) => void;
  title?: string;
}

export function ProfileSettings({ 
  currentUser,
  users,
  onSaveUser,
  onDeleteUser,
  uiSettings,
  onUpdateUISettings,
  currentUserData,
  onNavigateToDetail,
  title = 'Control Center'
}: ProfileSettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  const isMasterAdmin = currentUser === 'Master Admin';

  const [personalInfo, setPersonalInfo] = useState({
    firstName: currentUserData?.firstName || '',
    lastName: currentUserData?.lastName || '',
    email: currentUserData?.email || '',
    phone: currentUserData?.phone || '',
    password: currentUserData?.password || ''
  });

  const handleUpdatePersonal = () => {
    if (!currentUserData) return;
    const updated: SystemUser = {
      ...currentUserData,
      ...personalInfo,
      name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
    };
    onSaveUser(updated);
    toast({ title: "Profile Synchronized", description: "Identity metadata updated in master ledger." });
  };

  const handleUpdateUI = (key: keyof UISettings, value: any) => {
    const updated = { ...uiSettings, [key]: value };
    onUpdateUISettings(updated);
    if (currentUserData) {
      onSaveUser({ ...currentUserData, uiSettings: updated });
    }
  };

  const handleUpdateBillingTable = (field: string, value: number) => {
    const currentBilling = uiSettings.billingTableSettings || {
      colWidths: { description: 300, hsn: 100, qty: 80, unit: 100, price: 140, discount: 80, gst: 80, total: 160 },
      rowHeight: 48
    };

    let updatedBilling;
    if (field === 'rowHeight') {
      updatedBilling = { ...currentBilling, rowHeight: value };
    } else {
      updatedBilling = {
        ...currentBilling,
        colWidths: { ...currentBilling.colWidths, [field]: value }
      };
    }

    handleUpdateUI('billingTableSettings', updatedBilling);
  };

  const handleUpdateGlobalSeq = (key: 'woPrefix' | 'woNextNumber', value: any) => {
    handleUpdateUI(key, value);
    toast({ title: "Global Sequence Synchronized", description: `Sequence protocol ${key} updated for future nodes.` });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="px-2">
        <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
          <Settings className="h-3.5 w-3.5" /> System Configuration
        </div>
        <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight mt-1">{title}</h2>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="profile" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <UserCircle className="h-3.5 w-3.5 mr-2" /> My Identity
          </TabsTrigger>
          {isMasterAdmin && (
            <>
              <TabsTrigger value="users" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Users className="h-3.5 w-3.5 mr-2" /> Identity Ledger
              </TabsTrigger>
              <TabsTrigger value="ui" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Palette className="h-3.5 w-3.5 mr-2" /> UI Architecture
              </TabsTrigger>
              <TabsTrigger value="financial-matrix" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <TableProperties className="h-3.5 w-3.5 mr-2" /> Financial Matrix
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="m-0 max-w-4xl">
          <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10 space-y-12">
               <div className="flex items-center gap-6">
                 <div className="h-24 w-24 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden group">
                   {currentUserData?.image ? <img src={currentUserData.image} alt="" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-slate-300" />}
                 </div>
                 <div>
                   <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase">{currentUserData?.name}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{currentUserData?.role} • {currentUserData?.dept}</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">First Name</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl" value={personalInfo.firstName} onChange={(e)=>setPersonalInfo({...personalInfo, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Last Name</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl" value={personalInfo.lastName} onChange={(e)=>setPersonalInfo({...personalInfo, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Email Identity</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl" value={personalInfo.email} onChange={(e)=>setPersonalInfo({...personalInfo, email: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Contact Node</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl" value={personalInfo.phone} onChange={(e)=>setPersonalInfo({...personalInfo, phone: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Security Key</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} className="h-12 bg-slate-50 border-none rounded-xl pr-12" value={personalInfo.password} onChange={(e)=>setPersonalInfo({...personalInfo, password: e.target.value})} />
                      <button onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
               </div>

               <Button className="h-14 bg-[#001F3D] hover:bg-black text-white px-10 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3" onClick={handleUpdatePersonal}>
                 <Save className="h-4 w-4" /> Synchronize Identity Matrix
               </Button>
            </div>
          </Card>
        </TabsContent>

        {isMasterAdmin && (
          <>
            <TabsContent value="users" className="m-0">
              <UserManagement users={users} onSaveUser={onSaveUser} onDeleteUser={onDeleteUser} onNavigateToDetail={onNavigateToDetail!} />
            </TabsContent>

            <TabsContent value="ui" className="m-0 space-y-8 max-w-6xl">
              <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] space-y-12">
                <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Monitor className="h-7 w-7" /></div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">UI Architecture Governance</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global aesthetic and ergonomic protocols.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">Base Font Size (px) <span>{uiSettings.fontSize}px</span></Label>
                      <Slider value={[uiSettings.fontSize]} min={11} max={16} step={1} onValueChange={([v]) => handleUpdateUI('fontSize', v)} />
                    </div>
                    <div className="space-y-6">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Primary Brand Core</Label>
                      <div className="grid grid-cols-6 gap-3">
                        {THEME_COLORS.map(color => (
                          <button key={color.value} onClick={() => handleUpdateUI('primaryColor', color.value)} className={cn("h-10 w-full rounded-xl transition-all border-4", uiSettings.primaryColor === color.value ? "border-white ring-2 ring-slate-900" : "border-transparent", color.color)} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Global Sequence Prefixes</Label>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <span className="text-[8px] font-bold text-slate-400 uppercase">WO Prefix</span>
                             <Input className="h-11 bg-slate-50 border-none font-code font-bold" value={uiSettings.woPrefix} onChange={(e) => handleUpdateGlobalSeq('woPrefix', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                             <span className="text-[8px] font-bold text-slate-400 uppercase">Next Seq Number</span>
                             <Input type="number" className="h-11 bg-slate-50 border-none font-code font-bold" value={uiSettings.woNextNumber} onChange={(e) => handleUpdateGlobalSeq('woNextNumber', Number(e.target.value))} />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="financial-matrix" className="m-0 space-y-8 max-w-4xl">
               <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] space-y-12">
                  <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-6">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><TableProperties className="h-7 w-7" /></div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Financial Matrix Architect</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Spatial dimension protocols for commercial registry.</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                       {[
                         { id: 'description', label: 'Description Field Width' },
                         { id: 'hsn', label: 'HSN/SAC Field Width' },
                         { id: 'qty', label: 'Quantity Field Width' },
                         { id: 'unit', label: 'Unit Field Width' },
                         { id: 'price', label: 'Rate/Price Field Width' },
                         { id: 'discount', label: 'Disc % Field Width' },
                         { id: 'gst', label: 'GST % Field Width' },
                         { id: 'total', label: 'Total (₹) Field Width' },
                       ].map(node => (
                         <div key={node.id} className="space-y-5">
                            <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">
                               {node.label} <span>{uiSettings.billingTableSettings?.colWidths?.[node.id as keyof typeof uiSettings.billingTableSettings.colWidths] || 100}px</span>
                            </Label>
                            <Slider 
                              value={[uiSettings.billingTableSettings?.colWidths?.[node.id as keyof typeof uiSettings.billingTableSettings.colWidths] || 100]} 
                              min={60} max={600} step={10} 
                              onValueChange={([v]) => handleUpdateBillingTable(node.id, v)} 
                            />
                         </div>
                       ))}
                    </div>

                    <div className="pt-10 border-t space-y-6">
                       <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">
                          Global Entry Row Height <span>{uiSettings.billingTableSettings?.rowHeight || 48}px</span>
                       </Label>
                       <Slider 
                        value={[uiSettings.billingTableSettings?.rowHeight || 48]} 
                        min={32} max={120} step={4} 
                        onValueChange={([v]) => handleUpdateBillingTable('rowHeight', v)} 
                       />
                    </div>
                  </div>
               </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
