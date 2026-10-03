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
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemUser, PermissionLevel, UISettings, ViewType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { UserManagement } from './user-management';
import placeholderImages from '@/app/lib/placeholder-images.json';

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
    image: currentUserData?.image || ''
  });

  useEffect(() => {
    if (currentUserData) {
      setPersonalInfo({
        firstName: currentUserData.firstName || '',
        lastName: currentUserData.lastName || '',
        email: currentUserData.email || '',
        phone: currentUserData.phone || '',
        password: currentUserData.password || '',
        image: currentUserData.image || ''
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
        dept: 'Admin',
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

  const categories = Array.from(new Set(ACCESS_NODES.map(n => n.category)));

  const filteredNodes = ACCESS_NODES.filter(n => 
    n.label.toLowerCase().includes(pageSearch.toLowerCase()) || 
    n.id.toLowerCase().includes(pageSearch.toLowerCase())
  );

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
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="m-0 max-w-4xl">
          <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10 space-y-12">
               <div className="flex items-center gap-6">
                 <div className="relative group">
                   <div className="h-24 w-24 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden transition-all group-hover:opacity-80">
                     {personalInfo.image ? <img src={personalInfo.image} alt="" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-slate-300" />}
                   </div>
                   <input type="file" id="profile-image-upload" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                   <label htmlFor="profile-image-upload" className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#001F3D] text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20 border-2 border-white">
                      <Camera className="h-4 w-4" />
                   </label>
                 </div>
                 <div>
                   <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase">{currentUserData?.name || 'Master Admin'}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{currentUserData?.role || 'Master Admin'} • {currentUserData?.dept || 'Admin'} • ID: {currentUserData?.id || 'admin-master-node'}</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">First Name</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={personalInfo.firstName} onChange={(e)=>setPersonalInfo({...personalInfo, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Last Name</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={personalInfo.lastName} onChange={(e)=>setPersonalInfo({...personalInfo, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Email Identity</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={personalInfo.email} onChange={(e)=>setPersonalInfo({...personalInfo, email: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Contact Node</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={personalInfo.phone} onChange={(e)=>setPersonalInfo({...personalInfo, phone: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Security Key</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} className="h-12 bg-slate-50 border-none rounded-xl pr-12 font-bold" value={personalInfo.password} onChange={(e)=>setPersonalInfo({...personalInfo, password: e.target.value})} />
                      <button onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
               </div>

               <Button className="h-14 bg-[#001F3D] hover:bg-black text-white px-10 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3" onClick={handleUpdatePersonal}>
                 <Save className="h-4 w-4" /> SAVE DATA
               </Button>
            </div>
          </Card>
        </TabsContent>

        {isMasterAdmin && (
          <>
            <TabsContent value="users" className="m-0">
              <UserManagement users={users} onSaveUser={onSaveUser} onDeleteUser={onDeleteUser} onNavigateToDetail={onNavigateToDetail!} />
            </TabsContent>

            <TabsContent value="access-matrix" className="m-0 space-y-10">
              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
                    <div>
                       <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Access Matrix Hub</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select identity to govern operational nodes.</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select value={selectedMatrixUserId || ''} onValueChange={setSelectedMatrixUserId}>
                       <SelectTrigger className="w-full md:w-64 h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-inner">
                          <SelectValue placeholder="Identify Personnel..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
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
                    <Card key={cat} className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-[2rem]">
                      <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">{cat}</h3>
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[8px] font-bold px-3 uppercase tracking-tighter">GATED_NODES</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent bg-white">
                            <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-5 px-10">Functional Node</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">None</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Read-Only</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Standard Access</TableHead>
                            <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Full Control</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ACCESS_NODES.filter(n => n.category === cat).map((node) => (
                            <TableRow key={node.id} className="hover:bg-slate-50/30 h-20 border-b border-slate-50 transition-colors">
                              <TableCell className="px-10">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><node.icon className="h-4 w-4" /></div>
                                  <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">{node.label}</span>
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
                <div className="h-[400px] flex flex-col items-center justify-center opacity-30 text-center border-4 border-dashed border-slate-200 rounded-[3rem]">
                   <ShieldAlert className="h-16 w-16 mb-6 text-slate-300" />
                   <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Required</h4>
                   <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Select a personnel identity from the ledger above to initialize the access matrix protocol.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ui" className="m-0 space-y-12 max-w-6xl pb-20">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-xl shadow-primary/5"><Palette className="h-8 w-8" /></div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">UI Architecture Governance</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global aesthetic and ergonomic layout protocols.</p>
                    </div>
                 </div>
                 <Button className="h-12 bg-[#001F3D] hover:bg-black text-white px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleCommitUISettings}>
                   <Save className="h-4 w-4" /> SAVE DATA
                 </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="p-8 border-slate-200 bg-white shadow-xl rounded-[2rem] space-y-8">
                   <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                      <Type className="h-4 w-4 text-primary" />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">Typography Matrix</h4>
                   </div>
                   <div className="space-y-10">
                      <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">Base Font Size (px) <span className="text-primary font-code">{localUI.fontSize}px</span></Label>
                        <Slider value={[localUI.fontSize]} min={11} max={16} step={1} onValueChange={([v]) => updateLocalUIField('fontSize', v)} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Global Label Case</Label>
                        <Select value={localUI.labelCase} onValueChange={(val: any) => updateLocalUIField('labelCase', val)}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="uppercase" className="uppercase font-bold text-[10px]">ALL CAPS PROTOCOL</SelectItem>
                            <SelectItem value="capitalize" className="capitalize font-bold text-[10px]">Standard Capitalize</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </Card>

                <Card className="p-8 border-slate-200 bg-white shadow-xl rounded-[2rem] space-y-8">
                   <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                      <Square className="h-4 w-4 text-accent" />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">Aesthetic Matrix (Box Engine)</h4>
                   </div>
                   <div className="space-y-10">
                      <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">Border Radius (rem) <span className="text-accent font-code">{localUI.borderRadius}rem</span></Label>
                        <Slider value={[localUI.borderRadius]} min={0} max={2} step={0.25} onValueChange={([v]) => updateLocalUIField('borderRadius', v)} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Card Shadow Intensity</Label>
                        <Select value={localUI.cardShadow} onValueChange={(val: any) => updateLocalUIField('cardShadow', val)}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="none" className="uppercase font-bold text-[10px]">None (Flat Matrix)</SelectItem>
                            <SelectItem value="sm" className="uppercase font-bold text-[10px]">Small Depth</SelectItem>
                            <SelectItem value="xl" className="uppercase font-bold text-[10px]">Industrial XL Shadow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Primary Brand Core</Label>
                        <div className="grid grid-cols-6 gap-3">
                          {THEME_COLORS.map(color => (
                            <button key={color.value} onClick={() => updateLocalUIField('primaryColor', color.value)} className={cn("h-10 w-full rounded-xl transition-all border-4", localUI.primaryColor === color.value ? "border-white ring-2 ring-slate-900" : "border-transparent", color.color)} />
                          ))}
                        </div>
                      </div>
                   </div>
                </Card>

                <Card className="p-8 border-slate-200 bg-white shadow-xl rounded-[2rem] space-y-8">
                   <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                      <PanelLeft className="h-4 w-4 text-blue-500" />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">Layout Matrix</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Sidebar Protocol</Label>
                        <Select value={localUI.sidebarMode} onValueChange={(val: any) => updateLocalUIField('sidebarMode', val)}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="slim" className="uppercase font-bold text-[10px]">Slim Node</SelectItem>
                            <SelectItem value="full" className="uppercase font-bold text-[10px]">Full Scale Sidebar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Header Alignment</Label>
                        <Select value={localUI.headerAlignment} onValueChange={(val: any) => updateLocalUIField('headerAlignment', val)}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="left" className="uppercase font-bold text-[10px]">Left Justified</SelectItem>
                            <SelectItem value="center" className="uppercase font-bold text-[10px]">Centered Protocol</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Table Density Matrix</Label>
                        <Select value={localUI.tableDensity} onValueChange={(val: any) => updateLocalUIField('tableDensity', val)}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="compact" className="uppercase font-bold text-[10px]">Compact (Industrial)</SelectItem>
                            <SelectItem value="standard" className="uppercase font-bold text-[10px]">Standard ERP</SelectItem>
                            <SelectItem value="comfortable" className="uppercase font-bold text-[10px]">Comfortable Padding</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </Card>

                <Card className="p-8 border-slate-200 bg-white shadow-xl rounded-[2rem] space-y-8">
                   <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                      <QrCode className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">Identity Matrix</h4>
                   </div>
                   <div className="space-y-8">
                      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="relative group">
                           <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-sm">
                              <img src={localUI.brandLogo || defaultBrandLogo} alt="Corporate Logo" className="h-full w-full object-contain" />
                           </div>
                           <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                           <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#001F3D] text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                              <Camera className="h-4 w-4" />
                           </label>
                        </div>
                        <div className="flex-1 space-y-1">
                           <p className="text-[11px] font-bold text-[#001F3D] uppercase">Corporate Emblem</p>
                           <p className="text-[9px] text-slate-400 font-medium leading-tight">This node will be synchronized across headers, sidebars, and watermarks.</p>
                           {localUI.brandLogo && (
                             <Button variant="ghost" size="sm" className="h-7 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 text-[9px] font-bold uppercase tracking-widest gap-2 mt-2" onClick={handleDeleteLogo}>
                               <Trash2 className="h-3 w-3" /> Reset Node
                             </Button>
                           )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">Logo UI Scaling (px) <span className="text-emerald-500 font-code">{localUI.logoSize}px</span></Label>
                        <Slider value={[localUI.logoSize || 32]} min={24} max={64} step={2} onValueChange={([v]) => updateLocalUIField('logoSize', v)} />
                      </div>
                   </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="page-governance" className="m-0 space-y-8 max-w-6xl pb-20">
               <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/10"><Layout className="h-8 w-8" /></div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Page Architecture Governance</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manage functional identifiers and operational prefixes.</p>
                    </div>
                 </div>
                 <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleCommitUISettings}>
                   <Save className="h-4 w-4" /> SAVE DATA
                 </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                  <Card className="p-8 border-slate-200 bg-white shadow-xl rounded-[2rem]">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <Settings2 className="h-4 w-4 text-primary" />
                          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">Functional Node Identifiers (Page Edit)</h4>
                       </div>
                       <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                          <Input 
                            placeholder="Filter nodes..." 
                            className="h-9 pl-9 bg-slate-50 border-none rounded-lg text-xs" 
                            value={pageSearch} 
                            onChange={(e) => setPageSearch(e.target.value)} 
                          />
                       </div>
                    </div>

                    <div className="space-y-4">
                       {filteredNodes.map((node) => (
                         <div key={node.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-6 group hover:border-primary/20 transition-all">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors border shadow-sm">
                               <node.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                               <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Current Label: {node.label}</Label>
                               <Input 
                                 placeholder={`Enter new identifier for ${node.id}...`} 
                                 className="h-10 bg-white border-none rounded-lg text-[11px] font-bold uppercase shadow-sm"
                                 value={localUI.customTitles[node.id] || ''}
                                 onChange={(e) => handleUpdatePageTitle(node.id, e.target.value)}
                               />
                            </div>
                            <Badge variant="outline" className="text-[8px] font-code border-slate-200 text-slate-300 bg-white">ID_{node.id.toUpperCase()}</Badge>
                         </div>
                       ))}
                       {filteredNodes.length === 0 && (
                         <div className="py-20 text-center opacity-20"><Search className="h-12 w-12 mx-auto mb-4" /><p className="text-xs font-bold uppercase">No nodes match criteria</p></div>
                       )}
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                   <Card className="p-8 border-slate-200 bg-white shadow-xl rounded-[2rem] space-y-8">
                      <div className="flex items-center gap-3 border-l-4 border-red-500 pl-4">
                         <Hash className="h-4 w-4 text-red-500" />
                         <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">Sequence Governance</h4>
                      </div>
                      <div className="space-y-6">
                         <div className="space-y-2">
                           <Label className="text-[9px] font-bold uppercase text-slate-400">Master Work Order Prefix</Label>
                           <Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold text-primary" value={localUI.woPrefix} onChange={(e) => updateLocalUIField('woPrefix', e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-[9px] font-bold uppercase text-slate-400">Next Sequence Value</Label>
                           <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold text-[#001F3D]" value={localUI.woNextNumber} onChange={(e) => updateLocalUIField('woNextNumber', Number(e.target.value))} />
                         </div>
                         <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start">
                            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-[9px] text-red-700 leading-relaxed font-medium uppercase">Warning: Modifying sequence values can cause ledger fragmentation. Proceed with organizational authority.</p>
                         </div>
                      </div>
                   </Card>

                   <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2rem] relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                      <div className="relative z-10 space-y-6">
                         <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-primary" />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Architecture Lock</h4>
                         </div>
                         <p className="text-[10px] text-white/40 leading-relaxed font-medium">These settings are applied globally across all functional threads of the Ferocious Matrix.</p>
                      </div>
                   </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial-matrix" className="m-0 space-y-8 max-w-4xl">
               <div className="flex justify-between items-center px-2">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-xl"><TableProperties className="h-8 w-8" /></div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Financial Matrix Architect</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Spatial dimension protocols for commercial registry.</p>
                    </div>
                 </div>
                 <Button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleCommitUISettings}>
                   <Save className="h-4 w-4" /> SAVE DATA
                 </Button>
              </div>

               <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] space-y-12">
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
                               {node.label} <span>{localUI.billingTableSettings?.colWidths?.[node.id as keyof typeof localUI.billingTableSettings.colWidths] || 100}px</span>
                            </Label>
                            <Slider 
                              value={[localUI.billingTableSettings?.colWidths?.[node.id as keyof typeof localUI.billingTableSettings.colWidths] || 100]} 
                              min={60} max={600} step={10} 
                              onValueChange={([v]) => handleUpdateBillingTableLocal(node.id, v)} 
                            />
                         </div>
                       ))}
                    </div>

                    <div className="pt-10 border-t space-y-6">
                       <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">
                          Global Entry Row Height <span>{localUI.billingTableSettings?.rowHeight || 48}px</span>
                       </Label>
                       <Slider 
                        value={[localUI.billingTableSettings?.rowHeight || 48]} 
                        min={32} max={120} step={4} 
                        onValueChange={([v]) => handleUpdateBillingTableLocal('rowHeight', v)} 
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
