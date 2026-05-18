
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
import { SystemUser, UserLeave } from '@/lib/types';
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
  Info,
  CalendarCheck,
  Wallet,
  Shield,
  RefreshCw,
  LayoutGrid,
  Send,
  AlertCircle,
  User,
  ArchiveX
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
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

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
  startDate: string; 
  endDate: string;
}

interface ManpowerUtilizationProps {
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
  currentUser?: string | null;
  initialSubTab?: string;
}

export function ManpowerUtilization({ users, onSaveUser, currentUser, initialSubTab = 'overview' }: ManpowerUtilizationProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [isAddAnnualOpen, setIsAddAnnualOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const currentUserData = useMemo(() => {
    return users.find(u => u.name === currentUser || u.email === currentUser);
  }, [users, currentUser]);

  const isAuthorized = useMemo(() => {
    return currentUser === 'Master Admin' || currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager';
  }, [currentUser, currentUserData]);

  // Leave Application Form State
  const [leaveForm, setLeaveForm] = useState({
    type: 'Annual' as any,
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Annual Holiday State
  const [newAnnual, setNewAnnual] = useState({
    description: '',
    month: MONTHS[new Date().getMonth()],
    dates: '',
    reason: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  });

  const annualQuery = useMemoFirebase(() => collection(db, 'annual_leaves'), [db]);
  const { data: annualLeavesRaw } = useCollection<AnnualLeaveEntry>(annualQuery);
  const annualLeaves = annualLeavesRaw || [];

  const leavesQuery = useMemoFirebase(() => collection(db, 'leaves'), [db]);
  const { data: allLeavesData } = useCollection<UserLeave>(leavesQuery);
  const allLeaves = allLeavesData || [];

  const myLeaves = useMemo(() => {
    if (!currentUserData) return [];
    return allLeaves.filter(l => l.userId === currentUserData.id);
  }, [allLeaves, currentUserData]);

  const handleUpdateBalance = (userId: string, field: 'annual' | 'sick' | 'casual', value: string) => {
    if (!isAuthorized) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const numValue = parseInt(value) || 0;
    const currentBalance = user.leaveBalance || { annual: 0, sick: 0, casual: 0 };
    
    const updatedUser: SystemUser = {
      ...user,
      leaveBalance: {
        ...currentBalance,
        [field]: numValue
      }
    };

    onSaveUser(updatedUser);
    toast({
      title: "Balance Adjusted",
      description: `Leave credit for ${user.name} has been modified.`
    });
  };

  const handleApplyLeave = async () => {
    if (!currentUserData) return;
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "All fields are mandatory for leave application." });
      return;
    }

    setIsApplying(true);
    const leaveId = `LVE-${Date.now()}`;
    const leave: UserLeave = {
      id: leaveId,
      userId: currentUserData.id,
      userName: currentUserData.name,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: 'Pending'
    };

    setDocumentNonBlocking(doc(db, 'leaves', leaveId), leave, { merge: true });

    setTimeout(() => {
      setIsApplying(false);
      toast({ title: "Application Transmitted", description: "Your leave request node has been added to the HR queue." });
      setLeaveForm({ type: 'Annual', startDate: '', endDate: '', reason: '' });
      setActiveTab('planned');
    }, 800);
  };

  const handleAddAnnualLeave = () => {
    if (!isAuthorized) return;
    if (!newAnnual.description || !newAnnual.startDate || !newAnnual.endDate) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Holiday description and dates are required." });
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
    toast({ title: "Plan Synchronized", description: `Company holiday committed to the matrix.` });
    setIsAddAnnualOpen(false);
    setNewAnnual({ description: '', month: MONTHS[new Date().getMonth()], dates: '', reason: '', year: new Date().getFullYear(), startDate: '', endDate: '' });
  };

  const handleDeleteAnnual = (id: string) => {
    if (!isAuthorized) return;
    deleteDocumentNonBlocking(doc(db, 'annual_leaves', id));
    toast({ title: "Plan Removed", description: "Record purged from matrix.", variant: "destructive" });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm">
          <TabsTrigger value="overview" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-sm transition-all">Workforce Matrix</TabsTrigger>
          <TabsTrigger value="balance" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-sm transition-all">Leave Balance</TabsTrigger>
          <TabsTrigger value="apply" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-sm transition-all">Apply Leave</TabsTrigger>
          <TabsTrigger value="planned" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-sm transition-all">Planned Leave</TabsTrigger>
          <TabsTrigger value="annual" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-sm transition-all">Plant Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((member) => (
              <Card key={member.id} className="p-8 border-slate-200 shadow-xl bg-white hover:border-primary/50 transition-all rounded-[2rem] group relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <Avatar className="h-14 w-14 border-4 border-slate-50 shadow-sm">
                        <AvatarImage src={member.image} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{member.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{member.role} • {member.dept}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-10 font-bold text-[9px] uppercase tracking-widest gap-2 border-slate-200" onClick={() => setActiveTab('balance')}>
                    <Wallet className="h-3 w-3" /> Balance
                  </Button>
                  <Button className="flex-1 rounded-xl h-10 font-bold text-[9px] uppercase tracking-widest gap-2 bg-[#001F3D] hover:bg-black text-white" onClick={() => setActiveTab('apply')}>
                    <CalendarCheck className="h-3 w-3" /> Apply Leave
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="balance" className="m-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-wider">Resource Leave Matrix</h3>
              </div>
            </div>
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Personnel Node</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Annual (PL)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Sick (SL)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Casual (CL)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center text-primary px-10">Net Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const balance = user.leaveBalance || { annual: 12, sick: 6, casual: 8 };
                  const isSelf = user.id === currentUserData?.id;
                  return (
                    <TableRow key={user.id} className={cn("h-20 border-slate-50 hover:bg-slate-50/30 transition-colors", isSelf && "bg-primary/5")}>
                      <TableCell className="px-10">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[#001F3D] uppercase tracking-tight">{user.name}</span>
                          <span className="text-[9px] text-slate-400 font-code font-bold uppercase mt-0.5">{user.id} {isSelf && "(YOU)"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-code text-xs font-bold">
                        {isAuthorized ? (
                          <Input type="number" className="w-16 h-8 mx-auto text-center border-none bg-slate-50" defaultValue={balance.annual} onBlur={(e) => handleUpdateBalance(user.id, 'annual', e.target.value)} />
                        ) : `${balance.annual} d`}
                      </TableCell>
                      <TableCell className="text-center font-code text-xs font-bold">
                        {isAuthorized ? (
                          <Input type="number" className="w-16 h-8 mx-auto text-center border-none bg-slate-50" defaultValue={balance.sick} onBlur={(e) => handleUpdateBalance(user.id, 'sick', e.target.value)} />
                        ) : `${balance.sick} d`}
                      </TableCell>
                      <TableCell className="text-center font-code text-xs font-bold">
                        {isAuthorized ? (
                          <Input type="number" className="w-16 h-8 mx-auto text-center border-none bg-slate-50" defaultValue={balance.casual} onBlur={(e) => handleUpdateBalance(user.id, 'casual', e.target.value)} />
                        ) : `${balance.casual} d`}
                      </TableCell>
                      <TableCell className="text-center font-code text-sm text-primary font-bold px-10">
                        {balance.annual + balance.sick + balance.casual} DAYS
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="apply" className="m-0 max-w-3xl mx-auto">
          <Card className="p-12 bg-white border-slate-200 shadow-2xl rounded-[3rem] space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><CalendarCheck className="h-24 w-24" /></div>
            <div className="flex flex-col gap-2 border-l-4 border-primary pl-6">
              <h3 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Request Leave</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Initiation Sequence</p>
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Leave Classification</Label>
                  <Select value={leaveForm.type} onValueChange={(val) => setLeaveForm({...leaveForm, type: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="Annual" className="text-xs font-bold uppercase">Annual Leave (PL)</SelectItem>
                      <SelectItem value="Sick" className="text-xs font-bold uppercase">Sick Leave (SL)</SelectItem>
                      <SelectItem value="Casual" className="text-xs font-bold uppercase">Casual Leave (CL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Identity Node</Label>
                  <div className="h-12 bg-slate-100/50 rounded-xl flex items-center px-4 gap-3">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase">{currentUserData?.name || 'Loading Node...'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Start Date</Label>
                  <DatePicker value={leaveForm.startDate} onChange={(val) => setLeaveForm({...leaveForm, startDate: val})} className="h-12" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">End Date</Label>
                  <DatePicker value={leaveForm.endDate} onChange={(val) => setLeaveForm({...leaveForm, endDate: val})} className="h-12" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Reason for Absence</Label>
                <Textarea 
                  placeholder="Provide technical reason for protocol request..." 
                  className="min-h-[120px] bg-slate-50 border-none rounded-2xl p-6 text-xs font-medium resize-none shadow-inner"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                />
              </div>

              <Button 
                disabled={isApplying}
                className="w-full h-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl flex gap-3 group"
                onClick={handleApplyLeave}
              >
                {isApplying ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Submit Leave Application
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="planned" className="m-0 space-y-8">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-wider">My Absence Ledger</h3>
              </div>
              <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[10px] font-bold px-4 h-9 uppercase tracking-widest">
                {myLeaves.length} Protocol Entries
              </Badge>
            </div>
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Application ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Window</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Reason</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myLeaves.map((l) => (
                  <TableRow key={l.id} className="h-20 border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="px-10 font-code text-xs font-bold text-slate-400">{l.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase bg-slate-50 text-slate-500 border-slate-200">{l.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-code text-[10px] font-bold text-slate-600">
                      {l.startDate} TO {l.endDate}
                    </TableCell>
                    <TableCell className="text-[10px] font-medium text-slate-500 italic max-w-[200px] truncate">"{l.reason}"</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "text-[9px] font-bold uppercase px-3 rounded-full",
                        l.status === 'Approved' ? "bg-emerald-50 text-emerald-700" :
                        l.status === 'Rejected' ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      )}>
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {myLeaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20 py-10">
                        <ArchiveX className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">No Absence Protocols Logged</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="m-0 space-y-8">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-[#001F3D] rounded-2xl shadow-xl shadow-blue-900/10">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Plant Holiday Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">Regional Transport Availability Ledger</p>
                </div>
              </div>
              {isAuthorized && (
                <Button onClick={() => setIsAddAnnualOpen(true)} className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-3 h-12 px-10 font-bold text-[10px] uppercase tracking-widest shadow-2xl transition-all">
                  <Plus className="h-4 w-4" /> Add Matrix Entry
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Holiday / Event Description</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Month & Year</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Specific Dates</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                    <TableHead className="text-right px-10 w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {annualLeaves.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                      <TableCell className="px-10">
                        <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{plan.description}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase px-3 py-1 border-slate-200 text-slate-500">
                          {plan.month} {plan.year}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-code text-xs font-bold text-slate-600">
                        {plan.startDate} to {plan.endDate}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-bold uppercase px-4 py-1.5 rounded-full">
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        {isAuthorized && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteAnnual(plan.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddAnnualOpen} onOpenChange={setIsAddAnnualOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="space-y-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit"><CalendarDays className="h-8 w-8 text-primary" /></div>
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Holiday Matrix Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Description</Label><Input placeholder="e.g. Diwali Break" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={newAnnual.description} onChange={(e)=>setNewAnnual({...newAnnual, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Start Date</Label><DatePicker value={newAnnual.startDate} onChange={(val)=>setNewAnnual({...newAnnual, startDate: val})} className="h-12 bg-slate-50 border-none rounded-xl" /></div>
              <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">End Date</Label><DatePicker value={newAnnual.endDate} onChange={(val)=>setNewAnnual({...newAnnual, endDate: val})} className="h-12 bg-slate-50 border-none rounded-xl" /></div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] text-slate-400" onClick={()=>setIsAddAnnualOpen(false)}>Abort</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] shadow-xl" onClick={handleAddAnnualLeave}>Commit to Ledger</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
