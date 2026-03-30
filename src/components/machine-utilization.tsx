"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MachineLoadPlan } from '@/components/machine-load-plan';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Cpu, Search } from 'lucide-react';

const machines = [
  { id: '01', name: 'VMC milling-BFW (01)', load: 85, status: 'active', image: 'https://picsum.photos/seed/milling1/400/300' },
  { id: '02', name: 'VMC milling-BFW (02)', load: 72, status: 'active', image: 'https://picsum.photos/seed/milling2/400/300' },
  { id: '03', name: 'VMC milling-HASS (03)', load: 94, status: 'active', image: 'https://picsum.photos/seed/milling3/400/300' },
  { id: '04', name: 'VMC milling (04)', load: 45, status: 'fault', image: 'https://picsum.photos/seed/milling4/400/300' },
  { id: '05', name: 'CNC Turning -Jyothi (05)', load: 88, status: 'active', image: 'https://picsum.photos/seed/turning1/400/300' },
  { id: '06', name: 'EDM ZNC (06)', load: 60, status: 'maintenance', image: 'https://picsum.photos/seed/edm1/400/300' },
];

export function MachineUtilization() {
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-headline font-bold uppercase text-slate-800">
            {selectedMachineId ? `Load Plan: ${selectedMachine?.name}` : 'Machine Utilization Overview'}
          </h2>
        </div>
        <div className="px-4 py-1 border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white">
          Plant Target: 90%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {selectedMachineId ? (
            <MachineLoadPlan 
              machineId={selectedMachineId} 
              machineName={selectedMachine?.name || ''} 
              onBack={() => setSelectedMachineId(null)} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {machines.map((machine) => (
                <Card 
                  key={machine.id}
                  onClick={() => setSelectedMachineId(machine.id)}
                  className="overflow-hidden group cursor-pointer hover:border-primary transition-all bg-white border-slate-200 shadow-sm"
                >
                  <div className="relative h-40 w-full">
                    <Image 
                      src={machine.image} 
                      alt={machine.name} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      data-ai-hint="industrial machine"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">ID: {machine.id}</p>
                      <h3 className="text-sm font-bold text-white leading-tight">{machine.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Load Status</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        machine.load > 80 ? "text-green-600" : machine.load > 50 ? "text-blue-600" : "text-red-600"
                      )}>
                        {machine.load}%
                      </span>
                    </div>
                    <Progress value={machine.load} className="h-1.5" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel: Load Distribution List */}
        <Card className="lg:col-span-4 p-8 bg-[#111827] border-slate-800 shadow-2xl flex flex-col h-fit sticky top-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Load Distribution</h3>
          <div className="space-y-8 flex-grow">
            {machines.map((machine) => (
              <div 
                key={machine.id} 
                className="group cursor-pointer space-y-3"
                onClick={() => setSelectedMachineId(machine.id)}
              >
                <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                  <span className={cn(
                    "transition-colors",
                    selectedMachineId === machine.id ? "text-primary" : "text-slate-200 group-hover:text-primary"
                  )}>
                    {machine.name}
                  </span>
                  <span className={cn(
                    machine.load > 85 ? "text-blue-500" : machine.load < 50 ? "text-red-500" : "text-slate-400"
                  )}>
                    {machine.load}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      selectedMachineId === machine.id ? "bg-primary" : "bg-slate-600 group-hover:bg-primary/50"
                    )}
                    style={{ width: `${machine.load}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KPI Cards Bottom Row */}
      {!selectedMachineId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-[#2563eb] text-white border-none shadow-lg">
            <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Avg. Utilization</p>
            <p className="text-3xl font-bold">74.2%</p>
          </Card>
          <Card className="p-6 bg-[#16a34a] text-white border-none shadow-lg">
            <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Peak Capacity</p>
            <p className="text-3xl font-bold">94.0%</p>
          </Card>
          <Card className="p-6 bg-[#dc2626] text-white border-none shadow-lg">
            <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Downtime Hours</p>
            <p className="text-3xl font-bold">12.4h</p>
          </Card>
          <Card className="p-6 bg-[#1f2937] text-white border-none shadow-lg">
            <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 mb-2">Active Units</p>
            <p className="text-3xl font-bold tracking-tight">5 / 6</p>
          </Card>
        </div>
      )}
    </div>
  );
}
