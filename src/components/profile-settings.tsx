
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
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/user-management';
import { SystemUser, PermissionLevel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// High-fidelity permission nodes categorized by industrial function
const ACCESS_NODES = [
  // Category: Strategic Hub
  { id: 'overview', label: 'Command Matrix (Dashboard)', category: 'Strategic Hub', icon: LayoutGrid },
  { id: 'smart-quote', label: 'AI Smart Quoting (Gemini)', category: 'Strategic Hub', icon: BrainCircuit },
  { id: 'sqcdp', label: 'SQCDP Performance Metrics', category: 'Strategic Hub', icon: LineChart },
  
  // Category: Production Control
  { id: 'orders', label: 'Production Master Ledger', category: 'Production Control', icon: ShoppingCart },
  { id: 'gantt', label: 'Visual Timeline (Gantt)', category: 'Production Control', icon: LayoutGrid },
  { id: 'operations', label: 'Operational Spreadsheet', category: 'Production Control', icon: Layers },
  { id: 'weekly-plan', label: 'Master Production Schedule', category: 'Production Control', icon: Calendar },
  { id: 'work-log', label: 'Daily Operator Work Logs', category: 'Production Control', icon: ClipboardList },
  
  // Category: Quality & Compliance
  { id: 'quality', label: 'Quality Inspection Pipeline', category: 'Quality & Compliance', icon: ShieldCheck },
  { id: 'quality-release', label: 'Final Quality Release (Authority)', category: 'Quality & Compliance', icon: FileCheck },
  
  // Category: Commercial Operations
  { id: 'customer-orders', label: 'CRM / Account Pipeline', category: 'Commercial Operations', icon: Package },
  { id: 'billing', label: 'Financial Hub (Quoting/Billing)', category: 'Commercial Operations', icon: CreditCard },
  { id: 'billing-purge', label: 'Financial Deletion protocol', category: 'Commercial Operations', icon: Trash2 },
  { id: 'vendor', label: 'Supply Chain & Vendor Directory', category: 'Commercial Operations', icon: Truck },
  
  // Category: Resources & Assets
  { id: 'machine-utilization', label: 'Industrial Asset Telemetry', category: 'Resources & Assets', icon: Cpu },
  { id: 'maintenance', label: 'Asset Maintenance Ledger', category: 'Resources & Assets', icon: Activity },
  { id: 'manpower', label: 'Personnel & Skill Matrix', category: 'Resources & Assets', icon: Users },
  { id: 'hr-planning', label: 'Leave & Holiday Matrix', category: 'Resources & Assets', icon: Calendar },
  
  // Category: System Governance
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
  const [selectedUserForMatrix, setSelectedUserForMatrix] = useState<string | null>(null);

  // Group permissions for hierarchical UI
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

  useEffect(() => {
    if (activeAdmin) {
      setAdminName(activeAdmin.name);
      setAdminRole(activeAdmin.role);
    } else {
      setAdminName(currentUser || 'Sys_Admin_01');
      setAdminRole('Plant Controller');
    }
  }, [activeAdmin, currentUser]);

  const currentUserMatrix = useMemo(() => {
    if (users.length === 0) return null;
    const found = users.find(u => u.id === selectedUserForMatrix);
    return found || users[0];
  }, [users, selectedUserForMatrix]);

  const handleSaveAdminProfile = () => {
    setIsSaving(true);
    
    const profileToSave: SystemUser = activeAdmin ? {
      ...activeAdmin,
      name: adminName,
      role: adminRole
    } : {
      id: `ADMIN-${Date.now()}`,
      name: adminName,
      email: `${adminName.toLowerCase().replace(' ', '.')}@bharataxis.tech`,
      role: adminRole,
      dept: 'Admin',
      permissions: { overview: 'full' },
      lastLogin: new Date().toISOString(),
      status: 'online'
    };

    onSaveUser(profileToSave);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuration Synchronized",
        description: `Administrative profile for ${adminName} has been updated in the master ledger.`
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

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
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
        {activeTab === 'profile' && (
          <div className="flex items-center gap-3">
             <Button 
              className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
              onClick={handleSaveAdminProfile}
              disabled={isSaving}
             >
               {isSaving ? "Synchronizing..." : <Save className="h-4 w-4" />} {isSaving ? "" : "Save Protocol"}
             </Button>
          </div>
        )}
      </header>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm">
          <TabsTrigger value="profile" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <UserCircle className="h-3.5 w-3.5 mr-2" /> Admin Profile
          </TabsTrigger>
          <TabsTrigger value="access" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <Users className="h-3.5 w-3.5 mr-2" /> User Directory
          </TabsTrigger>
          <TabsTrigger value="matrix" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            <Unlock className="h-3.5 w-3.5 mr-2" /> Access Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="m-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-8 bg-white border-slate-200/60 shadow-xl rounded-2xl flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-xl">
                    <AvatarImage src={`https://picsum.photos/seed/${currentUser || 'admin'}/200/200`} />
                    <AvatarFallback className="bg-primary text-white text-xl font-bold">SA</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-[#001F3D]">{adminName}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">{adminRole}</p>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-slate-50">
                  <div className="p-3 bg-slate-50 rounded-xl text-left">
                    <p className="text-[8px] text-slate-400 uppercase font-bold mb-1">Employee ID</p>
                    <p className="text-[11px] font-bold text-[#001F3D]">{activeAdmin?.id.split('-')[0] || 'ID_PR_XXXX'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-left">
                    <p className="text-[8px] text-slate-400 uppercase font-bold mb-1">Access Tier</p>
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold px-2 py-0">COMMAND</Badge>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full mt-6 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest gap-2"
                  onClick={onLogout}
                >
                  <LogOut className="h-3.5 w-3.5" /> Terminate Session
                </Button>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[2rem] space-y-10">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Identity Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Network Alias</Label>
                      <Input 
                        value={adminName} 
                        onChange={(e) => setAdminName(e.target.value)}
                        className="h-11 bg-slate-50 border-none text-xs rounded-xl focus-visible:ring-primary/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Functional Role</Label>
                      <Input 
                        value={adminRole} 
                        onChange={(e) => setAdminRole(e.target.value)}
                        className="h-11 bg-slate-50 border-none text-xs rounded-xl focus-visible:ring-primary/20" 
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="access" className="m-0">
          <UserManagement users={users} onSaveUser={onSaveUser} onDeleteUser={onDeleteUser} />
        </TabsContent>

        <TabsContent value="matrix" className="m-0">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Access Control Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Hierarchical Security Assignment Ledger</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Target Identity:</span>
                <Select value={currentUserMatrix?.id || ''} onValueChange={setSelectedUserForMatrix}>
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
                      <div className="h-12 w-12 rounded-2xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">
                        {currentUserMatrix.name ? currentUserMatrix.name.charAt(0) : '?'}
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
                  <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium">Select a verified user identity from the directory above to initialize the hierarchical access matrix.</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
