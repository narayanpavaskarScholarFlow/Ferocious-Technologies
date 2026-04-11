
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Plus, History, Clock, User, Cpu, Save, Hash, ArchiveX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { WorkLogEntry as WorkLogEntryType, Machine, SystemUser } from '@/lib/types';

interface WorkLogEntryProps {
  logs: WorkLogEntryType[];
  onAddLog: (log: WorkLogEntryType) => void;
  machines: Machine[];
  users: SystemUser[];
}

export function WorkLogEntry({ logs, onAddLog, machines, users }: WorkLogEntryProps) {
  const { toast } = useToast();
  const [selectedResource, setSelectedResource] = useState('');
  const [activityType, setActivityType] = useState('Production');
  const [workOrderId, setWorkOrderId] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [operator, setOperator] = useState('');

  const handleSaveLog = () => {
    if (!selectedResource || !workOrderId || !duration) {
      toast({
        variant: "destructive",
        title: "Incomplete Entry",
        description: "Please provide a Work Order ID, Resource, and Duration.",
      });
      return;
    }

    const resource = machines.find(m => m.id === selectedResource) || users.find(u => u.id === selectedResource);
    
    const newLog: WorkLogEntryType = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      resourceId: selectedResource,
      resourceName: resource ? resource.name : `Resource ${selectedResource}`,
      operator: operator || 'System User',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift: 'Morning',
      type: activityType as any,
      duration: `${duration}h`,
      activity: description || 'Routine operation recorded',
      workOrderId: workOrderId
    };

    onAddLog(newLog);
    
    toast({
      title: "Log Recorded Successfully",
      description: `Production record for WO #${workOrderId} has been added to the master ledger.`,
    });

    // Reset form
    setWorkOrderId('');
    setDuration('');
    setDescription('');
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
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Work Order ID</Label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. 103645" 
                    className={cn(darkInputClasses, "pr-12")}
                    value={workOrderId}
                    onChange={(e) => setWorkOrderId(e.target.value)}
                  />
                  <Hash className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Select Machine / Resource</Label>
                <Select onValueChange={setSelectedResource} value={selectedResource}>
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue placeholder={(machines.length > 0 || users.length > 0) ? "Select resource..." : "No resources defined"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none">
                    {machines.length > 0 && (
                      <div className="px-2 py-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">Machines</div>
                    )}
                    {machines.map(res => (
                      <SelectItem key={res.id} value={res.id}>{res.name} ({res.mcNumber})</SelectItem>
                    ))}
                    {users.length > 0 && (
                      <div className="px-2 py-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 my-1">Personnel</div>
                    )}
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
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
                  <Input 
                    placeholder="0.0" 
                    className={cn(darkInputClasses, "pr-12")}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Activity Description</Label>
                <Input 
                  placeholder="Describe work performed..." 
                  className={darkInputClasses}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Operator Name</Label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. Sarah Miller" 
                    className={cn(darkInputClasses, "pr-12")}
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  />
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
             <Badge variant="outline" className="text-[10px] font-bold uppercase bg-white">Showing Last {logs.length} Entries</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white hover:bg-transparent border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Resource</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Shift/Type</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Work Order</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Duration</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-8">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
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
                            log.type === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                          )}
                        >
                          {log.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-code text-[10px] font-bold border-slate-200 text-slate-600 bg-slate-50">
                        #{log.workOrderId || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-code text-sm font-bold text-primary">{log.duration}</TableCell>
                    <TableCell className="text-right px-8">
                      <p className="text-xs font-medium text-slate-500 max-w-[200px] ml-auto line-clamp-2">
                        {log.activity}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20 py-10">
                        <ArchiveX className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-slate-500 font-code text-xs italic uppercase tracking-widest">No production logs recorded</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Resource Utilization KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-primary/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Total Logged (24h)</p>
          <p className="text-3xl font-display font-bold text-slate-900">
            {logs.reduce((acc, l) => acc + parseFloat(l.duration), 0).toFixed(1)}h
          </p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-green-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Production Time</p>
          <p className="text-3xl font-display font-bold text-green-600">
            {logs.filter(l => l.type === 'Production').reduce((acc, l) => acc + parseFloat(l.duration), 0).toFixed(1)}h
          </p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-amber-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Maintenance Logged</p>
          <p className="text-3xl font-display font-bold text-amber-600">
            {logs.filter(l => l.type === 'Maintenance').reduce((acc, l) => acc + parseFloat(l.duration), 0).toFixed(1)}h
          </p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm bg-white group hover:border-red-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Setup / Idle Time</p>
          <p className="text-3xl font-display font-bold text-red-600">
            {logs.filter(l => l.type === 'Setup' || l.type === 'Idle').reduce((acc, l) => acc + parseFloat(l.duration), 0).toFixed(1)}h
          </p>
        </Card>
      </div>
    </div>
  );
}
