"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  Activity, 
  Plus, 
  Settings2, 
  Ruler, 
  Warehouse, 
  Factory, 
  DollarSign, 
  Edit3, 
  Upload, 
  LayoutGrid, 
  List, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  CalendarDays
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
import { useToast } from '@/hooks/use-toast';
import { Machine, MachineCategory, Order } from '@/lib/types';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip,
  CartesianGrid
} from 'recharts';
import { MachineLoadPlan } from './machine-load-plan';

interface MachineUtilizationProps {
  machines: Machine[];
  orders: Order[];
  onSaveMachine: (machine: Machine) => void;
}

const DAILY_UTILIZATION_DATA = [
  { day: 'Mon', value: 72 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 78 },
  { day: 'Thu', value: 92 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 45 },
  { day: 'Sun', value: 30 },
];

export function MachineUtilization({ machines, orders, onSaveMachine }: MachineUtilizationProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [selectedMachineForLoad, setSelectedMachineForLoad] = useState<Machine | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Milling' as Exclude<MachineCategory, 'All'>,
    mcNumber: '',
    make: '',
    bedSize: '',
    costPerHour: '',
    image: ''
  });

  const handleOpenAdd = () => {
    setEditingMachine(null);
    setFormData({ name: '', type: 'Milling', mcNumber: '', make: '', bedSize: '', costPerHour: '', image: '' });
    setIsAddMachineOpen(true);
  };

  const handleOpenEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      name: machine.name,
      type: machine.type,
      mcNumber: machine.mcNumber,
      make: machine.make,
      bedSize: machine.bedSize,
      costPerHour: machine.costPerHour.toString(),
      image: machine.image
    });
    setIsAddMachineOpen(true);
  };

  const handleSaveMachine = () => {
    if (!formData.name || !formData.mcNumber || !formData.make) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Protocol requires Machine Name, MC Number, and Manufacturer."
      });
      return;
    }

    const imgMap: Record<string, string> = {
      'Milling': placeholderImages.placeholderImages.find(i => i.id === 'milling')?.imageUrl || '',
      'Turning': placeholderImages.placeholderImages.find(i => i.id === 'turning')?.imageUrl || '',
      'Grinding': placeholderImages.placeholderImages.find(i => i.id === 'grinding')?.imageUrl || '',
      '3D Printing': placeholderImages.placeholderImages.find(i => i.id === '3d-printing')?.imageUrl || '',
      'EDM': placeholderImages.placeholderImages.find(i => i.id === 'edm')?.imageUrl || '',
      'Double Column Milling': placeholderImages.placeholderImages.find(i => i.id === 'double-column')?.imageUrl || '',
    };

    const machine: Machine = {
      id: editingMachine?.id || formData.mcNumber,
      name: formData.name,
      type: formData.type,
      mcNumber: formData.mcNumber,
      make: formData.make,
      bedSize: formData.bedSize || 'Standard',
      costPerHour: parseFloat(formData.costPerHour) || 0,
      load: editingMachine?.load || Math.floor(Math.random() * 40) + 40,
      status: editingMachine?.status || 'active',
      image: formData.image || imgMap[formData.type] || 'https://picsum.photos/seed/machine/600/400'
    };

    onSaveMachine(machine);
    toast({
      title: editingMachine ? "Configuration Updated" : "Node Registered",
      description: `${machine.name} has been synchronized with Asset Telemetry.`
    });

    setIsAddMachineOpen(false);
  };

  const averageOEE = useMemo(() => {
    if (machines.length === 0) return 0;
    return (machines.reduce((acc, m) => acc + m.load, 0) / machines.length).toFixed(1);
  }, [machines]);

  if (selectedMachineForLoad) {
    return (
      <MachineLoadPlan 
        machine={selectedMachineForLoad} 
        orders={orders} 
        onBack={() => setSelectedMachineForLoad(null)} 
      />
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Activity className="h-4 w-4" />
            Industrial Asset Telemetry
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            Assets <span className="text-slate-400 font-medium">& Infrastructure</span>
          </h2>
          <p className="text-muted-foreground font-medium">Monitoring {machines.length} operational nodes across the plant floor.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              className={cn("h-9 rounded-lg px-4", viewMode === 'grid' && "bg-white text-primary shadow-sm hover:bg-white")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Grid
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              className={cn("h-9 rounded-lg px-4", viewMode === 'list' && "bg-white text-primary shadow-sm hover:bg-white")}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
          </div>
          <Button 
            onClick={handleOpenAdd}
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-3 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Register New Asset
          </Button>
        </div>
      </header>

      {/* Daily Utilization Matrix */}
      <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-primary rounded-full" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Fleet Performance</h4>
            </div>
            <p className="text-2xl font-bold tracking-tight text-[#001F3D]">Daily Utilization Trend</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Average OEE</p>
              <p className="text-3xl font-display font-bold text-primary">{averageOEE}%</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold px-4 py-1.5 rounded-full">NOMINAL</Badge>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DAILY_UTILIZATION_DATA}>
              <defs>
                <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                tickFormatter={(val) => `${val}%`}
              />
              <ChartTooltip 
                content={({active, payload}) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#001F3D] text-white px-4 py-3 rounded-2xl shadow-2xl border-none animate-in zoom-in-95">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">{payload[0].payload.day}</p>
                        <p className="text-xl font-display font-bold">{payload[0].value}% <span className="text-[10px] text-emerald-400">OEE</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorUtil)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {machines.map((machine) => (
              <Card key={machine.id} className="glass-card p-0 group overflow-hidden border-none hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image 
                    src={machine.image} 
                    alt={machine.name} 
                    fill 
                    className="object-cover transition-all duration-1000 group-hover:scale-110"
                    data-ai-hint="industrial machine"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001F3D]/90 via-[#001F3D]/20 to-transparent" />
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10"
                      onClick={() => handleOpenEdit(machine)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <Badge className="bg-primary/20 text-white border-white/10 backdrop-blur-md text-[8px] font-bold tracking-widest uppercase mb-2">
                          {machine.type}
                        </Badge>
                        <h3 className="text-xl font-display font-bold text-white tracking-tight">{machine.name}</h3>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{machine.mcNumber}</p>
                      </div>
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full mb-1 animate-pulse",
                        machine.status === 'active' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.5)]'
                      )} />
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manufacturer</p>
                      <p className="text-xs font-bold text-slate-700 uppercase">{machine.make}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cost Center</p>
                      <p className="text-xs font-bold text-primary">₹ {machine.costPerHour}/hr</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Current Load Factor</span>
                      <span className={cn(
                        machine.load > 80 ? "text-emerald-500" : machine.load > 50 ? "text-primary" : "text-amber-500"
                      )}>
                        {machine.load}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          machine.load > 80 ? "bg-emerald-500" : machine.load > 50 ? "bg-primary" : "bg-amber-500"
                        )}
                        style={{ width: `${machine.load}%` }}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#001F3D] hover:bg-black text-white rounded-xl h-11 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/10 mt-4"
                    onClick={() => setSelectedMachineForLoad(machine)}
                  >
                    <CalendarDays className="h-4 w-4" /> View Load Schedule
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2.5rem]">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-[0.2em] flex items-center gap-3">
                <LayoutGrid className="h-4 w-4 text-primary" /> Master Asset Directory
              </h3>
              <Badge variant="outline" className="bg-white border-slate-200 text-[10px] font-bold uppercase h-8 px-4">Live Inventory: {machines.length}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-50">
                    <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identification</th>
                    <th className="py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specifications</th>
                    <th className="py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Costing</th>
                    <th className="py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">OEE</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine) => (
                    <tr key={machine.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl relative overflow-hidden border border-slate-100 shadow-sm shrink-0">
                            <Image src={machine.image} alt="" fill className="object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#001F3D] uppercase">{machine.name}</span>
                            <span className="text-[10px] text-slate-400 font-code font-bold uppercase">{machine.mcNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-700">{machine.type}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{machine.make} • {machine.bedSize}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-code font-bold text-xs">
                          ₹ {machine.costPerHour.toLocaleString()}/hr
                        </Badge>
                      </td>
                      <td className="py-6 text-center">
                        <Badge className={cn(
                          "text-[9px] font-bold uppercase px-3 py-1 rounded-full",
                          machine.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {machine.status}
                        </Badge>
                      </td>
                      <td className="py-6 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${machine.load}%` }} />
                          </div>
                          <span className="text-[10px] font-code font-bold text-slate-600">{machine.load}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => setSelectedMachineForLoad(machine)}
                          >
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => handleOpenEdit(machine)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isAddMachineOpen} onOpenChange={setIsAddMachineOpen}>
        <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-0">
            <DialogTitle className="sr-only">{editingMachine ? 'Modify Asset Identity' : 'Register New Industrial Asset'}</DialogTitle>
            <DialogDescription className="sr-only">Update technical specifications, spatial dimensions, and hourly cost centers for asset fleet management.</DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row min-h-[500px]">
            {/* Sidebar Visual Preview */}
            <div className="w-full md:w-72 bg-slate-900 p-10 flex flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
              
              <div className="space-y-10 relative z-10">
                <div className="p-4 bg-primary rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20">
                  <Factory className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold tracking-tight uppercase">{editingMachine ? 'Edit Node' : 'Register Node'}</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Industrial Asset Matrix Protocol</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="aspect-[16/10] w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden group">
                  {formData.image ? (
                    <Image src={formData.image} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                      <Upload className="h-8 w-8" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Image Matrix Ready</span>
                    </div>
                  )}
                </div>
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">
                  {editingMachine ? 'ASSET_MOD_v2.4' : 'ASSET_REG_v2.4'}
                </div>
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 p-10 md:p-14 bg-white overflow-y-auto hide-scrollbar">
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Asset Name</Label>
                    <Input 
                      placeholder="e.g. VMC Milling Haas" 
                      className="h-12 bg-slate-50/50 border-none rounded-xl text-xs font-bold focus-visible:ring-primary/20"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Asset Classification</Label>
                    <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                      <SelectTrigger className="h-12 bg-slate-50/50 border-none rounded-xl text-xs font-bold uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Technical ID (MC No.)</Label>
                    <div className="relative">
                      <Input 
                        placeholder="TR-MC-001" 
                        className="h-12 bg-slate-50/50 border-none rounded-xl text-xs font-bold font-code pl-10 focus-visible:ring-primary/20"
                        value={formData.mcNumber}
                        onChange={(e) => setFormData({...formData, mcNumber: e.target.value})}
                      />
                      <Settings2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Manufacturer</Label>
                    <div className="relative">
                      <Input 
                        placeholder="Haas, BFW, HMT" 
                        className="h-12 bg-slate-50/50 border-none rounded-xl text-xs font-bold pl-10 focus-visible:ring-primary/20"
                        value={formData.make}
                        onChange={(e) => setFormData({...formData, make: e.target.value})}
                      />
                      <Warehouse className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Spatial Bed Size</Label>
                    <div className="relative">
                      <Input 
                        placeholder="1000 x 500" 
                        className="h-12 bg-slate-50/50 border-none rounded-xl text-xs font-bold pl-10 focus-visible:ring-primary/20"
                        value={formData.bedSize}
                        onChange={(e) => setFormData({...formData, bedSize: e.target.value})}
                      />
                      <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Operational Cost (₹/hr)</Label>
                    <div className="relative">
                      <Input 
                        type="number"
                        placeholder="1500.00" 
                        className="h-12 bg-slate-50/50 border-none rounded-xl text-xs font-bold pl-10 focus-visible:ring-primary/20"
                        value={formData.costPerHour}
                        onChange={(e) => setFormData({...formData, costPerHour: e.target.value})}
                      />
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Asset Imagery (URL Matrix)</Label>
                  <div className="relative group">
                    <Input 
                      placeholder="https://images.unsplash.com/..." 
                      className="h-12 bg-slate-50/50 border-none rounded-xl text-[10px] font-bold pr-12 focus-visible:ring-primary/20"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                    <Upload className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium italic">* Simulation: Paste image URL to synchronize visual database.</p>
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
                    className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex gap-3 group"
                    onClick={handleSaveMachine}
                  >
                    {editingMachine ? 'Synchronize Identity' : 'Commit to Matrix'}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Maintenance Alerts Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-start gap-6">
          <div className="p-4 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Active Maintenance Window</p>
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
              VMC Milling-HASS (TR-MC-001) is scheduled for hydraulic calibration in 4.5 operational hours. Ensure buffer stock readiness.
            </p>
          </div>
        </Card>

        <Card className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-start gap-6">
          <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/20">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Health Index Nominal</p>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Global fleet availability is currently at 94.2%. All critical nodes are responding to primary control signals.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
