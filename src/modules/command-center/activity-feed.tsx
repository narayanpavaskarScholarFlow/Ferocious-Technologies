
"use client";

import { useState, useMemo } from 'react';
import { 
  Order, 
  BillingRecord, 
  QualityReport, 
  TrainingAssignment, 
  SystemUser, 
  WorkLogEntry 
} from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  Clock, 
  User, 
  FileText, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  Users, 
  Receipt,
  Search,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Landmark,
  Box,
  Zap,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Award,
  BarChart3,
  Target,
  Briefcase,
  GraduationCap,
  ClipboardCheck,
  Star,
  Timer,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isToday, parseISO, subDays, isAfter } from 'date-fns';

interface ActivityFeedProps {
  orders: Order[];
  billing: BillingRecord[];
  reports: QualityReport[];
  assignments: TrainingAssignment[];
  users: SystemUser[];
  logs: WorkLogEntry[];
  currentUser?: string | null;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  user: string;
  module: 'Finance' | 'Production' | 'Quality' | 'Dispatch' | 'HR' | 'System' | 'Inventory' | 'Training';
  action: string;
  reference: string;
  severity: 'low' | 'medium' | 'high';
  type: 'creation' | 'update' | 'completion' | 'rejection';
}

export function ActivityFeed({ orders, billing, reports, assignments, users, logs, currentUser }: ActivityFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [activeMainTab, setActiveMainTab] = useState('performance');

  // AUTHORIZATION NODE
  const currentUserData = useMemo(() => users.find(u => u.name === currentUser || u.email === currentUser), [users, currentUser]);
  const isManager = useMemo(() => currentUser === 'Master Admin' || currentUserData?.role?.includes('Manager') || currentUserData?.role?.includes('Supervisor'), [currentUser, currentUserData]);

  // ACTIVITY SYNTHESIS PROTOCOL
  const allActivities = useMemo(() => {
    const events: ActivityEvent[] = [];

    billing.forEach(r => {
      events.push({
        id: r.id,
        timestamp: r.date,
        user: r.receiverName || 'Finance Node',
        module: 'Finance',
        action: `Processed ${r.type.replace('_', ' ')}`,
        reference: r.number,
        severity: r.status === 'Pending' ? 'medium' : 'low',
        type: r.status === 'Paid' ? 'completion' : 'creation'
      });
    });

    orders.forEach(o => {
      events.push({
        id: `ORD-${o.id}`,
        timestamp: o.startDate,
        user: o.owner || 'Planner',
        module: 'Production',
        action: 'Initialized Master Work Order',
        reference: `#${o.id}`,
        severity: o.priority === 'High' ? 'medium' : 'low',
        type: 'creation'
      });
    });

    reports.forEach(r => {
      events.push({
        id: r.id,
        timestamp: r.createdAt,
        user: r.inspector,
        module: 'Quality',
        action: r.status === 'Released' ? 'Authorized Quality Release' : 'Drafted Inspection Protocol',
        reference: r.drawingName,
        severity: r.verdict === 'Fail' ? 'high' : 'low',
        type: r.status === 'Released' ? 'completion' : 'creation'
      });
    });

    assignments.forEach(a => {
      events.push({
        id: a.id,
        timestamp: a.assignedDate,
        user: 'HR_NODE',
        module: 'Training',
        action: 'Deployed Skill Matrix Node',
        reference: a.trainingTitle,
        severity: 'low',
        type: 'creation'
      });
    });

    logs.forEach(l => {
      events.push({
        id: l.id,
        timestamp: l.date,
        user: l.operator,
        module: 'Production',
        action: `Logged ${l.duration} Operational Yield`,
        reference: `WO #${l.workOrderId}`,
        severity: 'low',
        type: 'update'
      });
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [billing, orders, reports, assignments, logs]);

  // PERFORMANCE CALCULATION MATRIX
  const performanceStats = useMemo(() => {
    const targetUser = currentUserData?.name || currentUser || 'System';
    const myLogs = logs.filter(l => l.operator === targetUser);
    const myWOs = orders.filter(o => o.owner === targetUser || o.routing?.some(r => r.responsiblePersonName === targetUser));
    const myTraining = assignments.filter(a => a.userName === targetUser);
    const myReports = reports.filter(r => r.inspector === targetUser);

    const todayCount = allActivities.filter(a => a.user === targetUser && isToday(parseISO(a.timestamp))).length;
    const weekCount = allActivities.filter(a => a.user === targetUser && isAfter(parseISO(a.timestamp), subDays(new Date(), 7))).length;

    const completedTasks = myLogs.length;
    const trainingComplete = myTraining.length > 0 ? (myTraining.filter(a => a.status === 'Completed').length / myTraining.length) * 100 : 100;
    const qualityScore = myReports.length > 0 ? (myReports.filter(r => r.verdict === 'Pass').length / myReports.length) * 100 : 100;
    
    // Weighted Performance Score Algorithm v2.4
    const attendanceWeight = 0.2;
    const productivityWeight = 0.4;
    const qualityWeight = 0.3;
    const trainingWeight = 0.1;

    const score = (100 * attendanceWeight) + 
                  (Math.min(100, (completedTasks / 20) * 100) * productivityWeight) + 
                  (qualityScore * qualityWeight) + 
                  (trainingComplete * trainingWeight);

    return {
      todayCount,
      weekCount,
      totalWOs: myWOs.length,
      completedWOs: myWOs.filter(o => o.status === 'Completed' || o.status === 'Delivered').length,
      pendingTasks: 5, // Simulated pending
      qualityScore: Math.round(qualityScore),
      trainingProgress: Math.round(trainingComplete),
      contributionScore: Math.round(score),
      attendance: 98 // Baseline
    };
  }, [allActivities, currentUserData, logs, orders, assignments, reports, currentUser]);

  const filteredTimeline = allActivities.filter(a => {
    const matchesSearch = a.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'All' || a.module === filterModule;
    return matchesSearch && matchesModule;
  });

  const topContributors = useMemo(() => {
    const userRanking: Record<string, number> = {};
    allActivities.forEach(a => {
      userRanking[a.user] = (userRanking[a.user] || 0) + 1;
    });
    return Object.entries(userRanking)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        user: users.find(u => u.name === name)
      }));
  }, [allActivities, users]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 font-body">
      
      {/* INSTITUTIONAL KPI MATRIX */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-1">
        {[
          { label: "Today's Yield", val: performanceStats.todayCount, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: "Weekly Volume", val: performanceStats.weekCount, icon: TrendingUp, color: 'text-primary', bg: 'bg-blue-50' },
          { label: "Completed WOs", val: performanceStats.completedWOs, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: "Quality Score", val: `${performanceStats.qualityScore}%`, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: "Training Index", val: `${performanceStats.trainingProgress}%`, icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: "Attendance %", val: `${performanceStats.attendance}%`, icon: UserCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(card => (
          <Card key={card.label} className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between hover:border-primary transition-all group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{card.label}</p>
              <div className={cn("p-1.5 rounded-lg transition-transform group-hover:scale-110", card.bg, card.color)}>
                <card.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className={cn("text-xl font-display font-black", card.color)}>{card.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-9 space-y-6">
          
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-full mb-6 h-12 inline-flex border border-slate-200 shadow-sm w-fit">
              <TabsTrigger value="performance" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">My Performance</TabsTrigger>
              <TabsTrigger value="activities" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Activity Matrix</TabsTrigger>
              {isManager && (
                <TabsTrigger value="manager" className="rounded-full px-8 h-10 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
                  <Users className="h-3.5 w-3.5 mr-2" /> Manager Matrix
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="performance" className="m-0 space-y-6 animate-in slide-in-from-left-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Appraisal Support Node */}
                  <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none transition-opacity" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
                    <div className="relative z-10">
                       <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-3 mb-4">Identity_Yield_Protocol</Badge>
                       <h3 className="text-4xl font-display font-black tracking-tighter uppercase leading-none">Contribution Score</h3>
                       <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Aggregated 90-Day Performance Index</p>
                    </div>
                    
                    <div className="mt-12 flex items-end justify-between relative z-10">
                       <div className="text-7xl font-display font-black text-primary tracking-tighter">{performanceStats.contributionScore}%</div>
                       <div className="text-right space-y-2">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase">
                             <TrendingUp className="h-3 w-3" /> +4.2% Monthly
                          </div>
                          <Badge className="bg-white/10 text-white border-none text-[8px] font-bold uppercase">Rank: Tier-1 Elite</Badge>
                       </div>
                    </div>

                    <div className="mt-8 space-y-2 relative z-10">
                       <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${performanceStats.contributionScore}%` }} />
                       </div>
                    </div>
                  </Card>

                  {/* Task Velocity Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:border-primary transition-all">
                       <div className="p-3 bg-blue-50 rounded-2xl w-fit text-blue-600 mb-4 transition-transform group-hover:scale-110 shadow-sm"><Target className="h-5 w-5" /></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Tasks</p>
                          <p className="text-3xl font-display font-black text-[#001F3D] mt-1">{performanceStats.pendingTasks + performanceStats.todayCount}</p>
                       </div>
                    </Card>
                    <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:border-emerald-500 transition-all">
                       <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-600 mb-4 transition-transform group-hover:scale-110 shadow-sm"><CheckCircle2 className="h-5 w-5" /></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed Items</p>
                          <p className="text-3xl font-display font-black text-emerald-600 mt-1">{performanceStats.todayCount}</p>
                       </div>
                    </Card>
                    <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:border-amber-500 transition-all">
                       <div className="p-3 bg-amber-50 rounded-2xl w-fit text-amber-600 mb-4 transition-transform group-hover:scale-110 shadow-sm"><Timer className="h-5 w-5" /></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadlines Pending</p>
                          <p className="text-3xl font-display font-black text-amber-600 mt-1">{performanceStats.pendingTasks}</p>
                       </div>
                    </Card>
                    <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-[2rem] flex flex-col justify-between group hover:border-indigo-500 transition-all">
                       <div className="p-3 bg-indigo-50 rounded-2xl w-fit text-indigo-600 mb-4 transition-transform group-hover:scale-110 shadow-sm"><Award className="h-5 w-5" /></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certifications</p>
                          <p className="text-3xl font-display font-black text-indigo-600 mt-1">{performanceStats.trainingProgress === 100 ? 'All Sync' : 'Pending'}</p>
                       </div>
                    </Card>
                  </div>
               </div>

               {/* Promotion & Appraisal Matrix Node */}
               <Card className="p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] overflow-hidden">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm"><BarChart3 className="h-6 w-6 text-[#001F3D]" /></div>
                     <div>
                        <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase">90-Day Contribution Ledger</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Appraisal & Increment Support Matrix</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                     {[
                       { label: 'Work Completion', val: '94%', color: 'text-emerald-500' },
                       { label: 'Quality Fidelity', val: '98%', color: 'text-blue-500' },
                       { label: 'Training Sync', val: '100%', color: 'text-indigo-500' },
                       { label: 'Attendance Lock', val: '99%', color: 'text-rose-500' },
                       { label: 'WO Contribution', val: performanceStats.totalWOs, color: 'text-primary' },
                     ].map(metric => (
                       <div key={metric.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                          <p className={cn("text-2xl font-display font-black", metric.color)}>{metric.val}</p>
                       </div>
                     ))}
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="activities" className="m-0 space-y-6 animate-in slide-in-from-right-4 duration-500">
               <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-wrap items-center gap-4 rounded-[1.5rem]">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    <Input 
                      placeholder="Search operational audit trail..." 
                      className="h-11 pl-10 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterModule} onValueChange={setFilterModule}>
                    <SelectTrigger className="w-48 h-11 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase">
                      <SelectValue placeholder="All Modules" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl">
                      <SelectItem value="All" className="text-[10px] font-bold uppercase">All Modules</SelectItem>
                      {['Finance', 'Production', 'Quality', 'Dispatch', 'HR', 'Training', 'System'].map(m => (
                        <SelectItem key={m} value={m} className="text-[10px] font-bold uppercase">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="h-11 px-6 rounded-xl font-bold uppercase text-[9px] tracking-widest gap-2">
                    <Filter className="h-3.5 w-3.5" /> Filters
                  </Button>
               </Card>

               <Card className="bg-white border-slate-200 shadow-xl rounded-[2.5rem] overflow-hidden min-h-[600px] flex flex-col">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1E293B] rounded-lg text-white shadow-lg"><History className="h-4 w-4" /></div>
                        <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest">Institutional Audit Matrix</h3>
                     </div>
                     <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[8px] font-bold px-4 h-9 uppercase tracking-widest rounded-full">
                        Temporal_Node_Stream_Active
                     </Badge>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-10">
                      {filteredTimeline.length > 0 ? (
                        <div className="space-y-0 relative">
                          <div className="absolute left-[33px] top-2 bottom-0 w-[1px] bg-slate-100" />
                          {filteredTimeline.map((activity) => (
                            <div key={activity.id} className="relative pl-20 pb-12 last:pb-0 group">
                              <div className={cn(
                                "absolute left-[26px] top-1 h-4 w-4 rounded-full border-4 border-white shadow-md transition-all group-hover:scale-125 z-10",
                                activity.severity === 'high' ? 'bg-rose-500' : activity.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              )} />
                              
                              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-8">
                                 <div className="md:col-span-2">
                                    <p className="text-[10px] font-code font-bold text-slate-400 uppercase">{activity.timestamp}</p>
                                    <Badge variant="outline" className="mt-3 bg-slate-50 text-slate-500 border-slate-200 text-[7px] font-black uppercase px-2 py-0">
                                      {activity.module}
                                    </Badge>
                                 </div>
                                 <div className="md:col-span-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 group-hover:border-primary/20 group-hover:bg-white transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                       <Avatar className="h-7 w-7 border-white shadow-sm">
                                          <AvatarFallback className="bg-[#001F3D] text-white text-[8px] font-black">
                                            {activity.user ? activity.user[0] : 'S'}
                                          </AvatarFallback>
                                       </Avatar>
                                       <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{activity.user}</span>
                                       <ChevronRight className="h-3 w-3 text-slate-200" />
                                       <span className="text-xs font-bold text-slate-700">{activity.action}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <div className="p-2 bg-white rounded-lg border border-slate-100"><Box className="h-3 w-3 text-slate-400" /></div>
                                       <span className="text-[11px] font-code font-bold text-primary uppercase tracking-tighter">{activity.reference}</span>
                                    </div>
                                 </div>
                                 <div className="md:col-span-2 text-right">
                                    <Button variant="ghost" size="sm" className="h-10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors gap-2">
                                      View Protocol <ChevronRight className="h-3 w-3" />
                                    </Button>
                                 </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                          <History className="h-16 w-16 mb-6 text-slate-300" />
                          <h4 className="text-xl font-display font-bold uppercase">No Activities Detected</h4>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
               </Card>
            </TabsContent>

            {isManager && (
              <TabsContent value="manager" className="m-0 space-y-8 animate-in zoom-in-95 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Top Contributors List */}
                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem]">
                       <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Award className="h-6 w-6" /></div>
                             <h4 className="text-lg font-display font-bold text-[#001F3D] uppercase">Activity Rankings</h4>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold uppercase text-[8px] tracking-widest px-3 py-1">Top_Tier_Nodes</Badge>
                       </div>
                       <div className="space-y-6">
                          {topContributors.map((node, i) => (
                            <div key={node.name} className="flex items-center justify-between group">
                               <div className="flex items-center gap-5">
                                  <span className="text-xl font-display font-black text-slate-100 group-hover:text-primary/20 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                                  <Avatar className="h-12 w-12 border-2 border-slate-50 group-hover:scale-110 transition-transform">
                                     <AvatarImage src={node.user?.image} />
                                     <AvatarFallback className="bg-slate-50 text-slate-400 font-bold uppercase">{node.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                     <p className="text-sm font-bold text-slate-700 uppercase">{node.name}</p>
                                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{node.user?.role || 'Personnel'}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="text-lg font-display font-black text-emerald-600">{node.count}</p>
                                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">Total Actions</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </Card>

                    {/* Departmental Yield Matrix */}
                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col justify-between">
                       <div>
                          <div className="flex items-center gap-4 mb-10">
                             <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Users className="h-6 w-6" /></div>
                             <h4 className="text-lg font-display font-bold text-[#001F3D] uppercase">Departmental Yield Matrix</h4>
                          </div>
                          <div className="space-y-8">
                             {[
                               { label: 'Tool Room', progress: 92, color: 'bg-blue-500' },
                               { label: 'Design', progress: 88, color: 'bg-indigo-500' },
                               { label: 'VMC Milling', progress: 95, color: 'bg-emerald-500' },
                               { label: 'Quality', progress: 84, color: 'bg-amber-500' },
                               { label: 'Finance', progress: 78, color: 'bg-slate-500' },
                             ].map(dept => (
                               <div key={dept.label} className="space-y-2">
                                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                     <span className="text-slate-500 tracking-widest">{dept.label}</span>
                                     <span className="text-[#001F3D]">{dept.progress}% Efficiency</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                     <div className={cn("h-full transition-all duration-1000", dept.color)} style={{ width: `${dept.progress}%` }} />
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </Card>
                 </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* RIGHT SIDE SUMMARY PANEL */}
        <div className="lg:col-span-3 space-y-6 sticky top-24">
          <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Star className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em]">Personal Node</p>
                <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase px-2 py-0">SYNCED</Badge>
              </div>
              
              <div className="space-y-8">
                <div>
                   <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Today's Summary</p>
                   <p className="text-sm font-medium text-white/80 leading-snug">Identified <b className="text-primary">{performanceStats.todayCount} protocol entries</b> committed to the daily ledger.</p>
                </div>
                
                <div className="pt-6 border-t border-white/5 space-y-6">
                   <div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Yield Momentum</span>
                         <span className="text-xs font-bold text-primary">{performanceStats.contributionScore}%</span>
                      </div>
                      <Progress value={performanceStats.contributionScore} className="h-1.5 bg-white/5 rounded-full" />
                   </div>
                </div>
              </div>

              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[9px] tracking-widest rounded-xl shadow-xl shadow-primary/20 gap-2">
                Download PDF Report <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-8">
             <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
                <Timer className="h-4 w-4 text-amber-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Task Protocol Queue</h4>
             </div>
             <div className="space-y-4">
                {[
                  { label: 'Pending Yield Entry', val: '2.5h Unallocated', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Training Due', val: 'ISO-9001 Calibration', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Approval Required', val: 'WO #9045 Terminal', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-center group">
                     <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", item.bg, item.color)}>
                        <item.icon className="h-4 w-4" />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-900 uppercase truncate leading-none">{item.label}</p>
                        <p className="text-[9px] text-slate-400 font-medium uppercase mt-1 tracking-tight">{item.val}</p>
                     </div>
                     <ChevronRight className="h-3 w-3 text-slate-200 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
             </div>
          </Card>

          <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
             <div className="flex items-center gap-3 mb-4">
                <Award className="h-4 w-4 text-primary" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fidelity Status</h4>
             </div>
             <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
               All activities are cryptographically linked to your identity node. Performance scores factor in absolute dimensional compliance and task velocity.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
