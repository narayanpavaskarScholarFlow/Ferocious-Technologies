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
  RefreshCw,
  Eye,
  EyeOff,
  LayoutDashboard,
  Mail
} from 'lucide-react';
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
    
    setTimeout(() => {
      setIsLoading(false);
      
      const foundUser = users.find(u => 
        u.name.toLowerCase() === username.toLowerCase() || 
        u.email.toLowerCase() === username.toLowerCase()
      );

      if (foundUser || username.toLowerCase() === 'master admin') {
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Precision Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-[480px] z-10 space-y-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="p-6 bg-[#001F3D] rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,31,61,0.4)] relative group overflow-hidden transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap className="h-12 w-12 text-white fill-white transition-transform duration-700 group-hover:rotate-12" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-headline font-bold text-[#001F3D] tracking-tighter uppercase">
              BHARAT<span className="text-primary">AXIS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.5em] ml-1">Integrated Industrial Gateway</p>
          </div>
        </div>

        <Card className="p-12 bg-white/80 backdrop-blur-2xl border-none shadow-[0_64px_128px_-24px_rgba(0,0,0,0.12)] rounded-[3rem] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50" />
          
          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em]">Identity Control</span>
                </div>
                <Badge variant="secondary" className="text-[9px] bg-slate-100 text-slate-400 border-none uppercase font-bold px-4 py-1 rounded-full">v2.4.0</Badge>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Alias / Network Email</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="e.g. Master Admin" 
                      className="h-16 bg-slate-50/50 border-none text-[#001F3D] text-sm font-bold rounded-2xl pl-14 focus-visible:ring-primary/20 transition-all shadow-inner"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 transition-colors group-focus-within/input:text-primary" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Security Key</Label>
                    <button 
                      type="button"
                      onClick={() => setView('reset')}
                      className="text-[10px] font-bold uppercase text-primary hover:text-primary/80 transition-colors tracking-widest"
                    >
                      Reset Token?
                    </button>
                  </div>
                  <div className="relative group/input">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="h-16 bg-slate-50/50 border-none text-[#001F3D] text-sm font-bold rounded-2xl pl-14 pr-16 focus-visible:ring-primary/20 transition-all shadow-inner"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 transition-colors group-focus-within/input:text-primary" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-[#001F3D]/20 transition-all duration-500 group"
              >
                {isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-4">
                    Synchronize Node
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/10 rounded-2xl"><Mail className="h-5 w-5 text-primary" /></div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.25em]">Protocol Reset</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Network Identifier</Label>
                  <div className="relative group/input">
                    <Input 
                      placeholder="admin@bharataxis.tech" 
                      className="h-16 bg-slate-50/50 border-none text-[#001F3D] text-sm font-bold rounded-2xl pl-14 focus-visible:ring-primary/20 shadow-inner"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 transition-colors group-focus-within/input:text-primary" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed px-2 font-medium">
                  Submit your registered node email to receive a secure recovery token. Protocol verification required.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setView('login')}
                  className="flex-1 h-16 text-slate-400 hover:text-[#001F3D] rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                >
                  Abort
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || !resetEmail}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
                >
                  Issue Token
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="flex items-center justify-center gap-10 opacity-30">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-slate-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">SSL Matrix</span>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-slate-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Live Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
