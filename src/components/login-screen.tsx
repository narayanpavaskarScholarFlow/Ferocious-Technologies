"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  Zap, 
  Key, 
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SystemUser } from '@/lib/types';

interface LoginScreenProps {
  onLogin: (user: string) => void;
  users: SystemUser[];
}

export function LoginScreen({ onLogin, users }: LoginScreenProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'login' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: "Credentials required for identity verification."
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate verification against the users list
    setTimeout(() => {
      setIsLoading(false);
      
      const foundUser = users.find(u => 
        u.name.toLowerCase() === username.toLowerCase() || 
        u.email.toLowerCase() === username.toLowerCase()
      );

      // Simple password check (for prototype purposes, matching username/admin)
      if (foundUser || username.toLowerCase() === 'admin') {
        const loginIdentity = foundUser ? foundUser.name : 'Master Admin';
        onLogin(loginIdentity);
        toast({
          title: "Access Granted",
          description: `Welcome back, ${loginIdentity}. ERP Matrix initialized.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Identity Rejection",
          description: "Unauthorized credentials detected. Node access denied."
        });
      }
    }, 800);
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Recovery Dispatched",
        description: `Security token transmitted to ${resetEmail}.`
      });
      setView('login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="w-full max-w-[440px] z-10 space-y-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="p-5 bg-primary rounded-3xl shadow-2xl shadow-primary/30 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap className="h-10 w-10 text-white fill-white transition-transform duration-700 group-hover:scale-110" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tighter uppercase">
              BHARAT<span className="text-primary">AXIS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Integrated Industrial Gateway</p>
          </div>
        </div>

        <Card className="p-10 bg-white/80 backdrop-blur-2xl border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Identify Controller</span>
                </div>
                <Badge variant="secondary" className="text-[9px] bg-slate-100 text-slate-400 border-none uppercase font-bold px-3">v2.4</Badge>
              </div>

              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Alias / Email</Label>
                  <div className="relative group">
                    <Input 
                      placeholder="e.g. John Operator" 
                      className="h-14 bg-slate-50 border-none text-slate-900 text-xs font-bold rounded-2xl pl-12 focus-visible:ring-primary/20 transition-all shadow-inner"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-300 transition-colors group-focus-within:text-primary" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Secret Key</Label>
                    <button 
                      type="button"
                      onClick={() => setView('reset')}
                      className="text-[10px] font-bold uppercase text-primary hover:text-primary/80 transition-colors tracking-widest"
                    >
                      Reset?
                    </button>
                  </div>
                  <div className="relative group">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="h-14 bg-slate-50 border-none text-slate-900 text-xs font-bold rounded-2xl pl-12 pr-14 focus-visible:ring-primary/20 transition-all shadow-inner"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-300 transition-colors group-focus-within:text-primary" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 bg-[#0f172a] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-slate-200 transition-all duration-500 group"
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    Synchronize Identity
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/10 rounded-lg"><AlertTriangle className="h-4 w-4 text-accent" /></div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Protocol Recovery</span>
              </div>

              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Network Email</Label>
                  <div className="relative group">
                    <Input 
                      placeholder="admin@bharataxis.tech" 
                      className="h-14 bg-slate-50 border-none text-slate-900 text-xs font-bold rounded-2xl pl-12 focus-visible:ring-primary/20 shadow-inner"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-300 transition-colors group-focus-within:text-primary" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed px-1 font-medium">
                  Submit your registered node email to receive an authorization token. Access will be logged for security audit.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setView('login')}
                  className="flex-1 h-14 text-slate-400 hover:text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || !resetEmail}
                  className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Issue Token
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="flex items-center justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-slate-600" />
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Secure Node</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="h-4 w-4 text-slate-600" />
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Live Matrix</span>
          </div>
        </div>
      </div>
    </div>
  );
}
