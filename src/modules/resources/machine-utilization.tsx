"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  Activity, 
  Plus, 
  Factory, 
  Edit3, 
  LayoutGrid, 
  List, 
  CalendarRange,
  ChevronRight
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Machine, MachineCategory, Order } from '@/lib/types';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { MachineLoadPlan } from '@/modules/resources/machine-load-plan';

interface MachineUtilizationProps {
  machines: Machine[];
  orders: Order[];
  onSaveMachine: (machine: Machine) => void;
}

export function MachineUtilization({ machines, orders, onSaveMachine }: MachineUtilizationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fleet');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [selectedMachineIdForLoad, setSelectedMachineIdForLoad] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Milling' as Exclude<MachineCategory, 'All'>,
    mcNumber: '',
    make: '',
    bedSize: '',
    costPerHour: '',
    image: ''
  });

  const averageOEE = useMemo(() => {
    if (machines.length === 0) return 0;
    return (machines.reduce((acc, m) => acc + (m.load || 0), 0) / machines.length).toFixed(1);
  }, [machines]);

  const handleSaveMachine = () => {
    if (!formData.name || !formData.mcNumber) return;
    const machine: Machine = {
      id: editingMachine?.id || formData.mcNumber,
      name: formData.name,
      type: formData.type,
      mcNumber: formData.mcNumber,
      make: formData.make,
      bedSize: formData.bedSize || 'Standard',
      costPerHour: parseFloat(formData.costPerHour) || 0,
      load: editingMachine?.load || 0,
      status: editingMachine?.status || 'active',
      image: formData.image || 'https://picsum.photos/seed/machine/600/400'
    };
    onSaveMachine(machine);
    setIsAddMachineOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Activity className="h-4 w-4" />
            Machine Management
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            Machine <span className="text-slate-400 font-medium">Management</span>
          </h2>
        </div>
        <Button onClick={() => setIsAddMachineOpen(true)} className="rounded-xl bg-[#001F3D] text-white h-11 px-8 font-bold text-[10px] uppercase shadow-xl">
           <Plus className="h-4 w-4 mr-2" /> Register Asset
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200">
          <TabsTrigger value="fleet" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Asset Fleet Matrix</TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Load Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="m-0 space-y-10">
           <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col items-center justify-center h-48 opacity-20">
              <p className="text-[10px] font-black uppercase tracking-widest">Average Fleet OEE: {averageOEE}%</p>
           </Card>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {machines.map(machine => (
                <Card key={machine.id} className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white space-y-4">
                   <div className="h-32 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                      <Image src={machine.image} alt="" width={400} height={200} className="object-cover h-full w-full" />
                   </div>
                   <h4 className="text-sm font-bold uppercase">{machine.name}</h4>
                   <Badge className="text-[8px] font-bold uppercase">{machine.status}</Badge>
                </Card>
              ))}
           </div>
        </TabsContent>
        <TabsContent value="schedule" className="m-0">
          <MachineLoadPlan machines={machines} orders={orders} initialMachineId={selectedMachineIdForLoad} />
        </TabsContent>
      </Tabs>
    </div>
  );
}