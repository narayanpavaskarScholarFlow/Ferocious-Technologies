
"use client";

import { useState, useMemo } from 'react';
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
  UserCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/user-management';
import { SystemUser, PermissionLevel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const ACCESS_PAGES = [
  { id: 'overview', label: 'Command Overview', icon: LayoutGrid },
  { id: 'orders', label: 'Production Orders', icon: ShoppingCart },
  { id: 'routing', label: 'Operational Routing', icon: Layers },
  { id: 'quality', label: 'Quality Assurance', icon: ShieldCheck },
  { id: 'inventory', label: 'Material Ledger', icon: Boxes },
  { id: 'billing', label: 'Financial Hub', icon: CreditCard },
  { id: 'work-log', label: 'Operator Work Log', icon: ClipboardList },
  { id: 'telemetry', label: 'Asset Telemetry', icon: Monitor },
  { id: 'resources', label: 'Resource Management', icon: Users },
  { id: 'sqcdp', label: 'SQCDP Board', icon: LineChart },
  { id: 'pipeline', label: 'CRM / Pipeline', icon: Package },
  { id: 'vendors', label: 'Supply Chain', icon: Truck },
  { id: 'schedule', label: 'Master Schedule', icon: Calendar },
];

interface ProfileSettingsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  users: SystemUser[];
  onUsersChange: (users: SystemUser[]) => void;
}

export function ProfileSettings({ 
  activeTab = 'profile', 
  onTabChange, 
  onLogout,
  users,
  onUsersChange
}: ProfileSettingsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUserForMatrix, setSelectedUserForMatrix] = useState<string | null>(null);

  // Robustly find the user to display in the matrix
  const currentUserMatrix = useMemo(() => {
    if (users.length === 0) return null;
    const found = users.find(u => u.id === selectedUserForMatrix);
    return found || users[0];
  }, [users, selectedUserForMatrix]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuration Synchronized",
        description: "Administrative profile for Sys_Admin_01 has been updated."
      });
    }, 1000);
  };

  const handleUpdatePermission = (userId: string, pageId: string, level: PermissionLevel) => {
    onUsersChange(users.map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        permissions: {
          ...(u.permissions || {}),
          [pageId]: level
        }
      };
    }));
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
              onClick={handleSave}
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
                    <AvatarImage src="https://picsum.photos/seed/erp-user/200/200" />
                    <AvatarFallback className="bg-primary text-white text-xl font-bold">SA</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-[#001F3D]">Sys_Admin_01</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Plant Controller / Root Admin</p>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-slate-50">
                  <div className="p-3 bg-slate-50 rounded-xl text-left">
                    <p className="text-[8px] text-slate-400 uppercase font-bold mb-1">Employee ID</p>
                    <p className="text-[11px] font-bold text-[#001F3D]">ID_PR_0012</p>
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
                      <Input defaultValue="Sys_Admin_01" className="h-11 bg-slate-50 border-none text-xs rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Functional Role</Label>
                      <Input defaultValue="Plant Controller" className="h-11 bg-slate-50 border-none text-xs rounded-xl" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="access" className="m-0">
          <UserManagement users={users} onUsersChange={onUsersChange} />
        </TabsContent>

        <TabsContent value="matrix" className="m-0">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Access Control Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Granular Security Assignment Ledger</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Select Identity:</span>
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
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                  <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-[#001F3D] text-white flex items-center justify-center font-display font-bold text-lg">
                        {currentUserMatrix.name ? currentUserMatrix.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{currentUserMatrix.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{currentUserMatrix.role} • {currentUserMatrix.dept}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-widest px-4 py-1.5 h-8">SECURE_ACTIVE</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {ACCESS_PAGES.map(page => {
                      const currentLevel = (currentUserMatrix.permissions && currentUserMatrix.permissions[page.id]) || 'none';
                      const Icon = page.icon;
                      
                      return (
                        <div key={page.id} className="group p-5 bg-white border border-slate-100 rounded-[1.5rem] flex flex-col gap-5 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                                <Icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{page.label}</span>
                            </div>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              currentLevel === 'full' ? "bg-accent animate-pulse" : 
                              currentLevel === 'edit' ? "bg-primary" : 
                              currentLevel === 'read' ? "bg-emerald-500" : "bg-slate-200"
                            )} />
                          </div>

                          <Select 
                            value={currentLevel} 
                            onValueChange={(val) => handleUpdatePermission(currentUserMatrix.id, page.id, val as PermissionLevel)}
                          >
                            <SelectTrigger className={cn(
                              "h-10 border-none text-[10px] font-bold uppercase rounded-xl transition-all shadow-sm",
                              currentLevel === 'full' ? "bg-accent/10 text-accent" :
                              currentLevel === 'edit' ? "bg-primary/10 text-primary" :
                              currentLevel === 'read' ? "bg-emerald-50 text-emerald-600" :
                              "bg-slate-50 text-slate-400"
                            )}>
                              <SelectValue placeholder="Access Level" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                              <SelectItem value="none" className="text-[10px] font-bold uppercase">No Access</SelectItem>
                              <SelectItem value="read" className="text-[10px] font-bold uppercase">View</SelectItem>
                              <SelectItem value="edit" className="text-[10px] font-bold uppercase">Edit</SelectItem>
                              <SelectItem value="full" className="text-[10px] font-bold uppercase">Full control</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center">
                  <div className="p-8 bg-slate-50 rounded-full mb-6">
                    <Shield className="h-16 w-16 text-slate-300" />
                  </div>
                  <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Required</h4>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Select a user from the directory to initialize the access matrix.</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
