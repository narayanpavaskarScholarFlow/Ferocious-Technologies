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
  Target
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

interface TrainingManagementProps {
  trainings: Training[];
  assignments: TrainingAssignment[];
  users: SystemUser[];
  onSaveTraining: (training: Training) => void;
  onDeleteTraining: (id: string) => void;
  onSaveAssignment: (assignment: TrainingAssignment) => void;
  onDeleteAssignment: (id: string) => void;
}

export function TrainingManagement({ 
  trainings, 
  assignments, 
  users, 
  onSaveTraining, 
  onDeleteTraining,
  onSaveAssignment,
  onDeleteAssignment
}: TrainingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Form States
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    department: '',
    durationHours: 0,
    impactScore: 5
  });

  const [newAssignment, setNewAssignment] = useState({
    trainingId: '',
    userId: '',
    targetDate: new Date().toISOString().split('T')[0]
  });

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => 
      a.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignments, searchTerm]);

  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'Completed').length;
    const overdue = assignments.filter(a => a.status === 'Overdue').length;
    const avgScore = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, overdue, avgScore: avgScore.toFixed(1) };
  }, [assignments]);

  const handleCreateTraining = () => {
    if (!newTraining.title || !newTraining.department) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Title and Department are required." });
      return;
    }

    const training: Training = {
      id: `TRN-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newTraining
    };

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
      trainingId: training.id,
      trainingTitle: training.title,
      userId: user.id,
      userName: user.name,
      assignedDate: new Date().toISOString().split('T')[0],
      targetDate: newAssignment.targetDate,
      status: 'Assigned'
    };

    onSaveAssignment(assignment);
    toast({ title: "Training Deployed", description: `Task node transmitted to ${user.name}.` });
    setIsAssignOpen(false);
  };

  const handleUpdateStatus = (assignment: TrainingAssignment, status: TrainingAssignment['status']) => {
    const updated = { ...assignment, status };
    if (status === 'Completed') {
      updated.completionDate = new Date().toISOString().split('T')[0];
      
      // Update user efficiency logic
      const user = users.find(u => u.id === assignment.userId);
      const training = trainings.find(t => t.id === assignment.trainingId);
      if (user && training) {
        const currentEff = user.efficiency || 70;
        const newEff = Math.min(currentEff + (training.impactScore * 0.5), 100);
        // This would be handled by onSaveUser in the parent if I passed it, 
        // but here we just notify the assignment change which the parent will handle.
      }
    }
    onSaveAssignment(updated);
    toast({ title: "Ledger Synchronized", description: `Assignment state moved to ${status}.` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <GraduationCap className="h-3.5 w-3.5" />
            Skill Matrix & Development
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Training <span className="text-slate-400 font-medium">Command</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Hierarchical skill acquisition and performance impact tracking.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 h-10 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-sm" onClick={() => setIsAddTrainingOpen(true)}>
            <BookOpen className="h-3.5 w-3.5" /> Registry Program
          </Button>
          <Button className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-10 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => setIsAssignOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Deploy Training
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-primary/50 transition-colors">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Global Training Load</p>
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
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2">Critical Overdue</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-red-600">{stats.overdue}</p>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        </Card>
        <Card className="p-6 bg-[#001F3D] text-white border-none shadow-xl rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest mb-2">Workforce Proficiency</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold">{stats.avgScore}%</p>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-6 h-12 inline-flex border border-slate-200 shadow-sm gap-1">
          <TabsTrigger value="assignments" className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">Active Deployments</TabsTrigger>
          <TabsTrigger value="curriculum" className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">Curriculum Registry</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">Performance Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="m-0 space-y-6">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-[1.5rem]">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Filter assignments..." className="pl-9 h-10 bg-white border-slate-200 text-xs font-bold uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-6">Resource Node</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Training Program</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Deadline</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center w-40">Status</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((asg) => (
                    <TableRow key={asg.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary"><User className="h-4 w-4" /></div>
                          <span className="text-xs font-bold text-[#001F3D] uppercase">{asg.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-700 uppercase">{asg.trainingTitle}</span>
                          <span className="text-[9px] text-slate-400 font-code uppercase">ASSIGN_#{asg.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-code text-[10px] font-bold text-slate-500">
                        {asg.targetDate}
                      </TableCell>
                      <TableCell className="text-center">
                        <Select value={asg.status} onValueChange={(val: any) => handleUpdateStatus(asg, val)}>
                          <SelectTrigger className={cn(
                            "h-8 border-none rounded-full text-[9px] font-bold uppercase",
                            asg.status === 'Completed' ? "bg-green-50 text-green-700" : 
                            asg.status === 'Overdue' ? "bg-red-50 text-red-700" :
                            "bg-blue-50 text-blue-700"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Assigned" className="text-[9px] font-bold uppercase">Assigned</SelectItem>
                            <SelectItem value="In-Progress" className="text-[9px] font-bold uppercase">In-Progress</SelectItem>
                            <SelectItem value="Completed" className="text-[9px] font-bold uppercase">Completed</SelectItem>
                            <SelectItem value="Failed" className="text-[9px] font-bold uppercase">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => onDeleteAssignment(asg.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAssignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30 py-10">
                          <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
                          <p className="text-xs font-bold uppercase tracking-widest text-[#001F3D]">No Deployment Matrix Found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trainings.map((trn) => (
              <Card key={trn.id} className="p-8 bg-white border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen className="h-16 w-16" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[8px] font-bold uppercase px-3">{trn.department}</Badge>
                    <h4 className="text-lg font-bold text-[#001F3D] uppercase tracking-tight line-clamp-1">{trn.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">{trn.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                      <Clock className="h-3 w-3" /> {trn.durationHours}h Module
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase">
                      <TrendingUp className="h-3 w-3" /> +{trn.impactScore} Efficiency
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Card 
              className="p-8 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all opacity-40 hover:opacity-100"
              onClick={() => setIsAddTrainingOpen(true)}
            >
              <div className="p-4 bg-slate-50 rounded-full"><Plus className="h-8 w-8 text-slate-300" /></div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#001F3D]">Register New Program</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-[1.5rem] text-center opacity-40">
            <BarChart3 className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#001F3D]">Skill Gaps & Efficiency Index Matrix</p>
            <p className="text-[10px] text-slate-400 mt-2">Aggregating workforce proficiency nodes...</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddTrainingOpen} onOpenChange={setIsAddTrainingOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Program Registry</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Initialize a new industrial training curriculum node.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Program Title</Label>
              <Input placeholder="e.g. Advanced VMC Optimization" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={newTraining.title} onChange={(e) => setNewTraining({...newTraining, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Department</Label>
                <Input placeholder="e.g. Quality" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={newTraining.department} onChange={(e) => setNewTraining({...newTraining, department: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Duration (Hours)</Label>
                <Input type="number" placeholder="0" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={newTraining.durationHours} onChange={(e) => setNewTraining({...newTraining, durationHours: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Performance Impact (0-10)</Label>
              <Input type="number" max="10" min="1" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={newTraining.impactScore} onChange={(e) => setNewTraining({...newTraining, impactScore: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Module Description</Label>
              <Input placeholder="Core technical outcomes..." className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={newTraining.description} onChange={(e) => setNewTraining({...newTraining, description: e.target.value})} />
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsAddTrainingOpen(false)}>Abort</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl" onClick={handleCreateTraining}>Synchronize Program</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Deploy Training</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Assign a curriculum node to a specific workforce identity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Select Curriculum</Label>
              <Select value={newAssignment.trainingId} onValueChange={(val) => setNewAssignment({...newAssignment, trainingId: val})}>
                <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold">
                  <SelectValue placeholder="Identify program..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  {trainings.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-bold uppercase">{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Select Identity</Label>
              <Select value={newAssignment.userId} onValueChange={(val) => setNewAssignment({...newAssignment, userId: val})}>
                <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold">
                  <SelectValue placeholder="Identify user..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id} className="text-xs font-bold uppercase">{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Completion Deadline</Label>
              <DatePicker value={newAssignment.targetDate} onChange={(val) => setNewAssignment({...newAssignment, targetDate: val})} className="h-12 bg-slate-50 border-none rounded-xl" />
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsAssignOpen(false)}>Abort</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl" onClick={handleAssignTraining}>Transmit Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
