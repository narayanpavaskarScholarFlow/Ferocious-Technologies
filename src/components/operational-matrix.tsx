"use client";

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tool, SystemActivity, MachineCategory } from '@/lib/types';
import { 
  Activity, 
  Settings, 
  AlertCircle, 
  ChevronRight,
  Database,
  Search,
  Zap,
  Cpu,
  Layers,
  RotateCw,
  Wind,
  ZapIcon,
  Columns
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MACHINE_TYPES: { label: MachineCategory; icon: any }[] = [
  { label: 'All', icon: Database },
  { label: 'Milling', icon: Settings },
  { label: 'Turning', icon: RotateCw },
  { label: 'Grinding', icon: Wind },
  { label: '3D Printing', icon: Layers },
  { label: 'EDM', icon: ZapIcon },
  { label: 'Double Column Milling', icon: Columns },
];

export function OperationalMatrix() {
  const [assets, setAssets] = useState<Tool[]>([]);
  const [logs, setLogs] = useState<SystemActivity[]>([]);
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<MachineCategory>('All');

  useEffect(() => {
    const mockAssets: Tool[] = [
      {
        id: '1',
        name: 'Vertical Machining Center',
        description: 'High-speed 3-axis milling',
        category: 'Milling',
        tags: ['CNC', '3-Axis'],
        imageUrl: '',
        status: 'active',
        technicalId: 'ML-01-VMC',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        name: 'Precision Lathe X2',
        description: 'Multi-tasking turning unit',
        category: 'Turning',
        tags: ['Lathe', 'Multi-task'],
        imageUrl: '',
        status: 'maintenance',
        technicalId: 'TR-04-LTH',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        name: 'Surface Grinder 500',
        description: 'Precision finishing station',
        category: 'Grinding',
        tags: ['Finishing'],
        imageUrl: '',
        status: 'active',
        technicalId: 'GR-02-SRF',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '4',
        name: 'SLA Industrial Printer',
        description: 'Large scale additive unit',
        category: '3D Printing',
        tags: ['SLA', 'Resin'],
        imageUrl: '',
        status: 'active',
        technicalId: '3D-09-SLA',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '5',
        name: 'Wire EDM Station',
        description: 'Electrical discharge machining',
        category: 'EDM',
        tags: ['Precision', 'Wire'],
        imageUrl: '',
        status: 'active',
        technicalId: 'ED-01-WIR',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '6',
        name: 'Gantry Mill TR-80',
        description: 'Heavy duty double column milling',
        category: 'Double Column Milling',
        tags: ['Heavy-Duty', 'Gantry'],
        imageUrl: '',
        status: 'active',
        technicalId: 'DC-80-GNT',
        createdAt: '',
        updatedAt: '',
      }
    ];

    setAssets(mockAssets);
    setLogs([]);
  }, []);

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(filter.toLowerCase()) || 
                         a.technicalId.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {MACHINE_TYPES.map((type) => {
          const Icon = type.icon;
          const isActive = activeCategory === type.label;
          return (
            <button
              key={type.label}
              onClick={() => setActiveCategory(type.label)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" 
                  : "bg-white/5 border-white/5 hover:border-white/20 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-md mb-2 transition-transform group-hover:scale-110",
                isActive ? "bg-primary/20" : "bg-white/5"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-headline font-bold uppercase tracking-tight text-center leading-none">
                {type.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 flex-grow overflow-hidden">
        <div className="xl:col-span-3 glass-effect rounded-lg border border-white/5 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-bold text-sm uppercase tracking-[0.2em]">Operational Matrix</h2>
              <Badge variant="outline" className="ml-2 font-code text-[10px] bg-primary/10 border-primary/20 text-primary">
                {activeCategory}
              </Badge>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input 
                placeholder="Filter results..." 
                className="h-8 pl-8 bg-black/20 border-white/10 text-xs font-code"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-grow overflow-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[120px] font-code text-[10px] uppercase">Tech_ID</TableHead>
                  <TableHead className="font-code text-[10px] uppercase">Machine Name</TableHead>
                  <TableHead className="font-code text-[10px] uppercase">Classification</TableHead>
                  <TableHead className="font-code text-[10px] uppercase">Status</TableHead>
                  <TableHead className="font-code text-[10px] uppercase text-right">Load</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="border-white/5 hover:bg-primary/5 group cursor-pointer transition-colors">
                    <TableCell className="font-code text-xs text-muted-foreground">{asset.technicalId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{asset.name}</span>
                        <span className="text-[10px] text-muted-foreground font-code line-clamp-1">{asset.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white/5 rounded">
                           {MACHINE_TYPES.find(m => m.label === asset.category)?.icon && (
                             (() => {
                               const Icon = MACHINE_TYPES.find(m => m.label === asset.category)!.icon;
                               return <Icon className="h-3 w-3 text-muted-foreground" />;
                             })()
                           )}
                        </div>
                        <span className="text-[10px] font-code uppercase">{asset.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full animate-pulse",
                          asset.status === 'active' ? 'bg-primary' : 
                          asset.status === 'maintenance' ? 'bg-amber-500' : 'bg-destructive'
                        )} />
                        <span className="text-[10px] uppercase font-code tracking-tighter">{asset.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] font-code text-muted-foreground">0%</span>
                        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-0" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAssets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-code text-xs">
                      _NO_ASSETS_FOUND_IN_THIS_CLASSIFICATION_
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-grow glass-effect rounded-lg border border-white/5 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                <h2 className="font-headline font-bold text-sm uppercase tracking-[0.2em]">Live Stream</h2>
              </div>
              <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
            </div>
            <div className="p-3 space-y-4 overflow-auto font-code text-[10px]">
              {logs.map((log) => (
                <div key={log.id} className="border-l-2 border-white/10 pl-3 space-y-1 group">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="group-hover:text-primary transition-colors">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={cn(
                      "uppercase",
                      log.severity === 'medium' ? 'text-amber-500' : 'text-primary'
                    )}>{log.type}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{log.message}</p>
                </div>
              ))}
              <div className="pt-2 text-center text-muted-foreground animate-pulse text-[8px]">
                _ WAITING_FOR_OPERATIONAL_SIGNALS...
              </div>
            </div>
          </div>

          <div className="h-40 glass-effect rounded-lg border border-white/5 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-headline font-bold uppercase tracking-widest">Health Index</h3>
              </div>
              <span className="text-2xl font-headline font-bold text-primary">100.0<span className="text-[10px] ml-1">%</span></span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-code text-muted-foreground">
                <span>SYSTEM_STABILITY</span>
                <span>NOMINAL</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent w-full" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-code text-primary animate-pulse">
              <Zap className="h-3 w-3" />
              READY_FOR_DATA_STREAM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
