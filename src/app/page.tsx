
import { Navbar } from '@/components/navbar';
import { ToolCatalog } from '@/components/tool-catalog';
import { ActivityFeed } from '@/components/activity-feed';
import { SystemCharts } from '@/components/system-charts';
import { Toaster } from '@/components/ui/toaster';
import { LayoutGrid, Database, Zap, Shield, Activity, Box, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero / Command Header */}
      <section className="pt-24 pb-8 border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-code text-primary uppercase tracking-[0.3em]">
                <Activity className="h-3 w-3 animate-pulse" />
                System Live
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
                COMMAND <span className="text-primary">CENTER</span>
              </h1>
              <p className="text-muted-foreground max-w-xl text-sm font-body">
                Integrated industrial resource management and real-time operational telemetry.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
              {[
                { label: 'Total Assets', value: '142', icon: Box },
                { label: 'Operational', value: '128', icon: Zap, color: 'text-primary' },
                { label: 'System Load', value: '24%', icon: Activity },
                { label: 'Uptime', value: '99.9%', icon: Shield, color: 'text-accent' },
              ].map((stat, i) => (
                <div key={i} className="glass-effect rounded-lg p-3 px-5 border border-white/5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-code text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className={`text-xl font-headline font-bold ${stat.color || ''}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Inventory (Primary focus) */}
            <div className="xl:col-span-8 space-y-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-headline font-bold text-xl flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Asset Inventory
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-code text-muted-foreground">
                  <Terminal className="h-3 w-3" />
                  QUERY_STATUS: OK
                </div>
              </div>
              <ToolCatalog />
            </div>

            {/* Right Column: Telemetry & Activity */}
            <div className="xl:col-span-4 space-y-8">
              <div className="space-y-4">
                <h2 className="font-headline font-bold text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  System Telemetry
                </h2>
                <SystemCharts />
              </div>

              <div className="h-[calc(100vh-400px)] min-h-[500px]">
                <ActivityFeed />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 bg-card/30">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-code">
          <div className="flex items-center gap-6">
            <span className="opacity-50 tracking-widest">&copy; 2024 TOOLROOM2.0 SYSTEMS</span>
            <span className="hover:text-primary cursor-pointer transition-colors tracking-tighter">SECURE_VPN_CONNECTED</span>
            <span className="hover:text-primary cursor-pointer transition-colors tracking-tighter">API_V3.4_READY</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="h-1 w-4 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-[shimmer_2s_infinite]"></div>
              </div>
              <div className="h-1 w-4 bg-primary/20 rounded-full"></div>
              <div className="h-1 w-4 bg-primary/20 rounded-full"></div>
            </div>
            <span className="tracking-widest">VER 2.4.12 // STABLE</span>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
