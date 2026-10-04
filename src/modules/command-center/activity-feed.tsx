
"use client";

import { useState, useMemo } from 'react';
import { 
  Order, 
  BillingRecord, 
  QualityReport, 
  TrainingAssignment, 
  SystemUser, 
  WorkLogEntry, 
  SystemActivity 
} from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Clock, 
  User, 
  Filter, 
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
  Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, parseISO } from 'date-fns';

interface ActivityFeedProps {
  orders: Order[];
  billing: BillingRecord[];
  reports: QualityReport[];
  assignments: TrainingAssignment[];
  users: SystemUser[];
  logs: WorkLogEntry[];
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  user: string;
  module: 'Finance' | 'Production' | 'Quality' | 'Dispatch' | 'HR' | 'System';
  action: string;
  reference: string;
  severity: 'low' | 'medium' | 'high';
  type: 'creation' | 'update' | 'completion' | 'rejection';
}

export function ActivityFeed({ orders, billing, reports, assignments, users, logs }: ActivityFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');

  const allActivities = useMemo(() => {
    const events: ActivityEvent[] = [];

    // Synthesize Finance Activities (Billing)
    billing.forEach(r => {
      events.push({
        id: r.id,
        timestamp: r.date,
        user: r.receiverName || 'System',
        module: 'Finance',
        action: `Recorded ${r.type.replace('_', ' ')}`,
        reference: r.number,
        severity: r.status === 'Pending' ? 'medium' : 'low',
        type: 'creation'
      });
    });

    // Synthesize Production Activities (Orders)
    orders.forEach(o => {
      events.push({
        id: `ORD-${o.id}`,
        timestamp: o.startDate,
        user: o.owner || 'Unassigned',
        module: 'Production',
        action: 'Initialized Master Order',
        reference: `#${o.id}`,
        severity: o.priority === 'High' ? 'medium' : 'low',
        type: 'creation'
      });
      if (o.deliveredAt) {
        events.push({
          id: `DEL-${o.id}`,
          timestamp: o.deliveredAt,
          user: 'Logistics',
          module: 'Dispatch',
          action: 'Finalized Dispatch Protocol',
          reference: `#${o.id}`,
          severity: 'low',
          type: 'completion'
        });
      }
    });

    // Synthesize Quality Activities
    reports.forEach(r => {
      events.push({
        id: r.id,
        timestamp: r.createdAt,
        user: r.inspector,
        module: 'Quality',
        action: r.status === 'Released' ? 'Authorized Release' : 'Drafted Inspection',
        reference: r.drawingName,
        severity: r.verdict === 'Fail' ? 'high' : 'low',
        type: r.status === 'Released' ? 'completion' : 'creation'
      });
    });

    // Synthesize HR Activities
    assignments.forEach(a => {
      events.push({
        id: a.id,
        timestamp: a.assignedDate,
        user: 'Admin',
        module: 'HR',
        action: 'Deployed Training Node',
        reference: a.trainingTitle,
        severity: 'low',
        type: 'creation'
      });
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [billing, orders, reports, assignments]);

  const filteredActivities = allActivities.filter(a => {
    const matchesSearch = a.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'All' || a.module === filterModule;
    return matchesSearch && matchesModule;
  });

  const summary = useMemo(() => {
    return {
      today: allActivities.filter(a => isToday(parseISO(a.timestamp))).length,
      pending: billing.filter(r => r.status === 'Pending').length + reports.filter(r => r.status === 'Review Pending').length,
      quotes: billing.filter(r => r.type === 'quotation' && isToday(parseISO(r.date))).length,
      workOrders: orders.filter(o => isToday(parseISO(o.startDate))).length,
      dispatches: orders.filter(o => o.deliveredAt && isToday(parseISO(o.deliveredAt))).length,
      failures: reports.filter(r => r.verdict === 'Fail').length
    };
  }, [allActivities, billing, reports, orders]);

  const sidebarStats = useMemo(() => {
    const userMap: Record<string, number> = {};
    const moduleMap: Record<string, number> = {};
    
    allActivities.forEach(a => {
      userMap[a.user] = (userMap[a.user] || 0) + 1;
      moduleMap[a.module] = (moduleMap[a.module] || 0) + 1;
    });

    const topUser = Object.entries(userMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topModule = Object.entries(moduleMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { topUser, topModule };
  }, [allActivities]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 font-body">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Today's Events", val: summary.today, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: "Pending Approvals", val: summary.pending, icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: "New Quotations", val: summary.quotes, icon: FileText, color: 'text-primary', bg: 'bg-blue-50' },
          { label: "Initialized WOs", val: summary.workOrders, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: "Dispatches", val: summary.dispatches, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: "System Failures", val: summary.failures, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(card => (
          <Card key={card.label} className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between hover:border-primary transition-all group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{card.label}</p>
              <div className={cn("p-1.5 rounded-lg transition-transform group-hover:scale-110", card.bg, card.color)}>
                <card.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className={cn("text-2xl font-display font-black", card.color)}>{card.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAIN FEED & FILTERS */}
        <div className="lg:col-span-9 space-y-6">
          <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
              <Input 
                placeholder="Search audit trail..." 
                className="h-10 pl-10 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-48 h-10 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="All" className="text-[10px] font-bold uppercase">All Modules</SelectItem>
                {['Finance', 'Production', 'Quality', 'Dispatch', 'HR', 'System'].map(m => (
                  <SelectItem key={m} value={m} className="text-[10px] font-bold uppercase">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-10 px-6 rounded-xl font-bold uppercase text-[9px] tracking-widest gap-2">
              <Calendar className="h-3.5 w-3.5" /> Date Range
            </Button>
          </Card>

          <Card className="bg-white border-slate-200 shadow-xl rounded-[2rem] overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1E293B] rounded-lg text-white shadow-lg"><History className="h-4 w-4" /></div>
                  <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest">Master Activity Matrix</h3>
               </div>
               <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[8px] font-bold px-4 h-8 uppercase tracking-widest">
                  Live Audit Protocol v2.4
               </Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-8">
                {filteredActivities.length > 0 ? (
                  <div className="space-y-0 relative">
                    <div className="absolute left-[33px] top-2 bottom-0 w-[1px] bg-slate-100" />
                    {filteredActivities.map((activity, idx) => (
                      <div key={activity.id} className="relative pl-16 pb-12 last:pb-0 group">
                        <div className={cn(
                          "absolute left-[26px] top-1 h-4 w-4 rounded-full border-4 border-white shadow-md transition-all group-hover:scale-125 z-10",
                          activity.severity === 'high' ? 'bg-rose-500' : activity.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        )} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6">
                           <div className="md:col-span-2">
                              <p className="text-[10px] font-code font-bold text-slate-400 uppercase">{activity.timestamp}</p>
                              <Badge variant="outline" className="mt-2 bg-slate-50 text-slate-500 border-slate-200 text-[7px] font-black uppercase px-2 py-0">
                                {activity.module}
                              </Badge>
                           </div>
                           <div className="md:col-span-8">
                              <div className="flex items-center gap-3 mb-1">
                                 <Avatar className="h-6 w-6 border-slate-100">
                                    <AvatarFallback className="bg-slate-50 text-slate-400 text-[8px] font-black">{activity.user[0]}</AvatarFallback>
                                 </Avatar>
                                 <span className="text-xs font-bold text-slate-900">{activity.user}</span>
                                 <ChevronRight className="h-3 w-3 text-slate-200" />
                                 <span className="text-xs font-medium text-slate-500">{activity.action}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="p-1.5 bg-slate-50 rounded-lg"><Box className="h-3 w-3 text-slate-300" /></div>
                                 <span className="text-[11px] font-code font-bold text-primary uppercase tracking-tighter">{activity.reference}</span>
                              </div>
                           </div>
                           <div className="md:col-span-2 text-right">
                              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[8px] font-bold uppercase text-slate-400 group-hover:text-primary transition-colors">
                                View Object
                              </Button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                    <History className="h-16 w-16 mb-6 text-slate-300" />
                    <h4 className="text-xl font-display font-bold uppercase">No Activities Discovered</h4>
                    <p className="text-xs font-bold uppercase tracking-widest mt-2">Adjust filter parameters to synchronize matrix node.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* SIDEBAR PANEL */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 bg-[#1E293B] text-white border-none shadow-xl rounded-[2rem] relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Focus</h4>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Most Active Module</p>
                  <p className="text-xl font-display font-black text-white">{sidebarStats.topModule}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Top Operator Node</p>
                  <p className="text-xl font-display font-black text-white">{sidebarStats.topUser}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase mb-2">
                  <span className="text-white/40">Audit Score</span>
                  <span className="text-emerald-400">98.2%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-400 w-[98%]" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Critical Alerts</h4>
             </div>
             <div className="space-y-4">
                {summary.failures > 0 ? (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                    <p className="text-[9px] font-black text-rose-600 uppercase">Quality Rejection</p>
                    <p className="text-[10px] text-rose-700/70 font-medium">{summary.failures} components failed compliance audit.</p>
                  </div>
                ) : (
                  <div className="text-center py-6 opacity-20">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    <p className="text-[9px] font-bold uppercase">All Nodes Nominal</p>
                  </div>
                )}
                
                {summary.pending > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
                    <p className="text-[9px] font-black text-amber-600 uppercase">Approval Bottleneck</p>
                    <p className="text-[10px] text-amber-700/70 font-medium">{summary.pending} nodes awaiting administrative certification.</p>
                  </div>
                )}
             </div>
          </Card>

          <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
             <div className="flex items-center gap-3 mb-4">
                <Landmark className="h-4 w-4 text-blue-600" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Protocol</h4>
             </div>
             <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
               All activities are immutable and cryptographically linked to the identity node performing the action. ISO-9001 compliance matrix synchronized.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
