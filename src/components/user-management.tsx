"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  UserPlus, 
  Shield, 
  User, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Lock,
  Key,
  LayoutDashboard,
  Check,
  Eye,
  Edit2,
  Settings2,
  ShieldCheck,
  Circle,
  Phone,
  ShoppingCart,
  Layers,
  Boxes,
  CreditCard,
  ClipboardList,
  Cpu,
  Users,
  LineChart,
  Package,
  Truck,
  Calendar,
  UserX,
  Zap
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const usersData: any[] = [];

const ACCESS_PAGES = [
  { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Production Orders', icon: ShoppingCart },
  { id: 'routing', label: 'Operational Routing', icon: Layers },
  { id: 'quality', label: 'Quality Assurance', icon: ShieldCheck },
  { id: 'inventory', label: 'Material Inventory', icon: Boxes },
  { id: 'billing', label: 'Financial Billing', icon: CreditCard },
  { id: 'work-log', label: 'Work Log Ledger', icon: ClipboardList },
  { id: 'telemetry', label: 'Asset Telemetry', icon: Cpu },
  { id: 'resources', label: 'Resource Mgmt', icon: Users },
  { id: 'sqcdp', label: 'SQCDP Board', icon: LineChart },
  { id: 'pipeline', label: 'Customer Pipeline', icon: Package },
  { id: 'vendors', label: 'Vendor Mgmt', icon: Truck },
  { id: 'schedule', label: 'Master Schedule', icon: Calendar },
];

type PermissionLevel = 'read' | 'edit' | 'full';

export function UserManagement() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [permissions, setPermissions] = useState<Record<string, PermissionLevel>>({
    overview: 'read'
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleTogglePage = (id: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => ({ ...prev, [id]: 'read' }));
    } else {
      const newPerms = { ...permissions };
      delete newPerms[id];
      setPermissions(newPerms);
    }
  };

  const handleSetPermission = (id: string, level: PermissionLevel) => {
    setPermissions(prev => ({ ...prev, [id]: level }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-accent font-bold text-[9px] uppercase tracking-[0.3em]">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-red" />
            Security Governance
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            System Access <span className="text-slate-400 font-medium">Control</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Manage identity verification and role-based permissions.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
            onClick={() => {
              setStep(1);
              setIsWizardOpen(true);
            }}
           >
             <UserPlus className="h-4 w-4" /> Register New User
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8 overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-2xl min-h-[500px] flex flex-col">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-5 px-8">User Identity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Permissions</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Last Activity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="flex-1">
              {usersData.length > 0 ? usersData.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                          {user.name.split(' ').map((n: any) => n[0]).join('')}
                        </div>
                        {user.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#001F3D]">{user.name}</span>
                        <span className="text-[9px] text-slate-400 font-code">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-bold uppercase gap-1.5 px-2.5 py-0.5 bg-white border-slate-200",
                      user.role === 'System Admin' ? "text-accent border-accent/20" : "text-primary border-primary/20"
                    )}>
                      {user.role === 'System Admin' ? <Shield className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] text-slate-500 font-medium font-code">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                         <Edit2 className="h-3.5 w-3.5" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-accent">
                         <Trash2 className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center opacity-30 py-10">
                      <div className="p-6 bg-slate-50 rounded-full mb-6">
                        <UserX className="h-12 w-12 text-slate-300" />
                      </div>
                      <p className="text-[#001F3D] font-headline font-bold text-xs uppercase tracking-widest">No Users Registered in System</p>
                      <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">Initialize security matrix by onboarding your first administrative or operational user.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col gap-8">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Security Summary</h3>
            <div className="space-y-4">
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-all">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Active Sessions</p>
                  <p className="text-4xl font-headline font-bold text-[#001F3D]">0</p>
                  <div className="h-1 w-8 bg-primary rounded-full mt-4 group-hover:w-12 transition-all duration-500" />
               </div>
               
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-accent/30 transition-all">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Login Failures (24h)</p>
                  <p className="text-4xl font-headline font-bold text-accent">0</p>
                  <div className="h-1 w-8 bg-accent rounded-full mt-4 group-hover:w-12 transition-all duration-500" />
               </div>

               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-emerald-500/30 transition-all">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-2">Audit Log Integrity</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System Verified ✓</span>
                  </div>
               </div>
            </div>
          </Card>
          
          <div className="p-6 bg-[#001F3D]/[0.02] border border-[#001F3D]/10 rounded-2xl flex items-start gap-4">
            <div className="h-2 w-2 rounded-full bg-accent mt-1 animate-pulse-red" />
            <div>
              <p className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest">Enforcement Note</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                Two-factor authentication is currently <span className="font-bold text-[#001F3D]">enforced</span> for all administrative and executive plant accounts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>User Onboarding Wizard</DialogTitle>
            <DialogDescription>Automated ERP registration flow with mobile capture and permission matrix.</DialogDescription>
          </DialogHeader>
          <div className="flex h-[750px]">
            <div className="w-72 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-4 bg-[#001F3D] rounded-2xl w-fit shadow-xl shadow-primary/20">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-8">
                  {[
                    { s: 1, label: 'Register New User', desc: 'IDENTITY & CONTACT' },
                    { s: 2, label: 'Access Control', desc: 'DEFINE PERMISSIONS' },
                    { s: 3, label: 'User Profile', desc: 'ORGANIZATIONAL ROLE' },
                    { s: 4, label: 'Credentials', desc: 'SECURITY SETUP' },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-5 group relative">
                      {item.s < 4 && (
                        <div className={cn(
                          "absolute left-3 top-8 w-[1px] h-10 transition-colors",
                          step > item.s ? "bg-emerald-500" : "bg-slate-200"
                        )} />
                      )}
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10",
                        step === item.s ? "bg-[#001F3D] border-[#001F3D] text-white scale-125 shadow-lg shadow-primary/30" : 
                        step > item.s ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-400"
                      )}>
                        {step > item.s ? <Check className="h-3 w-3" /> : item.s}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-bold transition-colors duration-500 leading-none",
                          step === item.s ? "text-[#001F3D]" : "text-slate-400"
                        )}>{item.label}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.15em] mt-1.5">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                ERP_AUTO_ONBOARD_V2.4
              </div>
            </div>

            <div className="flex-1 p-12 flex flex-col justify-between overflow-hidden bg-white">
              <div className="space-y-10 flex-grow overflow-hidden flex flex-col">
                {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">01. Identity</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Foundational Contact Protocols</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Full Legal Name</Label>
                        <Input placeholder="e.g. Miloš Kovařík" className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Network Email Address</Label>
                        <Input placeholder="name@toolroom.tech" className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Primary Mobile Link</Label>
                        <Input placeholder="+1 (555) 000-0000" className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 flex flex-col flex-grow overflow-hidden">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">02. Access Matrix</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Granular Permission Assignments</p>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-4 flex-grow custom-scrollbar">
                      {ACCESS_PAGES.map((page) => (
                        <div 
                          key={page.id}
                          className={cn(
                            "p-5 rounded-2xl border transition-all duration-500 flex flex-col gap-4",
                            permissions[page.id] ? "bg-primary/[0.03] border-primary/20" : "bg-white border-slate-100"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2.5 rounded-lg transition-colors",
                                permissions[page.id] ? "bg-white shadow-sm" : "bg-slate-50"
                              )}>
                                <page.icon className={cn(
                                  "h-4 w-4 transition-colors",
                                  permissions[page.id] ? "text-primary" : "text-slate-400"
                                )} />
                              </div>
                              <span className={cn(
                                "text-[11px] font-bold uppercase tracking-tight transition-colors",
                                permissions[page.id] ? "text-[#001F3D]" : "text-slate-400"
                              )}>{page.label}</span>
                            </div>
                            <div 
                              onClick={() => handleTogglePage(page.id, !permissions[page.id])}
                              className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                                permissions[page.id] ? "bg-[#001F3D] border-[#001F3D] text-white" : "bg-white border-slate-200"
                              )}
                            >
                              {permissions[page.id] && <Check className="h-3 w-3" />}
                            </div>
                          </div>
                          {permissions[page.id] && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                              <RadioGroup 
                                value={permissions[page.id]} 
                                onValueChange={(val) => handleSetPermission(page.id, val as PermissionLevel)}
                                className="grid grid-cols-3 gap-2"
                              >
                                {[
                                  { id: 'read', label: 'Monitor', icon: Eye },
                                  { id: 'edit', label: 'Operator', icon: Edit2 },
                                  { id: 'full', label: 'Command', icon: ShieldCheck }
                                ].map((opt) => (
                                  <div key={opt.id} className="relative">
                                    <RadioGroupItem value={opt.id} id={`${page.id}-${opt.id}`} className="sr-only" />
                                    <Label 
                                      htmlFor={`${page.id}-${opt.id}`} 
                                      className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer text-center",
                                        permissions[page.id] === opt.id 
                                          ? "bg-white border-primary text-primary shadow-sm" 
                                          : "bg-white/50 border-transparent hover:border-slate-200 text-slate-400"
                                      )}
                                    >
                                      <opt.icon className={cn("h-3 w-3", permissions[page.id] === opt.id ? "text-primary" : "text-slate-300")} />
                                      <span className="text-[8px] font-bold uppercase tracking-widest">{opt.label}</span>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">03. Role Setup</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Organizational Placement</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Functional Job Title</Label>
                        <Input placeholder="e.g. Lead Machinist" className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Department Code</Label>
                        <Input placeholder="e.g. QA-01" className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">04. Credentials</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Secure Link Initialization</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Temporary Master Key</Label>
                        <div className="relative">
                          <Input type="password" placeholder="••••••••" className="h-12 bg-slate-50/50 border-none text-xs rounded-xl pr-14 focus-visible:ring-primary/20" />
                          <Key className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                      <div className="p-6 bg-emerald-500/[0.03] rounded-2xl border border-emerald-500/10 flex gap-5 items-center">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <ShieldCheck className="h-6 w-6 text-emerald-500" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                          Secure activation link and 2FA setup instructions will be dispatched automatically to the registered network email.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#001F3D] hover:bg-transparent px-0"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Protocol Back
                </Button>
                <Button 
                  onClick={step === 4 ? () => setIsWizardOpen(false) : nextStep}
                  className={cn(
                    "rounded-xl px-10 h-12 font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 flex gap-3",
                    step === 4 ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30" : "bg-[#001F3D] hover:bg-[#002d4f] shadow-primary/30"
                  )}
                >
                  {step === 4 ? 'Commit & Finalize' : 'Execute Next Step'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
