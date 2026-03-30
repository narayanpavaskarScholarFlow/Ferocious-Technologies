
import { Navbar } from '@/components/navbar';
import { ToolCatalog } from '@/components/tool-catalog';
import { Toaster } from '@/components/ui/toaster';
import { LayoutGrid, Database, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Stats / Welcome */}
      <section className="pt-24 pb-8 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold mb-3 tracking-tight">
                System <span className="text-primary">Inventory</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg">
                Manage your technical resources with precision. Monitor status, organize categories, and utilize AI-driven insights for efficient discovery.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="glass-effect rounded-lg p-4 px-6 border border-white/5">
                <div className="text-xs font-code text-muted-foreground uppercase mb-1">Total Assets</div>
                <div className="text-2xl font-headline font-bold">142</div>
              </div>
              <div className="glass-effect rounded-lg p-4 px-6 border border-white/5">
                <div className="text-xs font-code text-muted-foreground uppercase mb-1">Active Status</div>
                <div className="text-2xl font-headline font-bold text-primary">128</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Row - Optional subtle background details */}
      <section className="py-4 bg-secondary/20">
        <div className="container mx-auto px-4 overflow-hidden">
          <div className="flex items-center gap-12 whitespace-nowrap text-[10px] font-code text-muted-foreground tracking-widest uppercase opacity-40 py-2">
            <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> Encrypted Storage</span>
            <span className="flex items-center gap-2"><Zap className="h-3 w-3" /> AI Engine Ready</span>
            <span className="flex items-center gap-2"><Database className="h-3 w-3" /> Real-time Sync</span>
            <span className="flex items-center gap-2"><LayoutGrid className="h-3 w-3" /> Modular Interface</span>
            <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> Encrypted Storage</span>
            <span className="flex items-center gap-2"><Zap className="h-3 w-3" /> AI Engine Ready</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <ToolCatalog />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-code">
          <div className="flex items-center gap-4">
            <span>&copy; 2024 TOOLROOM2.0 SYSTEMS</span>
            <span className="text-white/10">|</span>
            <span className="hover:text-primary cursor-pointer transition-colors">PRIVACY POLICY</span>
            <span className="hover:text-primary cursor-pointer transition-colors">API DOCS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            SYSTEMS NOMINAL - VER 2.4.12
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
