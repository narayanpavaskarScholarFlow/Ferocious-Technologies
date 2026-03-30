
import { Navbar } from '@/components/navbar';
import { OperationalMatrix } from '@/components/operational-matrix';
import { Toaster } from '@/components/ui/toaster';
import { Terminal, Shield, Cpu, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#0a0c0d] text-foreground">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-6 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl h-full flex flex-col gap-4">
          
          {/* System Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-effect rounded-lg border border-white/5 bg-primary/5">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-code">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground uppercase tracking-wider">Operational Status:</span>
                <span className="text-primary font-bold">NOMINAL</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs font-code">
                <Globe className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground uppercase tracking-wider">Node:</span>
                <span className="text-foreground">EU-WEST-1_S2</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-xs font-code">
                <Cpu className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground uppercase tracking-wider">Core Load:</span>
                <span className="text-foreground">12.4%</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5 text-[10px] font-code text-muted-foreground">
                <Shield className="h-3 w-3" />
                SECURE_PROTOCOL_V4
              </div>
              <div className="text-[10px] font-code text-primary">
                {new Date().toISOString().split('T')[0]} // {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Unified Display Area */}
          <div className="flex-grow min-h-[600px]">
            <OperationalMatrix />
          </div>

          {/* Console Footer */}
          <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between font-code text-[10px] text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Terminal className="h-3 w-3" /> SYS_INIT_COMPLETE</span>
              <span className="text-primary/50">|</span>
              <span className="hover:text-primary cursor-pointer">AUDIT_LOGS</span>
              <span className="text-primary/50">|</span>
              <span className="hover:text-primary cursor-pointer">TELEMETRY_EXPORT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3"></div>
              </div>
              <span>MEM_USAGE: 4.2GB</span>
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
}
