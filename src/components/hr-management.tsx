
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
  UserCheck,
  LayoutGrid
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
  isReportingManager?: boolean;
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
  isReportingManager,
  title = 'HR Command Hub'
}: HRManagementProps) {
  const db = useFirestore();

  const currentUserData = useMemo(() => {
    return users.find(u => u.name === currentUser || u.email === currentUser);
  }, [users, currentUser]);

  const isHRAdmin = useMemo(() => {
    return currentUser === 'Master Admin' || currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager';
  }, [currentUser, currentUserData]);

  // If they are not HR Admin and not a reporting manager, they shouldn't be here.
  const isAuthorized = isHRAdmin || isReportingManager;

  const [activeTab, setActiveTab] = useState(isHRAdmin ? 'overview' : 'approvals');

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
    return logs.filter(l => {
      const isSubmitted = l.status === 'Submitted';
      if (!isSubmitted) return false;
      
      if (isHRAdmin) return true;
      
      const operatorUser = users.find(u => u.id === l.operatorId || u.name === l.operator);
      return operatorUser?.reportingManager === currentUser;
    }).length;
  }, [logs, isHRAdmin, users, currentUser]);

  if (!isAuthorized) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center opacity-30 text-center">
         <ShieldCheck className="h-20 w-20 mb-6 text-slate-300" />
         <h3 className="text-xl font-display font-bold uppercase text-[#001F3D]">Restricted Access</h3>
         <p className="text-xs text-slate-400 mt-2">Administrative Command Center is gated for authorized personnel nodes only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Briefcase className="h-4 w-4" />
            Human Capital Command Center
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-slate-400 font-medium">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Global workforce governance and payroll matrix.</p>
        </div>
        
        {isHRAdmin && (
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
        )}
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          {isHRAdmin && (
            <TabsTrigger value="overview" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
              <Users className="h-3.5 w-3.5 mr-2" /> Workforce Matrix
            </TabsTrigger>
          )}
          
          <TabsTrigger value="approvals" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all relative">
            <UserCheck className="h-3.5 w-3.5 mr-2" /> Log Approvals
            {pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] border-2 border-white animate-pulse">
                {pendingApprovals}
              </span>
            )}
          </TabsTrigger>

          {isHRAdmin && (
            <>
              <TabsTrigger value="salary" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <Banknote className="h-3.5 w-3.5 mr-2" /> Salary Structure
              </TabsTrigger>

              <TabsTrigger value="training" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
                <GraduationCap className="h-3.5 w-3.5 mr-2" /> Global Training Registry
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="m-0">
          {isHRAdmin && (
            <ManpowerUtilization 
              users={users} 
              onSaveUser={onSaveUser} 
              currentUser={currentUser}
              initialSubTab="overview"
            />
          )}
        </TabsContent>

        <TabsContent value="approvals" className="m-0">
             <LogApprovalMatrix 
               logs={logs}
               users={users}
               currentUser={currentUser}
             />
        </TabsContent>

        <TabsContent value="salary" className="m-0">
          {isHRAdmin && (
            <SalaryStructureLedger 
              users={users}
              onSaveUser={onSaveUser}
            />
          )}
        </TabsContent>

        <TabsContent value="training" className="m-0">
          {isHRAdmin && (
            <TrainingManagement 
              trainings={trainings}
              assignments={assignments}
              users={users}
              onSaveTraining={onSaveTraining}
              onDeleteTraining={onDeleteTraining}
              onSaveAssignment={onSaveAssignment}
              onDeleteAssignment={onDeleteAssignment}
              isFullControl={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
