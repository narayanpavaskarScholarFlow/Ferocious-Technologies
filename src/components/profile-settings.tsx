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
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/user-management';

interface ProfileSettingsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
}

export function ProfileSettings({ activeTab = 'profile', onTabChange, onLogout }: ProfileSettingsProps) {
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
            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> System Access Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="m-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Profile Card */}
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

              <Card className="p-6 bg-primary/[0.02] border-primary/10 border shadow-sm rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary rounded-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest">Security Signal</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Your identity is verified via <span className="font-bold text-[#001F3D]">Biometric Protocol V2</span>. Last deep-security audit was completed <span className="text-primary font-bold">2.4h ago</span>.
                </p>
              </Card>
            </div>

            {/* Settings Area */}
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
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Primary Network Email</Label>
                      <Input defaultValue="admin_01@toolroom.tech" className="h-11 bg-slate-50 border-none text-xs rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Contact Signal</Label>
                      <Input defaultValue="+1 (555) 900-1200" className="h-11 bg-slate-50 border-none text-xs rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                    <Lock className="h-5 w-5 text-accent" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Credentials & Access</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-40">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temporary Master Key</p>
                        <p className="text-xs font-bold text-[#001F3D]">••••••••••••••••</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-fit h-8 text-[9px] font-bold uppercase tracking-widest border-slate-200 rounded-lg group">
                        <RefreshCw className="h-3 w-3 mr-2 group-hover:rotate-180 transition-transform" />
                        Reset Key Protocol
                      </Button>
                    </div>

                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-40">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">2FA Enforcement</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-red" />
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">ACTIVE_SECURE</span>
                          </div>
                        </div>
                        <ShieldAlert className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-[9px] text-slate-400 leading-snug">Multi-factor verification is mandatory for root access tier accounts.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-l-4 border-slate-200 pl-4">
                    <Settings className="h-5 w-5 text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Matrix Configuration</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Audit Log Live Stream', desc: 'Enable real-time security events in command header.', icon: Zap },
                      { label: 'Asset Telemetry Overlay', desc: 'Display node health index on operational charts.', icon: Cpu },
                      { label: 'Critical Alert Notifications', desc: 'Dispatch signal interruptions to contact links.', icon: Bell },
                    ].map((pref, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary/5">
                            <pref.icon className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-[#001F3D]">{pref.label}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">{pref.desc}</p>
                          </div>
                        </div>
                        <Switch defaultChecked={i < 2} className="data-[state=checked]:bg-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="access" className="m-0">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
