
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  History, 
  Clock, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ChevronRight, 
  Target, 
  Briefcase, 
  GraduationCap, 
  ClipboardCheck, 
  Search,
  Calendar,
  Filter,
  ArrowUpRight,
  LineChart,
  Edit3,
  UserCheck,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isToday, parseISO, isAfter, subDays, startOfMonth, startOfQuarter, startOfYear, format } from 'date-fns';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from 'recharts';

interface ActivityFeedProps {
  orders: Order[];
  billing: BillingRecord[];
  reports: QualityReport[];
  assignments: TrainingAssignment[];
  users: SystemUser[];
  logs: WorkLogEntry[];
  leaves: any[];
  currentUser?: string | null;
}

type RangeType = 'Today' | 'Week' | 'Month' | 'Quarter' | 'Year';

export function ActivityFeed({ orders, reports, assignments, users, logs, leaves, currentUser }: ActivityFeedProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.find(u => u.name === currentUser || u.email === currentUser)?.id || users[0]?.id || ''
  );
  const [dateRange, setDateRange] = useState<RangeType>('Month');

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);

  const filteredData = useMemo(() => {
    if (!selectedUserId) return { logs: [], reports: [], assignments: [], orders: [] };

    const now = new Date();
    let startDate = startOfMonth(now);
    if (dateRange === 'Today') startDate = now;
    else if (dateRange === 'Week') startDate = subDays(now, 7);
    else if (dateRange === 'Quarter') startDate = startOfQuarter(now);
    else if (dateRange === 'Year') startDate = startOfYear(now);

    const userLogs = logs.filter(l => l.operatorId === selectedUserId && (dateRange === 'Today' ? isToday(parseISO(l.date)) : isAfter(parseISO(l.date), startDate)));
    const userReports = reports.filter(r => r.inspector === selectedUser?.name && isAfter(parseISO(r.createdAt), startDate));
    const userAssignments = assignments.filter(a => a.userId === selectedUserId && isAfter(parseISO(a.assignedDate), startDate));
    const userOrders = orders.filter(o => o.owner === selectedUser?.name || o.routing?.some(r => r.responsiblePersonId === selectedUserId));

    return { logs: userLogs, reports: userReports, assignments: userAssignments, orders: userOrders };
  }, [selectedUserId, dateRange, logs, reports, assignments, orders, selectedUser]);

  const stats = useMemo(() => {
    const totalHours = filteredData.logs.reduce((acc, l) => acc + (parseFloat(l.duration) || 0), 0);
    const completedTasks = filteredData.logs.length;
    const qualityScore = filteredData.reports.length > 0 
      ? Math.round((filteredData.reports.filter(r => r.verdict === 'Pass').length / filteredData.reports.length) * 100) 
      : 100;
    const trainingComplete = filteredData.assignments.length > 0 
      ? Math.round((filteredData.assignments.filter(a => a.status === 'Completed').length / filteredData.assignments.length) * 100)
      : 100;

    const score = Math.round((qualityScore * 0.4) + (trainingComplete * 0.2) + (Math.min(100, (totalHours / 160) * 100) * 0.4));

    return { totalHours, completedTasks, qualityScore, trainingComplete, score };
  }, [filteredData]);

  const trendData = useMemo(() => {
    return [
      { name: 'Week 1', score: 85 },
      { name: 'Week 2', score: 88 },
      { name: 'Week 3', score: 92 },
      { name: 'Week 4', score: stats.score },
    ];
  }, [stats.score]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 px-2">
        <div className="flex items-center gap-6 flex-1 w-full">
           <div className="space-y-1 shrink-0">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Identity Node</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-12 w-full lg:w-72 bg-white border-slate-200 rounded-xl font-bold uppercase shadow-sm">
                  <SelectValue placeholder="Select Employee..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-2xl">
                  {users.map(u => <SelectItem key={u.id} value={u.id} className="text-[10px] font-bold uppercase py-3">{u.name} ({u.role})</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-1 shrink-0">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Analysis Window</Label>
              <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                <SelectTrigger className="h-12 w-full lg:w-48 bg-white border-slate-200 rounded-xl font-bold uppercase shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-2xl">
                  {['Today', 'Week', 'Month', 'Quarter', 'Year'].map(r => <SelectItem key={r} value={r} className="text-[10px] font-bold uppercase">{r}</SelectItem>)}
                </SelectContent>
              </Select>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="h-12 px-8 font-display text-xl font-black bg-[#001F3D] text-white border-none rounded-2xl shadow-xl">
             {stats.score}% <span className="text-[9px] font-bold uppercase ml-2 text-white/40 tracking-widest leading-none">Net Score</span>
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: 'Yield Hours', val: `${stats.totalHours.toFixed(1)}h`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'Task Velocity', val: stats.completedTasks, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
               { label: 'Quality Fidelity', val: `${stats.qualityScore}%`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
               { label: 'Training Sync', val: `${stats.trainingComplete}%`, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
             ].map(kpi => (
               <Card key={kpi.label} className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
                    <div className={cn("p-2 rounded-xl shadow-sm", kpi.bg, kpi.color)}><kpi.icon className="h-4 w-4" /></div>
                  </div>
                  <p className={cn("text-2xl font-display font-black", kpi.color)}>{kpi.val}</p>
               </Card>
             ))}
          </div>

          <Tabs defaultValue="contributions" className="w-full">
            <TabsList className="bg-slate-100 p-1.5 rounded-full mb-6 h-12 inline-flex border border-slate-200 shadow-sm w-fit">
              <TabsTrigger value="contributions" className="rounded-full px-8 h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">WO Contribution</TabsTrigger>
              <TabsTrigger value="yield" className="rounded-full px-8 h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Daily Yield Logs</TabsTrigger>
              <TabsTrigger value="skills" className="rounded-full px-8 h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Skill Matrix</TabsTrigger>
            </TabsList>

            <TabsContent value="contributions" className="m-0 animate-in fade-in duration-500">
               <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-[2rem]">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase">Work Order Node</TableHead>
                        <TableHead className="text-[10px] font-black uppercase">Identity Account</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase">Hours Contributed</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase">State</TableHead>
                        <TableHead className="text-right px-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.orders.map(order => {
                        const userLogs = logs.filter(l => l.workOrderId === order.id && l.operatorId === selectedUserId);
                        const userHours = userLogs.reduce((acc, l) => acc + (parseFloat(l.duration) || 0), 0);
                        return (
                          <TableRow key={order.id} className="h-20 border-slate-50 hover:bg-slate-50/50 group">
                            <TableCell className="px-8"><span className="font-display font-bold text-primary">#{order.id}</span></TableCell>
                            <TableCell><span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{order.customer}</span></TableCell>
                            <TableCell className="text-center"><span className="text-sm font-display font-bold text-[#001F3D]">{userHours.toFixed(1)}h</span></TableCell>
                            <TableCell className="text-center"><Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-bold uppercase px-3">{order.status}</Badge></TableCell>
                            <TableCell className="text-right px-8"><ChevronRight className="h-4 w-4 text-slate-200 ml-auto" /></TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredData.orders.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="h-40 text-center opacity-30 text-[10px] font-bold uppercase italic">No project nodes detected for this identity.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
               </Card>
            </TabsContent>

            <TabsContent value="yield" className="m-0 animate-in fade-in duration-500">
               <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-[2rem]">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase">Session Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase">Work Order</TableHead>
                        <TableHead className="text-[10px] font-black uppercase">Resource Node</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase">Duration</TableHead>
                        <TableHead className="text-right px-8">Technical Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.logs.map(log => (
                        <TableRow key={log.id} className="h-20 border-slate-50 hover:bg-slate-50/50">
                          <TableCell className="px-8 font-code text-[10px] font-bold text-slate-400">{log.date}</TableCell>
                          <TableCell><Badge variant="outline" className="border-primary/20 text-primary font-bold">#{log.workOrderId}</Badge></TableCell>
                          <TableCell><span className="text-[10px] font-bold text-slate-600 uppercase">{log.resourceName}</span></TableCell>
                          <TableCell className="text-center font-display font-bold text-slate-900">{log.duration}</TableCell>
                          <TableCell className="text-right px-8"><p className="text-[9px] text-slate-400 font-medium italic truncate max-w-[200px]">"{log.activity}"</p></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </Card>
            </TabsContent>

            <TabsContent value="skills" className="m-0 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredData.assignments.map(asg => (
                   <Card key={asg.id} className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#001F3D] uppercase">{asg.trainingTitle}</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Deadline: {asg.targetDate}</p>
                         </div>
                         <Badge className={cn("text-[8px] font-bold uppercase", asg.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700')}>{asg.status}</Badge>
                      </div>
                      <div className="mt-6 flex justify-between items-center">
                         <div className="flex items-center gap-2"><div className={cn("h-2 w-2 rounded-full", asg.status === 'Completed' ? "bg-emerald-500" : "bg-blue-500")} /><span className="text-[10px] font-bold text-slate-500 uppercase">{asg.status === 'Completed' ? 'Synced' : 'Active'}</span></div>
                         {asg.status === 'Completed' && <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-bold uppercase gap-2 text-indigo-600 hover:bg-indigo-50"><FileText className="h-3.5 w-3.5" /> View Cert</Button>}
                      </div>
                   </Card>
                 ))}
               </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <Card className="p-8 bg-slate-50 border border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none transition-opacity"><Target className="h-32 w-32" /></div>
            <div className="relative z-10 space-y-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-widest border-l-4 border-primary pl-4">Appraisal Evidence</h3>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[8px] font-bold">90_DAY_WINDOW</Badge>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Yield Momentum</p>
                     <div className="h-[120px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={trendData}>
                              <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                              <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fill="url(#colorScore)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Compliance Matrix</p>
                     <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-emerald-500 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShieldCheck className="h-4 w-4" /></div>
                           <span className="text-[10px] font-bold text-slate-600 uppercase">Quality Fidelity</span>
                        </div>
                        <span className="text-sm font-display font-black text-emerald-600">{stats.qualityScore}%</span>
                     </div>
                  </div>
               </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
             <div className="flex items-center gap-3">
                <Edit3 className="h-4 w-4 text-primary" />
                <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Management Protocol</h4>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                   <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-widest ml-1">Private Management Notes</Label>
                   <Textarea placeholder="Manager comments on identity performance..." className="bg-slate-50 border-none min-h-[120px] rounded-2xl text-[11px] font-medium resize-none" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-widest ml-1">Development Goals</Label>
                   <Input placeholder="Assign target for next cycle..." className="bg-slate-50 border-none h-12 rounded-xl text-[11px] font-bold" />
                </div>
                <Button className="w-full h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[9px] tracking-[0.2em] shadow-xl">Commit Review</Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
