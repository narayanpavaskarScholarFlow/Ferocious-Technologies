"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shield, 
  Settings, 
  Bell, 
  Monitor, 
  Key, 
  Save, 
  LogOut, 
  CheckCircle2, 
  ShieldAlert,
  Cpu,
  Zap,
  Lock,
  Users,
  ShieldCheck,
  RefreshCw,
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
  Eye,
  Edit2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/user-management';
import { SystemUser, PermissionLevel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ACCESS_PAGES = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'routing', label: 'Routing', icon: Layers },
  { id: 'quality', label: 'QA', icon: ShieldCheck },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'work-log', label: 'Work Log', icon: ClipboardList },
  { id: 'telemetry', label: 'Telemetry', icon: Cpu },
  { id: 'resources', label: 'Resources', icon: Users },
  { id: 'sqcdp', label: 'SQCDP', icon: LineChart },
  { id: 'pipeline', label: 'Pipeline', icon: Package },
  { id: 'vendors', label: 'Vendors', icon: Truck },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
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
          ...u.permissions,
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
        <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200">
          <TabsTrigger value="profile" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="h-3.5 w-3.5 mr-2" /> Admin Profile
          </TabsTrigger>
          <TabsTrigger value="access" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5 mr-2" /> User Directory
          </TabsTrigger>
          <TabsTrigger value="matrix" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Access Matrix
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
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-widest">Access Control Matrix</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">Granular Security Assignment Ledger</p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase">SECURE_MODE</Badge>
            </div>
            
            <ScrollArea className="w-full">
              <div className="min-w-[1200px]">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="w-[200px] sticky left-0 bg-white z-20 font-bold text-[9px] uppercase text-slate-400 py-6 px-8 border-r border-slate-50">Identity</TableHead>
                      {ACCESS_PAGES.map(page => (
                        <TableHead key={page.id} className="text-center min-w-[100px]">
                          <div className="flex flex-col items-center gap-1.5">
                            <page.icon className="h-3.5 w-3.5 text-slate-300" />
                            <span className="font-bold text-[8px] uppercase tracking-tighter text-slate-400 leading-none">{page.label}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id} className="hover:bg-slate-50/30 h-16 border-slate-50">
                        <TableCell className="sticky left-0 bg-white z-10 px-8 border-r border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#001F3D]">{user.name}</span>
                            <span className="text-[8px] text-slate-400 font-code uppercase">{user.id}</span>
                          </div>
                        </TableCell>
                        {ACCESS_PAGES.map(page => (
                          <TableCell key={page.id} className="p-2">
                            <div className="flex justify-center">
                              <Select 
                                value={user.permissions[page.id] || 'none'} 
                                onValueChange={(val) => handleUpdatePermission(user.id, page.id, val as PermissionLevel)}
                              >
                                <SelectTrigger className={cn(
                                  "h-8 border-none text-[8px] font-bold uppercase w-[80px] rounded-lg transition-all",
                                  user.permissions[page.id] === 'full' ? "bg-accent/10 text-accent" :
                                  user.permissions[page.id] === 'edit' ? "bg-primary/10 text-primary" :
                                  user.permissions[page.id] === 'read' ? "bg-slate-100 text-slate-500" :
                                  "bg-slate-50 text-slate-300"
                                )}>
                                  <SelectValue placeholder="Access" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="none" className="text-[8px] font-bold uppercase">Forbidden</SelectItem>
                                  <SelectItem value="read" className="text-[8px] font-bold uppercase">Monitor</SelectItem>
                                  <SelectItem value="edit" className="text-[8px] font-bold uppercase">Operator</SelectItem>
                                  <SelectItem value="full" className="text-[8px] font-bold uppercase">Command</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={ACCESS_PAGES.length + 1} className="h-40 text-center text-slate-300 font-code text-[10px] uppercase">
                          No users available for matrix assignment
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
