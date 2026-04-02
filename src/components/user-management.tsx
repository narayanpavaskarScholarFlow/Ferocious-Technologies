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
  Phone
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

const usersData = [
  { id: '1', name: 'Admin Root', email: 'admin@toolroom.io', role: 'System Admin', lastLogin: '2 mins ago', status: 'online' },
  { id: '2', name: 'Miloš Kovařík', email: 'm.kovarik@toolroom.io', role: 'Plant Manager', lastLogin: '1 hour ago', status: 'offline' },
  { id: '3', name: 'Sarah Miller', email: 's.miller@toolroom.io', role: 'Operator', lastLogin: 'Yesterday', status: 'offline' },
];

const ACCESS_PAGES = [
  { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
  { id: 'production', label: 'Production Orders', icon: Shield },
  { id: 'routing', label: 'Operational Routing', icon: Shield },
  { id: 'inventory', label: 'Material Inventory', icon: Shield },
  { id: 'billing', label: 'Financial Billing', icon: Shield },
  { id: 'resources', label: 'Resource Management', icon: Shield },
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
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Shield className="h-4 w-4" />
            Security Governance
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            System Access Control
          </h2>
          <p className="text-muted-foreground font-medium">Manage identity verification and role-based permissions.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-8 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
            onClick={() => {
              setStep(1);
              setIsWizardOpen(true);
            }}
           >
             <UserPlus className="h-4 w-4" /> Register New User
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main User Matrix */}
        <Card className="lg:col-span-8 overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-[300px]">User Identity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Permissions</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Last Activity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {user.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-code">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase gap-2 px-3 py-1 bg-white border-slate-200",
                      user.role === 'System Admin' ? "text-red-600" : "text-slate-600"
                    )}>
                      {user.role === 'System Admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-medium">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary">
                         <MoreHorizontal className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Security Summary Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-8">Security Summary</h3>
            
            <div className="space-y-6">
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Active Sessions</p>
                  <p className="text-4xl font-display font-bold text-slate-900">12</p>
                  <div className="h-1 w-12 bg-primary rounded-full mt-4" />
               </div>
               
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Login Failures (24h)</p>
                  <p className="text-4xl font-display font-bold text-red-500">0</p>
                  <div className="h-1 w-12 bg-red-500 rounded-full mt-4" />
               </div>

               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Audit Log Integrity</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Verified ✓</span>
                  </div>
               </div>
            </div>
          </Card>

          <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <p className="text-xs font-medium text-slate-600 leading-snug">
              Two-factor authentication is currently <span className="font-bold text-primary">enforced</span> for all administrative accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Registration Wizard Automation */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>User Onboarding Wizard</DialogTitle>
            <DialogDescription>Follow the 4-step process to register a new user and assign granular permissions.</DialogDescription>
          </DialogHeader>
          <div className="flex h-[750px]">
            {/* Sidebar Steps */}
            <div className="w-72 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-4 bg-primary rounded-2xl w-fit shadow-xl shadow-primary/20">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-8">
                  {[
                    { s: 1, label: 'Register New User', desc: 'IDENTITY & CONTACT DETAILS' },
                    { s: 2, label: 'Access Control', desc: 'DEFINE PAGE PERMISSIONS' },
                    { s: 3, label: 'User Profile', desc: 'FUNCTIONAL ROLE SETUP' },
                    { s: 4, label: 'Credentials', desc: 'SECURITY ESTABLISHMENT' },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-5 group relative">
                      {item.s < 4 && (
                        <div className={cn(
                          "absolute left-3 top-8 w-[1px] h-10 transition-colors",
                          step > item.s ? "bg-green-500" : "bg-slate-200"
                        )} />
                      )}
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10",
                        step === item.s ? "bg-primary border-primary text-white scale-125 shadow-lg shadow-primary/30" : 
                        step > item.s ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-400"
                      )}>
                        {step > item.s ? <Check className="h-3 w-3" /> : item.s}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-sm font-bold transition-colors duration-500 leading-none",
                          step === item.s ? "text-slate-900" : "text-slate-400"
                        )}>{item.label}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1.5">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                ERP ONBOARDING V2.4
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-12 flex flex-col justify-between overflow-hidden bg-white">
              <div className="space-y-10 flex-grow overflow-hidden flex flex-col">
                {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">01. Identity Registration</h3>
                      <p className="text-base text-muted-foreground mt-2">Provide the foundational details for the new user account.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Full Name</Label>
                        <Input placeholder="e.g. Miloš Kovařík" className="h-14 bg-slate-50/50 border-none text-base rounded-2xl focus-visible:ring-primary/20" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Email Address</Label>
                        <Input placeholder="name@toolroom.tech" className="h-14 bg-slate-50/50 border-none text-base rounded-2xl focus-visible:ring-primary/20" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Mobile Number</Label>
                        <Input placeholder="+1 (555) 000-0000" className="h-14 bg-slate-50/50 border-none text-base rounded-2xl focus-visible:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 flex flex-col flex-grow overflow-hidden">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">02. Access Control Matrix</h3>
                      <p className="text-base text-muted-foreground mt-2">Define granular permission levels for each functional area.</p>
                    </div>
                    <div className="space-y-4 overflow-y-auto pr-4 flex-grow custom-scrollbar">
                      {ACCESS_PAGES.map((page) => (
                        <div 
                          key={page.id}
                          className={cn(
                            "p-6 rounded-[1.5rem] border transition-all duration-500 flex flex-col gap-6",
                            permissions[page.id] ? "bg-primary/[0.03] border-primary/20 shadow-sm" : "bg-white border-slate-100"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                permissions[page.id] ? "bg-white shadow-sm" : "bg-slate-50"
                              )}>
                                <page.icon className={cn(
                                  "h-5 w-5 transition-colors",
                                  permissions[page.id] ? "text-primary" : "text-slate-400"
                                )} />
                              </div>
                              <span className={cn(
                                "text-base font-bold transition-colors",
                                permissions[page.id] ? "text-slate-900" : "text-slate-500"
                              )}>{page.label}</span>
                            </div>
                            <div 
                              onClick={() => handleTogglePage(page.id, !permissions[page.id])}
                              className={cn(
                                "h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                                permissions[page.id] ? "bg-primary border-primary text-white" : "bg-white border-slate-200"
                              )}
                            >
                              {permissions[page.id] && <Check className="h-3.5 w-3.5" />}
                            </div>
                          </div>
                          
                          {permissions[page.id] && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 pt-2">
                              <RadioGroup 
                                value={permissions[page.id]} 
                                onValueChange={(val) => handleSetPermission(page.id, val as PermissionLevel)}
                                className="grid grid-cols-3 gap-3"
                              >
                                {[
                                  { id: 'read', label: 'Read Only', icon: Eye },
                                  { id: 'edit', label: 'Edit', icon: Edit2 },
                                  { id: 'full', label: 'Full Control', icon: ShieldCheck }
                                ].map((opt) => (
                                  <div key={opt.id} className="relative group/opt">
                                    <RadioGroupItem value={opt.id} id={`${page.id}-${opt.id}`} className="sr-only" />
                                    <Label 
                                      htmlFor={`${page.id}-${opt.id}`} 
                                      className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer text-center h-full justify-center",
                                        permissions[page.id] === opt.id 
                                          ? "bg-white border-primary text-primary shadow-md" 
                                          : "bg-white/50 border-transparent hover:border-slate-200 text-slate-400"
                                      )}
                                    >
                                      <opt.icon className={cn("h-4 w-4", permissions[page.id] === opt.id ? "text-primary" : "text-slate-300")} />
                                      <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
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
                      <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">03. User Profile Setup</h3>
                      <p className="text-base text-muted-foreground mt-2">Assign professional roles and departmental locations.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Professional Role</Label>
                        <Input placeholder="e.g. Lead Machinist" className="h-14 bg-slate-50/50 border-none text-base rounded-2xl focus-visible:ring-primary/20" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Department</Label>
                        <Input placeholder="e.g. Quality Assurance" className="h-14 bg-slate-50/50 border-none text-base rounded-2xl focus-visible:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">04. Credentials</h3>
                      <p className="text-base text-muted-foreground mt-2">Finalize the security layer for the new account.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Initial Password</Label>
                        <div className="relative">
                          <Input type="password" placeholder="••••••••" className="h-14 bg-slate-50/50 border-none text-base rounded-2xl pr-14 focus-visible:ring-primary/20" />
                          <Key className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        </div>
                      </div>
                      <div className="p-6 bg-primary/[0.03] rounded-[1.5rem] border border-primary/10 flex gap-5 items-center">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                          By finalizing, the system will generate a secure identity token and send an <span className="font-bold text-primary">activation link</span> to the user.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-transparent px-0"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                
                <Button 
                  onClick={step === 4 ? () => setIsWizardOpen(false) : nextStep}
                  className={cn(
                    "rounded-full px-10 h-14 font-bold text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 flex gap-3",
                    step === 4 ? "bg-green-600 hover:bg-green-700 shadow-green-600/30" : "bg-primary hover:bg-primary/90 shadow-primary/30"
                  )}
                >
                  {step === 4 ? 'Complete Registration' : 'Next Step'}
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
