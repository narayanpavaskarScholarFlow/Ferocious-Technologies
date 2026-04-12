"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shield, 
  Settings, 
  Save, 
  LogOut, 
  CheckCircle2, 
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
  ChevronRight,
  Monitor,
  Edit3,
  Unlock,
  UserCircle,
  Trash2,
  UserPlus,
  BrainCircuit,
  Cpu,
  FileCheck,
  Zap,
  Activity,
  Plus,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Phone,
  Briefcase,
  Network,
  Fingerprint,
  Camera,
  Upload,
  Printer,
  QrCode,
  Eye,
  RefreshCw,
  Factory
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/user-management';
import { SystemUser, PermissionLevel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const ACCESS_NODES = [
  { id: 'overview', label: 'Command Matrix (Dashboard)', category: 'Strategic Hub', icon: LayoutGrid },
  { id: 'smart-quote', label: 'AI Smart Quoting (Gemini)', category: 'Strategic Hub', icon: BrainCircuit },
  { id: 'sqcdp', label: 'SQCDP Performance Metrics', category: 'Strategic Hub', icon: LineChart },
  { id: 'orders', label: 'Production Master Ledger', category: 'Production Control', icon: ShoppingCart },
  { id: 'production-planner', label: 'High-Volume Production Matrix: Planning & Tracking', category: 'Production Control', icon: Factory },
  { id: 'order-create', label: 'Production: New Order Protocol', category: 'Production Control', icon: Plus },
  { id: 'gantt', label: 'Visual Timeline (Gantt)', category: 'Production Control', icon: LayoutGrid },
  { id: 'operations', label: 'Operational Spreadsheet', category: 'Production Control', icon: Layers },
  { id: 'weekly-plan', label: 'Master Production Schedule', category: 'Production Control', icon: Calendar },
  { id: 'work-log', label: 'Daily Operator Work Logs', category: 'Production Control', icon: ClipboardList },
  { id: 'quality', label: 'Quality Inspection Pipeline', category: 'Quality & Compliance', icon: ShieldCheck },
  { id: 'quality-review', label: 'Final Compliance Review (Tab Access)', category: 'Quality & Compliance', icon: Unlock },
  { id: 'quality-release', label: 'Final Quality Release (Authority)', category: 'Quality & Compliance', icon: FileCheck },
  { id: 'quality-report-delete', label: 'Quality: Delete Compliance Report Protocol', category: 'Quality & Compliance', icon: Trash2 },
  { id: 'customer-orders', label: 'CRM / Account Pipeline', category: 'Commercial Operations', icon: Package },
  { id: 'inventory-add', label: 'Inventory: Add Item to Ledger', category: 'Commercial Operations', icon: Plus },
  { id: 'billing', label: 'Financial Hub (Master Ledger)', category: 'Commercial Operations', icon: CreditCard },
  { id: 'billing-quotation', label: 'Finance: Quotation Protocol', category: 'Commercial Operations', icon: FileText },
  { id: 'billing-invoice', label: 'Finance: Invoice Protocol', category: 'Commercial Operations', icon: FileText },
  { id: 'billing-proforma', label: 'Finance: Proforma Protocol', category: 'Commercial Operations', icon: FileText },
  { id: 'billing-inward', label: 'Logistics: Inward Protocol', category: 'Commercial Operations', icon: ArrowDownLeft },
  { id: 'billing-outward', label: 'Logistics: Outward Protocol', category: 'Commercial Operations', icon: ArrowUpRight },
  { id: 'billing-create', label: 'Finance: Create New Record', category: 'Commercial Operations', icon: Plus },
  { id: 'billing-delete', label: 'Finance: Record Deletion Protocol', category: 'Commercial Operations', icon: Trash2 },
  { id: 'vendor', label: 'Supply Chain & Vendor Directory', category: 'Commercial Operations', icon: Truck },
  { id: 'vendor-onboard', label: 'Supply: Onboard New Partner', category: 'Commercial Operations', icon: UserPlus },
  { id: 'machine-utilization', label: 'Industrial Asset Telemetry', category: 'Resources & Assets', icon: Cpu },
  { id: 'maintenance', label: 'Asset Maintenance Ledger', category: 'Resources & Assets', icon: Activity },
  { id: 'manpower', label: 'Personnel & Skill Matrix', category: 'Resources & Assets', icon: Users },
  { id: 'hr-planning', label: 'Leave Allocation Matrix', category: 'Resources & Assets', icon: Calendar },
  { id: 'holiday-matrix', label: 'HR: Annual Holiday Matrix', category: 'Resources & Assets', icon: CalendarDays },
  { id: 'users', label: 'System Identity Management', category: 'System Governance', icon: UserPlus },
  { id: 'matrix', label: 'Access Control Matrix', category: 'System Governance', icon: Unlock },
  { id: 'settings', label: 'Global System Configuration', category: 'System Governance', icon: Settings },
];

interface ProfileSettingsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  currentUser: string | null;
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
  onDeleteUser: (userId: string) => void;
}

export function ProfileSettings({ 
  activeTab = 'profile', 
  onTabChange, 
  onLogout,
  currentUser,
  users,
  onSaveUser,
  onDeleteUser
}: ProfileSettingsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserForMatrix, setSelectedUserForMatrix] = useState<string | null>(null);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof ACCESS_NODES> = {};
    ACCESS_NODES.forEach(node => {
      if (!groups[node.category]) groups[node.category] = [];
      groups[node.category].push(node);
    });
    return groups;
  }, []);

  const activeAdmin = useMemo(() => {
    return users.find(u => u.name === currentUser || u.email?.includes(String(currentUser).toLowerCase())) || null;
  }, [users, currentUser]);

  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminDept, setAdminDept] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminReportingManager, setAdminReportingManager] = useState('');
  const [adminImage, setAdminImage] = useState<string | undefined>();

  useEffect(() => {
    if (activeAdmin) {
      setAdminName(activeAdmin.name);
      setAdminRole(activeAdmin.role);
      setAdminEmail(activeAdmin.email);
      setAdminPhone(activeAdmin.phone || '');
      setAdminDept(activeAdmin.dept);
      setAdminId(activeAdmin.id);
      setAdminReportingManager(activeAdmin.reportingManager || '');
      setAdminImage(activeAdmin.image);
    } else {
      setAdminName(currentUser || 'Master Admin');
      setAdminRole('Plant Controller');
      setAdminEmail(currentUser === 'Master Admin' ? 'admin@bharataxis.tech' : '');
      setAdminDept('Admin');
      setAdminId('ID_PR_0001');
      setAdminReportingManager('Self / Board');
      setAdminImage(undefined);
    }
  }, [activeAdmin, currentUser]);

  const currentUserMatrix = useMemo(() => {
    if (users.length === 0) return null;
    const found = users.find(u => u.id === selectedUserForMatrix);
    return found || users[0];
  }, [users, selectedUserForMatrix]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminImage(reader.result as string);
        toast({ title: "Visual Identity Matrix Updated", description: "Identity image cached for synchronization." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAdminProfile = () => {
    setIsSaving(true);
    
    const profileToSave: SystemUser = activeAdmin ? {
      ...activeAdmin,
      name: adminName,
      role: adminRole,
      email: adminEmail,
      phone: adminPhone || '',
      dept: adminDept,
      image: adminImage || '',
      reportingManager: adminReportingManager || ''
    } : {
      id: adminId || `ADMIN-${Date.now()}`,
      name: adminName,
      email: adminEmail || `${adminName.toLowerCase().replace(' ', '.')}@bharataxis.tech`,
      phone: adminPhone || '',
      role: adminRole,
      dept: adminDept || 'Admin',
      image: adminImage || '',
      reportingManager: adminReportingManager || '',
      permissions: { overview: 'full' },
      lastLogin: new Date().toISOString(),
      lastPasswordChange: new Date().toISOString(),
      status: 'online'
    };

    onSaveUser(profileToSave);

    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast({
        title: "Identity Synchronized",
        description: `Master metadata for ${adminName} has been committed to the ledger.`
      });
    }, 800);
  };

  const handleUpdatePermission = (userId: string, pageId: string, level: PermissionLevel) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    onSaveUser({
      ...userToUpdate,
      permissions: {
        ...(userToUpdate.permissions || {}),
        [pageId]: level
      }
    });

    toast({
      title: "Permission Escalated",
      description: `Access level for ${pageId} has been updated.`,
    });
  };

  const handlePhysicalPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2 print:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-accent font-bold text-[9px] uppercase tracking-[0.3em]">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-red" />
            System Governance
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Control Center <span className="text-slate-400 font-medium">& Settings</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Manage root identity and system-wide access protocols.</p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full print:block">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm print:hidden">
          <TabsTrigger value="profile" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <UserCircle className="h-3.5 w-3.5 mr-2" /> User Profile
          </TabsTrigger>
          {currentUser === 'Master Admin' && (
            <TabsTrigger value="access" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
              <Users className="h-3.5 w-3.5 mr-2" /> User Directory
            </TabsTrigger>
          )}
          {currentUser === 'Master Admin' && (
            <TabsTrigger value="matrix" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
              <Unlock className="h-3.5 w-3.5 mr-2" /> Access Matrix
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="m-0 space-y-8 print:m-0 print:space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
            <div className="lg:col-span-4 space-y-6 print:w-full print:flex print:justify-center">
              {/* Digital Industrial ID Card */}
              <div id="id-card-printable" className="relative group/id print:w-[350px]">
                <Card className="p-0 bg-slate-900 border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 hover:scale-[1.02] hover:-rotate-1 print:shadow-none print:rotate-0 print:scale-100 print:rounded-none print:border-2 print:border-slate-200">
                  {/* ID Card Header */}
                  <div className="bg-[#001F3D] p-6 flex justify-between items-center border-b border-white/5 relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
                    <div className="relative z-10">
                      <h1 className="text-xl font-display font-bold tracking-tighter text-white">BHARAT<span className="text-primary">AXIS</span></h1>
                      <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.4em]">Integrated Control Network</p>
                    </div>
                    <QrCode className="h-8 w-8 text-white/20 relative z-10" />
                  </div>

                  {/* ID Card Body */}
                  <div className="p-8 flex-1 flex flex-col items-center text-center gap-6 relative">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                    
                    <div className="relative group/photo">
                      <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800 flex items-center justify-center">
                        {adminImage ? (
                          <img src={adminImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-30 text-white">
                            <UserCircle className="h-12 w-12" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">No Matrix Data</span>
                          </div>
                        )}
                      </div>
                      
                      <input 
                        type="file" 
                        id="id-photo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label 
                        htmlFor="id-photo-upload"
                        className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform print:hidden"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <h3 className="text-xl font-display font-bold text-white tracking-tight uppercase">{adminName}</h3>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.25em]">{adminRole}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4 mt-4 relative z-10">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left print:bg-slate-50 print:border-slate-200">
                        <p className="text-[7px] text-white/30 uppercase font-bold mb-1 tracking-widest print:text-slate-400">Employee Node</p>
                        <p className="text-11px font-code font-bold text-white print:text-slate-900">{adminId || 'ID_PR_0001'}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left print:bg-slate-50 print:border-slate-200">
                        <p className="text-[7px] text-white/30 uppercase font-bold mb-1 tracking-widest print:text-slate-400">Plant Section</p>
                        <p className="text-11px font-bold text-white uppercase truncate print:text-slate-900">{adminDept || 'General'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ID Card Footer */}
                  <div className="bg-slate-950 p-4 border-t border-white/5 text-center flex flex-col items-center print:bg-slate-100">
                    <div className="h-1 w-12 bg-white/10 rounded-full mb-3 print:bg-slate-300" />
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.5em] animate-pulse print:text-slate-400">Security Clearance Active</p>
                  </div>
                </Card>
                
                <div className="flex gap-2 mt-6 print:hidden">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white border-slate-200 text-slate-400 hover:text-primary rounded-xl h-11 text-[9px] font-bold uppercase tracking-widest gap-2 shadow-sm"
                    onClick={handlePhysicalPrint}
                  >
                    <Printer className="h-3.5 w-3.5" /> Physical ID Print
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[9px] uppercase tracking-widest h-11 rounded-xl gap-2 px-4"
                    onClick={onLogout}
                  >
                    <LogOut className="h-3.5 w-3.5" /> Log Out
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6 print:hidden">
              <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[2rem] space-y-10">
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Master Identity Matrix</h3>
                    </div>
                    {isEditing ? (
                      <div className="flex gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="rounded-lg px-4 font-bold text-[10px] uppercase h-9">Cancel</Button>
                        <Button 
                          size="sm"
                          onClick={handleSaveAdminProfile}
                          disabled={isSaving}
                          className="bg-[#001F3D] hover:bg-black text-white rounded-lg px-6 font-bold text-[10px] uppercase tracking-widest h-9 flex gap-2"
                        >
                          {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Commit Protocol
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="border-slate-200 text-slate-600 hover:text-primary rounded-lg px-6 font-bold text-[10px] uppercase tracking-widest h-9 flex gap-2"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Modify Matrix Entry
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <Fingerprint className="h-3 w-3 text-primary" /> Employee Identity (ID)
                      </Label>
                      {isEditing ? (
                        <Input 
                          value={adminId} 
                          onChange={(e) => setAdminId(e.target.value)}
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20 shadow-inner" 
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-xl text-xs font-bold text-[#001F3D] uppercase">{adminId || 'NOT_SET'}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Identity User name</Label>
                      {isEditing ? (
                        <Input 
                          value={adminName} 
                          onChange={(e) => setAdminName(e.target.value)}
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20 shadow-inner" 
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-xl text-xs font-bold text-[#001F3D] uppercase">{adminName || 'NOT_SET'}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <Phone className="h-3 w-3 text-primary" /> Contact Synchronization Node
                      </Label>
                      {isEditing ? (
                        <Input 
                          value={adminPhone} 
                          onChange={(e) => setAdminPhone(e.target.value)}
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20 shadow-inner" 
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-xl text-xs font-bold text-[#001F3D] uppercase">{adminPhone || 'NOT_SET'}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Network Mail ID</Label>
                      {isEditing ? (
                        <Input 
                          value={adminEmail} 
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20 shadow-inner" 
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-xl text-xs font-bold text-[#001F3D]">{adminEmail || 'NOT_SET'}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Plant Department</Label>
                      {isEditing ? (
                        <Input 
                          value={adminDept} 
                          onChange={(e) => setAdminDept(e.target.value)}
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20 shadow-inner" 
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-xl text-xs font-bold text-[#001F3D] uppercase">{adminDept || 'NOT_SET'}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <Briefcase className="h-3 w-3 text-primary" /> Functional Role
                      </Label>
                      {isEditing ? (
                        <Input 
                          value={adminRole} 
                          onChange={(e) => setAdminRole(e.target.value)}
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20 shadow-inner" 
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-xl text-xs font-bold text-[#001F3D] uppercase">{adminRole || 'NOT_SET'}</div>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <Network className="h-3 w-3 text-primary" /> Command Lead (Reporting Manager)
                      </Label>
                      {isEditing ? (
                        <Input 
                          value={adminReportingManager} 
                          onChange={(e) => setAdminReportingManager(e.target.value)}
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20 shadow-inner" 
                        />
                      ) : (
                        <div className="h-12 flex items-center px-4 bg-slate-50/50 rounded-xl text-xs font-bold text-[#001F3D] uppercase">{adminReportingManager || 'NOT_SET'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {currentUser === 'Master Admin' && (
          <TabsContent value="access" className="m-0 print:hidden">
            <UserManagement users={users} onSaveUser={onSaveUser} onDeleteUser={onDeleteUser} />
          </TabsContent>
        )}

        {currentUser === 'Master Admin' && (
          <TabsContent value="matrix" className="m-0 print:hidden">
            <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Access Control Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Hierarchical Security Assignment Ledger</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Target Identity:</span>
                  <Select value={selectedUserForMatrix || ''} onValueChange={setSelectedUserForMatrix}>
                    <SelectTrigger className="w-[240px] h-11 bg-white border-slate-200 rounded-xl shadow-sm text-xs font-bold text-[#001F3D]">
                      <SelectValue placeholder="Select User..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id} className="text-xs font-bold uppercase">{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-10">
                {currentUserMatrix ? (
                  <div className="space-y-12">
                    <div className="flex items-center justify-between px-4 py-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg overflow-hidden border border-white/10">
                          {currentUserMatrix.image ? (
                            <img src={currentUserMatrix.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            currentUserMatrix.name ? currentUserMatrix.name.charAt(0) : '?'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{currentUserMatrix.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{currentUserMatrix.role} • {currentUserMatrix.dept}</p>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest px-4 py-1.5 rounded-full text-[9px]">PROTOCOL_ACTIVE</Badge>
                    </div>

                    <div className="space-y-16">
                      {Object.entries(groupedPermissions).map(([category, nodes]) => (
                        <div key={category} className="space-y-8">
                          <div className="flex items-center gap-4">
                            <div className="h-px bg-slate-100 flex-1" />
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] px-4 whitespace-nowrap">{category}</h4>
                            <div className="h-px bg-slate-100 flex-1" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {nodes.map(node => {
                              const currentLevel = (currentUserMatrix.permissions && currentUserMatrix.permissions[node.id]) || 'none';
                              const Icon = node.icon;
                              
                              return (
                                <div key={node.id} className="group p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col gap-6 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                                        <Icon className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-tight">{node.label}</span>
                                    </div>
                                    <div className={cn(
                                      "h-2 w-2 rounded-full",
                                      currentLevel === 'full' ? "bg-accent animate-pulse" : 
                                      currentLevel === 'edit' ? "bg-primary" : 
                                      currentLevel === 'read' ? "bg-emerald-500" : "bg-slate-200"
                                    )} />
                                  </div>

                                  <Select 
                                    value={currentLevel} 
                                    onValueChange={(val) => handleUpdatePermission(currentUserMatrix.id, node.id, val as PermissionLevel)}
                                  >
                                    <SelectTrigger className={cn(
                                      "h-11 border-none text-[10px] font-bold uppercase rounded-xl transition-all shadow-inner",
                                      currentLevel === 'full' ? "bg-accent/10 text-accent" :
                                      currentLevel === 'edit' ? "bg-primary/10 text-primary" :
                                      currentLevel === 'read' ? "bg-emerald-50 text-emerald-600" :
                                      "bg-slate-50 text-slate-400"
                                    )}>
                                      <SelectValue placeholder="Access Level" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                      <SelectItem value="none" className="text-[10px] font-bold uppercase">No Access</SelectItem>
                                      <SelectItem value="read" className="text-[10px] font-bold uppercase">View Only</SelectItem>
                                      <SelectItem value="edit" className="text-[10px] font-bold uppercase">Modify/Edit</SelectItem>
                                      <SelectItem value="full" className="text-[10px] font-bold uppercase">Full command</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center">
                    <div className="p-10 bg-slate-50 rounded-full mb-8">
                      <Shield className="h-20 w-20 text-slate-300" />
                    </div>
                    <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Synchronization Required</h4>
                    <p className="text-xs text-slate-400 mt-2 max-sm mx-auto font-medium">Select a verified user identity from the directory above to initialize the hierarchical access matrix.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
