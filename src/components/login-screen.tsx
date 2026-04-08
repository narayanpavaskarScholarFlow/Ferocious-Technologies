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
  ArrowRight, 
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Box,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LoginScreenProps {
  onLogin: (user: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
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
        title: "Incomplete Protocol",
        description: "Please enter both Username and Password."
      });
      return;
    }

    setIsLoading(true);
    // Simulate industrial authentication delay
    setTimeout(() => {
      setIsLoading(false);
      if (username.toLowerCase() === 'admin' || username === 'Sys_Admin_01') {
        onLogin('Sys_Admin_01');
        toast({
          title: "Session Initialized",
          description: "Welcome back, Plant Controller. Command Matrix is now online."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Invalid credentials detected. Security event logged."
        });
      }
    }, 1200);
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Protocol Dispatched",
        description: `Security reset link has been transmitted to ${resetEmail}.`
      });
      setView('login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#001F3D] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Industrial Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[420px] z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-accent rounded-2xl shadow-2xl shadow-accent/20 border border-white/10 relative group">
            <Box className="h-10 w-10 text-white transition-transform duration-500 group-hover:rotate-90" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_#fff]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-white tracking-tighter uppercase">
              TOOLROOM<span className="text-accent">2.0</span>
            </h1>
            <p className="text-[10px] text-primary-foreground/40 font-bold uppercase tracking-[0.4em]">Enterprise Security Gate</p>
          </div>
        </div>

        <Card className="p-8 bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          
          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-red" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Protocol: Identity_Verification</span>
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 uppercase">v2.4.0</Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-white/50 tracking-widest ml-1">Network Username</Label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. Sys_Admin_01" 
                      className="h-12 bg-white/5 border-white/10 text-white text-xs rounded-xl pl-11 focus-visible:ring-accent/50 transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[9px] font-bold uppercase text-white/50 tracking-widest">Security Password</Label>
                    <button 
                      type="button"
                      onClick={() => setView('reset')}
                      className="text-[9px] font-bold uppercase text-accent hover:text-accent/80 transition-colors tracking-widest"
                    >
                      Reset Protocol?
                    </button>
                  </div>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="h-12 bg-white/5 border-white/10 text-white text-xs rounded-xl pl-11 pr-12 focus-visible:ring-accent/50 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-white hover:bg-white/90 text-[#001F3D] rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl transition-all duration-500 group"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Initialize Command Sequence
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Security Override: Password Reset</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-white/50 tracking-widest ml-1">Registered Network Email</Label>
                  <div className="relative">
                    <Input 
                      placeholder="name@toolroom.tech" 
                      className="h-12 bg-white/5 border-white/10 text-white text-xs rounded-xl pl-11 focus-visible:ring-accent/50"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  </div>
                </div>
                <p className="text-[9px] text-white/30 leading-relaxed px-1">
                  Submit your network email to receive a temporary authorization token. Access will be logged for audit.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setView('login')}
                  className="flex-1 h-12 text-white/50 hover:text-white hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || !resetEmail}
                  className="flex-[2] h-12 bg-accent hover:bg-accent/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20"
                >
                  Request Reset
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-white" />
            <span className="text-[8px] font-bold text-white uppercase tracking-[0.2em]">End-to-End Secure</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-white" />
            <span className="text-[8px] font-bold text-white uppercase tracking-[0.2em]">Real-time Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
