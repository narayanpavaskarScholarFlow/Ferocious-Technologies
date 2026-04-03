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
import { StaffMember, LeaveBalance, LeaveRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Calendar, 
  Search,
  UserX
} from 'lucide-react';

const staffData: StaffMember[] = [];

const leaveBalances: LeaveBalance[] = [];

const plannedLeaves: LeaveRequest[] = [];

export function ManpowerUtilization() {
  const [activeTab, setActiveTab] = useState('overview');

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
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-10 px-4 font-bold text-[10px] uppercase tracking-widest">
            Available Resources: {staffData.length}
          </Badge>
        </div>
      </header>

      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
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
          {staffData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffData.map((staff) => (
                <Card key={staff.id} className="p-6 flex items-center justify-between border-slate-200 shadow-sm bg-white hover:border-primary/50 transition-colors rounded-2xl">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-slate-50">
                      <AvatarImage src={`https://picsum.photos/seed/${staff.id}/100/100`} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{staff.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{staff.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-bold uppercase py-1 px-3",
                        staff.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                        staff.status === 'break' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      )}
                    >
                      {staff.status}
                    </Badge>
                    <p className="text-[10px] font-code mt-1 text-slate-400">{staff.shift} Shift</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 opacity-40">
              <UserX className="h-12 w-12 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No staff members in database</p>
            </div>
          )}

          <Card className="p-8 border-slate-200 shadow-sm bg-white rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Resource Skill Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Milling', value: 0 },
                { label: 'Turning', value: 0 },
                { label: 'Quality Control', value: 0 },
                { label: 'Logistics', value: 0 },
              ].map((skill) => (
                <div key={skill.label} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase text-slate-600 tracking-tight">{skill.label}</p>
                    <span className="text-[10px] font-code font-bold text-primary">{skill.value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${skill.value}%` }} />
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
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Total Taken</TableHead>
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
                  <Input placeholder="Search staff..." className="h-12 bg-slate-50 border-none rounded-xl" />
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

        <TabsContent value="planned" className="m-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Upcoming Absences</h3>
              <Badge variant="outline" className="bg-white font-bold text-[9px] uppercase">Approved: 0</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Request ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Resource</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Timeline</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Type</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-8">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plannedLeaves.map((pl) => (
                  <TableRow key={pl.id} className="h-20 border-slate-50">
                    <TableCell className="px-8 font-code text-xs text-slate-400">{pl.id}</TableCell>
                    <TableCell className="font-bold text-sm text-slate-900">{pl.resourceName}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">{pl.startDate} — {pl.endDate}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-[9px] font-bold uppercase">{pl.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Badge className="bg-green-50 text-green-700 border border-green-100 text-[9px] font-bold uppercase px-3">
                        {pl.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {plannedLeaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-code text-xs italic uppercase">No upcoming absences recorded</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="m-0">
          <Card className="p-10 border-slate-200 bg-white shadow-xl rounded-3xl min-h-[500px] flex flex-col justify-center items-center text-center">
            <Calendar className="h-16 w-16 text-primary/20 mb-6" />
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Company Annual Leave Plan Sheet</h3>
            <p className="text-muted-foreground max-w-lg mb-8">
              This interactive heat-map tracks plant-wide availability for the 2025 financial year, ensuring critical operation staffing levels are maintained during peak vacation periods.
            </p>
            <div className="grid grid-cols-12 gap-2 w-full max-w-4xl opacity-50">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-sm bg-slate-100" />
              ))}
            </div>
            <div className="mt-8 flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-sm bg-primary" /> Peak (0-20% Avail)</div>
               <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-sm bg-amber-400" /> Caution (21-50%)</div>
               <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-sm bg-slate-100" /> Optimal (&gt;50%)</div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}