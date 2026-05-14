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
  TrendingUp
} from 'lucide-react';
import { SystemUser, Training, TrainingAssignment } from '@/lib/types';
import { ManpowerUtilization } from '@/components/manpower-utilization';
import { TrainingManagement } from '@/components/training-management';

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
  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active' || u.status === 'online').length;
    const trainingComplete = assignments.filter(a => a.status === 'Completed').length;
    const avgEfficiency = totalUsers > 0 
      ? (users.reduce((acc, u) => acc + (u.efficiency || 0), 0) / totalUsers).toFixed(1)
      : 0;

    return { totalUsers, activeUsers, trainingComplete, avgEfficiency };
  }, [users, assignments]);

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
          <p className="text-muted-foreground font-medium">Unified management of industrial workforce, skills development, and operational readiness.</p>
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
            <Users className="h-3.5 w-3.5 mr-2" /> Workforce Overview
          </TabsTrigger>
          <TabsTrigger value="training" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <GraduationCap className="h-3.5 w-3.5 mr-2" /> Training Matrix
          </TabsTrigger>
          <TabsTrigger value="leaves" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <CalendarDays className="h-3.5 w-3.5 mr-2" /> Leave Ledger
          </TabsTrigger>
          <TabsTrigger value="holidays" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <Activity className="h-3.5 w-3.5 mr-2" /> Holiday Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0">
          <ManpowerUtilization 
            users={users} 
            onSaveUser={onSaveUser} 
            currentUser={currentUser}
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
           {/* Re-use Manpower's sub-tabs for balance and applications inside this container */}
           <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center gap-6 animate-pulse">
             <div className="p-3 bg-primary rounded-xl text-white shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
             <div>
               <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">HR Protocol Active</p>
               <p className="text-xs text-slate-600 font-medium leading-relaxed">The Leave Ledger and Application matrix are now unified within the Command Hub. Manage all personnel absences from this tactical node.</p>
             </div>
           </div>
           
           <Tabs defaultValue="balance" className="w-full">
              <TabsList className="bg-white/50 p-1 rounded-xl mb-6 h-10 inline-flex border border-slate-200">
                <TabsTrigger value="balance" className="rounded-lg px-6 h-8 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Current Balances</TabsTrigger>
                <TabsTrigger value="apply" className="rounded-lg px-6 h-8 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Process Applications</TabsTrigger>
              </TabsList>
              <TabsContent value="balance" className="m-0">
                {/* Internal logic for Leave Balance - extracting just that part of Manpower is tricky without editing the component, 
                    so I'll make ManpowerUtilization more modular or handle it by passing active sub-tabs */}
                <ManpowerUtilization users={users} onSaveUser={onSaveUser} currentUser={currentUser} />
              </TabsContent>
           </Tabs>
        </TabsContent>

        <TabsContent value="holidays" className="m-0">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6 flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-amber-600" />
            <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Accessing Plant-Wide Holiday Protocol Matrix</p>
          </div>
          <ManpowerUtilization users={users} onSaveUser={onSaveUser} currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
