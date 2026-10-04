
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
  Eye,
  EyeOff,
  Phone,
  Network,
  Camera,
  Upload,
  UserCircle,
  Hash,
  Fingerprint,
  Share2,
  Mail,
  Lock,
  ShieldAlert,
  Search,
  ExternalLink,
  Cpu,
  DollarSign
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
import { sendCredentials } from '@/ai/flows/send-credentials-flow';
import { Checkbox } from '@/components/ui/checkbox';

const JOB_TITLES = [
  "HR",
  "Manager",
  "Supervisor",
  "VMC Programmer",
  "VMC Operator",
  "Tool Maker",
  "Senior Tool Maker",
  "Plant Controller"
];

const DEPARTMENTS = [
  "Admin",
  "Marketing",
  "R&D",
  "Design",
  "Engineering",
  "Tool Room",
  "Quality",
  "Production",
  "Accounts"
];

const MACHINE_ACCESS_LIST = [
  "VMC",
  "CNC Turning",
  "Surface Grinding",
  "VMM"
];

const REPORTING_MANAGERS = [
  "Master Admin",
  "Manager",
  "Supervisor"
];

interface UserManagementProps {
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
  onDeleteUser: (userId: string) => void;
  onNavigateToDetail: (userId: string) => void;
}

export function UserManagement({ users, onSaveUser, onDeleteUser, onNavigateToDetail }: UserManagementProps) {
  const { toast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Wizard Form State
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    deptCode: '',
    reportingManager: '',
    password: '',
    image: undefined as string | undefined,
    machineAccess: [] as string[],
    approvalLimit: 0
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleMachine = (machine: string) => {
    const current = formData.machineAccess || [];
    const updated = current.includes(machine) 
      ? current.filter(m => m !== machine) 
      : [...current, machine];
    updateField('machineAccess', updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('image', reader.result as string);
        toast({ title: "Visual Matrix Cached", description: "Identity photo initialized for onboarding." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Full credentials (Username, First/Last Name, and Password) are required."
      });
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const finalIdentifier = formData.username.toLowerCase().replace(/\s/g, '');

    if (editingUser) {
      const updatedUser: SystemUser = {
        ...editingUser,
        username: finalIdentifier,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: fullName,
        email: finalIdentifier,
        password: formData.password,
        phone: formData.phone || '',
        role: formData.jobTitle || editingUser.role,
        dept: formData.deptCode || editingUser.dept,
        reportingManager: formData.reportingManager || '',
        image: formData.image || editingUser.image || '',
        machineAccess: formData.machineAccess,
        approvalLimit: formData.approvalLimit
      };
      
      onSaveUser(updatedUser);

      toast({
        title: "Identity Updated",
        description: `Identity details for ${fullName} have been synchronized.`,
      });
    } else {
      const newUser: SystemUser = {
        id: formData.id || `USER-${Math.floor(1000 + Math.random() * 9000)}`,
        username: finalIdentifier,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: fullName,
        email: finalIdentifier,
        password: formData.password,
        phone: formData.phone || '',
        role: formData.jobTitle || 'Standard Operator',
        dept: formData.deptCode || 'Admin',
        reportingManager: formData.reportingManager || '',
        image: formData.image || '',
        permissions: { overview: 'read' },
        lastLogin: 'Never',
        status: 'offline',
        machineAccess: formData.machineAccess,
        approvalLimit: formData.approvalLimit
      };

      onSaveUser(newUser);

      // Call Genkit AI flow to simulate credential dispatch
      sendCredentials({
        name: fullName,
        email: finalIdentifier,
        role: newUser.role,
        temporaryPassword: formData.password
      }).then(res => {
        if (res.success) {
          toast({
            title: "Credentials Dispatched",
            description: `Login protocols transmitted to ${finalIdentifier}.`,
          });
        }
      });

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
      id: user.id,
      username: user.username || user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      jobTitle: user.role,
      deptCode: user.dept,
      reportingManager: user.reportingManager || '',
      password: user.password || '',
      image: user.image,
      machineAccess: user.machineAccess || [],
      approvalLimit: user.approvalLimit || 0
    });
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    onDeleteUser(id);
    toast({
      title: "User Revoked",
      description: "Access privileges have been terminated.",
      variant: "destructive"
    });
  };

  const handleShareCredentials = (user: SystemUser) => {
    sendCredentials({
      name: user.name,
      email: user.email,
      role: user.role,
      temporaryPassword: user.password || '---'
    }).then(res => {
      if (res.success) {
        toast({
          title: "Identity Re-Transmitted",
          description: `Security protocols for ${user.name} sent to ${user.email}.`,
        });
      }
    });
  };

  const resetWizard = () => {
    setStep(1);
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      id: '',
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      deptCode: '',
      reportingManager: '',
      password: '',
      image: undefined,
      machineAccess: [],
      approvalLimit: 0
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by name, ID or username..." 
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm text-xs font-bold uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="w-full md:w-auto rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          onClick={() => {
            resetWizard();
            setIsWizardOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" /> Register New User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-12 overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-2xl min-h-[500px] flex flex-col">
          <div className="bg-slate-50/50">
            <div className="flex items-center gap-2 p-5 border-b border-slate-100">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-red" />
              <span className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">Live Identity Ledger</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-white">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-5 px-8 border-r border-slate-100">User Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 border-r border-slate-100">Username</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 border-r border-slate-100">Functional Role</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 border-r border-slate-100 text-center">Approval Limit</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 border-r border-slate-100">Email Identifier</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 border-r border-slate-100">Password</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 h-24 border-b border-slate-100 group transition-colors">
                    <TableCell className="px-8 border-r border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200 overflow-hidden">
                            {user.image ? (
                              <img src={user.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-sm">{user.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}</span>
                            )}
                          </div>
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white shadow-sm",
                            user.status === 'online' || user.status === 'active' ? "bg-green-500" : "bg-slate-300"
                          )} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-[#001F3D]">{user.name}</span>
                          <span className="text-[9px] text-slate-400 font-code uppercase tracking-tighter mt-1">ID: {user.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-slate-50">
                      <Badge variant="outline" className="font-code text-[10px] bg-slate-50 text-slate-500 border-slate-200 px-3">
                        @{user.username || 'not_set'}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{user.role}</span>
                        <span className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">{user.dept}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-slate-50 text-center">
                       <span className="text-[11px] font-display font-bold text-[#001F3D]">₹ {(user.approvalLimit || 0).toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="border-r border-slate-50">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-slate-300" />
                        <span className="text-[10px] font-medium text-slate-600 truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-slate-50">
                      <div className="flex items-center gap-2 group/pass">
                        <Lock className="h-3 w-3 text-slate-300" />
                        <span className="text-[10px] font-code font-bold text-slate-700 blur-[2px] group-hover/pass:blur-none transition-all">{user.password || '---'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-[#001F3D] rounded-lg"
                          title="View Profile & Access Matrix"
                          onClick={() => onNavigateToDetail(user.id)}
                         >
                           <ExternalLink className="h-4 w-4" />
                         </Button>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                          title="Share Credentials"
                          onClick={() => handleShareCredentials(user)}
                         >
                           <Share2 className="h-3.5 w-3.5" />
                         </Button>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                          title="Quick Edit"
                          onClick={() => handleEditUser(user)}
                         >
                           <Edit2 className="h-3.5 w-3.5" />
                         </Button>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg"
                          title="Delete Node"
                          onClick={() => handleDeleteUser(user.id)}
                         >
                           <Trash2 className="h-3.5 w-3.5" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-[400px] text-center bg-white">
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
            </Table>
          </div>
        </Card>
      </div>

      <Dialog open={isWizardOpen} onOpenChange={(open) => {
        setIsWizardOpen(open);
        if (!open) resetWizard();
      }}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>{editingUser ? 'Edit User Identity Protocol' : 'New User Onboarding Protocol'}</DialogTitle>
            <DialogDescription>Identity registration matrix.</DialogDescription>
          </DialogHeader>
          
          <div className="flex h-[600px]">
            <div className="w-72 bg-slate-900 p-10 border-r border-slate-800 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-4 bg-primary rounded-2xl w-fit shadow-xl shadow-primary/20 relative">
                  {editingUser ? <Shield className="h-7 w-7 text-white" /> : <UserPlus className="h-7 w-7 text-white" />}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="space-y-8">
                  {[
                    { s: 1, label: editingUser ? 'Update Identity' : 'Register Identity', desc: 'NAME & USERNAME' },
                    { s: 2, label: 'Role Setup', desc: 'DEPT & FUNCTION' },
                    { s: 3, label: 'Credentials', desc: 'SECURITY SETUP' },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-5 group relative">
                      {item.s < 3 && (
                        <div className={cn(
                          "absolute left-3 top-8 w-[1px] h-10 transition-colors",
                          step > item.s ? "bg-emerald-500" : "bg-slate-700"
                        )} />
                      )}
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10",
                        step === item.s ? "bg-white border-white text-slate-900 scale-125 shadow-lg shadow-white/20" : 
                        step > item.s ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                      )}>
                        {step > item.s ? <Check className="h-3 w-3" /> : item.s}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-bold transition-colors duration-500 leading-none",
                          step === item.s ? "text-white" : "text-slate-500"
                        )}>{item.label}</span>
                        <span className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.15em] mt-1.5">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                ERP_AUTO_ONBOARD_V2.4
              </div>
            </div>

            <div className="flex-1 p-12 flex flex-col justify-between overflow-hidden bg-white">
              <div className="space-y-10 flex-grow overflow-y-auto pr-4 -mr-4 hide-scrollbar">
                {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-red-500 rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">{editingUser ? 'Update' : '01. Identity'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Foundational Identity Protocols</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-8 items-start">
                      <div className="relative group/photo shrink-0">
                        <div className="h-24 w-24 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-lg bg-slate-100 flex items-center justify-center">
                          {formData.image ? (
                            <img src={formData.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <UserCircle className="h-12 w-12 text-slate-300" />
                          )}
                        </div>
                        <input 
                          type="file" 
                          id="onboard-photo-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <label 
                          htmlFor="onboard-photo-upload"
                          className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Camera className="h-4 w-4" />
                        </label>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Employee ID</Label>
                            <Input 
                              placeholder="e.g. ID_PR_001" 
                              className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus-visible:ring-primary/20"
                              value={formData.id}
                              onChange={(e) => updateField('id', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Username</Label>
                            <div className="relative">
                              <Input 
                                placeholder="unique_alias" 
                                className="h-12 bg-slate-50 border-none text-xs rounded-xl pl-10 focus-visible:ring-primary/20"
                                value={formData.username}
                                onChange={(e) => {
                                  const val = e.target.value.toLowerCase().replace(/\s/g, '');
                                  setFormData(prev => ({ ...prev, username: val, email: val }));
                                }}
                              />
                              <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">First Name</Label>
                            <Input 
                              placeholder="John" 
                              className="h-12 bg-slate-50 border-none text-xs rounded-xl focus-visible:ring-primary/20"
                              value={formData.firstName}
                              onChange={(e) => updateField('firstName', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Last Name</Label>
                            <Input 
                              placeholder="Operator" 
                              className="h-12 bg-slate-50 border-none text-xs rounded-xl focus-visible:ring-primary/20"
                              value={formData.lastName}
                              onChange={(e) => updateField('lastName', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Contact number</Label>
                            <div className="relative">
                              <Input 
                                placeholder="+91 00000 00000" 
                                className="h-12 bg-slate-50 border-none text-xs rounded-xl pl-10 focus-visible:ring-primary/20"
                                value={formData.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                              />
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-red-500 rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">{editingUser ? 'Update' : '02. Role Setup'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Organizational Placement</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Functional Role</Label>
                          <Select value={formData.jobTitle} onValueChange={(val) => updateField('jobTitle', val)}>
                            <SelectTrigger className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus:ring-primary/20">
                              <SelectValue placeholder="Select role..." />
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
                          <Select value={formData.deptCode} onValueChange={(val) => updateField('deptCode', val)}>
                            <SelectTrigger className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl focus:ring-primary/20">
                              <SelectValue placeholder="Select dept..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl">
                              {DEPARTMENTS.map(dept => (
                                <SelectItem key={dept} value={dept} className="text-xs font-bold uppercase">{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                           <Cpu className="h-3.5 w-3.5" /> Machine Access Authorization
                         </Label>
                         <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                            {MACHINE_ACCESS_LIST.map(machine => (
                              <div key={machine} className="flex items-center space-x-3">
                                <Checkbox 
                                  id={`machine-${machine}`} 
                                  checked={formData.machineAccess?.includes(machine)}
                                  onCheckedChange={() => handleToggleMachine(machine)}
                                />
                                <Label htmlFor={`machine-${machine}`} className="text-[10px] font-bold uppercase text-slate-600 cursor-pointer">{machine}</Label>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Approval Limit (₹)</Label>
                          <div className="relative">
                            <Input 
                              type="number"
                              placeholder="0.00" 
                              className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl pl-10 focus-visible:ring-primary/20"
                              value={formData.approvalLimit}
                              onChange={(e) => updateField('approvalLimit', Number(e.target.value))}
                            />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Reporting manager</Label>
                          <Select 
                            value={formData.reportingManager} 
                            onValueChange={(val) => updateField('reportingManager', val)}
                          >
                            <SelectTrigger className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl pl-10 relative focus:ring-primary/20">
                              <Network className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                              <SelectValue placeholder="Identify supervisor node..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl">
                              {REPORTING_MANAGERS.map(manager => (
                                <SelectItem key={manager} value={manager} className="text-xs font-bold uppercase">{manager}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Secure Identity Initialization</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Password</Label>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="e.g. Pass_1234" 
                            className="h-12 bg-slate-50 border-none text-xs rounded-xl pr-14 focus-visible:ring-primary/20"
                            value={formData.password}
                            onChange={(e) => updateField('password', e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors z-20"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="p-6 bg-red-500/[0.03] rounded-2xl border border-red-500/10 flex gap-5 items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                          This security key will be required for gateway entry. Users can view and modify their own credentials within their Profile Settings.
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
                      step === 3 ? "bg-red-600 hover:bg-red-700 shadow-red-600/30" : "bg-[#001F3D] hover:bg-black shadow-primary/20"
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
