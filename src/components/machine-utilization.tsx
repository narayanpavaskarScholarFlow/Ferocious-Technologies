"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MachineLoadPlan } from '@/components/machine-load-plan';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Cpu, Search, Activity, Zap, BoxSelect, Plus, Settings2, Ruler, Warehouse, Factory, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Machine, MachineCategory } from '@/lib/types';
import placeholderImages from '@/app/lib/placeholder-images.json';

interface MachineUtilizationProps {
  machines: Machine[];
  onMachinesChange: (machines: Machine[]) => void;
}

export function MachineUtilization({ machines, onMachinesChange }: MachineUtilizationProps) {
  const { toast } = useToast();
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: '',
    type: 'Milling' as Exclude<MachineCategory, 'All'>,
    mcNumber: '',
    make: '',
    bedSize: '',
    costPerHour: ''
  });

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  const handleAddMachine = () => {
    if (!newMachine.name || !newMachine.mcNumber || !newMachine.make) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Protocol requires Machine Name, MC Number, and Manufacturer for registration."
      });
      return;
    }

    // Assign image based on type from placeholders
    const imgMap: Record<string, string> = {
      'Milling': placeholderImages.placeholderImages.find(i => i.id === 'milling')?.imageUrl || '',
      'Turning': placeholderImages.placeholderImages.find(i => i.id === 'turning')?.imageUrl || '',
      'Grinding': placeholderImages.placeholderImages.find(i => i.id === 'grinding')?.imageUrl || '',
      '3D Printing': placeholderImages.placeholderImages.find(i => i.id === '3d-printing')?.imageUrl || '',
      'EDM': placeholderImages.placeholderImages.find(i => i.id === 'edm')?.imageUrl || '',
      'Double Column Milling': placeholderImages.placeholderImages.find(i => i.id === 'double-column')?.imageUrl || '',
    };

    const machine: Machine = {
      id: newMachine.mcNumber,
      name: newMachine.name,
      type: newMachine.type,
      mcNumber: newMachine.mcNumber,
      make: newMachine.make,
      bedSize: newMachine.bedSize || 'Standard',
      costPerHour: parseFloat(newMachine.costPerHour) || 0,
      load: Math.floor(Math.random() * 40) + 40, // Random initial load
      status: 'active',
      image: imgMap[newMachine.type] || 'https://picsum.photos/seed/machine/600/400'
    };

    onMachinesChange([...machines, machine]);
    toast({
      title: "Node Registered",
      description: `${machine.name} has been synchronized with Asset Telemetry.`
    });

    setIsAddMachineOpen(false);
    setNewMachine({ name: '', type: 'Milling', mcNumber: '', make: '', bedSize: '', costPerHour: '' });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Activity className="h-4 w-4" />
            Asset Telemetry
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight">
            {selectedMachineId ? selectedMachine?.name : 'Resource Catalog'}
          </h2>
          <p className="text-muted-foreground font-medium">Real-time load balancing across {machines.length} active nodes.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsAddMachineOpen(true)}
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-3 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Register New Asset
          </Button>
          {!selectedMachineId && (
            <div className="px-6 py-2.5 bg-black/[0.03] dark:bg-white/[0.05] rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-black/5 dark:border-white/5">
              Operational Target: <span className="text-primary ml-1">90% Efficiency</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {selectedMachineId ? (
            <MachineLoadPlan 
              machineId={selectedMachineId} 
              machineName={selectedMachine?.name || ''} 
              onBack={() => setSelectedMachineId(null)} 
            />
          ) : machines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {machines.map((machine) => (
                <div 
                  key={machine.id}
                  onClick={() => setSelectedMachineId(machine.id)}
                  className="glass-card p-0 group cursor-pointer hover:scale-[1.02]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image 
                      src={machine.image} 
                      alt={machine.name} 
                      fill 
                      className="object-cover transition-all duration-1000 group-hover:scale-110"
                      data-ai-hint="industrial machine"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1">NODE {machine.mcNumber}</p>
                          <h3 className="text-lg font-bold text-white leading-tight">{machine.name}</h3>
                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">{machine.make} • {machine.bedSize}</p>
                        </div>
                        <div className={cn(
                          "h-2 w-2 rounded-full mb-1 animate-pulse",
                          machine.status === 'active' ? 'bg-green-400' : 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.5)]'
                        )} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Operational Load</span>
                      <span className={cn(
                        machine.load > 80 ? "text-green-500" : machine.load > 50 ? "text-primary" : "text-red-500"
                      )}>
                        {machine.load}%
                      </span>
                    </div>
                    <div className="h-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          machine.load > 80 ? "bg-green-500" : machine.load > 50 ? "bg-primary" : "bg-red-500"
                        )}
                        style={{ width: `${machine.load}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[400px] glass-card flex flex-col items-center justify-center text-slate-400 opacity-40">
              <BoxSelect className="h-16 w-16 mb-6" />
              <h3 className="text-xl font-display font-bold uppercase tracking-tight">No resources registered</h3>
              <p className="text-sm font-medium mt-2">The catalog is currently empty. Add machines via the management interface.</p>
            </div>
          )}
        </div>

        {/* Side Panel: Elegant List */}
        <div className="lg:col-span-4 sticky top-32 space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">Load Distribution</h3>
            <div className="space-y-6">
              {machines.length > 0 ? machines.map((machine) => (
                <div 
                  key={machine.id} 
                  className="group cursor-pointer space-y-3"
                  onClick={() => setSelectedMachineId(machine.id)}
                >
                  <div className="flex justify-between items-center text-[11px] font-bold tracking-tight">
                    <span className={cn(
                      "transition-all duration-300",
                      selectedMachineId === machine.id ? "text-primary translate-x-1" : "text-muted-foreground group-hover:text-primary group-hover:translate-x-1"
                    )}>
                      {machine.name}
                    </span>
                    <span className={cn(
                      "text-[10px] transition-opacity duration-300",
                      selectedMachineId === machine.id ? "opacity-100" : "opacity-40"
                    )}>
                      {machine.load}%
                    </span>
                  </div>
                  <div className="h-1 bg-black/[0.03] dark:bg-white/[0.05] rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        selectedMachineId === machine.id ? "bg-primary" : "bg-muted-foreground/20 group-hover:bg-primary/40"
                      )}
                      style={{ width: `${machine.load}%` }} 
                    />
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-bold text-slate-300 italic">SYSTEM_OFFLINE: Waiting for resource registration...</p>
              )}
            </div>
          </div>
          
          <div className="glass-card p-8 bg-primary dark:bg-primary text-white border-none shadow-2xl shadow-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Fleet Efficiency</span>
            </div>
            <p className="text-4xl font-display font-bold tracking-tighter mb-2">
              {machines.length > 0 
                ? (machines.reduce((acc, m) => acc + m.load, 0) / machines.length).toFixed(1)
                : '0.0'}%
            </p>
            <p className="text-xs font-medium opacity-80 leading-relaxed">
              {machines.length > 0 
                ? `Monitoring ${machines.length} operational nodes in current session.`
                : 'No operational nodes detected in current session.'}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isAddMachineOpen} onOpenChange={setIsAddMachineOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="space-y-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit">
              <Factory className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Asset Registration Protocol</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Configure technical specifications for industrial node integration.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Machine Name</Label>
                <Input 
                  placeholder="e.g. VMC Milling Haas" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Machine Category</Label>
                <Select value={newMachine.type} onValueChange={(val: any) => setNewMachine({...newMachine, type: val})}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Milling" className="text-xs font-bold uppercase">Milling Center</SelectItem>
                    <SelectItem value="Turning" className="text-xs font-bold uppercase">Turning Center</SelectItem>
                    <SelectItem value="Grinding" className="text-xs font-bold uppercase">Grinding Unit</SelectItem>
                    <SelectItem value="3D Printing" className="text-xs font-bold uppercase">Additive Mfg</SelectItem>
                    <SelectItem value="EDM" className="text-xs font-bold uppercase">EDM Machine</SelectItem>
                    <SelectItem value="Double Column Milling" className="text-xs font-bold uppercase">Double Column</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">MC Number / Technical ID</Label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. TR-MC-001" 
                    className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold font-code pl-10"
                    value={newMachine.mcNumber}
                    onChange={(e) => setNewMachine({...newMachine, mcNumber: e.target.value})}
                  />
                  <Settings2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Manufacturer (Make)</Label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. Haas, BFW" 
                    className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold pl-10"
                    value={newMachine.make}
                    onChange={(e) => setNewMachine({...newMachine, make: e.target.value})}
                  />
                  <Warehouse className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Bed Size / Spatial Capacity</Label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. 1000 x 500" 
                    className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold pl-10"
                    value={newMachine.bedSize}
                    onChange={(e) => setNewMachine({...newMachine, bedSize: e.target.value})}
                  />
                  <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Machine Per Hour Cost ($)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="e.g. 150.00" 
                    className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold pl-10"
                    value={newMachine.costPerHour}
                    onChange={(e) => setNewMachine({...newMachine, costPerHour: e.target.value})}
                  />
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                variant="ghost" 
                className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400"
                onClick={() => setIsAddMachineOpen(false)}
              >
                Abort Protocol
              </Button>
              <Button 
                className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                onClick={handleAddMachine}
              >
                Execute Registration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
