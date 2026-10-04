"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  Briefcase,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import { SystemUser, Training, TrainingAssignment } from '@/lib/types';
import { ManpowerUtilization } from '@/modules/resources/manpower-utilization';
import { TrainingManagement } from '@/modules/resources/training-management';
import { SalaryStructureLedger } from '@/modules/resources/salary-structure-ledger';

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
  title = 'HR Management'
}: HRManagementProps) {
  const currentUserData = useMemo(() => {
    return users.find(u => u.name === currentUser || u.email === currentUser);
  }, [users, currentUser]);

  const isHRAdmin = useMemo(() => {
    return currentUser === 'Master Admin' || currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager';
  }, [currentUser, currentUserData]);

  const isAuthorized = isHRAdmin;

  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active' || u.status === 'online').length;
    const avgEfficiency = totalUsers > 0 
      ? (users.reduce((acc, u) => acc + (u.efficiency || 0), 0) / totalUsers).toFixed(1)
      : 0;

    return { totalUsers, activeUsers, avgEfficiency };
  }, [users]);

  if (!isAuthorized) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center opacity-30 text-center">
         <ShieldCheck className="h-20 w-20 mb-6 text-slate-300" />
         <h3 className="text-xl font-display font-bold uppercase text-[#001F3D]">Restricted Access</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Briefcase className="h-4 w-4" />
            Human Capital Hub
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            {title}
          </h2>
        </div>
        
        <Card className="px-8 py-4 bg-white border border-slate-100 rounded-2xl shadow-xl">
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency Index</p>
            <p className="text-2xl font-display font-bold text-primary">{stats.avgEfficiency}%</p>
          </div>
        </Card>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="overview" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">Workforce Matrix</TabsTrigger>
          <TabsTrigger value="salary" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">Salary Structure</TabsTrigger>
          <TabsTrigger value="training" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">Training Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0">
          <ManpowerUtilization users={users} onSaveUser={onSaveUser} currentUser={currentUser} initialSubTab="overview" />
        </TabsContent>
        <TabsContent value="salary" className="m-0">
          <SalaryStructureLedger users={users} onSaveUser={onSaveUser} />
        </TabsContent>
        <TabsContent value="training" className="m-0">
          <TrainingManagement trainings={trainings} assignments={assignments} users={users} onSaveTraining={onSaveTraining} onDeleteTraining={onDeleteTraining} onSaveAssignment={onSaveAssignment} onDeleteAssignment={onDeleteAssignment} isFullControl={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
