"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ShieldCheck, 
  UserCircle, 
  Unlock, 
  Mail, 
  Phone, 
  Network, 
  Briefcase,
  Save,
  RefreshCw,
  LayoutGrid,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Hash,
  Fingerprint,
  ExternalLink,
  Users,
  CreditCard,
  Receipt,
  Building2,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemUser, PermissionLevel, ViewType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ACCESS_NODES: { id: ViewType; label: string; category: string; icon: any }[] = [
  { id: 'overview', label: 'Command Matrix', category: 'Strategic Hub', icon: LayoutGrid },
  { id: 'agile', label: 'Agile Kanban', category: 'Strategic Hub', icon: Zap },
  { id: 'smart-quote', label: 'AI Quoting', category: 'Strategic Hub', icon: Zap },
  { id: 'sqcdp', label: 'Performance Board', category: 'Strategic Hub', icon: ShieldCheck },
  { id: 'team-matrix', label: 'My Team Matrix', category: 'Strategic Hub', icon: Users },
  { id: 'orders', label: 'Master Orders', category: 'Production Control', icon: Briefcase },
  { id: 'production-planner', label: 'Mass Production', category: 'Production Control', icon: Briefcase },
  { id: 'gantt', label: 'Visual Timeline', category: 'Production Control', icon: Briefcase },
  { id: 'operations', label: 'Operational Spreadsheet', category: 'Production Control', icon: Briefcase },
  { id: 'weekly-plan', label: 'Master Schedule', category: 'Production Control', icon: Briefcase },
  { id: 'work-log', label: 'Work Log Hub', category: 'Production Control', icon: Briefcase },
  { id: 'quality', label: 'Quality Hub', category: 'Quality & Compliance', icon: ShieldCheck },
  { id: 'training', label: 'Training Matrix', category: 'Quality & Compliance', icon: Briefcase },
  { id: 'customer-orders', label: 'Customer Identity', category: 'Commercial Operations', icon: Briefcase },
  { id: 'inventory', label: 'Stock Ledger', category: 'Commercial Operations', icon: Briefcase },
  { id: 'billing', label: 'Financial Hub (Main)', category: 'Commercial Operations', icon: CreditCard },
  { id: 'billing-quotation', label: 'Financial: Quotation', category: 'Commercial Operations', icon: FileText },
  { id: 'billing-invoice', label: 'Financial: Invoice', category: 'Commercial Operations', icon: Receipt },
  { id: 'billing-proforma', label: 'Financial: Proforma', category: 'Commercial Operations', icon: Building2 },
  { id: 'billing-inward', label: 'Financial: Inward', category: 'Commercial Operations', icon: ArrowDownLeft },
  { id: 'billing-outward', label: 'Financial: Outward', category: 'Commercial Operations', icon: ArrowUpRight },
  { id: 'billing-bank', label: 'Financial: Bank Ledger', category: 'Commercial Operations', icon: Landmark },
  { id: 'vendor', label: 'Supply Chain', category: 'Commercial Operations', icon: Briefcase },
  { id: 'machine-utilization', label: 'Asset Fleet', category: 'Resources & Assets', icon: Briefcase },
  { id: 'hr', label: 'HR Command', category: 'Resources & Assets', icon: Briefcase },
  { id: 'settings', label: 'Control Center', category: 'System Governance', icon: Briefcase },
];

interface UserDetailViewProps {
  userId: string | null;
  users: SystemUser[];
  onBack: () => void;
  onSaveUser: (user: SystemUser) => void;
  onVerifyPortal: (userName: string) => void;
}

export function UserDetailView({ userId, users, onBack, onSaveUser, onVerifyPortal }: UserDetailViewProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Matrix Filter State
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState('all');

  const targetUser = useMemo(() => {
    return users.find(u => u.id === userId) || null;
  }, [userId, users]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    dept: '',
    reportingManager: '',
    permissions: {} as Record<string, PermissionLevel>
  });

  useEffect(() => {
    if (targetUser) {
      setFormData({
        firstName: targetUser.firstName || '',
        lastName: targetUser.lastName || '',
        username: targetUser.username || targetUser.email || '',
        email: targetUser.email || '',
        password: targetUser.password || '',
        phone: targetUser.phone || '',
        role: targetUser.role || '',
        dept: targetUser.dept || '',
        reportingManager: targetUser.reportingManager || '',
        permissions: targetUser.permissions || {}
      });
    }
  }, [targetUser]);

  const handleUpdatePermission = (nodeId: string, level: PermissionLevel) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [nodeId]: level
      }
    }));
  };

  const filteredAccessNodes = useMemo(() => {
    return ACCESS_NODES.filter(node => {
      const matchesSearch = node.label.toLowerCase().includes(matrixSearch.toLowerCase());
      const matchesCategory = matrixCategoryFilter === 'all' || node.category === matrixCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [matrixSearch, matrixCategoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(ACCESS_NODES.map(n => n.category));
    return Array.from(cats);
  }, []);

  const handleSaveProtocol = () => {
    if (!targetUser) return;

    setIsSaving(true);
    const updatedUser: SystemUser = {
      ...targetUser,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      username: formData.username,
      email: formData.username, // Synchronize
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      dept: formData.dept,
      reportingManager: formData.reportingManager,
      permissions: formData.permissions
    };

    onSaveUser(updatedUser);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "User Matrix Synchronized",
        description: `Identity and access protocols for ${updatedUser.name} updated successfully.`
      });
    }, 800);
  };

  const handleVerifyPortal = () => {
    if (targetUser) {
      // Use window.open to launch a separate verification node in a new tab
      const url = `${window.location.origin}/?verifyUser=${encodeURIComponent(targetUser.name)}`;
      window.open(url, '_blank');
      
      toast({
        title: "Simulation Initialized",
        description: `Opening separate verification node for ${targetUser.name}.`
      });
    }
  };

  if (!targetUser) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex items-center gap-5 px-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 text-slate-400 hover:bg-white rounded-2xl shadow-sm border border-slate-100">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em] mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Identity Access Management
          </div>
          <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">
            {targetUser.name} <span className="text-slate-400 font-medium ml-2">Protocol Page</span>
          </h2>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={handleVerifyPortal}
            className="h-12 px-6 rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] border-slate-200 bg-white hover:bg-slate-50 flex gap-3 shadow-sm"
          >
            <UserCircle className="h-4 w-4" />
            Verify Portal View (New Tab)
          </Button>
          
          <Button 
            disabled={isSaving}
            onClick={handleSaveProtocol}
            className="h-12 px-10 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/20 flex gap-3 group"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Commit Ledger Changes
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Identity Data */}
        <div className="xl:col-span-4 space-y-8">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#001F3D 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="relative z-10 flex flex-col items-center text-center gap-6 mb-10">
              <div className="h-24 w-24 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-2xl bg-slate-100 flex items-center justify-center">
                {targetUser.image ? <img src={targetUser.image} alt="" className="h-full w-full object-cover" /> : <UserCircle className="h-12 w-12 text-slate-300" />}
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{targetUser.name}</h3>
                <Badge variant="outline" className="mt-1.5 font-code text-[9px] border-primary/20 text-primary bg-primary/5 px-3 uppercase">{targetUser.id}</Badge>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Core Identity Nodes</h4>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Network Identifier (Login ID)</Label>
                    <div className="relative">
                      <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})} className="h-11 bg-slate-50 border-none rounded-xl font-bold font-code text-slate-700 pl-10" />
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Security Token (Pass)</Label>
                    <div className="relative group">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="h-11 bg-slate-50 border-none rounded-xl font-bold font-code text-slate-700 pl-10 pr-10" 
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Organizational Placement</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2"><Briefcase className="h-3 w-3" /> Assigned Role</Label>
                    <Input value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="h-11 bg-slate-50 border-none rounded-xl font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2"><Network className="h-3 w-3" /> Department Node</Label>
                    <Input value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})} className="h-11 bg-slate-50 border-none rounded-xl font-bold text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Access Control Matrix */}
        <div className="xl:col-span-8 space-y-6">
          {/* Matrix Filter Bar */}
          <Card className="p-4 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Filter matrix by module name..." 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest shadow-inner focus-visible:ring-2 focus-visible:ring-primary/20"
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={matrixCategoryFilter} onValueChange={setMatrixCategoryFilter}>
                <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-inner">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <SelectValue placeholder="Filter Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">All Operational Hubs</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-[10px] font-bold uppercase">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(matrixSearch || matrixCategoryFilter !== 'all') && (
              <Button variant="ghost" size="icon" onClick={() => { setMatrixSearch(''); setMatrixCategoryFilter('all'); }} className="h-11 w-11 rounded-xl text-slate-400 hover:text-red-500">
                <X className="h-5 w-5" />
              </Button>
            )}
          </Card>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><Unlock className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Access Control Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit and assign navigation privileges for this identity.</p>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-none px-4 h-8 uppercase font-bold text-[9px] tracking-widest">REAL_TIME_PROTOCOLS</Badge>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredAccessNodes.map(node => (
                <div key={node.id} className="p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 flex flex-col gap-6 group hover:border-primary/20 transition-all shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-primary transition-colors border border-slate-100">
                        <node.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase text-slate-700 tracking-widest leading-none">{node.label}</span>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{node.category}</p>
                      </div>
                    </div>
                    {formData.permissions[node.id] && formData.permissions[node.id] !== 'none' && (
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Grant Access Level</Label>
                    <Select 
                      value={formData.permissions[node.id] || 'none'} 
                      onValueChange={(val) => handleUpdatePermission(node.id, val as any)}
                    >
                      <SelectTrigger className="h-10 bg-white border-none rounded-xl text-[10px] font-bold uppercase shadow-sm focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                        <SelectItem value="none" className="text-[10px] font-bold uppercase text-slate-400">Locked / No Access</SelectItem>
                        <SelectItem value="read" className="text-[10px] font-bold uppercase text-blue-600">Telemetry (Read Only)</SelectItem>
                        <SelectItem value="edit" className="text-[10px] font-bold uppercase text-amber-600">Operational (Edit)</SelectItem>
                        <SelectItem value="full" className="text-[10px] font-bold uppercase text-emerald-600">Root Command (Full)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {filteredAccessNodes.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No modules found matching filter protocol</p>
                </div>
              )}
            </div>
            
            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#001F3D]/5 rounded-lg text-[#001F3D]"><ShieldCheck className="h-5 w-5" /></div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">
                    Navigation visibility is managed <br />by this centralized matrix node.
                  </p>
               </div>
               <Button 
                disabled={isSaving}
                onClick={handleSaveProtocol}
                className="h-14 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-emerald-600/20 flex gap-4"
               >
                 {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Synchronize Matrix Protocol
               </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
