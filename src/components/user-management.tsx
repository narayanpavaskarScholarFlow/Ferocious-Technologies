
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
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Key,
  Check,
  Edit2,
  UserX,
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SystemUser, PermissionLevel } from '@/lib/types';

const JOB_TITLES = [
  "Manager",
  "Supervisor",
  "VMC Programmer",
  "VMC Operator",
  "Tool Maker",
  "Senior Tool Maker"
];

const DEPARTMENTS = [
  "Admin",
  "Account",
  "Market",
  "Design",
  "Tool Room",
  "VMC Milling",
  "CNC Turning",
  "Assembly",
  "Quality"
];

interface UserManagementProps {
  users: SystemUser[];
  onUsersChange: (users: SystemUser[]) => void;
}

export function UserManagement({ users, onUsersChange }: UserManagementProps) {
  const { toast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [step, setStep] = useState(1);
  
  // Wizard Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    deptCode: '',
    password: ''
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleRegisterUser = () => {
    if (!formData.name || !formData.email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Identity name and email are required."
      });
      return;
    }

    if (editingUser) {
      onUsersChange(users.map(u => u.id === editingUser.id ? {
        ...u,
        name: formData.name,
        email: formData.email,
        role: formData.jobTitle,
        dept: formData.deptCode,
      } : u));

      toast({
        title: "Identity Updated",
        description: `Identity details for ${formData.name} have been synchronized.`,
      });
    } else {
      const newUser: SystemUser = {
        id: `USER-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        email: formData.email,
        role: formData.jobTitle || 'Standard Operator',
        dept: formData.deptCode || 'GEN-01',
        permissions: { overview: 'read' },
        lastLogin: 'Never',
        status: 'offline'
      };

      onUsersChange([...users, newUser]);
      toast({
        title: "User Registered",
        description: `${newUser.name} has been added. Manage permissions in the Access Matrix.`,
      });
    }

    setIsWizardOpen(false);
    resetWizard();
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: '',
      jobTitle: user.role,
      deptCode: user.dept,
      password: '••••••••'
    });
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    onUsersChange(users.filter(u => u.id !== id));
    toast({
      title: "User Revoked",
      description: "Access privileges have been terminated.",
      variant: "destructive"
    });
  };

  const resetWizard = () => {
    setStep(1);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      jobTitle: '',
      deptCode: '',
      password: ''
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-end px-2">
         <Button 
          className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          onClick={() => {
            resetWizard();
            setIsWizardOpen(true);
          }}
         >
           <UserPlus className="h-4 w-4" /> Register New User
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8 overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-2xl min-h-[500px] flex flex-col">
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2 p-5 border-b border-slate-100">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-red" />
              <span className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">Live Identity Ledger</span>
            </div>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-5 px-8">User Identity</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Functional Role</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Last Session</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="flex-1">
            {users.length > 0 ? users.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                <TableCell className="px-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {user.status === 'online' && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[#001F3D]">{user.name}</span>
                      <span className="text-[9px] text-slate-400 font-code uppercase tracking-tighter">{user.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{user.role}</span>
                    <span className="text-[9px] text-slate-400 font-medium uppercase">{user.dept}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-code text-slate-400">{user.lastLogin}</span>
                </TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-primary"
                      onClick={() => handleEditUser(user)}
                     >
                       <Edit2 className="h-3.5 w-3.5" />
                     </Button>
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => handleDeleteUser(user.id)}
                     >
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
                    <p className="text-[#001F3D] font-headline font-bold text-xs uppercase tracking-widest">No Users Registered</p>
                    <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">Initialize security matrix by onboarding your first user.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Security Summary</h3>
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="space-y-4">
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-all">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Active Sessions</p>
                  <p className="text-4xl font-headline font-bold text-[#001F3D]">{users.filter(u => u.status === 'online').length}</p>
                  <div className="h-1 w-8 bg-primary rounded-full mt-4 group-hover:w-12 transition-all duration-500" />
               </div>
               
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-red-500/30 transition-all">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total Identities</p>
                  <p className="text-4xl font-headline font-bold text-[#001F3D]">{users.length}</p>
                  <div className="h-1 w-8 bg-red-500 rounded-full mt-4 group-hover:w-12 transition-all duration-500" />
               </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem]">
          <DialogTitle className="sr-only">
            {editingUser ? 'Edit User Identity Protocol' : 'New User Onboarding Protocol'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Sequence for registering or modifying administrative and operator identities within the Command Matrix.
          </DialogDescription>
          
          <div className="flex h-[600px]">
            <div className="w-72 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-4 bg-[#001F3D] rounded-2xl w-fit shadow-xl shadow-primary/20 relative">
                  {editingUser ? <Shield className="h-7 w-7 text-white" /> : <UserPlus className="h-7 w-7 text-white" />}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="space-y-8">
                  {[
                    { s: 1, label: editingUser ? 'Update Identity' : 'Register Identity', desc: 'NAME & CONTACT' },
                    { s: 2, label: 'Role Setup', desc: 'DEPT & FUNCTION' },
                    { s: 3, label: 'Credentials', desc: 'SECURITY SETUP' },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-5 group relative">
                      {item.s < 3 && (
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
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-red-500 rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">{editingUser ? 'Update' : '01. Identity'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Foundational Contact Protocols</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Full Legal Name</Label>
                        <Input 
                          placeholder="e.g. Miloš Kovařík" 
                          className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/20"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Network Email Address</Label>
                        <Input 
                          placeholder="name@toolroom.tech" 
                          className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/20"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-red-500 rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">02. Role Setup</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Organizational Placement</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Functional Job Title</Label>
                        <Select value={formData.jobTitle} onValueChange={(val) => setFormData({...formData, jobTitle: val})}>
                          <SelectTrigger className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus:ring-primary/20">
                            <SelectValue placeholder="Select functional title..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                            {JOB_TITLES.map(title => (
                              <SelectItem key={title} value={title} className="text-xs font-bold uppercase">{title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Department</Label>
                        <Select value={formData.deptCode} onValueChange={(val) => setFormData({...formData, deptCode: val})}>
                          <SelectTrigger className="h-12 bg-slate-50/50 border-none text-xs rounded-xl focus:ring-primary/20">
                            <SelectValue placeholder="Select department..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                            {DEPARTMENTS.map(dept => (
                              <SelectItem key={dept} value={dept} className="text-xs font-bold uppercase">{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-red-500 rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">03. Credentials</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Secure Link Initialization</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Temporary Master Key</Label>
                        <div className="relative">
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 bg-slate-50/50 border-none text-xs rounded-xl pr-14 focus-visible:ring-primary/20"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                          <Key className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                      <div className="p-6 bg-red-500/[0.03] rounded-2xl border border-red-500/10 flex gap-5 items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
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
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost"
                    onClick={() => setIsWizardOpen(false)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Abort
                  </Button>
                  <Button 
                    onClick={step === 3 ? handleRegisterUser : nextStep}
                    className={cn(
                      "rounded-xl px-10 h-12 font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 flex gap-3",
                      step === 3 ? "bg-red-600 hover:bg-red-700 shadow-red-600/30" : "bg-[#001F3D] hover:bg-[#002d4f] shadow-primary/30"
                    )}
                  >
                    {step === 3 ? (editingUser ? 'Save Changes' : 'Commit & Finalize') : 'Execute Next Step'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
