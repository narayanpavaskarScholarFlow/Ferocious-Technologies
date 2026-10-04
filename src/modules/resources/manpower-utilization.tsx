"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SystemUser, UserLeave } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Plus, 
  CalendarDays, 
  ClipboardList, 
  Wallet, 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { DatePicker } from '@/components/ui/date-picker';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export interface AnnualLeaveEntry {
  id: string;
  description: string;
  month: string;
  dates: string;
  year: number;
  reason: string;
  status: 'Planned' | 'Approved';
  startDate: string; 
  endDate: string;
}

interface ManpowerUtilizationProps {
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
  currentUser?: string | null;
  initialSubTab?: string;
}

export function ManpowerUtilization({ users, onSaveUser, currentUser, initialSubTab = 'overview' }: ManpowerUtilizationProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [isAddAnnualOpen, setIsAddAnnualOpen] = useState(false);
  
  const currentUserData = useMemo(() => {
    return users.find(u => u.name === currentUser || u.email === currentUser);
  }, [users, currentUser]);

  const isMasterAdmin = currentUser === 'Master Admin';
  const isHR = currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager';

  const [newAnnual, setNewAnnual] = useState({
    description: '',
    month: MONTHS[new Date().getMonth()],
    dates: '',
    reason: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  });

  const annualQuery = useMemoFirebase(() => collection(db, 'annual_leaves'), [db]);
  const { data: annualLeavesRaw } = useCollection<AnnualLeaveEntry>(annualQuery);
  const annualLeaves = annualLeavesRaw || [];

  const handleUpdateBalance = (userId: string, field: 'annual' | 'sick' | 'casual', value: string) => {
    if (!isHR && !isMasterAdmin) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const numValue = parseInt(value) || 0;
    const currentBalance = user.leaveBalance || { annual: 0, sick: 0, casual: 0 };
    
    const updatedUser: SystemUser = {
      ...user,
      leaveBalance: {
        ...currentBalance,
        [field]: numValue
      }
    };

    onSaveUser(updatedUser);
    toast({
      title: "Balance Adjusted",
      description: `Leave credit node for ${user.name} modified successfully.`
    });
  };

  const handleAddAnnualLeave = () => {
    if (!isMasterAdmin) return;
    const entryId = `AL-${Date.now()}`;
    const entry: AnnualLeaveEntry = {
      id: entryId,
      description: newAnnual.description,
      month: newAnnual.month,
      dates: `${new Date(newAnnual.startDate).getDate()} - ${new Date(newAnnual.endDate).getDate()}`,
      year: new Date(newAnnual.startDate).getFullYear(),
      reason: newAnnual.reason,
      status: 'Planned',
      startDate: newAnnual.startDate,
      endDate: newAnnual.endDate
    };
    setDocumentNonBlocking(doc(db, 'annual_leaves', entryId), entry, { merge: true });
    setIsAddAnnualOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="overview" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] transition-all">Global Workforce Matrix</TabsTrigger>
          <TabsTrigger value="balance" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] transition-all">Global Leave Balance</TabsTrigger>
          <TabsTrigger value="annual" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] transition-all">Plant Holiday Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {users.map((member) => (
              <Card key={member.id} className="p-8 border-slate-200 shadow-xl bg-white hover:border-primary/50 transition-all rounded-[2rem] flex flex-col justify-between">
                <div className="flex items-center gap-5 mb-6">
                  <Avatar className="h-14 w-14 border-4 border-slate-50 shadow-sm">
                    <AvatarImage src={member.image} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-[#001F3D] uppercase">{member.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{member.role}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-10 font-bold text-[9px] uppercase tracking-widest gap-2" onClick={() => setActiveTab('balance')}>
                  <Wallet className="h-3 w-3" /> View Balance
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="balance" className="m-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="px-10 py-6 text-[10px] font-bold uppercase">Personnel Node</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase">Annual (PL)</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase">Sick (SL)</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase">Casual (CL)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="h-20 border-slate-50">
                    <TableCell className="px-10"><span className="font-bold text-sm text-[#001F3D] uppercase">{user.name}</span></TableCell>
                    <TableCell className="text-center"><Input type="number" className="w-16 h-8 mx-auto text-center" defaultValue={user.leaveBalance?.annual || 0} onBlur={(e) => handleUpdateBalance(user.id, 'annual', e.target.value)} /></TableCell>
                    <TableCell className="text-center"><Input type="number" className="w-16 h-8 mx-auto text-center" defaultValue={user.leaveBalance?.sick || 0} onBlur={(e) => handleUpdateBalance(user.id, 'sick', e.target.value)} /></TableCell>
                    <TableCell className="text-center"><Input type="number" className="w-16 h-8 mx-auto text-center" defaultValue={user.leaveBalance?.casual || 0} onBlur={(e) => handleUpdateBalance(user.id, 'casual', e.target.value)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="m-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase">Plant Holiday Matrix</h3>
                {isMasterAdmin && <Button onClick={() => setIsAddAnnualOpen(true)} className="bg-[#001F3D] text-white font-bold text-[9px] uppercase"><Plus className="h-4 w-4 mr-2" /> Add Entry</Button>}
             </div>
             <Table>
                <TableBody>
                   {annualLeaves.map(plan => (
                     <TableRow key={plan.id} className="h-20 border-slate-50">
                        <TableCell className="px-10 font-bold uppercase">{plan.description}</TableCell>
                        <TableCell className="text-center uppercase text-[10px] font-bold text-slate-400">{plan.month} {plan.year}</TableCell>
                        <TableCell className="text-right px-10"><Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, 'annual_leaves', plan.id))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                     </TableRow>
                   ))}
                </TableBody>
             </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
