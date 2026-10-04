
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
  Moon,
  FileBarChart,
  UserCheck,
  Bell,
  Activity,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemUser, PermissionLevel, UISettings, ViewType, NumberSeries } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { UserManagement } from '@/modules/administration/user-management';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

const ACCESS_NODES: { id: ViewType | string; label: string; category: string; icon: any }[] = [
  { id: 'overview', label: 'Command Matrix', category: 'Functional Hub', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics Dashboard', category: 'Functional Hub', icon: LineChart },
  { id: 'customer-master', label: 'Customer Master', category: 'Functional Hub', icon: Building2 },
  { id: 'vendor-master', label: 'Vendor Master', category: 'Functional Hub', icon: Truck },
  { id: 'product-master', label: 'Product Registry', category: 'Functional Hub', icon: Box },
  { id: 'quotation', label: 'Quotation Ledger', category: 'Functional Hub', icon: FileText },
  { id: 'sale-invoice', label: 'Sales Invoice Ledger', category: 'Functional Hub', icon: Receipt },
  { id: 'purchase-order', label: 'Purchase Order Ledger', category: 'Functional Hub', icon: PackageCheck },
  { id: 'orders', label: 'Work Order Management', category: 'Functional Hub', icon: ShoppingCart },
  { id: 'production-planner', label: 'Production Planner', category: 'Functional Hub', icon: Factory },
  { id: 'gantt', label: 'Production Timeline', category: 'Functional Hub', icon: Calendar },
  { id: 'quality', label: 'Quality Control Hub', category: 'Functional Hub', icon: ShieldCheck },
  { id: 'inventory', label: 'Inventory Ledger', category: 'Functional Hub', icon: Boxes },
  { id: 'hr', label: 'Employee Management', category: 'Functional Hub', icon: Users },
  { id: 'settings', label: 'System Control Center', category: 'Functional Hub', icon: Settings },

  { id: 'dash-billing', label: 'Metric: Monthly Billing', category: 'Dashboard Matrix', icon: TrendingUp },
  { id: 'dash-outstanding', label: 'Metric: Outstanding Coll.', category: 'Dashboard Matrix', icon: Landmark },
  { id: 'dash-po', label: 'Metric: Customer PO Value', category: 'Dashboard Matrix', icon: Receipt },
  { id: 'dash-machine', label: 'Metric: Asset OEE', category: 'Dashboard Matrix', icon: Cpu },
  { id: 'dash-production', label: 'Metric: Production Achieve.', category: 'Dashboard Matrix', icon: Factory },
  { id: 'dash-health', label: 'Metric: Business Health', category: 'Dashboard Matrix', icon: Activity },
  { id: 'dash-ai', label: 'Widget: AI Business Insights', category: 'Dashboard Matrix', icon: BrainCircuit },
  { id: 'dash-alerts', label: 'Widget: System Alert Panel', category: 'Dashboard Matrix', icon: Bell },
  { id: 'dash-approvals', label: 'Widget: Approval Gateway', category: 'Dashboard Matrix', icon: UserCheck },
  
  { id: 'report-sales', label: 'Report: Sales & Revenue', category: 'Reports Matrix', icon: FileBarChart },
  { id: 'report-quality', label: 'Report: Quality Audit', category: 'Reports Matrix', icon: ShieldCheck },
  { id: 'report-production', label: 'Report: Yield Analysis', category: 'Reports Matrix', icon: Factory },
  { id: 'report-dispatch', label: 'Report: Dispatch Ledger', category: 'Reports Matrix', icon: PackageCheck },
  { id: 'report-machine', label: 'Report: Machine Load', category: 'Reports Matrix', icon: Cpu },
  { id: 'report-financial', label: 'Report: Financial Liquidity', category: 'Reports Matrix', icon: Landmark },

  { id: 'approve-quotation', label: 'Auth: Quotation Release', category: 'Certification Matrix', icon: FileCheck },
  { id: 'approve-wo', label: 'Auth: Work Order Start', category: 'Certification Matrix', icon: ShoppingCart },
  { id: 'approve-dispatch', label: 'Auth: Dispatch Protocol', category: 'Certification Matrix', icon: Truck },
  { id: 'approve-invoice', label: 'Auth: Invoice Finalization', category: 'Certification Matrix', icon: Receipt },
  { id: 'approve-payment', label: 'Auth: Payment Settlement', category: 'Certification Matrix', icon: Landmark },
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

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({ variant: "destructive", title: "Image Matrix Overflow", description: "Please use a photo under 800KB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo(prev => ({ ...prev, image: reader.result as string }));
        toast({ title: "Visual Identity Cached" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMatrixPermissionUpdate = (nodeId: string, level: PermissionLevel) => {
    setMatrixPermissions(prev => ({ ...prev, [nodeId]: level }));
  };

  const handleSaveMatrix = () => {
    if (!selectedMatrixUserId) return;
    const user = users.find(u => u.id === selectedMatrixUserId);
    if (!user) return;
    onSaveUser({ ...user, permissions: matrixPermissions });
    toast({ title: "Matrix Synchronized", description: `Permissions for ${user.name} committed.` });
  };

  const handleToggleMachineLocal = (machine: string) => {
    const current = personalInfo.machineAccess || [];
    const updated = current.includes(machine) 
      ? current.filter(m => m !== machine) 
      : [...current, machine];
    setPersonalInfo(prev => ({ ...prev, machineAccess: updated }));
  };

  const categories = Array.from(new Set(ACCESS_NODES.map(n => n.category)));

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
                <ShieldCheck className="h-4 w-4 mr-2" /> Access Matrix
              </TabsTrigger>
              <TabsTrigger value="ui" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Palette className="h-3.5 w-3.5 mr-2" /> UI Architecture
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
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{currentUserData?.role || 'Master Admin'} • {currentUserData?.dept || 'Admin'}</p>
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
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D] dark:text-white">Asset Access</h4>
                 </div>
                 <div className="space-y-4 pt-2">
                    {MACHINE_ACCESS_LIST.map(machine => (
                      <div key={machine} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-border">
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
                       <h3 className="text-xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Governance Hub</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select identity to manage cross-functional access.</p>
                    </div>
                 </div>
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
              </Card>

              {selectedMatrixUserId ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {categories.map((cat) => (
                    <Card key={cat} className="overflow-hidden border-slate-200 dark:border-border bg-white dark:bg-card shadow-xl rounded-[2rem]">
                      <div className="bg-slate-50/50 dark:bg-slate-900/10 p-6 border-b border-slate-100 dark:border-border flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-[#001F3D] dark:text-white uppercase tracking-[0.2em]">{cat}</h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent bg-white dark:bg-card">
                            <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-5 px-10">Functional Node</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">None</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Read-Only</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Standard</TableHead>
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
                                <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                  <div className="flex justify-center"><RadioGroupItem value="none" className="h-5 w-5 border-slate-200 text-slate-400" /></div>
                                </RadioGroup>
                              </TableCell>
                              <TableCell className="text-center">
                                <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                  <div className="flex justify-center"><RadioGroupItem value="read" className="h-5 w-5 border-slate-200 text-blue-500" /></div>
                                </RadioGroup>
                              </TableCell>
                              <TableCell className="text-center">
                                <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                  <div className="flex justify-center"><RadioGroupItem value="edit" className="h-5 w-5 border-slate-200 text-primary" /></div>
                                </RadioGroup>
                              </TableCell>
                              <TableCell className="text-center">
                                <RadioGroup value={matrixPermissions[node.id] || 'none'} onValueChange={(val) => handleMatrixPermissionUpdate(node.id, val as any)}>
                                  <div className="flex justify-center"><RadioGroupItem value="full" className="h-5 w-5 border-slate-200 text-emerald-500" /></div>
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ))}
                  <div className="flex justify-end pt-6">
                    <Button className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white px-12 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleSaveMatrix}>
                      <Save className="h-4 w-4" /> Commit Matrix Synchronizations
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center opacity-30 text-center border-4 border-dashed border-slate-200 dark:border-border rounded-[3rem]">
                   <ShieldAlert className="h-16 w-16 mb-6 text-slate-300" />
                   <h4 className="text-xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Identity Required</h4>
                   <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Select a personnel identity to initialize the access matrix.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ui" className="m-0 space-y-10">
               <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary/10 rounded-xl text-primary"><Palette className="h-7 w-7" /></div>
                     <h3 className="text-2xl font-display font-bold uppercase">UI Architecture</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Primary Brand Color</Label>
                        <div className="flex flex-wrap gap-3">
                           {THEME_COLORS.map(color => (
                             <button key={color.value} onClick={() => updateLocalUIField('primaryColor', color.value)} className={cn("h-10 w-10 rounded-xl transition-all border-4", color.color, localUI.primaryColor === color.value ? "border-slate-900 scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100")} />
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Sidebar Interaction</Label>
                        <div className="flex gap-4">
                           <Button variant={localUI.sidebarMode === 'full' ? 'default' : 'outline'} className="rounded-xl h-12 px-6 uppercase font-bold text-[9px]" onClick={() => updateLocalUIField('sidebarMode', 'full')}>Full Navigation</Button>
                           <Button variant={localUI.sidebarMode === 'slim' ? 'default' : 'outline'} className="rounded-xl h-12 px-6 uppercase font-bold text-[9px]" onClick={() => updateLocalUIField('sidebarMode', 'slim')}>Slim Protocol</Button>
                        </div>
                     </div>
                  </div>
                  <div className="pt-10 border-t flex justify-end">
                     <Button className="h-14 px-12 bg-slate-900 text-white rounded-xl uppercase font-bold text-[10px]" onClick={handleCommitUISettings}>Commit Global UI Protocol</Button>
                  </div>
               </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
