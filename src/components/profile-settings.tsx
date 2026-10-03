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
  Globe,
  Upload,
  Maximize,
  Layout,
  Type,
  Square,
  DollarSign,
  SwitchCamera,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemUser, PermissionLevel, UISettings, ViewType, NumberSeries } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { UserManagement } from './user-management';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

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

const MACHINE_ACCESS_LIST = ["VMC", "CNC Turning", "Surface Grinding", "VMM"];

const DEPARTMENTS = [
  "Admin", "Marketing", "R&D", "Design", "Engineering", "Tool Room", "Quality", "Production", "Accounts"
];

const DOC_TYPES_FOR_SERIES = [
  { id: 'quotation', label: 'Quotation' },
  { id: 'sale_order', label: 'Sales Order' },
  { id: 'purchase_order', label: 'Purchase Order' },
  { id: 'invoice', label: 'Sales Invoice' },
  { id: 'purchase_invoice', label: 'Purchase Invoice' },
  { id: 'proforma', label: 'Proforma' },
  { id: 'delivery_challan', label: 'Delivery Challan' },
  { id: 'credit_note', label: 'Credit Note' },
  { id: 'debit_note', label: 'Debit Note' },
  { id: 'job_work', label: 'Job Work' },
  { id: 'service_request', label: 'Service Request' },
];

const DEFAULT_NUMBER_SERIES: NumberSeries = {
  prefix: 'QT',
  startingNumber: 1,
  currentNumber: 1,
  length: 4,
  fyFormat: 'YYYY',
  separator: '-',
  resetEveryFY: true,
  manualOverride: false,
};

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
  const [pageSearch, setPageSearch] = useState('');

  const [localUI, setLocalUI] = useState<UISettings>(uiSettings);
  const [selectedMatrixUserId, setSelectedMatrixUserId] = useState<string | null>(null);
  const [matrixPermissions, setMatrixPermissions] = useState<Record<string, PermissionLevel>>({});

  const isMasterAdmin = currentUser?.toLowerCase() === 'master admin';
  const masterAdminRecord = useMemo(() => users.find(u => u.role === 'Master Admin' || u.name?.toLowerCase() === 'master admin' || u.username === 'admin'), [users]);
  const defaultBrandLogo = placeholderImages.placeholderImages.find(i => i.id === 'brand-logo')?.imageUrl || '';

  const [personalInfo, setPersonalInfo] = useState({
    firstName: currentUserData?.firstName || '',
    lastName: currentUserData?.lastName || '',
    email: currentUserData?.email || '',
    phone: currentUserData?.phone || '',
    password: currentUserData?.password || '',
    image: currentUserData?.image || '',
    dept: currentUserData?.dept || 'Admin',
    machineAccess: currentUserData?.machineAccess || [],
    approvalLimit: currentUserData?.approvalLimit || 0
  });

  useEffect(() => {
    if (currentUserData) {
      setPersonalInfo({
        firstName: currentUserData.firstName || '',
        lastName: currentUserData.lastName || '',
        email: currentUserData.email || '',
        phone: currentUserData.phone || '',
        password: currentUserData.password || '',
        image: currentUserData.image || '',
        dept: currentUserData.dept || 'Admin',
        machineAccess: currentUserData.machineAccess || [],
        approvalLimit: currentUserData.approvalLimit || 0
      });
    }
  }, [currentUserData]);

  useEffect(() => {
    setLocalUI(uiSettings);
  }, [uiSettings]);

  useEffect(() => {
    if (selectedMatrixUserId) {
      const user = users.find(u => u.id === selectedMatrixUserId);
      if (user) {
        setMatrixPermissions(user.permissions || {});
      }
    }
  }, [selectedMatrixUserId, users]);

  const handleUpdatePersonal = () => {
    let updated: Partial<SystemUser>;
    let targetId: string;

    if (currentUserData) {
      targetId = currentUserData.id;
      updated = {
        ...currentUserData,
        ...personalInfo,
        name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
      };
    } else if (isMasterAdmin) {
      targetId = 'admin-master-node';
      updated = {
        id: targetId,
        username: 'admin',
        ...personalInfo,
        name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
        role: 'Master Admin',
        dept: personalInfo.dept,
        permissions: {},
        lastLogin: new Date().toISOString(),
        status: 'active'
      };
    } else {
      return;
    }

    if (isMasterAdmin) {
      updated.uiSettings = { ...localUI };
      onUpdateUISettings(localUI);
    }

    onSaveUser(updated as SystemUser);
    toast({ title: "SAVE DATA", description: "Identity and configuration committed to master ledger." });
  };

  const updateLocalUIField = (key: keyof UISettings, value: any) => {
    setLocalUI(prev => ({ ...prev, [key]: value }));
  };

  const handleCommitUISettings = () => {
    onUpdateUISettings(localUI);
    
    let targetAdmin = masterAdminRecord || users.find(u => u.name?.toLowerCase() === 'master admin') || currentUserData;
    
    if (!targetAdmin && isMasterAdmin) {
      targetAdmin = {
        id: 'admin-master-node',
        username: 'admin',
        firstName: 'Master',
        lastName: 'Admin',
        name: 'Master Admin',
        email: 'admin@ferocious.tech',
        role: 'Master Admin',
        dept: 'Admin',
        permissions: {},
        lastLogin: new Date().toISOString(),
        status: 'active'
      } as SystemUser;
    }
    
    if (targetAdmin) {
      const adminUpdate: SystemUser = {
        ...targetAdmin,
        uiSettings: {
          ...localUI
        }
      };
      onSaveUser(adminUpdate);
      toast({ title: "SAVE DATA", description: "Global architecture configuration committed." });
    } else {
      toast({ variant: "destructive", title: "Protocol Error", description: "Administrative node not identified for global commit." });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({ variant: "destructive", title: "Image Matrix Overflow", description: "Please use a logo under 800KB for institutional synchronization." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLocalUIField('brandLogo', reader.result as string);
        toast({ title: "Logo Metadata Cached", description: "Click SAVE DATA to synchronize branding." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({ variant: "destructive", title: "Image Matrix Overflow", description: "Please use a photo under 800KB for institutional synchronization." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo(prev => ({ ...prev, image: reader.result as string }));
        toast({ title: "Visual Identity Cached", description: "Identity photo initialized. Click SAVE DATA to commit." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = () => {
    updateLocalUIField('brandLogo', undefined);
    toast({ title: "Logo Reference Purged", description: "Click SAVE DATA to reset to system default." });
  };

  const handleUpdateBillingTableLocal = (field: string, value: number) => {
    const currentBilling = localUI.billingTableSettings || {
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

    updateLocalUIField('billingTableSettings', updatedBilling);
  };

  const handleUpdateSeries = (docId: string, field: keyof NumberSeries, value: any) => {
    const currentSeriesMap = localUI.numberSeries || {};
    const series = currentSeriesMap[docId] || { ...DEFAULT_NUMBER_SERIES };
    
    const updatedSeries = { ...series, [field]: value };
    const updatedMap = { ...currentSeriesMap, [docId]: updatedSeries };
    
    updateLocalUIField('numberSeries', updatedMap);
  };

  const getSeriesPreview = (docId: string) => {
    const series = localUI.numberSeries?.[docId] || DEFAULT_NUMBER_SERIES;
    const numStr = series.currentNumber.toString().padStart(series.length, '0');
    const fy = new Date().getFullYear();
    const fyStr = series.fyFormat === 'YYYY' ? fy.toString() : 
                 series.fyFormat === 'YY-YY' ? `${fy.toString().slice(-2)}-${(fy+1).toString().slice(-2)}` : '';
    
    return [series.prefix, numStr, fyStr].filter(Boolean).join(` ${series.separator} `);
  };

  const handleMatrixPermissionUpdate = (nodeId: string, level: PermissionLevel) => {
    setMatrixPermissions(prev => ({ ...prev, [nodeId]: level }));
  };

  const handleSaveMatrix = () => {
    if (!selectedMatrixUserId) return;
    const user = users.find(u => u.id === selectedMatrixUserId);
    if (!user) return;
    onSaveUser({ ...user, permissions: matrixPermissions });
    toast({ title: "SAVE DATA", description: `Permissions for ${user.name} committed to matrix.` });
  };

  const handleUpdatePageTitle = (nodeId: string, title: string) => {
    const titles = { ...localUI.customTitles, [nodeId]: title };
    updateLocalUIField('customTitles', titles);
  };

  const handleToggleMachineLocal = (machine: string) => {
    const current = personalInfo.machineAccess || [];
    const updated = current.includes(machine) 
      ? current.filter(m => m !== machine) 
      : [...current, machine];
    setPersonalInfo(prev => ({ ...prev, machineAccess: updated }));
  };

  const categories = Array.from(new Set(ACCESS_NODES.map(n => n.category)));

  const filteredNodes = ACCESS_NODES.filter(n => 
    n.label.toLowerCase().includes(pageSearch.toLowerCase()) || 
    n.id.toLowerCase().includes(pageSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="px-2 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <Settings className="h-3.5 w-3.5" /> System Configuration
          </div>
          <h2 className="text-3xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight mt-1">{title}</h2>
        </div>
        <div className="flex gap-4 items-center bg-slate-100 dark:bg-card p-1.5 rounded-2xl border dark:border-border">
          <button 
            onClick={() => updateLocalUIField('theme', 'light')}
            className={cn("h-10 px-6 rounded-xl font-bold uppercase text-[9px] tracking-widest flex items-center gap-2 transition-all", localUI.theme === 'light' ? "bg-white text-primary shadow-md" : "text-slate-400")}
          >
            <Sun className="h-3.5 w-3.5" /> Light Mode
          </button>
          <button 
            onClick={() => updateLocalUIField('theme', 'dark')}
            className={cn("h-10 px-6 rounded-xl font-bold uppercase text-[9px] tracking-widest flex items-center gap-2 transition-all", localUI.theme === 'dark' ? "bg-primary text-card shadow-md" : "text-slate-400")}
          >
            <Moon className="h-3.5 w-3.5" /> Dark Mode
          </button>
        </div>
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
              <TabsTrigger value="access-matrix" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Access Matrix
              </TabsTrigger>
              <TabsTrigger value="ui" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Palette className="h-3.5 w-3.5 mr-2" /> UI Architecture
              </TabsTrigger>
              <TabsTrigger value="page-governance" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Layout className="h-3.5 w-3.5 mr-2" /> Page Governance
              </TabsTrigger>
              <TabsTrigger value="financial-matrix" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <TableProperties className="h-3.5 w-3.5 mr-2" /> Financial Matrix
              </TabsTrigger>
              <TabsTrigger value="number-governance" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Hash className="h-3.5 w-3.5 mr-2" /> Sequence Matrix
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="m-0 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 p-10 border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <div className="relative z-10 space-y-12">
                 <div className="flex items-center gap-6">
                   <div className="relative group">
                     <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border-4 border-white dark:border-border shadow-lg overflow-hidden transition-all group-hover:opacity-80">
                       {personalInfo.image ? <img src={personalInfo.image} alt="" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-slate-300" />}
                     </div>
                     <input type="file" id="profile-image-upload" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                     <label htmlFor="profile-image-upload" className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#001F3D] dark:bg-primary text-white dark:text-card rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20 border-2 border-white dark:border-border">
                        <Camera className="h-4 w-4" />
                     </label>
                   </div>
                   <div>
                     <h3 className="text-2xl font-display font-bold text-[#001F3D] dark:text-white uppercase">{currentUserData?.name || 'Master Admin'}</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{currentUserData?.role || 'Master Admin'} • {currentUserData?.dept || 'Admin'} • ID: {currentUserData?.id || 'admin-master-node'}</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">First Name</Label>
                      <Input className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" value={personalInfo.firstName} onChange={(e)=>setPersonalInfo({...personalInfo, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Last Name</Label>
                      <Input className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" value={personalInfo.lastName} onChange={(e)=>setPersonalInfo({...personalInfo, lastName: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Email Identity</Label>
                      <Input className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold" value={personalInfo.email} onChange={(e)=>setPersonalInfo({...personalInfo, email: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Department</Label>
                      <Select value={personalInfo.dept} onValueChange={(val)=>setPersonalInfo({...personalInfo, dept: val})}>
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="text-[10px] font-bold uppercase">{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Security Key</Label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl pr-12 font-bold" value={personalInfo.password} onChange={(e)=>setPersonalInfo({...personalInfo, password: e.target.value})} />
                        <button onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Approval Limit (₹)</Label>
                      <div className="relative">
                        <Input type="number" className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 font-bold" value={personalInfo.approvalLimit} onChange={(e)=>setPersonalInfo({...personalInfo, approvalLimit: Number(e.target.value)})} />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                 </div>

                 <Button className="h-14 bg-[#001F3D] dark:bg-primary hover:bg-black dark:hover:bg-primary/90 text-white dark:text-card px-10 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3" onClick={handleUpdatePersonal}>
                   <Save className="h-4 w-4" /> SAVE DATA
                 </Button>
              </div>
            </Card>

            <div className="lg:col-span-4 space-y-8">
              <Card className="p-8 border-slate-200 dark:border-border bg-white dark:bg-card shadow-xl rounded-[2rem] space-y-6">
                 <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                    <Cpu className="h-4 w-4 text-primary" />
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D] dark:text-white">Asset Access Matrix</h4>
                 </div>
                 <div className="space-y-4 pt-2">
                    {MACHINE_ACCESS_LIST.map(machine => (
                      <div key={machine} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-border transition-all hover:bg-white dark:hover:bg-slate-800">
                        <Checkbox 
                          id={`profile-machine-${machine}`} 
                          checked={personalInfo.machineAccess?.includes(machine)}
                          onCheckedChange={() => handleToggleMachineLocal(machine)}
                        />
                        <Label htmlFor={`profile-machine-${machine}`} className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 cursor-pointer">{machine}</Label>
                      </div>
                    ))}
                 </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {isMasterAdmin && (
          <>
            <TabsContent value="users" className="m-0">
              <UserManagement users={users} onSaveUser={onSaveUser} onDeleteUser={onDeleteUser} onNavigateToDetail={onNavigateToDetail!} />
            </TabsContent>

            <TabsContent value="access-matrix" className="m-0 space-y-10">
              <Card className="p-8 bg-white dark:bg-card border-slate-200 dark:border-border shadow-xl rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#001F3D] dark:bg-primary rounded-xl text-white dark:text-card shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
                    <div>
                       <h3 className="text-xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Access Matrix Hub</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select identity to govern operational nodes.</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select value={selectedMatrixUserId || ''} onValueChange={setSelectedMatrixUserId}>
                       <SelectTrigger className="w-full md:w-64 h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-inner">
                          <SelectValue placeholder="Identify Personnel..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border-slate-100 dark:border-border shadow-2xl">
                          {users.map(u => (
                            <SelectItem key={u.id} value={u.id} className="text-[10px] font-bold uppercase py-2">
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                    {selectedMatrixUserId && (
                      <Button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleSaveMatrix}>
                        <Save className="h-4 w-4" /> SAVE DATA
                      </Button>
                    )}
                 </div>
              </Card>

              {selectedMatrixUserId ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {categories.map((cat) => (
                    <Card key={cat} className="overflow-hidden border-slate-200 dark:border-border bg-white dark:bg-card shadow-xl rounded-[2rem]">
                      <div className="bg-slate-50/50 dark:bg-slate-900/10 p-6 border-b border-slate-100 dark:border-border flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-[#001F3D] dark:text-white uppercase tracking-[0.2em]">{cat}</h3>
                        <Badge variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-border text-slate-400 text-[8px] font-bold px-3 uppercase tracking-tighter">GATED_NODES</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent bg-white dark:bg-card">
                            <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-5 px-10">Functional Node</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">None</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Read-Only</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Standard Access</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Full Control</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ACCESS_NODES.filter(n => n.category === cat).map((node) => (
                            <TableRow key={node.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 h-20 border-b border-slate-50 dark:border-border transition-colors">
                              <TableCell className="px-10">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400"><node.icon className="h-4 w-4" /></div>
                                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{node.label}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                    <RadioGroupItem value="none" className="h-5 w-5 border-slate-200 text-slate-400" />
                                  </RadioGroup>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                    <RadioGroupItem value="read" className="h-5 w-5 border-slate-200 text-blue-500" />
                                  </RadioGroup>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                    <RadioGroupItem value="edit" className="h-5 w-5 border-slate-200 text-primary" />
                                  </RadioGroup>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                    <RadioGroupItem value="full" className="h-5 w-5 border-slate-200 text-emerald-500" />
                                  </RadioGroup>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center opacity-30 text-center border-4 border-dashed border-slate-200 dark:border-border rounded-[3rem]">
                   <ShieldAlert className="h-16 w-16 mb-6 text-slate-300" />
                   <h4 className="text-xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Identity Required</h4>
                   <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Select a personnel identity from the ledger above to initialize the access matrix protocol.</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
