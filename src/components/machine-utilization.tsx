"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MachineLoadPlan } from '@/components/machine-load-plan';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Cpu, Search, Activity, Zap } from 'lucide-react';

const machines = [
  { id: '01', name: 'VMC milling-BFW', load: 85, status: 'active', image: 'https://picsum.photos/seed/apple-vmc1/800/600' },
  { id: '02', name: 'VMC milling-BFW', load: 72, status: 'active', image: 'https://picsum.photos/seed/apple-vmc2/800/600' },
  { id: '03', name: 'VMC milling-HASS', load: 94, status: 'active', image: 'https://picsum.photos/seed/apple-hass/800/600' },
  { id: '04', name: 'VMC milling', load: 45, status: 'fault', image: 'https://picsum.photos/seed/apple-milling4/800/600' },
  { id: '05', name: 'CNC Turning -Jyothi', load: 88, status: 'active', image: 'https://picsum.photos/seed/apple-turning/800/600' },
  { id: '06', name: 'EDM ZNC', load: 60, status: 'maintenance', image: 'https://picsum.photos/seed/apple-edm/800/600' },
];

export function MachineUtilization() {
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

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
        {!selectedMachineId && (
          <div className="px-6 py-2.5 bg-black/[0.03] dark:bg-white/[0.05] rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-black/5 dark:border-white/5">
            Operational Target: <span className="text-primary ml-1">90% Efficiency</span>
          </div>
        )}
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
          ) : (
            <div className="apple-grid">
              {machines.map((machine) => (
                <div 
                  key={machine.id}
                  onClick={() => setSelectedMachineId(machine.id)}
                  className="glass-card p-0 group cursor-pointer hover:scale-[1.02]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image 
                      src={machine.image} 
                      alt={machine.name} 
                      fill 
                      className="object-cover transition-all duration-1000 group-hover:scale-110"
                      data-ai-hint="precision machine"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1">NODE {machine.id}</p>
                          <h3 className="text-lg font-bold text-white leading-tight">{machine.name}</h3>
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
          )}
        </div>

        {/* Side Panel: Elegant List */}
        <div className="lg:col-span-4 sticky top-32 space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">Load Distribution</h3>
            <div className="space-y-6">
              {machines.map((machine) => (
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
              ))}
            </div>
          </div>
          
          <div className="glass-card p-8 bg-primary dark:bg-primary text-white border-none shadow-2xl shadow-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Fleet Efficiency</span>
            </div>
            <p className="text-4xl font-display font-bold tracking-tighter mb-2">74.2%</p>
            <p className="text-xs font-medium opacity-80 leading-relaxed">System performing within 4% of peak theoretical output.</p>
          </div>
        </div>
      </div>

      {/* Modern KPI Row */}
      {!selectedMachineId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Fleet Avg</p>
            <p className="text-3xl font-display font-bold tracking-tight group-hover:text-primary transition-colors">74.2%</p>
          </div>
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Peak Capacity</p>
            <p className="text-3xl font-display font-bold tracking-tight text-green-500">94.0%</p>
          </div>
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Downtime</p>
            <p className="text-3xl font-display font-bold tracking-tight text-red-500">12.4h</p>
          </div>
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Active Nodes</p>
            <p className="text-3xl font-display font-bold tracking-tight">5 <span className="text-muted-foreground text-sm font-normal">/ 6</span></p>
          </div>
        </div>
      )}
    </div>
  );
}