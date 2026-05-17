
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  CalendarDays, 
  ClipboardList, 
  Activity,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Banknote,
  DollarSign,
  FileCheck,
  LayoutGrid,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { SystemUser, Training, TrainingAssignment, WorkLogEntry } from '@/lib/types';
import { ManpowerUtilization } from '@/components/manpower-utilization';
import { TrainingManagement } from '@/components/training-management';
import { SalaryStructureLedger } from '@/components/salary-structure-ledger';
import { LogApprovalMatrix } from '@/components/log-approval-matrix';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface HRManagementProps {
  users: SystemUser[];
  trainings: Training[];
  assignments: TrainingAssignment[];
  onSaveUser: (user: SystemUser) => void;
  onSaveTraining: (training: Training) => void;
  onDeleteTraining: (id: string) => void;
  onSaveAssignment: (assignment: TrainingAssignment) => void;
  onDeleteAssignment: (id: string) => void;
  currentUser: string | null;
}

export function HRManagement({ 
  users, 
  trainings, 
  assignments, 
  onSaveUser, 
  onSaveTraining, 
  onDeleteTraining, 
  onSaveAssignment, 
  onDeleteAssignment,
  currentUser 
}: HRManagementProps) {
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState('overview');

  const logsQuery = useMemoFirebase(() => collection(db, 'work_logs'), [db]);
  const { data: logsData } = useCollection<WorkLogEntry>(logsQuery);
  const logs = logsData || [];

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active' || u.status === 'online').length;
    const trainingComplete = assignments.filter(a => a.status === 'Completed').length;
    const avgEfficiency = totalUsers > 0 
      ? (users.reduce((acc, u) => acc + (u.efficiency || 0), 0) / totalUsers).toFixed(1)
      : 0;

    return { totalUsers, activeUsers, trainingComplete, avgEfficiency };
  }, [users, assignments]);

  const pendingApprovals = useMemo(() => {
    return logs.filter(l => l.status === 'Submitted').length;
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Briefcase className="h-4 w-4" />
            Human Capital Command
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            HR <span className="text-slate-400 font-medium">Command Hub</span>
          </h2>
          <p className="text-muted-foreground font-medium">Unified management of industrial workforce, payroll protocols, and operational readiness.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Index</p>
              <p className="text-lg font-display font-bold text-primary">{stats.avgEfficiency}%</p>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Personnel</p>
              <p className="text-lg font-display font-bold text-[#001F3D]">{stats.activeUsers}/{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-8 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="overview" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <Users className="h-3.5 w-3.5 mr-2" /> Workforce
          </TabsTrigger>
          <TabsTrigger value="approvals" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all relative">
            <UserCheck className="h-3.5 w-3.5 mr-2" /> Log Approvals
            {pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] border-2 border-white animate-pulse">
                {pendingApprovals}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="salary" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <Banknote className="h-3.5 w-3.5 mr-2" /> Salary Structure
          </TabsTrigger>
          <TabsTrigger value="training" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <GraduationCap className="h-3.5 w-3.5 mr-2" /> Training Matrix
          </TabsTrigger>
          <TabsTrigger value="leaves" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <CalendarDays className="h-3.5 w-3.5 mr-2" /> Leaves
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0">
          <ManpowerUtilization 
            users={users} 
            onSaveUser={onSaveUser} 
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="approvals" className="m-0">
           <LogApprovalMatrix 
             logs={logs}
             users={users}
             currentUser={currentUser}
           />
        </TabsContent>

        <TabsContent value="salary" className="m-0">
          <SalaryStructureLedger 
            users={users}
            onSaveUser={onSaveUser}
          />
        </TabsContent>

        <TabsContent value="training" className="m-0">
          <TrainingManagement 
            trainings={trainings}
            assignments={assignments}
            users={users}
            onSaveTraining={onSaveTraining}
            onDeleteTraining={onDeleteTraining}
            onSaveAssignment={onSaveAssignment}
            onDeleteAssignment={onDeleteAssignment}
          />
        </TabsContent>

        <TabsContent value="leaves" className="m-0 space-y-8">
           <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center gap-6 animate-pulse">
             <div className="p-3 bg-primary rounded-xl text-white shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
             <div>
               <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">HR Protocol Active</p>
               <p className="text-xs text-slate-600 font-medium leading-relaxed">The Leave Ledger and Application matrix are now unified within the Command Hub.</p>
             </div>
           </div>
           
           <Tabs defaultValue="balance" className="w-full">
              <TabsList className="bg-white/50 p-1 rounded-xl mb-6 h-10 inline-flex border border-slate-200">
                <TabsTrigger value="balance" className="rounded-lg px-6 h-8 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Current Balances</TabsTrigger>
                <TabsTrigger value="apply" className="rounded-lg px-6 h-8 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Process Applications</TabsTrigger>
              </TabsList>
              <TabsContent value="balance" className="m-0">
                <ManpowerUtilization users={users} onSaveUser={onSaveUser} currentUser={currentUser} />
              </TabsContent>
           </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
