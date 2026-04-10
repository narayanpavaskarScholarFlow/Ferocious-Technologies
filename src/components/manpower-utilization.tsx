"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SystemUser, LeaveBalance, LeaveRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Calendar, 
  Search,
  UserX,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const leaveBalances: LeaveBalance[] = [];
const plannedLeaves: LeaveRequest[] = [];

const JOB_TITLES = [
  "Manager",
  "Supervisor",
  "VMC Programmer",
  "VMC Operator",
  "Tool Maker",
  "Senior Tool Maker"
];

const DEPARTMENTS = [
  "Admin",
  "Account",
  "Market",
  "Design",
  "Tool Room",
  "VMC Milling",
  "CNC Turning",
  "Assembly",
  "Quality"
];

interface ManpowerUtilizationProps {
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
}

export function ManpowerUtilization({ users, onSaveUser }: ManpowerUtilizationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    dept: '',
    shift: 'Morning' as any,
    email: ''
  });

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.role || !newStaff.dept) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Full identity, role, and department assignment required."
      });
      return;
    }

    const member: SystemUser = {
      id: `USER-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newStaff.name.trim(),
      email: newStaff.email || `${newStaff.name.toLowerCase().replace(' ', '.')}@bharataxis.tech`,
      role: newStaff.role,
      dept: newStaff.dept,
      status: 'active',
      shift: newStaff.shift,
      efficiency: 0,
      permissions: { overview: 'read' },
      lastLogin: 'Never'
    };

    onSaveUser(member);
    toast({
      title: "Resource Synchronized",
      description: `${member.name} has been added to the master resource pool.`
    });

    setIsAddStaffOpen(false);
    setStep(1);
    setNewStaff({ name: '', role: '', dept: '', shift: 'Morning', email: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Users className="h-4 w-4" />
            Human Resources & Ops
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Resource Management
          </h2>
          <p className="text-muted-foreground font-medium">Coordinate manpower availability, leave planning, and shift efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsAddStaffOpen(true)}
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            <UserPlus className="h-4 w-4" /> Register New Resource
          </Button>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-10 px-4 font-bold text-[10px] uppercase tracking-widest">
            Available: {users.length}
          </Badge>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200">
          <TabsTrigger value="overview" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Operational Overview
          </TabsTrigger>
          <TabsTrigger value="balance" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Leave Balance
          </TabsTrigger>
          <TabsTrigger value="apply" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Apply Leave
          </TabsTrigger>
          <TabsTrigger value="planned" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Planned Leave
          </TabsTrigger>
          <TabsTrigger value="annual" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Annual Leave Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 m-0">
          {users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((member) => (
                <Card key={member.id} className="p-6 flex items-center justify-between border-slate-200 shadow-sm bg-white hover:border-primary/50 transition-colors rounded-2xl">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-slate-50">
                      <AvatarImage src={`https://picsum.photos/seed/${member.id}/100/100`} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{member.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{member.role} • {member.dept}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-bold uppercase py-1 px-3",
                        member.status === 'active' || member.status === 'online' ? 'bg-green-50 text-green-600 border-green-100' :
                        member.status === 'break' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      )}
                    >
                      {member.status}
                    </Badge>
                    <p className="text-[10px] font-code mt-1 text-slate-400">{member.shift || 'Morning'} Shift</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 opacity-40">
              <UserX className="h-12 w-12 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No personnel in resource pool</p>
            </div>
          )}

          <Card className="p-8 border-slate-200 shadow-sm bg-white rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Resource Skill Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Milling', value: users.filter(s => s.dept === 'VMC Milling').length * 20 },
                { label: 'Turning', value: users.filter(s => s.dept === 'CNC Turning').length * 20 },
                { label: 'Quality Control', value: users.filter(s => s.dept === 'Quality').length * 20 },
                { label: 'Logistics', value: users.filter(s => s.dept === 'Market').length * 20 },
              ].map((skill) => (
                <div key={skill.label} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase text-slate-600 tracking-tight">{skill.label}</p>
                    <span className="text-[10px] font-code font-bold text-primary">{Math.min(skill.value, 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(skill.value, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="m-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Resource Leave Ledger</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search resource..." className="pl-10 h-9 text-xs bg-white border-none" />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-slate-100 hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Resource Name</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Annual Leave</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Sick Leave</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Casual Leave</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center">Total Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.map((lb) => (
                  <TableRow key={lb.id} className="h-20 border-slate-50">
                    <TableCell className="px-8 font-bold text-sm text-slate-900">{lb.resourceName}</TableCell>
                    <TableCell className="text-center font-code text-sm text-slate-600">{lb.annual} d</TableCell>
                    <TableCell className="text-center font-code text-sm text-slate-600">{lb.sick} d</TableCell>
                    <TableCell className="text-center font-code text-sm text-slate-600">{lb.casual} d</TableCell>
                    <TableCell className="text-center font-code text-sm text-primary font-bold">{lb.totalTaken} d</TableCell>
                  </TableRow>
                ))}
                {leaveBalances.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-code text-xs italic uppercase">No leave records found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="apply" className="m-0 max-w-2xl mx-auto">
          <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-3xl">
            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-display font-bold text-slate-900">Request Leave</h3>
                <p className="text-sm text-muted-foreground">Submit your leave request for departmental approval.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Leave Type</Label>
                  <Input placeholder="e.g. Annual Leave" className="h-12 bg-slate-50 border-none rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Resource Name</Label>
                  <Select>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl">
                      <SelectValue placeholder="Select user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Start Date</Label>
                  <Input type="date" className="h-12 bg-slate-50 border-none rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">End Date</Label>
                  <Input type="date" className="h-12 bg-slate-50 border-none rounded-xl" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Reason / Description</Label>
                <Input placeholder="Enter brief reason for absence..." className="h-24 bg-slate-50 border-none rounded-xl" />
              </div>

              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
                Submit Leave Application
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem]">
          <DialogTitle className="sr-only">Personnel Registration Protocol</DialogTitle>
          <DialogDescription className="sr-only">Register new human resources for operational tracking and scheduling.</DialogDescription>
          
          <div className="flex h-[600px]">
            <div className="w-72 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-4 bg-[#001F3D] rounded-2xl w-fit shadow-xl shadow-primary/20 relative">
                  <UserPlus className="h-7 w-7 text-white" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="space-y-8">
                  {[
                    { s: 1, label: 'Identify Resource', desc: 'NAME & PERSONAL' },
                    { s: 2, label: 'Deployment', desc: 'DEPT & SHIFT' },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-5 group relative">
                      {item.s < 2 && (
                        <div className={cn(
                          "absolute left-3 top-8 w-[1px] h-10 transition-colors",
                          step > item.s ? "bg-emerald-500" : "bg-slate-200"
                        )} />
                      )}
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10",
                        step === item.s ? "bg-[#001F3D] border-[#001F3D] text-white scale-125 shadow-lg shadow-primary/30" : 
                        step > item.s ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-400"
                      )}>
                        {step > item.s ? <Check className="h-3 w-3" /> : item.s}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-bold transition-colors duration-500 leading-none",
                          step === item.s ? "text-[#001F3D]" : "text-slate-400"
                        )}>{item.label}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.15em] mt-1.5">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                RESOURCE_REG_V2.4
              </div>
            </div>

            <div className="flex-1 p-12 flex flex-col justify-between overflow-hidden bg-white">
              <div className="space-y-10 flex-grow overflow-hidden flex flex-col">
                {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">01. Identity</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Resource Registration Base</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Personnel Full Name</Label>
                        <Input 
                          placeholder="e.g. John Operator" 
                          className="h-12 bg-slate-50/50 border-none text-xs font-bold rounded-xl"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Email Address</Label>
                        <Input 
                          placeholder="e.g. john@bharataxis.tech" 
                          className="h-12 bg-slate-50/50 border-none text-xs font-bold rounded-xl"
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Functional Role</Label>
                        <Select value={newStaff.role} onValueChange={(val) => setNewStaff({...newStaff, role: val})}>
                          <SelectTrigger className="h-12 bg-slate-50/50 border-none text-xs font-bold rounded-xl">
                            <SelectValue placeholder="Select designation..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {JOB_TITLES.map(title => (
                              <SelectItem key={title} value={title} className="text-xs font-bold uppercase">{title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      <div>
                        <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">02. Deployment</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Allocation</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Department</Label>
                        <Select value={newStaff.dept} onValueChange={(val) => setNewStaff({...newStaff, dept: val})}>
                          <SelectTrigger className="h-12 bg-slate-50/50 border-none text-xs font-bold rounded-xl">
                            <SelectValue placeholder="Select dept..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {DEPARTMENTS.map(dept => (
                              <SelectItem key={dept} value={dept} className="text-xs font-bold uppercase">{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Primary Shift</Label>
                        <Select value={newStaff.shift} onValueChange={(val) => setNewStaff({...newStaff, shift: val as any})}>
                          <SelectTrigger className="h-12 bg-slate-50/50 border-none text-xs font-bold rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Morning" className="text-xs font-bold uppercase">Morning Shift</SelectItem>
                            <SelectItem value="Evening" className="text-xs font-bold uppercase">Evening Shift</SelectItem>
                            <SelectItem value="Night" className="text-xs font-bold uppercase">Night Shift</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(s => s - 1)} 
                  disabled={step === 1}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#001F3D] px-0"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Protocol Back
                </Button>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Abort
                  </Button>
                  <Button 
                    onClick={step === 2 ? handleAddStaff : () => setStep(s => s + 1)}
                    className={cn(
                      "rounded-xl px-10 h-12 font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 flex gap-3",
                      step === 2 ? "bg-primary hover:bg-[#002d4f] shadow-primary/30" : "bg-slate-900 hover:bg-black shadow-black/20"
                    )}
                  >
                    {step === 2 ? 'Commit & Finalize' : 'Execute Next Step'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
