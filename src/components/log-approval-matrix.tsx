
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  ChevronRight,
  Filter,
  Search,
  Lock
} from 'lucide-react';
import { WorkLogEntry, SystemUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface LogApprovalMatrixProps {
  logs: WorkLogEntry[];
  users: SystemUser[];
  currentUser: string | null;
}

export function LogApprovalMatrix({ logs, users, currentUser }: LogApprovalMatrixProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const currentUserData = useMemo(() => {
    return users.find(u => u.name === currentUser);
  }, [users, currentUser]);

  const submittedLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = l.operator.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           l.workOrderId?.includes(searchTerm);
      const isManager = currentUser === 'Master Admin' || users.find(u => u.id === l.operatorId)?.reportingManager === currentUser;
      return l.status === 'Submitted' && matchesSearch && (currentUser === 'Master Admin' || isManager);
    });
  }, [logs, searchTerm, currentUser, users]);

  const handleApprove = (log: WorkLogEntry) => {
    updateDocumentNonBlocking(doc(db, 'work_logs', log.id), {
      status: 'Approved',
      approvedBy: currentUser || 'Manager',
      approvedAt: new Date().toISOString()
    });

    toast({
      title: "Operation Certified",
      description: `Log for ${log.operator} on WO #${log.workOrderId} has been approved.`,
    });
  };

  const handleReject = (log: WorkLogEntry) => {
    updateDocumentNonBlocking(doc(db, 'work_logs', log.id), {
      status: 'Draft' // Return to draft so user can fix
    });

    toast({
      variant: "destructive",
      title: "Protocol Rejected",
      description: `Log returned to ${log.operator} for correction.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20"><UserCheck className="h-6 w-6 text-white" /></div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Certification Matrix</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Pending Approval Queue: {submittedLogs.length} Entries</p>
            </div>
          </div>
          <div className="relative w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by operator or work order..." 
              className="pl-10 h-11 bg-white border-slate-200 text-xs rounded-xl shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10 w-40">Session Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Personnel Identity</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Yield (Duration)</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">OT Detection</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Observation</TableHead>
              <TableHead className="text-right px-10 w-40">Certification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submittedLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/50 h-28 border-slate-50 group">
                <TableCell className="px-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-code font-bold text-slate-500">{log.date}</span>
                    <Badge variant="outline" className="mt-1 border-primary/20 text-primary text-[8px] font-bold w-fit">WO #{log.workOrderId}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#001F3D] font-bold text-xs border border-slate-200">
                      {log.operator.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{log.operator}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xl font-display font-bold text-[#001F3D]">{log.duration}</span>
                </TableCell>
                <TableCell>
                   {log.isOT ? (
                     <div className="flex flex-col">
                       <Badge className="bg-emerald-500 text-white border-none text-[9px] font-bold px-3">OT: {log.otHours}h</Badge>
                       <span className="text-[7px] text-slate-300 font-bold uppercase mt-1">Certified upon approval</span>
                     </div>
                   ) : (
                     <span className="text-[9px] text-slate-300 font-bold uppercase">No OT</span>
                   )}
                </TableCell>
                <TableCell>
                  <p className="text-xs text-slate-500 font-medium italic line-clamp-2 max-w-[300px]">"{log.activity}"</p>
                </TableCell>
                <TableCell className="text-right px-10">
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg h-10 px-4 border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold text-[9px] uppercase tracking-widest gap-2"
                      onClick={() => handleReject(log)}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="rounded-lg h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-600/20"
                      onClick={() => handleApprove(log)}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {submittedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-96 text-center">
                  <div className="flex flex-col items-center justify-center opacity-30 py-10">
                    <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                      <ShieldCheck className="h-20 w-20 text-slate-300" />
                    </div>
                    <p className="text-[#001F3D] font-headline font-bold text-2xl uppercase tracking-tight">Queue Synchronized</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium leading-relaxed">No pending operational nodes detected for your management identifier.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
