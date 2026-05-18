
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  CalendarDays, 
  Briefcase,
  ShieldCheck,
  Banknote,
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
  title?: string;
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
  currentUser,
  title = 'HR Command'
}: HRManagementProps) {
  const db = useFirestore();

  const currentUserData = useMemo(() => {
    return users.find(u => u.name === currentUser || u.email === currentUser);
  }, [users, currentUser]);

  const isAuthorized = useMemo(() => {
    return currentUser === 'Master Admin' || currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager';
  }, [currentUser, currentUserData]);

  // Land regular users on 'leaves' instead of 'overview'
  const [activeTab, setActiveTab] = useState(isAuthorized ? 'overview' : 'leaves');

  const logsQuery = useMemoFirebase(() => collection(db, 'work_logs'), [db]);
  const { data: logsData } = useCollection<WorkLogEntry>(logsQuery);
  const logs = logsData || [];

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active' || u.status === 'online').length;
    const avgEfficiency = totalUsers > 0 
      ? (users.reduce((acc, u) => acc + (u.efficiency || 0), 0) / totalUsers).toFixed(1)
      : 0;

    return { totalUsers, activeUsers, avgEfficiency };
  }, [users]);

  const pendingApprovals = useMemo(() => {
    return logs.filter(l => l.status === 'Submitted').length;
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Briefcase className="h-4 w-4" />
            Human Capital Command
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-slate-400 font-medium">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Unified management of industrial workforce, payroll protocols, and operational readiness.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <Card className="flex items-center gap-8 px-8 py-4 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-blue-900/5">
            <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency Index</p>
              <p className="text-2xl font-display font-bold text-primary">{stats.avgEfficiency}%</p>
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Personnel</p>
              <p className="text-2xl font-display font-bold text-[#001F3D]">{stats.activeUsers}/{stats.totalUsers}</p>
            </div>
          </Card>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="overview" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <Users className="h-3.5 w-3.5 mr-2" /> Workforce
          </TabsTrigger>
          
          {isAuthorized && (
            <TabsTrigger value="approvals" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all relative">
              <UserCheck className="h-3.5 w-3.5 mr-2" /> Log Approvals
              {pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] border-2 border-white animate-pulse">
                  {pendingApprovals}
                </span>
              )}
            </TabsTrigger>
          )}

          {isAuthorized && (
            <TabsTrigger value="salary" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
              <Banknote className="h-3.5 w-3.5 mr-2" /> Salary Structure
            </TabsTrigger>
          )}

          <TabsTrigger value="training" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <GraduationCap className="h-3.5 w-3.5 mr-2" /> Training Matrix
          </TabsTrigger>

          <TabsTrigger value="leaves" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <CalendarDays className="h-3.5 w-3.5 mr-2" /> Leaves & Holidays
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0">
          <ManpowerUtilization 
            users={users} 
            onSaveUser={onSaveUser} 
            currentUser={currentUser}
            initialSubTab="overview"
          />
        </TabsContent>

        {isAuthorized && (
          <TabsContent value="approvals" className="m-0">
             <LogApprovalMatrix 
               logs={logs}
               users={users}
               currentUser={currentUser}
             />
          </TabsContent>
        )}

        {isAuthorized && (
          <TabsContent value="salary" className="m-0">
            <SalaryStructureLedger 
              users={users}
              onSaveUser={onSaveUser}
            />
          </TabsContent>
        )}

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

        <TabsContent value="leaves" className="m-0">
           <ManpowerUtilization 
            users={users} 
            onSaveUser={onSaveUser} 
            currentUser={currentUser}
            initialSubTab="apply"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

