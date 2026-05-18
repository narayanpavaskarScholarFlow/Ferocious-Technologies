"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  User, 
  BookOpen,
  ChevronRight,
  TrendingUp,
  History,
  Trash2,
  Settings2,
  Target,
  Download,
  Briefcase,
  FileText
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Training, TrainingAssignment, SystemUser } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

interface TrainingManagementProps {
  trainings: Training[];
  assignments: TrainingAssignment[];
  users: SystemUser[];
  onSaveTraining: (training: Training) => void;
  onDeleteTraining: (id: string) => void;
  onSaveAssignment: (assignment: TrainingAssignment) => void;
  onDeleteAssignment: (id: string) => void;
  isFullControl?: boolean;
  targetUserId?: string;
}

export function TrainingManagement({ 
  trainings, 
  assignments, 
  users, 
  onSaveTraining, 
  onDeleteTraining,
  onSaveAssignment,
  onDeleteAssignment,
  isFullControl = false,
  targetUserId
}: TrainingManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Form States
  const [newTraining, setNewTraining] = useState({
    title: '', description: '', department: '', durationHours: 0, impactScore: 5
  });

  const [newAssignment, setNewAssignment] = useState({
    trainingId: '', userId: '', targetDate: new Date().toISOString().split('T')[0]
  });

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (!isFullControl && targetUserId && a.userId !== targetUserId) return false;
      return a.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             a.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [assignments, searchTerm, isFullControl, targetUserId]);

  const stats = useMemo(() => {
    const total = filteredAssignments.length;
    const completed = filteredAssignments.filter(a => a.status === 'Completed').length;
    const overdue = filteredAssignments.filter(a => a.status === 'Overdue').length;
    const avgScore = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, overdue, avgScore: avgScore.toFixed(1) };
  }, [filteredAssignments]);

  const handleCreateTraining = () => {
    if (!newTraining.title || !newTraining.department) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Title and Department are required." });
      return;
    }
    const training: Training = { id: `TRN-${Math.floor(1000 + Math.random() * 9000)}`, ...newTraining };
    onSaveTraining(training);
    toast({ title: "Curriculum Synchronized", description: `${training.title} added to registry.` });
    setIsAddTrainingOpen(false);
    setNewTraining({ title: '', description: '', department: '', durationHours: 0, impactScore: 5 });
  };

  const handleAssignTraining = () => {
    if (!newAssignment.trainingId || !newAssignment.userId) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Identity and Curriculum node required." });
      return;
    }
    const training = trainings.find(t => t.id === newAssignment.trainingId);
    const user = users.find(u => u.id === newAssignment.userId);
    if (!training || !user) return;

    const assignment: TrainingAssignment = {
      id: `ASG-${Math.floor(1000 + Math.random() * 9000)}`,
      trainingId: training.id, trainingTitle: training.title,
      userId: user.id, userName: user.name,
      assignedDate: new Date().toISOString().split('T')[0],
      targetDate: newAssignment.targetDate, status: 'Assigned'
    };
    onSaveAssignment(assignment);
    toast({ title: "Training Deployed", description: `Task node transmitted to ${user.name}.` });
    setIsAssignOpen(false);
  };

  const handleUpdateStatus = (assignment: TrainingAssignment, status: TrainingAssignment['status']) => {
    const updated = { ...assignment, status };
    if (status === 'Completed') updated.completionDate = new Date().toISOString().split('T')[0];
    onSaveAssignment(updated);
    toast({ title: "Ledger Synchronized", description: `Assignment state moved to ${status}.` });
  };

  const downloadCertificate = (asg: TrainingAssignment) => {
    toast({ title: "Certificate Dispatch", description: `Official certification for ${asg.trainingTitle} downloaded.` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <GraduationCap className="h-3.5 w-3.5" />
            Skill Matrix Management
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Training <span className="text-slate-400 font-medium">Matrix</span>
          </h2>
        </div>
        
        {isFullControl && (
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest gap-2" onClick={() => setIsAddTrainingOpen(true)}>
              <BookOpen className="h-3.5 w-3.5" /> Registry
            </Button>
            <Button className="rounded-xl bg-[#001F3D] hover:bg-black text-white gap-2 h-10 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl" onClick={() => setIsAssignOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Deploy Training
            </Button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-primary/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">{isFullControl ? 'Global Load' : 'My Modules'}</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-[#001F3D]">{stats.total}</p>
            <History className="h-5 w-5 text-primary" />
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-emerald-500/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Verified Complete</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-emerald-600">{stats.completed}</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-red-500/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Target Overdue</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-red-600">{stats.overdue}</p>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        </Card>
        <Card className="p-6 bg-[#001F3D] text-white border-none shadow-xl rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest mb-2">Proficiency Index</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold">{stats.avgScore}%</p>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-[1.5rem]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Filter matrix..." className="pl-9 h-10 bg-white border-slate-200 text-xs font-bold uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-6">Curriculum Module</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Identities</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Deadline</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center w-40">Status</TableHead>
                <TableHead className="text-right px-6 w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((asg) => (
                <TableRow key={asg.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                  <TableCell className="px-6 font-bold text-[12px] uppercase text-[#001F3D]">{asg.trainingTitle}</TableCell>
                  <TableCell className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{asg.userName}</TableCell>
                  <TableCell className="text-center font-code text-[10px] font-bold text-slate-500">{asg.targetDate}</TableCell>
                  <TableCell className="text-center">
                    {isFullControl ? (
                      <Select value={asg.status} onValueChange={(val: any) => handleUpdateStatus(asg, val)}>
                        <SelectTrigger className={cn("h-8 border-none rounded-full text-[9px] font-bold uppercase", asg.status === 'Completed' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Assigned" className="text-[9px] font-bold uppercase">Assigned</SelectItem>
                          <SelectItem value="In-Progress" className="text-[9px] font-bold uppercase">In-Progress</SelectItem>
                          <SelectItem value="Completed" className="text-[9px] font-bold uppercase">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={cn("text-[9px] font-bold uppercase px-3 py-1", asg.status === 'Completed' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>{asg.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {asg.status === 'Completed' ? (
                       <Button variant="ghost" size="sm" className="h-9 px-4 text-[9px] font-bold uppercase gap-2 hover:text-primary" onClick={() => downloadCertificate(asg)}>
                          <Download className="h-3.5 w-3.5" /> Certificate
                       </Button>
                    ) : isFullControl ? (
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => onDeleteAssignment(asg.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add Training to Registry Dialog */}
      <Dialog open={isAddTrainingOpen} onOpenChange={setIsAddTrainingOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2rem] p-10">
          <DialogHeader className="mb-6">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4"><BookOpen className="h-6 w-6 text-primary" /></div>
            <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase">Curriculum Registry</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Define a new technical or compliance training module.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] uppercase font-bold text-slate-400">Training Title</Label>
              <Input placeholder="e.g. CNC Safety Protocol" className="bg-slate-50 border-none rounded-xl h-12 text-xs font-bold" value={newTraining.title} onChange={(e) => setNewTraining({...newTraining, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold text-slate-400">Department</Label>
                <Select value={newTraining.department} onValueChange={(val) => setNewTraining({...newTraining, department: val})}>
                  <SelectTrigger className="bg-slate-50 border-none rounded-xl h-12 text-xs font-bold uppercase"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["Admin", "Market", "Design", "Tool Room", "VMC Milling", "CNC Turning", "Assembly", "Quality"].map(d => (
                      <SelectItem key={d} value={d} className="text-xs font-bold uppercase">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold text-slate-400">Duration (Hours)</Label>
                <Input type="number" className="bg-slate-50 border-none rounded-xl h-12 text-xs font-bold" value={newTraining.durationHours} onChange={(e) => setNewTraining({...newTraining, durationHours: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] uppercase font-bold text-slate-400">Functional Description</Label>
              <Textarea placeholder="Core learning objectives..." className="bg-slate-50 border-none rounded-xl min-h-[100px] text-xs font-medium" value={newTraining.description} onChange={(e) => setNewTraining({...newTraining, description: e.target.value})} />
            </div>
            <Button className="w-full h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl uppercase font-bold text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleCreateTraining}>
              <Plus className="h-4 w-4" /> Add to Curriculum
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deploy Training (Assignment) Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2rem] p-10">
          <DialogHeader className="mb-6">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4"><Target className="h-6 w-6 text-primary" /></div>
            <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase">Deploy Training</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Assign a curriculum node to a personnel identity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] uppercase font-bold text-slate-400">Identity Selection</Label>
              <Select value={newAssignment.userId} onValueChange={(val) => setNewAssignment({...newAssignment, userId: val})}>
                <SelectTrigger className="bg-slate-50 border-none rounded-xl h-12 text-xs font-bold uppercase"><SelectValue placeholder="Identify Personnel..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id} className="text-xs font-bold uppercase">{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] uppercase font-bold text-slate-400">Curriculum Module</Label>
              <Select value={newAssignment.trainingId} onValueChange={(val) => setNewAssignment({...newAssignment, trainingId: val})}>
                <SelectTrigger className="bg-slate-50 border-none rounded-xl h-12 text-xs font-bold uppercase"><SelectValue placeholder="Select Module..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {trainings.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-bold uppercase">{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] uppercase font-bold text-slate-400">Target Deadline</Label>
              <DatePicker value={newAssignment.targetDate} onChange={(val) => setNewAssignment({...newAssignment, targetDate: val})} className="h-12 rounded-xl" />
            </div>
            <Button className="w-full h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl uppercase font-bold text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleAssignTraining}>
              <Plus className="h-4 w-4" /> Deploy Task Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
