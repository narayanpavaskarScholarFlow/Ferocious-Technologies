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
  Check
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

export function UserManagement() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPages, setSelectedPages] = useState<string[]>(['overview']);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const togglePage = (id: string) => {
    setSelectedPages(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
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
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
          <div className="flex h-[600px]">
            {/* Sidebar Steps */}
            <div className="w-64 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="p-3 bg-primary rounded-xl w-fit">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-6">
                  {[
                    { s: 1, label: 'Register New User', desc: 'Identify basic details' },
                    { s: 2, label: 'Access Control', desc: 'Define page permissions' },
                    { s: 3, label: 'User Profile', desc: 'Functional role setup' },
                    { s: 4, label: 'Credentials', desc: 'Security establishment' },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-4 group">
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-500",
                        step === item.s ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" : 
                        step > item.s ? "bg-green-500 border-green-500 text-white" : "border-slate-200 text-slate-400"
                      )}>
                        {step > item.s ? <Check className="h-3 w-3" /> : item.s}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-xs font-bold transition-colors duration-500",
                          step === item.s ? "text-slate-900" : "text-slate-400"
                        )}>{item.label}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                ERP Onboarding v2.4
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-10 flex flex-col justify-between">
              <div className="space-y-8">
                {step === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-900">01. Identity Registration</h3>
                      <p className="text-sm text-muted-foreground mt-1">Provide the foundational details for the user account.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Full Name</Label>
                        <Input placeholder="e.g. Miloš Kovařík" className="h-12 bg-slate-50 border-none text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Email Address</Label>
                        <Input placeholder="name@toolroom.tech" className="h-12 bg-slate-50 border-none text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-900">02. Access Control Matrix</h3>
                      <p className="text-sm text-muted-foreground mt-1">Select the functional areas this user is authorized to visit.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {ACCESS_PAGES.map((page) => (
                        <div 
                          key={page.id}
                          onClick={() => togglePage(page.id)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group",
                            selectedPages.includes(page.id) ? "bg-primary/5 border-primary/20" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <Checkbox 
                            checked={selectedPages.includes(page.id)} 
                            onCheckedChange={() => togglePage(page.id)}
                            className="rounded-full h-5 w-5"
                          />
                          <span className={cn(
                            "text-xs font-bold transition-colors",
                            selectedPages.includes(page.id) ? "text-primary" : "text-slate-600 group-hover:text-slate-900"
                          )}>{page.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-900">03. User Profile Setup</h3>
                      <p className="text-sm text-muted-foreground mt-1">Assign roles and departmental locations.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Professional Role</Label>
                        <Input placeholder="e.g. Lead Machinist" className="h-12 bg-slate-50 border-none text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Department</Label>
                        <Input placeholder="e.g. Quality Assurance" className="h-12 bg-slate-50 border-none text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-900">04. Credentials</h3>
                      <p className="text-sm text-muted-foreground mt-1">Finalize the security layer for the new account.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Initial Password</Label>
                        <div className="relative">
                          <Input type="password" placeholder="••••••••" className="h-12 bg-slate-50 border-none text-sm pr-10" />
                          <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                        <Shield className="h-5 w-5 text-blue-600 shrink-0" />
                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                          By finalizing, the system will send an <span className="font-bold text-blue-700">activation link</span> to the registered email address.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                
                {step < 4 ? (
                  <Button 
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    Next Step <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsWizardOpen(false)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-600/20"
                  >
                    Complete Registration <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
