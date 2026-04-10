"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SystemUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Search,
  UserX,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Check,
  Edit2,
  Trash2,
  Plus,
  CalendarDays,
  Clock,
  ClipboardList,
  Info
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export interface AnnualLeaveEntry {
  id: string;
  description: string;
  month: string;
  dates: string;
  year: number;
  reason: string;
  status: 'Planned' | 'Approved';
  startDate: string; // ISO date
  endDate: string;   // ISO date
}

interface ManpowerUtilizationProps {
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
}

export function ManpowerUtilization({ users, onSaveUser }: ManpowerUtilizationProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddAnnualOpen, setIsAddAnnualOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const [newAnnual, setNewAnnual] = useState({
    description: '',
    month: MONTHS[new Date().getMonth()],
    dates: '',
    reason: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  });

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    dept: '',
    shift: 'Morning' as any,
    email: ''
  });

  const annualQuery = useMemoFirebase(() => collection(db, 'annual_leaves'), [db]);
  const { data: annualLeavesRaw } = useCollection<AnnualLeaveEntry>(annualQuery);
  const annualLeaves = annualLeavesRaw || [];

  const handleEditStaff = (user: SystemUser) => {
    setEditingUserId(user.id);
    setNewStaff({
      name: user.name,
      role: user.role,
      dept: user.dept,
      shift: user.shift || 'Morning',
      email: user.email
    });
    setStep(1);
    setIsAddStaffOpen(true);
  };

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.role || !newStaff.dept) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Full identity, role, and department assignment required."
      });
      return;
    }

    const member: SystemUser = {
      id: editingUserId || `USER-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newStaff.name.trim(),
      email: newStaff.email || `${newStaff.name.toLowerCase().replace(' ', '.')}@bharataxis.tech`,
      role: newStaff.role,
      dept: newStaff.dept,
      status: editingUserId ? (users.find(u => u.id === editingUserId)?.status || 'active') : 'active',
      shift: newStaff.shift,
      efficiency: editingUserId ? (users.find(u => u.id === editingUserId)?.efficiency || 0) : 0,
      permissions: editingUserId ? (users.find(u => u.id === editingUserId)?.permissions || { overview: 'read' }) : { overview: 'read' },
      lastLogin: editingUserId ? (users.find(u => u.id === editingUserId)?.lastLogin || 'Never') : 'Never'
    };

    onSaveUser(member);
    toast({
      title: editingUserId ? "Identity Synchronized" : "Resource Synchronized",
      description: `${member.name} has been updated in the master resource pool.`
    });

    setIsAddStaffOpen(false);
    setEditingUserId(null);
    setStep(1);
    setNewStaff({ name: '', role: '', dept: '', shift: 'Morning', email: '' });
  };

  const handleAddAnnualLeave = () => {
    if (!newAnnual.description || !newAnnual.startDate || !newAnnual.endDate) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: "Holiday description and specific start/end dates are required."
      });
      return;
    }

    const entryId = `AL-${Date.now()}`;
    const entry: AnnualLeaveEntry = {
      id: entryId,
      description: newAnnual.description,
      month: newAnnual.month,
      dates: `${new Date(newAnnual.startDate).getDate()} - ${new Date(newAnnual.endDate).getDate()}`,
      year: new Date(newAnnual.startDate).getFullYear(),
      reason: newAnnual.reason,
      status: 'Planned',
      startDate: newAnnual.startDate,
      endDate: newAnnual.endDate
    };

    setDocumentNonBlocking(doc(db, 'annual_leaves', entryId), entry, { merge: true });
    
    toast({
      title: "Plan Synchronized",
      description: `Company holiday "${entry.description}" has been committed to the ledger.`
    });

    setIsAddAnnualOpen(false);
    setNewAnnual({ description: '', month: MONTHS[new Date().getMonth()], dates: '', reason: '', year: new Date().getFullYear(), startDate: '', endDate: '' });
  };

  const handleDeleteAnnual = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'annual_leaves', id));
    toast({
      title: "Plan Removed",
      description: "The holiday record has been purged from the directory.",
      variant: "destructive"
    });
  };

  const safeUsers = users || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Users className="h-4 w-4" />
            Human Resources & Ops
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900 uppercase">
            Resource <span className="text-slate-400 font-medium">Management</span>
          </h2>
          <p className="text-muted-foreground font-medium">Coordinate manpower availability, leave planning, and shift efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 h-10 px-6 font-bold text-[10px] uppercase tracking-widest rounded-full">
            Available Resources: {safeUsers.length}
          </Badge>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm">
          <TabsTrigger value="overview" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            Operational Overview
          </TabsTrigger>
          <TabsTrigger value="balance" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            Leave Balance
          </TabsTrigger>
          <TabsTrigger value="apply" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            Apply Leave
          </TabsTrigger>
          <TabsTrigger value="planned" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            Planned Leave
          </TabsTrigger>
          <TabsTrigger value="annual" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
            Annual Holiday Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 m-0">
          {safeUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeUsers.map((member) => (
                <Card key={member.id} className="p-8 border-slate-200/60 shadow-xl bg-white hover:border-primary/50 transition-all rounded-[2rem] group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-4 border-slate-50 shadow-sm">
                          <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                          member.status === 'online' || member.status === 'active' ? "bg-emerald-500" : "bg-slate-300"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{member.name}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">{member.role} • {member.dept}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleEditStaff(member)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assigned Shift</p>
                      <p className="text-[10px] font-bold text-slate-700">{member.shift || 'Morning'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Operational Status</p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[8px] font-bold uppercase py-0.5 px-3 rounded-full border shadow-sm",
                          member.status === 'active' || member.status === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          member.status === 'break' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        )}
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
              <div className="p-8 bg-slate-50 rounded-full mb-6">
                <UserX className="h-16 w-16 text-slate-300" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Resource Pool Offline</p>
              <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">No personnel data detected in the master directory. Use Settings to register your first node.</p>
            </div>
          )}

          <Card className="p-10 border-slate-200/60 shadow-2xl bg-white rounded-[2.5rem]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 border-l-4 border-primary pl-4">Resource Skill Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {[
                { label: 'Milling', value: safeUsers.filter(s => s.dept === 'VMC Milling').length * 20 },
                { label: 'Turning', value: safeUsers.filter(s => s.dept === 'CNC Turning').length * 20 },
                { label: 'Quality Assurance', value: safeUsers.filter(s => s.dept === 'Quality').length * 20 },
                { label: 'Logistics Node', value: safeUsers.filter(s => s.dept === 'Market').length * 20 },
              ].map((skill) => (
                <div key={skill.label} className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-bold uppercase text-slate-600 tracking-widest">{skill.label}</p>
                    <span className="text-[10px] font-code font-bold text-primary">{Math.min(skill.value, 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner p-[1px]">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(skill.value, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="m-0 space-y-8">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#001F3D] rounded-xl shadow-lg shadow-primary/20">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Plant Holiday Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">General Capacity Availability Ledger</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setIsAddAnnualOpen(true)}
                  className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Matrix Entry
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Holiday / Event Description</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Month & Year</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Specific Dates</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Rational / Reason</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                    <TableHead className="text-right px-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {annualLeaves && annualLeaves.length > 0 ? annualLeaves.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group transition-colors">
                      <TableCell className="px-10">
                        <div className="flex items-center gap-4">
                          <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center font-bold text-primary text-[10px] border border-primary/10 uppercase">
                            <Info className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{plan.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase px-3 py-1 border-slate-200 text-slate-500">
                          {plan.month} {plan.year}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 font-code text-xs font-bold text-slate-600">
                          <Clock className="h-3 w-3 text-slate-300" /> {plan.startDate} to {plan.endDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-500 italic line-clamp-1">{plan.reason || 'N/A'}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-bold uppercase px-3">
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-200 hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleDeleteAnnual(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-80 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30 py-10">
                          <div className="p-8 bg-slate-50 rounded-[2rem] mb-6">
                            <CalendarDays className="h-16 w-16 text-slate-300" />
                          </div>
                          <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Planning Ledger Offline</p>
                          <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto font-medium">No annual holiday plans detected. Execute the "Add Matrix Entry" protocol to initialize.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="m-0">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Resource Leave Ledger</h3>
              </div>
              <div className="relative w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input placeholder="Filter resource ID..." className="pl-10 h-10 bg-white border-slate-200 text-xs rounded-xl shadow-sm" />
              </div>
            </div>
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Resource Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Annual (PL)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Sick (SL)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Casual (CL)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center text-primary px-10">Total Credited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeUsers.map((user) => (
                  <TableRow key={user.id} className="h-20 border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="px-10">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#001F3D] uppercase tracking-tight">{user.name}</span>
                        <span className="text-[9px] text-slate-400 font-code font-bold uppercase tracking-tighter mt-0.5">{user.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-code text-xs font-bold text-slate-600">12 d</TableCell>
                    <TableCell className="text-center font-code text-xs font-bold text-slate-600">06 d</TableCell>
                    <TableCell className="text-center font-code text-xs font-bold text-slate-600">08 d</TableCell>
                    <TableCell className="text-center font-code text-sm text-primary font-bold px-10">26 DAYS</TableCell>
                  </TableRow>
                ))}
                {safeUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-code text-[10px] italic uppercase tracking-widest">_NO_RESOURCE_DATA_FOUND_</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="apply" className="m-0 max-w-2xl mx-auto">
          <Card className="p-12 bg-white border-slate-200/60 shadow-2xl rounded-[3rem] space-y-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col gap-2 border-l-4 border-primary pl-6">
                <h3 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Request Leave</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Initiation Sequence</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Leave Type</Label>
                  <Select>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner">
                      <SelectValue placeholder="Select classification..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Annual" className="text-xs font-bold uppercase">Annual Leave (PL)</SelectItem>
                      <SelectItem value="Sick" className="text-xs font-bold uppercase">Sick Leave (SL)</SelectItem>
                      <SelectItem value="Casual" className="text-xs font-bold uppercase">Casual Leave (CL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Resource Node</Label>
                  <Select>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner">
                      <SelectValue placeholder="Identify user..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {safeUsers.map(u => (
                        <SelectItem key={u.id} value={u.id} className="text-xs font-bold uppercase">{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Window Start</Label>
                  <Input type="date" className="h-14 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Window End</Label>
                  <Input type="date" className="h-14 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Rational / Description</Label>
                <Input placeholder="Enter brief technical reason for absence..." className="h-20 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner" />
              </div>

              <Button className="w-full h-16 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-[1.5rem] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex gap-3 group">
                Submit Leave Application 
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddAnnualOpen} onOpenChange={setIsAddAnnualOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="space-y-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit">
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Holiday Matrix Entry</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Execute planning protocol for plant-wide holiday allocation.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Holiday / Event Description</Label>
              <Input 
                placeholder="e.g. Ganesh Chaturthi / Annual Maintenance Shutdown" 
                className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner"
                value={newAnnual.description}
                onChange={(e) => setNewAnnual({...newAnnual, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Start Date</Label>
                <Input 
                  type="date"
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner"
                  value={newAnnual.startDate}
                  onChange={(e) => setNewAnnual({...newAnnual, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">End Date</Label>
                <Input 
                  type="date"
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner"
                  value={newAnnual.endDate}
                  onChange={(e) => setNewAnnual({...newAnnual, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Rationale / Notes</Label>
              <Input 
                placeholder="Brief reason for holiday window..." 
                className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner"
                value={newAnnual.reason}
                onChange={(e) => setNewAnnual({...newAnnual, reason: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                variant="ghost" 
                className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400"
                onClick={() => setIsAddAnnualOpen(false)}
              >
                Abort Protocol
              </Button>
              <Button 
                className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                onClick={handleAddAnnualLeave}
              >
                Commit to Ledger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddStaffOpen} onOpenChange={(open) => {
        setIsAddStaffOpen(open);
        if (!open) setEditingUserId(null);
      }}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem]">
          <DialogTitle className="sr-only">{editingUserId ? 'Edit Personnel Identity' : 'Personnel Registration Protocol'}</DialogTitle>
          <DialogDescription className="sr-only">Update or register human resources for operational tracking and scheduling.</DialogDescription>
          
          <div className="flex h-[600px]">
            <div className="w-72 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-4 bg-[#001F3D] rounded-2xl w-fit shadow-xl shadow-primary/20 relative">
                  {editingUserId ? <Edit2 className="h-7 w-7 text-white" /> : <UserPlus className="h-7 w-7 text-white" />}
                  <div className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white animate-pulse", editingUserId ? "bg-primary" : "bg-green-500")} />
                </div>
                <div className="space-y-8">
                  {[
                    { s: 1, label: editingUserId ? 'Modify Identity' : 'Identify Resource', desc: 'NAME & PERSONAL' },
                    { s: 2, label: 'Redeployment', desc: 'DEPT & SHIFT' },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-5 group relative">
                      {item.s < 2 && (
                        <div className={cn(
                          "absolute left-3 top-8 w-[1px] h-10 transition-colors",
                          step > item.s ? "bg-emerald-500" : "bg-slate-200"
                        )} />
                      )}
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10 shadow-sm",
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
                {editingUserId ? 'RESOURCE_MOD_V2.4' : 'RESOURCE_REG_V2.4'}
              </div>
            </div>

            <div className="flex-1 p-12 flex flex-col justify-between overflow-hidden bg-white">
              <div className="space-y-10 flex-grow overflow-hidden flex flex-col">
                {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">01. {editingUserId ? 'Update' : 'Identity'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Resource Registration Base</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Personnel Full Name</Label>
                        <Input 
                          placeholder="e.g. John Operator" 
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl shadow-inner focus-visible:ring-primary/20"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Email Address</Label>
                        <Input 
                          placeholder="e.g. john@bharataxis.tech" 
                          className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl shadow-inner focus-visible:ring-primary/20"
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Functional Role</Label>
                        <Select value={newStaff.role} onValueChange={(val) => setNewStaff({...newStaff, role: val})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl shadow-inner focus:ring-primary/20">
                            <SelectValue placeholder="Select designation..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                            {JOB_TITLES.map(title => (
                              <SelectItem key={title} value={title} className="text-xs font-bold uppercase">{title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">02. {editingUserId ? 'Re-Allocation' : 'Deployment'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Allocation</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Department</Label>
                        <Select value={newStaff.dept} onValueChange={(val) => setNewStaff({...newStaff, dept: val})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl shadow-inner focus:ring-primary/20">
                            <SelectValue placeholder="Select dept..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                            {DEPARTMENTS.map(dept => (
                              <SelectItem key={dept} value={dept} className="text-xs font-bold uppercase">{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Primary Shift</Label>
                        <Select value={newStaff.shift} onValueChange={(val) => setNewStaff({...newStaff, shift: val as any})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none text-xs font-bold rounded-xl shadow-inner focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                            <SelectItem value="Morning" className="text-xs font-bold uppercase">Morning Shift</SelectItem>
                            <SelectItem value="Evening" className="text-xs font-bold uppercase">Evening Shift</SelectItem>
                            <SelectItem value="Night" className="text-xs font-bold uppercase">Night Shift</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(s => s - 1)} 
                  disabled={step === 1}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#001F3D] px-0"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Protocol Back
                </Button>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      setIsAddStaffOpen(false);
                      setEditingUserId(null);
                    }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Abort
                  </Button>
                  <Button 
                    onClick={step === 2 ? handleAddStaff : () => setStep(s => s + 1)}
                    className={cn(
                      "rounded-xl px-10 h-12 font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 flex gap-3",
                      step === 2 ? "bg-primary hover:bg-[#002d4f] shadow-primary/30" : "bg-[#001F3D] hover:bg-black shadow-primary/20"
                    )}
                  >
                    {step === 2 ? (editingUserId ? 'Synchronize Identity' : 'Commit & Finalize') : 'Execute Next Step'}
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
