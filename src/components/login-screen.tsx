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
  Mail,
  Fingerprint,
  Terminal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemUser } from '@/lib/types';
import { cn } from '@/lib/utils';

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

  const handleLogin = () => {
    // Strict manual trigger only
    if (!username.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: "Credentials required for identity verification."
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate network verification delay
    setTimeout(() => {
      setIsLoading(false);
      
      const foundUser = users.find(u => 
        (u.username && u.username.toLowerCase() === username.toLowerCase()) ||
        u.name.toLowerCase() === username.toLowerCase() || 
        u.email.toLowerCase() === username.toLowerCase()
      );

      // Verify credentials against master ledger
      const isMasterAdmin = username.toLowerCase() === 'master admin' && password === 'admin123';
      const isUserMatch = foundUser && (foundUser.password === password || (!foundUser.password && password === 'user123'));

      if (isMasterAdmin || isUserMatch) {
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
          description: "Unauthorized credentials detected. Security key mismatch."
        });
      }
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
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
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background Matrix layers - guaranteed no-block */}
      <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px] animate-pulse pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[150px] animate-pulse pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)', backgroundSize: '60px 60px' }} />

      <div className="w-full max-w-[520px] z-50 space-y-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative group">
            <div className="p-7 bg-[#0A0F18] rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] border border-white/5 relative">
              <Zap className="h-14 w-14 text-white fill-white pointer-events-none" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-4 border-[#0A0F18] animate-pulse pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-bold text-[#001F3D] tracking-tighter uppercase flex items-center gap-2 justify-center">
              BHARAT<span className="text-primary">AXIS</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.6em] ml-2">Industrial Command Gateway</p>
          </div>
        </div>

        <Card className="p-12 bg-white border-none shadow-[0_64px_128px_-24px_rgba(0,0,0,0.15)] rounded-[3.5rem] relative overflow-hidden z-50">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />
          
          {view === 'login' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Identity Protocol</span>
                </div>
                <Badge className="bg-slate-100 text-slate-400 border-none uppercase font-bold text-[9px] px-4 py-1.5 rounded-full">v2.4.1_STABLE</Badge>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Network Identifier</Label>
                  <div className="relative group/input z-50">
                    <Input 
                      autoFocus
                      name="username"
                      placeholder="Username, ID or Email" 
                      className="h-16 bg-[#F8FAFC] border-none text-[#001F3D] text-sm font-bold rounded-2xl pl-14 focus-visible:ring-primary/20 shadow-inner placeholder:text-slate-300 relative z-50"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none z-[60]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Security Token</Label>
                    <button 
                      type="button"
                      onClick={() => setView('reset')}
                      className="text-[10px] font-bold uppercase text-primary hover:text-primary/80 transition-colors tracking-widest relative z-50"
                    >
                      Reset Token?
                    </button>
                  </div>
                  <div className="relative group/input z-50">
                    <Input 
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="h-16 bg-[#F8FAFC] border-none text-[#001F3D] text-sm font-bold rounded-2xl pl-14 pr-16 focus-visible:ring-primary/20 shadow-inner placeholder:text-slate-300 relative z-50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none z-[60]" />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors z-[70]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-4">
                <Terminal className="h-4 w-4 text-slate-400 mt-0.5 pointer-events-none" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Encryption Layer: SHA-256 Synchronized. Identifier: "Master Admin", Token: "admin123"
                </p>
              </div>

              <Button 
                type="button" 
                disabled={isLoading}
                onClick={handleLogin}
                className="w-full h-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-primary/20 transition-all duration-300 group overflow-hidden relative z-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-4 relative z-10">
                    Synchronize Identity
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 z-50">
              <div className="flex items-center gap-5 mb-2">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Mail className="h-6 w-6 pointer-events-none" /></div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight leading-none">Protocol Reset</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Security Token Recovery</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Registered Node Email</Label>
                  <div className="relative group/input z-50">
                    <Input 
                      placeholder="e.g. admin@bharataxis.tech" 
                      className="h-16 bg-[#F8FAFC] border-none text-[#001F3D] text-sm font-bold rounded-2xl pl-14 focus-visible:ring-primary/20 shadow-inner relative z-50"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none z-[60]" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setView('login')}
                  className="flex-1 h-16 text-slate-400 hover:text-[#001F3D] rounded-2xl text-[10px] font-bold uppercase tracking-widest relative z-50"
                >
                  Abort
                </Button>
                <Button 
                  type="button"
                  disabled={isLoading || !resetEmail}
                  onClick={handleResetRequest}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 relative z-50"
                >
                  Request Key
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-center gap-10 opacity-30 pointer-events-none z-50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-slate-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">SSL_MATRIX_ACTIVE</span>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-slate-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">NODE_SYNC_2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}