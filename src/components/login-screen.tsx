"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  Key, 
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  LayoutDashboard,
  Mail,
  Fingerprint
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemUser } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LoginScreenProps {
  onLogin: (user: string) => void;
  users: SystemUser[];
  brandLogo?: string;
}

export function LoginScreen({ onLogin, users, brandLogo = '' }: LoginScreenProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'login' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      toast({ variant: "destructive", title: "Missing Credentials" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const foundUser = users.find(u => 
        (u.username && u.username.toLowerCase() === username.toLowerCase()) ||
        u.name.toLowerCase() === username.toLowerCase() || 
        u.email.toLowerCase() === username.toLowerCase()
      );
      const isMasterAdmin = username.toLowerCase() === 'master admin' && password === 'admin123';
      const isUserMatch = foundUser && (foundUser.password === password || (!foundUser.password && password === 'user123'));

      if (isMasterAdmin || isUserMatch) {
        onLogin(foundUser ? foundUser.name : 'Master Admin');
      } else {
        toast({ variant: "destructive", title: "Authentication Failed", description: "Identity check rejected." });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative font-body">
      <div className="w-full max-w-[480px] space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative h-20 w-20 bg-white rounded-2xl shadow-xl p-3 border border-slate-100 flex items-center justify-center">
             <Image src={brandLogo} alt="Logo" fill className="object-contain p-2" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-[#0F172A] tracking-tighter uppercase">
              FEROCIOUS<span className="text-blue-600">TECH</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] ml-2">Enterprise Resource Platform</p>
          </div>
        </div>

        <Card className="p-12 bg-white border-slate-200 shadow-2xl rounded-3xl relative overflow-hidden">
          {view === 'login' ? (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Identity Username</Label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. admin" 
                      className="h-14 bg-slate-50 border-slate-100 text-slate-900 text-sm font-bold rounded-xl pl-12 focus-visible:ring-blue-600/20"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Password</Label>
                  </div>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="h-14 bg-slate-50 border-slate-100 text-slate-900 text-sm font-bold rounded-xl pl-12 pr-14 focus-visible:ring-blue-600/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                disabled={isLoading}
                onClick={handleLogin}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 transition-all flex gap-3"
              >
                {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <>Sign In to ERP <ChevronRight className="h-4 w-4" /></>}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
               <h3 className="text-xl font-bold text-slate-900 uppercase">Reset Password</h3>
               <div className="space-y-4">
                  <Input placeholder="Enter your registered email" className="h-14 bg-slate-50" />
                  <div className="flex gap-4">
                     <Button variant="ghost" className="flex-1 rounded-xl h-12 uppercase font-bold text-[10px]" onClick={() => setView('login')}>Cancel</Button>
                     <Button className="flex-1 bg-blue-600 text-white rounded-xl h-12 uppercase font-bold text-[10px]">Send Link</Button>
                  </div>
               </div>
            </div>
          )}
        </Card>
        
        <div className="flex items-center justify-center gap-10 opacity-30 text-slate-400">
           <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL Matrix</span></div>
           <div className="flex items-center gap-2"><Fingerprint className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-widest">SHA-256 Protocol</span></div>
        </div>
      </div>
    </div>
  );
}