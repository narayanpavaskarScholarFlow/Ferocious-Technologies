"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Plus, History, Clock, User, Cpu, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const mockResources = [
  { id: '01', name: 'VMC milling-BFW' },
  { id: '02', name: 'VMC milling-BFW' },
  { id: '03', name: 'VMC milling-HASS' },
  { id: '04', name: 'VMC milling' },
  { id: '05', name: 'CNC Turning -Jyothi' },
  { id: '06', name: 'EDM ZNC' },
];

const mockRecentLogs = [
  { id: 'LOG-001', resourceName: 'VMC milling-BFW (01)', operator: 'Sarah Miller', date: '03 Mar 2025', shift: 'Morning', type: 'Production', duration: '4.5h', activity: 'Main batch production #103645' },
  { id: 'LOG-002', resourceName: 'CNC Turning -Jyothi (05)', operator: 'Sarah Miller', date: '03 Mar 2025', shift: 'Morning', type: 'Setup', duration: '1.2h', activity: 'Tool changing for new order' },
  { id: 'LOG-003', resourceName: 'EDM ZNC (06)', operator: 'A. Chen', date: '02 Mar 2025', shift: 'Evening', type: 'Maintenance', duration: '2.0h', activity: 'Routine electrode inspection' },
];

export function WorkLogEntry() {
  const { toast } = useToast();
  const [selectedResource, setSelectedResource] = useState('');
  const [activityType, setActivityType] = useState('Production');

  const handleSaveLog = () => {
    toast({
      title: "Log Recorded Successfully",
      description: "Production record has been added to the master ledger.",
    });
  };

  const darkInputClasses = "bg-[#0a0f18] border-none text-white h-12 focus-visible:ring-primary/50 text-sm font-medium";
  const darkSelectClasses = "bg-[#0a0f18] border-none text-white h-12 focus:ring-primary/50 text-sm font-medium";

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <ClipboardList className="h-4 w-4" />
            Operational Ledger
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Work Log Entry
          </h2>
          <p className="text-muted-foreground font-medium">Record resource activity, downtime, and operator throughput.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20" onClick={handleSaveLog}>
             <Save className="h-4 w-4" /> Submit Daily Log
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Entry Form */}
        <Card className="lg:col-span-4 p-8 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col h-fit">
          <div className="space-y-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Log Record
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Select Machine / Resource</Label>
                <Select onValueChange={setSelectedResource}>
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue placeholder="Select resource..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none">
                    {mockResources.map(res => (
                      <SelectItem key={res.id} value={res.id}>{res.name} ({res.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Shift</Label>
                  <Select defaultValue="Morning">
                    <SelectTrigger className={darkSelectClasses}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] text-white border-none">
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Type</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger className={darkSelectClasses}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] text-white border-none">
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Idle">Idle</SelectItem>
                      <SelectItem value="Setup">Setup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Duration (Hours)</Label>
                <div className="relative">
                  <Input placeholder="0.0" className={cn(darkInputClasses, "pr-12")} />
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Activity Description</Label>
                <Input placeholder="Describe work performed..." className={darkInputClasses} />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Operator Name</Label>
                <div className="relative">
                  <Input defaultValue="Sarah Miller" className={cn(darkInputClasses, "pr-12")} />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Logs Table */}
        <Card className="lg:col-span-8 overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Recent Operational Entries</h3>
             </div>
             <Badge variant="outline" className="text-[10px] font-bold uppercase bg-white">Showing Last 15 Entries</Badge>
          </div>
          <Table>
            <TableHeader className="bg-white hover:bg-transparent border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Resource</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Shift/Type</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Operator</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Duration</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-right px-8">Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecentLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                  <TableCell className="px-8">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900">{log.resourceName}</span>
                      <span className="text-[10px] text-slate-400 font-code">{log.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-700">{log.shift}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-bold uppercase w-fit px-2",
                          log.type === 'Production' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          log.type === 'Maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        )}
                      >
                        {log.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-600">{log.operator}</TableCell>
                  <TableCell className="font-code text-sm font-bold text-primary">{log.duration}</TableCell>
                  <TableCell className="text-right px-8">
                    <p className="text-xs font-medium text-slate-500 max-w-[200px] ml-auto line-clamp-2">
                      {log.activity}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Resource Utilization KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-primary/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Total Logged (24h)</p>
          <p className="text-3xl font-display font-bold text-slate-900">42.5h</p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-green-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Production Time</p>
          <p className="text-3xl font-display font-bold text-green-600">34.0h</p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-amber-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Maintenance Logged</p>
          <p className="text-3xl font-display font-bold text-amber-600">6.5h</p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-red-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Setup / Idle Time</p>
          <p className="text-3xl font-display font-bold text-red-600">2.0h</p>
        </Card>
      </div>
    </div>
  );
}
