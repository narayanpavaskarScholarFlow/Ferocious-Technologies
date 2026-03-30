
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
import { Tool, SystemActivity } from '@/lib/types';
import { 
  Activity, 
  Box, 
  Settings, 
  AlertCircle, 
  ChevronRight,
  Database,
  Search,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function OperationalMatrix() {
  const [assets, setAssets] = useState<Tool[]>([]);
  const [logs, setLogs] = useState<SystemActivity[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Mock data for assets
    const mockAssets: Tool[] = [
      {
        id: '1',
        name: 'Industrial 3D Printer',
        description: 'Rapid prototyping unit',
        category: 'Manufacturing',
        tags: ['SLA', 'High-Res'],
        imageUrl: '',
        status: 'active',
        technicalId: 'TR-PRNT-01',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        name: 'Digital Oscilloscope',
        description: 'Circuit analysis',
        category: 'Electronics',
        tags: ['Measurement'],
        imageUrl: '',
        status: 'maintenance',
        technicalId: 'TR-OSCI-04',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        name: 'Hydraulic Press',
        description: '20-ton industrial press',
        category: 'Heavy Equipment',
        tags: ['Pneumatic'],
        imageUrl: '',
        status: 'active',
        technicalId: 'TR-PRES-02',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '4',
        name: 'Laser Cutter X1',
        description: 'Precision CO2 laser',
        category: 'Fabrication',
        tags: ['Laser', 'Cut'],
        imageUrl: '',
        status: 'active',
        technicalId: 'TR-LSR-09',
        createdAt: '',
        updatedAt: '',
      }
    ];

    // Mock data for live logs
    const mockLogs: SystemActivity[] = [
      { id: '1', type: 'usage', message: 'TR-PRNT-01 print cycle started', timestamp: new Date().toISOString(), severity: 'low' },
      { id: '2', type: 'alert', message: 'TR-OSCI-04 calibration required', timestamp: new Date().toISOString(), severity: 'medium' },
      { id: '3', type: 'maintenance', message: 'TR-PRES-02 safety check passed', timestamp: new Date().toISOString(), severity: 'low' },
    ];

    setAssets(mockAssets);
    setLogs(mockLogs);
  }, []);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(filter.toLowerCase()) || 
    a.technicalId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 h-full">
      
      {/* Asset Explorer (Large Panel) */}
      <div className="xl:col-span-3 glass-effect rounded-lg border border-white/5 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h2 className="font-headline font-bold text-sm uppercase tracking-[0.2em]">Asset Matrix</h2>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input 
              placeholder="Search assets..." 
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
                <TableHead className="w-[120px] font-code text-[10px] uppercase">ID</TableHead>
                <TableHead className="font-code text-[10px] uppercase">Asset Name</TableHead>
                <TableHead className="font-code text-[10px] uppercase">Category</TableHead>
                <TableHead className="font-code text-[10px] uppercase">Status</TableHead>
                <TableHead className="font-code text-[10px] uppercase">Telemetry</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="border-white/5 hover:bg-primary/5 group cursor-pointer">
                  <TableCell className="font-code text-xs text-muted-foreground">{asset.technicalId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{asset.name}</span>
                      <span className="text-[10px] text-muted-foreground font-code">{asset.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-code border-white/10">{asset.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        asset.status === 'active' ? 'bg-primary' : 
                        asset.status === 'maintenance' ? 'bg-amber-500' : 'bg-destructive'
                      )} />
                      <span className="text-xs uppercase font-code tracking-tighter">{asset.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn(
                          "h-4 w-1 rounded-sm",
                          i < 4 ? "bg-primary/40" : "bg-white/10"
                        )} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Real-time Telemetry (Side Panel) */}
      <div className="flex flex-col gap-4">
        
        {/* Live Logs */}
        <div className="flex-grow glass-effect rounded-lg border border-white/5 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <h2 className="font-headline font-bold text-sm uppercase tracking-[0.2em]">Live Stream</h2>
            </div>
            <Zap className="h-3 w-3 text-primary animate-pulse" />
          </div>
          <div className="p-3 space-y-4 overflow-auto font-code text-[10px]">
            {logs.map((log) => (
              <div key={log.id} className="border-l-2 border-white/10 pl-3 space-y-1">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={cn(
                    "uppercase",
                    log.severity === 'medium' ? 'text-amber-500' : 'text-primary'
                  )}>{log.type}</span>
                </div>
                <p className="text-foreground leading-relaxed">{log.message}</p>
              </div>
            ))}
            <div className="pt-2 text-center text-muted-foreground animate-pulse">
              _ LISTENING FOR EVENTS...
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="h-48 glass-effect rounded-lg border border-white/5 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-headline font-bold uppercase tracking-widest">Health Index</h3>
            </div>
            <span className="text-2xl font-headline font-bold text-primary">98%</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-code">
              <span>UPTIME</span>
              <span>124:12:05</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[98%]" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-code text-destructive animate-pulse">
            <AlertCircle className="h-3 w-3" />
            1 NON-CRITICAL WARNING
          </div>
        </div>

      </div>
    </div>
  );
}
