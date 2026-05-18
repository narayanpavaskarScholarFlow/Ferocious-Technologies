"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  User,
  History,
  Kanban as KanbanIcon,
  Zap,
  TrendingUp,
  RotateCw,
  Box
} from 'lucide-react';
import { Order } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AgileBoardProps {
  orders: Order[];
  title?: string;
}

type ColumnType = 'Backlog' | 'Operational' | 'Blocked' | 'Certified';

export function AgileBoard({ orders, title = 'Flow Matrix' }: AgileBoardProps) {
  const db = useFirestore();
  const { toast } = useToast();

  const columns: { title: ColumnType; color: string; icon: any; sub: string }[] = [
    { title: 'Backlog', color: 'bg-slate-400', icon: Box, sub: 'Yet to start' },
    { title: 'Operational', color: 'bg-primary', icon: Zap, sub: 'In progress' },
    { title: 'Blocked', color: 'bg-red-500', icon: AlertCircle, sub: 'On Hold / Delayed' },
    { title: 'Certified', color: 'bg-emerald-500', icon: CheckCircle2, sub: 'Completed' },
  ];

  const getStatusColumn = (status: Order['status']): ColumnType => {
    switch (status) {
      case 'Yet to start': return 'Backlog';
      case 'Active': return 'Operational';
      case 'Delayed':
      case 'Pending': return 'Blocked';
      case 'Completed': return 'Certified';
      default: return 'Backlog';
    }
  };

  const ordersByColumn = useMemo(() => {
    const map: Record<ColumnType, Order[]> = {
      Backlog: [],
      Operational: [],
      Blocked: [],
      Certified: []
    };
    orders.forEach(order => {
      map[getStatusColumn(order.status)].push(order);
    });
    return map;
  }, [orders]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setDocumentNonBlocking(doc(db, 'orders', orderId), { status: newStatus }, { merge: true });
    toast({
      title: "Flow Updated",
      description: `Order thread synchronized to ${newStatus}.`,
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-1000 overflow-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <KanbanIcon className="h-3.5 w-3.5" />
            Agile Project Flow
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-slate-400 font-medium">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Real-time Kanban visualization of production threads.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-bold text-[9px] uppercase tracking-widest text-slate-400">
            MTD Velocity: 1.2x
          </Badge>
          <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm">
            <History className="h-3.5 w-3.5" /> Flow Audit
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex h-full min-w-[1200px] gap-6">
          {columns.map((col) => {
            const ColumnIcon = col.icon;
            const items = ordersByColumn[col.title];
            
            return (
              <div key={col.title} className="flex-1 flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg text-white shadow-lg", col.color)}>
                      <ColumnIcon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-[#001F3D] uppercase tracking-wider">{col.title}</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{col.sub}</p>
                    </div>
                  </div>
                  <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[9px]">{items.length}</Badge>
                </div>

                <ScrollArea className="flex-1 bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100 shadow-inner">
                  <div className="space-y-4">
                    {items.map((order) => (
                      <Card key={order.id} className="p-5 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-primary/30 transition-all hover:shadow-xl hover:translate-y-[-2px] relative overflow-hidden">
                        {/* Priority Indicator */}
                        <div className={cn(
                          "absolute top-0 left-0 w-1.5 h-full",
                          order.priority === 'High' ? 'bg-red-500' : order.priority === 'Medium' ? 'bg-amber-500' : 'bg-primary'
                        )} />

                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-code font-bold text-slate-400 uppercase tracking-tighter">#{order.id}</span>
                            <Badge variant="outline" className={cn(
                              "text-[8px] font-bold uppercase px-2 py-0 border-none",
                              order.priority === 'High' ? 'text-red-500 bg-red-50' : 'text-slate-400 bg-slate-50'
                            )}>
                              {order.priority}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-[#001F3D] uppercase tracking-tight truncate">{order.customer}</h4>
                            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-medium">
                              <User className="h-2.5 w-2.5" />
                              {order.owner || 'Unassigned'}
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-50">
                            <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-slate-400">
                              <span>Matrix Yield</span>
                              <span>{order.progress || 0}%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-1000" 
                                style={{ width: `${order.progress || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                             <div className="flex items-center gap-2">
                                <Clock className="h-2.5 w-2.5 text-slate-300" />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{order.endDate}</span>
                             </div>
                             
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {col.title !== 'Backlog' && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-md hover:bg-slate-100"
                                    onClick={() => updateOrderStatus(order.id, col.title === 'Operational' ? 'Yet to start' : 'Active')}
                                  >
                                    <RotateCw className="h-3 w-3 text-slate-400 rotate-180" />
                                  </Button>
                                )}
                                {col.title !== 'Certified' && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-md bg-[#001F3D] text-white hover:bg-black"
                                    onClick={() => updateOrderStatus(order.id, col.title === 'Backlog' ? 'Active' : 'Completed')}
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                  </Button>
                                )}
                             </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {items.length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center px-4">
                        <Box className="h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-[9px] font-bold uppercase tracking-widest">Queue Null</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
