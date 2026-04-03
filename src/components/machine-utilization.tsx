"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MachineLoadPlan } from '@/components/machine-load-plan';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Cpu, Search, Activity, Zap, BoxSelect } from 'lucide-react';

const machines: any[] = [];

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
          ) : machines.length > 0 ? (
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
            <p className="text-4xl font-display font-bold tracking-tighter mb-2">0.0%</p>
            <p className="text-xs font-medium opacity-80 leading-relaxed">No operational nodes detected in current session.</p>
          </div>
        </div>
      </div>

      {/* Modern KPI Row */}
      {!selectedMachineId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Fleet Avg</p>
            <p className="text-3xl font-display font-bold tracking-tight group-hover:text-primary transition-colors">0.0%</p>
          </div>
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Peak Capacity</p>
            <p className="text-3xl font-display font-bold tracking-tight text-green-500">0.0%</p>
          </div>
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Downtime</p>
            <p className="text-3xl font-display font-bold tracking-tight text-red-500">0.0h</p>
          </div>
          <div className="glass-card p-8 group">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Active Nodes</p>
            <p className="text-3xl font-display font-bold tracking-tight">0 <span className="text-muted-foreground text-sm font-normal">/ 0</span></p>
          </div>
        </div>
      )}
    </div>
  );
}