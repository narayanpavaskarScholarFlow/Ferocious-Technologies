"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ListOrdered
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemUser, PermissionLevel, UISettings, ViewType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const THEME_COLORS = [
  { name: 'Classic Navy', value: '243 75% 59%', color: 'bg-[#6366f1]' },
  { name: 'Emerald Forest', value: '142 71% 45%', color: 'bg-[#10b981]' },
  { name: 'Cyber Crimson', value: '346 84% 61%', color: 'bg-[#f43f5e]' },
  { name: 'Deep Amber', value: '38 92% 50%', color: 'bg-[#f59e0b]' },
  { name: 'Royal Violet', value: '262 83% 58%', color: 'bg-[#8b5cf6]' },
  { name: 'Stealth Grey', value: '215 25% 27%', color: 'bg-[#334155]' },
];

const ACCESS_NODES: { id: ViewType; label: string; category: string; icon: any }[] = [
  { id: 'overview', label: 'Command Matrix', category: 'Strategic Hub', icon: LayoutGrid },
  { id: 'agile', label: 'Agile Kanban', category: 'Strategic Hub', icon: Contact },
  { id: 'smart-quote', label: 'AI Quoting', category: 'Strategic Hub', icon: BrainCircuit },
  { id: 'sqcdp', label: 'Performance Board', category: 'Strategic Hub', icon: LineChart },
  { id: 'team-matrix', label: 'My Team Matrix', category: 'Strategic Hub', icon: Users },
  { id: 'orders', label: 'Master Orders', category: 'Production Control', icon: ShoppingCart },
  { id: 'production-planner', label: 'Mass Production', category: 'Production Control', icon: Factory },
  { id: 'gantt', label: 'Visual Timeline', category: 'Production Control', icon: LayoutGrid },
  { id: 'operations', label: 'Operational Spreadsheet', category: 'Production Control', icon: Layers },
  { id: 'weekly-plan', label: 'Master Schedule', category: 'Production Control', icon: Calendar },
  { id: 'work-log', label: 'Work Log Hub', category: 'Production Control', icon: ClipboardList },
  { id: 'quality', label: 'Quality Hub', category: 'Quality & Compliance', icon: ShieldCheck },
  { id: 'training', label: 'Training Matrix', category: 'Quality & Compliance', icon: GraduationCap },
  { id: 'customer-orders', label: 'Customer Identity', category: 'Commercial Operations', icon: Contact },
  { id: 'inventory', label: 'Stock Ledger', category: 'Commercial Operations', icon: Boxes },
  { id: 'billing', label: 'Financial Hub', category: 'Commercial Operations', icon: CreditCard },
  { id: 'vendor', label: 'Supply Chain', category: 'Commercial Operations', icon: Truck },
  { id: 'machine-utilization', label: 'Asset Fleet', category: 'Resources & Assets', icon: Cpu },
  { id: 'hr', label: 'HR Command', category: 'Resources & Assets', icon: Users },
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
  title = 'Control Center'
}: ProfileSettingsProps) {
  const { toast } = useToast();
  const [internalTab, setInternalTab] = useState('profile');
  const [selectedUserForMatrix, setSelectedUserForMatrix] = useState<string | null>(null);
  const [stagedPermissions, setStagedPermissions] = useState<Record<string, PermissionLevel>>({});
  const [selectedModuleForConfig, setSelectedModuleForConfig] = useState<ViewType | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMatrixSaving, setIsMatrixSaving] = useState(false);

  const isMasterAdmin = currentUser === 'Master Admin';

  const [profileData, setProfileData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    id: '',
    password: '',
    image: undefined as string | undefined
  });

  useEffect(() => {
    if (currentUserData) {
      setProfileData({
        username: currentUserData.username || currentUserData.email || '',
        firstName: currentUserData.firstName || '',
        lastName: currentUserData.lastName || '',
        email: currentUserData.email || '',
        id: currentUserData.id || '',
        password: currentUserData.password || '',
        image: currentUserData.image
      });
    } else if (currentUser === 'Master Admin') {
      setProfileData({
        username: 'admin',
        firstName: 'Master',
        lastName: 'Admin',
        email: 'admin@bharataxis.tech',
        id: 'ID_PR_0001',
        password: 'admin123',
        image: undefined
      });
    }
  }, [currentUserData, currentUser]);

  const currentUserMatrix = useMemo(() => {
    if (users.length === 0) return null;
    return users.find(u => u.id === selectedUserForMatrix) || null;
  }, [users, selectedUserForMatrix]);

  const reportingManagerData = useMemo(() => {
    if (!currentUserData?.reportingManager || !users) return null;
    return users.find(u => u.name === currentUserData.reportingManager || u.id === currentUserData.reportingManager);
  }, [currentUserData?.reportingManager, users]);

  useEffect(() => {
    if (currentUserMatrix) {
      setStagedPermissions(currentUserMatrix.permissions || {});
    } else {
      setStagedPermissions({});
    }
  }, [currentUserMatrix?.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, image: reader.result as string }));
        toast({ title: "Identity Visual Cached", description: "Identity photo loaded. Save profile to synchronize." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUserData && currentUser !== 'Master Admin') return;

    setIsSaving(true);
    
    const updatedUser: SystemUser = {
      ...(currentUserData || {
        id: profileData.id,
        role: 'Plant Controller',
        dept: 'Admin',
        status: 'online',
        lastLogin: new Date().toISOString(),
        permissions: { overview: 'full' }
      } as any),
      username: profileData.username,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      email: profileData.username, // Synchronize Login ID with Username
      password: profileData.password,
      image: profileData.image
    };

    onSaveUser(updatedUser);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Synchronized",
        description: "Your industrial identity nodes have been updated across the master ledger."
      });
    }, 800);
  };

  const handleUpdateStagedPermission = (pageId: string, level: PermissionLevel) => {
    setStagedPermissions(prev => ({
      ...prev,
      [pageId]: level
    }));
  };

  const handleSaveMatrix = () => {
    if (!currentUserMatrix) {
      toast({ variant: "destructive", title: "Target Missing", description: "Please select a user identity to synchronize." });
      return;
    }

    setIsMatrixSaving(true);
    
    onSaveUser({
      ...currentUserMatrix,
      permissions: stagedPermissions
    });

    setTimeout(() => {
      setIsMatrixSaving(false);
      toast({
        title: "Access Matrix Synchronized",
        description: `Security protocols for ${currentUserMatrix.name} have been committed to the ledger.`
      });
    }, 800);
  };

  const updateTitle = (view: string, title: string) => {
    onUpdateUISettings({
      ...uiSettings,
      customTitles: {
        ...(uiSettings.customTitles || {}),
        [view]: title
      }
    });
  };

  const selectedModuleData = useMemo(() => {
    return ACCESS_NODES.find(n => n.id === selectedModuleForConfig);
  }, [selectedModuleForConfig]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2 print:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-accent font-bold text-[9px] uppercase tracking-[0.3em]">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-red" />
            System Governance
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            {title} <span className="text-slate-400 font-medium">& Settings</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Manage root identity and system-wide access protocols.</p>
        </div>
      </header>

      <Tabs value={internalTab} onValueChange={setInternalTab} className="w-full print:block">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm print:hidden">
          <TabsTrigger value="profile" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <UserCircle className="h-3.5 w-3.5 mr-2" /> User Profile
          </TabsTrigger>
          {isMasterAdmin && (
            <TabsTrigger value="matrix" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
              <Unlock className="h-3.5 w-3.5 mr-2" /> Access Matrix
            </TabsTrigger>
          )}
          {isMasterAdmin && (
            <TabsTrigger value="config" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
              <Monitor className="h-3.5 w-3.5 mr-2" /> Global UI Command
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="m-0 space-y-8 print:m-0 print:space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
            <div className="lg:col-span-4 space-y-6 print:w-full print:flex print:justify-center">
              <div className="space-y-6 w-full">
                <Card className="p-0 bg-slate-900 border-slate-800 shadow-2xl rounded-[var(--radius)] overflow-hidden flex flex-col transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
                  <div className="bg-[#001F3D] p-6 flex justify-between items-center border-b border-white/5 relative">
                    <div className="relative z-10">
                      <h1 className="text-xl font-display font-bold tracking-tighter text-white">BHARAT<span className="text-primary">AXIS</span></h1>
                      <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.4em]">Integrated Control Network</p>
                    </div>
                    <QrCode className="h-8 w-8 text-white/20 relative z-10" />
                  </div>
                  <div className="p-8 flex-1 flex flex-col items-center text-center gap-6 relative">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800 flex items-center justify-center relative">
                        {profileData.image ? <img src={profileData.image} alt="" className="h-full w-full object-cover" /> : <UserCircle className="h-12 w-12 text-white/30" />}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl shadow-lg flex items-center justify-center text-white border-2 border-slate-900">
                        <Camera className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="space-y-1 relative z-10">
                      <h3 className="text-xl font-display font-bold text-white tracking-tight uppercase">{profileData.firstName} {profileData.lastName}</h3>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.25em]">{currentUserData?.role || 'Plant Controller'}</p>
                      <Badge variant="outline" className="font-code text-[8px] bg-white/5 border-white/10 text-white/40 px-2 py-0">@{profileData.username}</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-[var(--radius)] overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary"><Network className="h-4 w-4" /></div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporting Protocol</h4>
                  </div>
                  
                  {reportingManagerData ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="h-10 w-10 rounded-xl bg-[#001F3D] flex items-center justify-center text-white font-bold text-xs">
                          {reportingManagerData.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Supervisor Node</p>
                          <p className="text-sm font-bold text-[#001F3D] uppercase">{reportingManagerData.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Phone className="h-4 w-4" /></div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Verified Contact</p>
                          <p className="text-sm font-bold text-primary font-code">{reportingManagerData.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center opacity-40">
                      <ShieldAlert className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Supervisor Node Linked</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
            
            <div className="lg:col-span-8 space-y-8">
              <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[var(--radius)]">
                <div className="flex items-center gap-3 mb-10 border-l-4 border-primary pl-6">
                  <UserCircle className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Matrix</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Foundational Personnel Node</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Employee ID (Locked)</Label>
                    <div className="relative">
                      <Input value={profileData.id} readOnly className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code text-slate-400 pl-10" />
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Network Identifier (Login ID)</Label>
                    <div className="relative group">
                      <Input 
                        value={profileData.username} 
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/\s/g, '');
                          setProfileData(prev => ({ ...prev, username: val, email: val }));
                        }}
                        className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code text-slate-700 pl-10 focus-visible:ring-primary/20" 
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</Label>
                    <Input 
                      value={profileData.firstName} 
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-700 focus-visible:ring-primary/20" 
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</Label>
                    <Input 
                      value={profileData.lastName} 
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-700 focus-visible:ring-primary/20" 
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">System Email (Sync)</Label>
                    <div className="relative group">
                      <Input 
                        value={profileData.email} 
                        readOnly
                        className="h-12 bg-slate-100 border-none rounded-xl font-bold font-code text-slate-400 pl-10 cursor-not-allowed" 
                      />
                      <Contact className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Security Token (Password)</Label>
                    <div className="relative group">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        value={profileData.password} 
                        onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code text-slate-700 pl-10 pr-12 focus-visible:ring-primary/20" 
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-10 mt-10 border-t border-slate-100 flex justify-end">
                  <Button 
                    disabled={isSaving}
                    onClick={handleSaveProfile}
                    className="h-14 px-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/20 flex gap-4 group"
                  >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Synchronize Profile Protocol
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="m-0 print:hidden">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[var(--radius)]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl text-white shadow-lg"><Unlock className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Access Control Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hierarchical Security Ledger</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1">
                  <Select value={selectedUserForMatrix || ''} onValueChange={setSelectedUserForMatrix}>
                    <SelectTrigger className="w-[280px] h-11 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase shadow-sm">
                      <SelectValue placeholder="Identify Target Node..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id} className="text-[10px] font-bold uppercase py-3">
                          <div className="flex flex-col">
                            <span>{u.name}</span>
                            <span className="text-[8px] text-slate-400 mt-0.5">ID: {u.id} • {u.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  disabled={isMatrixSaving || !selectedUserForMatrix}
                  onClick={handleSaveMatrix}
                  className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-red-600/20 flex gap-3 group"
                >
                  {isMatrixSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Matrix Protocol
                </Button>
              </div>
            </div>
            
            <div className="p-10">
              {currentUserMatrix ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {ACCESS_NODES.map(node => (
                    <div key={node.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col gap-6 group hover:border-primary/20 transition-all shadow-inner">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                          <node.icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-600 tracking-widest">{node.label}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-widest ml-1">Grant Access Level</Label>
                        <Select 
                          value={stagedPermissions[node.id] || 'none'} 
                          onValueChange={(val) => handleUpdateStagedPermission(node.id, val as any)}
                        >
                          <SelectTrigger className="h-10 bg-white border-none rounded-xl text-[9px] font-bold uppercase shadow-sm focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            <SelectItem value="none" className="text-[9px] font-bold uppercase text-slate-400">No Access (Locked)</SelectItem>
                            <SelectItem value="read" className="text-[9px] font-bold uppercase text-blue-600">Read Only (Tele)</SelectItem>
                            <SelectItem value="edit" className="text-[9px] font-bold uppercase text-amber-600">Edit Access (Mod)</SelectItem>
                            <SelectItem value="full" className="text-[9px] font-bold uppercase text-emerald-600">Full Command (Root)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center opacity-30 text-center">
                  <div className="p-10 bg-slate-50 rounded-full mb-8">
                    <ShieldAlert className="h-20 w-20 text-slate-300" />
                  </div>
                  <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Node Required</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Select a personnel identity from the directory to initialize the security matrix synchronization.</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="m-0 print:hidden space-y-8">
          <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[var(--radius)]">
            <div className="flex items-center gap-4 mb-12 border-l-4 border-primary pl-6">
              <Monitor className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Global UI Command Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Master Admin Architecture Node</p>
              </div>
            </div>

            <Tabs defaultValue="architecture">
              <TabsList className="bg-slate-100 p-1 rounded-full mb-10 h-11 inline-flex border border-slate-200 w-fit">
                <TabsTrigger value="architecture" className="rounded-full px-6 h-9 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D]">Architecture</TabsTrigger>
                <TabsTrigger value="modules" className="rounded-full px-6 h-9 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D]">Module Customizer</TabsTrigger>
              </TabsList>

              <TabsContent value="architecture" className="m-0 space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-12">
                    {/* WO ID Sequence Panel */}
                    <div className="space-y-6 bg-slate-50/50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-primary" /> Work Order ID Sequence Pattern
                      </Label>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[8px] font-bold uppercase text-slate-400">Prefix Series</Label>
                          <Input 
                            value={uiSettings.woPrefix} 
                            onChange={(e) => onUpdateUISettings({ ...uiSettings, woPrefix: e.target.value })}
                            className="h-11 bg-white border-none rounded-xl text-xs font-bold uppercase shadow-sm"
                            placeholder="e.g. WO-"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-bold uppercase text-slate-400">Next Node Number</Label>
                          <Input 
                            type="number"
                            value={uiSettings.woNextNumber} 
                            onChange={(e) => onUpdateUISettings({ ...uiSettings, woNextNumber: parseInt(e.target.value) || 0 })}
                            className="h-11 bg-white border-none rounded-xl text-xs font-bold shadow-sm"
                          />
                        </div>
                      </div>
                      <p className="text-[8px] text-slate-400 italic">* New orders will follow this protocol. Paddings apply automatically (e.g. {uiSettings.woPrefix}{uiSettings.woNextNumber.toString().padStart(4, '0')}).</p>
                    </div>

                    <div className="space-y-6">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Primary Accent Protocol
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {THEME_COLORS.map((theme) => (
                          <button key={theme.name} onClick={() => onUpdateUISettings({ ...uiSettings, primaryColor: theme.value })} className={cn("p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2", uiSettings.primaryColor === theme.value ? "border-primary bg-primary/5 shadow-lg" : "border-slate-100 hover:border-slate-200 bg-white")}>
                            <div className={cn("h-8 w-8 rounded-full", theme.color)} />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <TableProperties className="h-4 w-4" /> Table Interaction Density
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['compact', 'standard', 'comfortable'] as const).map((d) => (
                          <Button 
                            key={d} 
                            variant={uiSettings.tableDensity === d ? 'default' : 'outline'} 
                            className="h-12 rounded-xl font-bold uppercase text-[9px] tracking-widest" 
                            onClick={() => onUpdateUISettings({ ...uiSettings, tableDensity: d })}
                          >
                            {d}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="space-y-6 bg-slate-50/50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Typographic Scale</Label><Badge variant="outline" className="font-code text-primary bg-white">{uiSettings.fontSize}px</Badge></div>
                          <Slider min={11} max={16} step={1} value={[uiSettings.fontSize]} onValueChange={(val) => onUpdateUISettings({ ...uiSettings, fontSize: val[0] })} />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Corner Radius</Label><Badge variant="outline" className="font-code text-primary bg-white">{uiSettings.borderRadius}rem</Badge></div>
                          <Slider min={0} max={3} step={0.1} value={[uiSettings.borderRadius]} onValueChange={(val) => onUpdateUISettings({ ...uiSettings, borderRadius: val[0] })} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2"><CaseSensitive className="h-4 w-4" /> Labeling Style</Label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                          <button onClick={() => onUpdateUISettings({ ...uiSettings, labelCase: 'uppercase' })} className={cn("flex-1 h-9 rounded-lg text-[9px] font-bold uppercase transition-all", uiSettings.labelCase === 'uppercase' ? "bg-white shadow-sm text-[#001F3D]" : "text-slate-400")}>UPPER</button>
                          <button onClick={() => onUpdateUISettings({ ...uiSettings, labelCase: 'capitalize' })} className={cn("flex-1 h-9 rounded-lg text-[9px] font-bold uppercase transition-all", uiSettings.labelCase === 'capitalize' ? "bg-white shadow-sm text-[#001F3D]" : "text-slate-400")}>Lower</button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2"><AlignCenter className="h-4 w-4" /> Header Align</Label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                          <button onClick={() => onUpdateUISettings({ ...uiSettings, headerAlignment: 'left' })} className={cn("flex-1 h-9 rounded-lg flex items-center justify-center transition-all", uiSettings.headerAlignment === 'left' ? "bg-white shadow-sm text-[#001F3D]" : "text-slate-400")}><AlignLeft className="h-4 w-4" /></button>
                          <button onClick={() => onUpdateUISettings({ ...uiSettings, headerAlignment: 'center' })} className={cn("flex-1 h-9 rounded-lg flex items-center justify-center transition-all", uiSettings.headerAlignment === 'center' ? "bg-white shadow-sm text-[#001F3D]" : "text-slate-400")}><AlignCenter className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2"><PanelLeft className="h-4 w-4" /> Navigation Architecture</Label>
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button onClick={() => onUpdateUISettings({ ...uiSettings, sidebarMode: 'full' })} className={cn("flex-1 h-9 rounded-lg text-[9px] font-bold uppercase transition-all", uiSettings.sidebarMode === 'full' ? "bg-white shadow-sm text-[#001F3D]" : "text-slate-400")}>Expanded</button>
                        <button onClick={() => onUpdateUISettings({ ...uiSettings, sidebarMode: 'slim' })} className={cn("flex-1 h-9 rounded-lg text-[9px] font-bold uppercase transition-all", uiSettings.sidebarMode === 'slim' ? "bg-white shadow-sm text-[#001F3D]" : "text-slate-400")}>Slim (Icons)</button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="m-0 space-y-10">
                <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner max-w-2xl">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <Settings2 className="h-3.5 w-3.5 text-primary" /> Target Module Selection
                      </Label>
                      <Select value={selectedModuleForConfig} onValueChange={(val: any) => setSelectedModuleForConfig(val)}>
                        <SelectTrigger className="h-14 bg-white border-none rounded-2xl text-xs font-bold uppercase shadow-sm">
                          <SelectValue placeholder="Identify Module to Customize..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                          {ACCESS_NODES.map(node => (
                            <SelectItem key={node.id} value={node.id} className="text-[10px] font-bold uppercase">
                              <div className="flex items-center gap-3">
                                <node.icon className="h-3.5 w-3.5 text-slate-400" />
                                {node.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-slate-400 font-medium italic mt-2 ml-1">Select a tab from the list to initialize specific page configuration.</p>
                    </div>

                    {selectedModuleData && (
                      <div className="pt-10 space-y-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg">
                            <selectedModuleData.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">Configuration Matrix: {selectedModuleData.label}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedModuleData.category}</p>
                          </div>
                        </div>

                        <div className="space-y-4 bg-white p-8 rounded-[1.5rem] border border-slate-200 shadow-xl">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Custom Section Title</Label>
                            <div className="relative">
                              <Input 
                                placeholder={selectedModuleData.label} 
                                className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner pl-10"
                                value={uiSettings.customTitles?.[selectedModuleForConfig] || ''}
                                onChange={(e) => updateTitle(selectedModuleForConfig, e.target.value)}
                              />
                              <Edit3 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            </div>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-2 px-1">This title will reflect in headers and navigation labels.</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                          <Zap className="h-4 w-4 text-primary" />
                          <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Real-time synchronization active for this node.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
