"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCircle, 
  GraduationCap, 
  CalendarDays, 
  Banknote, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  FileBadge,
  ShieldCheck,
  Send,
  Plus,
  CalendarCheck,
  ArchiveX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SystemUser, TrainingAssignment, UserLeave, SalarySlip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

interface PersonnelPortalProps {
  currentUser: SystemUser | null;
  assignments: TrainingAssignment[];
  leaves: UserLeave[];
  slips: SalarySlip[];
  holidays: any[];
  title?: string;
}

export function PersonnelPortal({ currentUser, assignments, leaves, slips, holidays, title = 'Personnel Portal' }: PersonnelPortalProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Planned Leave Form State
  const [plannedMonth, setPlannedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [plannedReason, setPlannedReason] = useState('');

  const myAssignments = useMemo(() => assignments.filter(a => a.userId === currentUser?.id), [assignments, currentUser]);
  const myLeaves = useMemo(() => leaves.filter(l => l.userId === currentUser?.id), [leaves, currentUser]);
  const mySlips = useMemo(() => slips.filter(s => s.userId === currentUser?.id), [slips, currentUser]);

  const isLateForPlanning = useMemo(() => {
    const today = new Date();
    // Strict requirement: Plan before the 5th of every month
    return today.getDate() > 5;
  }, []);

  const handleDownloadCertificate = (assignment: TrainingAssignment) => {
    toast({
      title: "Certificate Generated",
      description: `Official certification for ${assignment.trainingTitle} downloaded.`,
    });
  };

  const handleDownloadSlip = (slip: SalarySlip) => {
    toast({
      title: "Document Dispatched",
      description: `Salary Slip for ${slip.month} ${slip.year} downloaded successfully.`,
    });
  };

  const handleSubmitPlannedLeave = () => {
    if (!currentUser) return;
    if (isLateForPlanning) {
      toast({ 
        variant: "destructive", 
        title: "Temporal Lock Active", 
        description: "Monthly planning matrix must be submitted before the 5th." 
      });
      return;
    }

    const leaveId = `PLN-${Date.now()}`;
    const plannedEntry: UserLeave = {
      id: leaveId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'Annual',
      startDate: 'Planned',
      endDate: 'Planned',
      reason: plannedReason,
      status: 'Pending',
      isPlannedMatrix: true,
      plannedMonth: plannedMonth
    };

    setDocumentNonBlocking(doc(db, 'leaves', leaveId), plannedEntry, { merge: true });
    toast({ title: "Matrix Synchronized", description: `Leave plan for ${plannedMonth} committed.` });
    setPlannedReason('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <UserCircle className="h-4 w-4" />
            Identity Dashboard
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-slate-400 font-medium">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Personal operational telemetry and self-service hub.</p>
        </div>

        <Card className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center gap-8">
           <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
              <p className="text-xl font-display font-bold text-primary">{currentUser?.efficiency || 0}%</p>
           </div>
           <div className="h-8 w-px bg-slate-100" />
           <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold uppercase">{currentUser?.status || 'Offline'}</Badge>
           </div>
        </Card>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="dashboard" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Overview</TabsTrigger>
          <TabsTrigger value="training" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all relative">
            My Training Matrix
            {myAssignments.filter(a => a.status !== 'Completed').length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] border-2 border-white animate-pulse">
                {myAssignments.filter(a => a.status !== 'Completed').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="leaves" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Leaves & Holidays</TabsTrigger>
          <TabsTrigger value="slips" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Salary Slips</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="m-0 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="h-16 w-16" /></div>
                 <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Target Yield Efficiency</p>
                 <h3 className="text-5xl font-display font-bold tracking-tighter">{currentUser?.efficiency || 0}%</h3>
                 <div className="mt-8 space-y-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${currentUser?.efficiency || 0}%` }} />
                    </div>
                    <p className="text-[8px] font-bold uppercase text-white/20 tracking-widest">Real-time Node Telemetry</p>
                 </div>
              </Card>

              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Training</p>
                       <h3 className="text-3xl font-display font-bold text-[#001F3D]">{myAssignments.filter(a => a.status === 'Completed').length} / {myAssignments.length}</h3>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-xl text-primary"><GraduationCap className="h-6 w-6" /></div>
                 </div>
                 <div className="pt-6 border-t border-slate-50 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Training nodes synchronized</span>
                 </div>
              </Card>

              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">My Leave Balance</p>
                       <h3 className="text-3xl font-display font-bold text-primary">{currentUser?.leaveBalance?.annual || 0} <span className="text-xs text-slate-300 uppercase">Days</span></h3>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><CalendarDays className="h-6 w-6" /></div>
                 </div>
                 <div className="pt-6 border-t border-slate-50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Personal Credit Availability</p>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="training" className="m-0 space-y-8">
           <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <FileBadge className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest">Personal Curriculum Nodes</h3>
              </div>
              </div>
              <Table>
                 <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Program Title</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400">Assigned</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400">Target Date</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                       <TableHead className="text-right px-10">Certification</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {myAssignments.map((asg) => (
                       <TableRow key={asg.id} className="h-20 border-slate-50 hover:bg-slate-50/30 transition-colors group">
                          <TableCell className="px-10">
                             <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-[#001F3D] uppercase">{asg.trainingTitle}</span>
                                <span className="text-[9px] text-slate-400 font-code uppercase mt-1">ID: {asg.trainingId}</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-[11px] font-bold text-slate-500 font-code">{asg.assignedDate}</TableCell>
                          <TableCell className="text-[11px] font-bold text-primary font-code">{asg.targetDate}</TableCell>
                          <TableCell className="text-center">
                             <Badge className={cn(
                                "text-[9px] font-bold uppercase px-3 py-1 rounded-full",
                                asg.status === 'Completed' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                             )}>{asg.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right px-10">
                             {asg.status === 'Completed' ? (
                                <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 font-bold text-[9px] uppercase tracking-widest gap-2" onClick={() => handleDownloadCertificate(asg)}>
                                   <Download className="h-3.5 w-3.5" /> Certificate
                                </Button>
                             ) : (
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">In-Progress</span>
                             )}
                          </TableCell>
                       </TableRow>
                    ))}
                    {myAssignments.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="h-40 text-center opacity-20 text-xs font-bold uppercase tracking-widest">No Curriculum Nodes Detected</TableCell></TableRow>
                    )}
                 </TableBody>
              </Table>
           </Card>
        </TabsContent>

        <TabsContent value="leaves" className="m-0 space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                 <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-10 border-l-4 border-primary pl-4">
                       <CalendarCheck className="h-5 w-5 text-primary" />
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Leave Planning</h4>
                    </div>

                    <div className="space-y-6">
                       <div className={cn("p-4 rounded-2xl border transition-all duration-500", isLateForPlanning ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100")}>
                          <div className="flex items-center gap-3 mb-2">
                             {isLateForPlanning ? <AlertCircle className="h-4 w-4 text-red-600" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                             <span className={cn("text-[10px] font-bold uppercase", isLateForPlanning ? "text-red-700" : "text-emerald-700")}>
                                {isLateForPlanning ? 'Planning Protocol Locked' : 'Planning Protocol Active'}
                             </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Monthly planning matrix submission mandatory before the **5th** day.</p>
                       </div>

                       <div className="space-y-4">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Protocol Month</Label>
                             <Select value={plannedMonth} onValueChange={setPlannedMonth} disabled={isLateForPlanning}>
                                <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                   {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                      <SelectItem key={m} value={m} className="text-xs font-bold uppercase">{m}</SelectItem>
                                   ))}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Planned Absence Description</Label>
                             <Textarea 
                                disabled={isLateForPlanning}
                                placeholder="e.g. Planning 2 days annual leave for family event..." 
                                className="min-h-[100px] bg-slate-50 border-none rounded-xl text-xs font-medium resize-none shadow-inner"
                                value={plannedReason}
                                onChange={(e) => setPlannedReason(e.target.value)}
                             />
                          </div>
                          <Button 
                             disabled={isLateForPlanning || !plannedReason}
                             className="w-full h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-xl flex gap-3"
                             onClick={handleSubmitPlannedLeave}
                          >
                             <Send className="h-4 w-4" /> Commit Monthly Matrix
                          </Button>
                       </div>
                    </div>
                 </Card>

                 <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-8">
                       <Banknote className="h-5 w-5 text-primary" />
                       <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">My Credit Balance</h4>
                    </div>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Annual (PL)</span>
                          <span className="text-xl font-display font-bold text-white">{currentUser?.leaveBalance?.annual || 0} <span className="text-[8px] text-white/20">D</span></span>
                       </div>
                       <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Sick (SL)</span>
                          <span className="text-xl font-display font-bold text-white">{currentUser?.leaveBalance?.sick || 0} <span className="text-[8px] text-white/20">D</span></span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Casual (CL)</span>
                          <span className="text-xl font-display font-bold text-white">{currentUser?.leaveBalance?.casual || 0} <span className="text-[8px] text-white/20">D</span></span>
                       </div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-8 space-y-8">
                 <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem] mb-8">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                       <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest">Historical Plant Holiday Matrix</h3>
                    </div>
                    <Table>
                       <TableHeader className="bg-white">
                          <TableRow className="hover:bg-transparent">
                             <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Holiday / Event</TableHead>
                             <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Month</TableHead>
                             <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Dates</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {holidays.map((h) => (
                             <TableRow key={h.id} className="h-16 border-slate-50">
                                <TableCell className="px-10 text-[11px] font-bold text-slate-700 uppercase">{h.description}</TableCell>
                                <TableCell className="text-center">
                                   <Badge variant="outline" className="text-[8px] font-bold uppercase border-slate-100 bg-slate-50 text-slate-500">{h.month} {h.year}</Badge>
                                </TableCell>
                                <TableCell className="text-center font-code text-[10px] font-bold text-slate-400">{h.startDate} TO {h.endDate}</TableCell>
                             </TableRow>
                          ))}
                          {holidays.length === 0 && (
                            <TableRow><TableCell colSpan={4} className="h-40 text-center opacity-20 text-xs font-bold uppercase tracking-widest">No Holiday Matrix Entries</TableCell></TableRow>
                          )}
                       </TableBody>
                    </Table>
                 </Card>

                 <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                       <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest">Absence Transaction Ledger</h3>
                       <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[9px] font-bold px-4 h-8 uppercase">LE_#{myLeaves.length}</Badge>
                    </div>
                    <Table>
                       <TableHeader className="bg-white">
                          <TableRow className="hover:bg-transparent">
                             <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Application Date</TableHead>
                             <TableHead className="font-bold text-[10px] uppercase text-slate-400">Class</TableHead>
                             <TableHead className="font-bold text-[10px] uppercase text-slate-400">Window / Month</TableHead>
                             <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {myLeaves.map((l) => (
                             <TableRow key={l.id} className="h-16 border-slate-50 hover:bg-slate-50/30 transition-colors">
                                <TableCell className="px-10 text-[10px] font-bold text-slate-400 font-code">{l.id}</TableCell>
                                <TableCell>
                                   <Badge variant="outline" className={cn("text-[8px] font-bold uppercase px-3 rounded-full border-slate-200", l.isPlannedMatrix ? "bg-purple-50 text-purple-700" : "bg-slate-50 text-slate-600")}>
                                      {l.isPlannedMatrix ? 'Planned Matrix' : l.type}
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-[11px] font-bold text-slate-600 uppercase">
                                   {l.isPlannedMatrix ? l.plannedMonth : `${l.startDate} - ${l.endDate}`}
                                </TableCell>
                                <TableCell className="text-center">
                                   <Badge className={cn(
                                      "text-[8px] font-bold uppercase px-3 py-1 rounded-full",
                                      l.status === 'Approved' ? "bg-emerald-50 text-emerald-700" : l.status === 'Rejected' ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                                   )}>{l.status}</Badge>
                                </TableCell>
                             </TableRow>
                          ))}
                          {myLeaves.length === 0 && (
                            <TableRow><TableCell colSpan={4} className="h-40 text-center opacity-20 text-xs font-bold uppercase tracking-widest">No Absence Matrix Logged</TableCell></TableRow>
                          )}
                       </TableBody>
                    </Table>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="slips" className="m-0 space-y-8">
           <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest">Official Salary Slip Matrix</h3>
                 </div>
              </div>
              <Table>
                 <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Slip Reference</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400">Settlement Period</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-slate-400">Dispatched On</TableHead>
                       <TableHead className="font-bold text-[10px] uppercase text-right">Net Valuation</TableHead>
                       <TableHead className="text-right px-10 w-20"></TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {mySlips.map((slip) => (
                       <TableRow key={slip.id} className="h-20 border-slate-50 hover:bg-slate-50/30 transition-colors group">
                          <TableCell className="px-10 font-code text-[10px] font-bold text-slate-400 uppercase">{slip.id}</TableCell>
                          <TableCell className="text-xs font-bold text-[#001F3D] uppercase">{slip.month} {slip.year}</TableCell>
                          <TableCell className="text-[11px] font-bold text-slate-500 font-code">{slip.generatedDate}</TableCell>
                          <TableCell className="text-right font-display font-bold text-lg text-[#001F3D]">₹ {slip.netPay.toLocaleString()}</TableCell>
                          <TableCell className="text-right px-10">
                             <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 font-bold text-[9px] uppercase tracking-widest gap-2 shadow-sm" onClick={() => handleDownloadSlip(slip)}>
                                <Download className="h-3.5 w-3.5" /> Download PDF
                             </Button>
                          </TableCell>
                       </TableRow>
                    ))}
                    {mySlips.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="h-40 text-center opacity-20 text-xs font-bold uppercase tracking-widest">No Settlement Nodes Dispatched</TableCell></TableRow>
                    )}
                 </TableBody>
              </Table>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
