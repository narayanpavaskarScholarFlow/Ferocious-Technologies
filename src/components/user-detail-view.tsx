"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  X,
  BrainCircuit,
  ShoppingCart,
  Factory,
  Layers,
  Calendar,
  ClipboardList,
  GraduationCap,
  Contact,
  Boxes,
  Truck,
  Cpu,
  Settings,
  ShieldAlert,
  LineChart,
  Kanban
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemUser, PermissionLevel, ViewType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ACCESS_NODES: { id: ViewType; label: string; category: string; icon: any }[] = [
  { id: 'overview', label: 'Command Matrix', category: 'Strategic Hub', icon: LayoutGrid },
  { id: 'agile', label: 'Agile Kanban', category: 'Strategic Hub', icon: Kanban },
  { id: 'smart-quote', label: 'AI Quoting Assistant', category: 'Strategic Hub', icon: BrainCircuit },
  { id: 'sqcdp', label: 'Performance Analytics', category: 'Strategic Hub', icon: ShieldCheck },
  { id: 'team-matrix', label: 'My Team Matrix', category: 'Strategic Hub', icon: Users },
  { id: 'orders', label: 'Master Orders', category: 'Production Control', icon: ShoppingCart },
  { id: 'production-planner', label: 'Mass Production', category: 'Production Control', icon: Factory },
  { id: 'gantt', label: 'Visual Timeline', category: 'Production Control', icon: LayoutGrid },
  { id: 'operations', label: 'Operational Spreadsheet', category: 'Production Control', icon: Layers },
  { id: 'weekly-plan', label: 'Master Schedule', category: 'Production Control', icon: Calendar },
  { id: 'work-log', label: 'Daily Work Logs', category: 'Production Control', icon: ClipboardList },
  { id: 'quality', label: 'Quality Hub', category: 'Quality & Compliance', icon: ShieldCheck },
  { id: 'training', label: 'Training Matrix', category: 'Quality & Compliance', icon: GraduationCap },
  { id: 'customer-orders', label: 'Customer Identity', category: 'Commercial Operations', icon: Contact },
  { id: 'inventory', label: 'Stock Ledger', category: 'Commercial Operations', icon: Boxes },
  { id: 'billing', label: 'Financial Hub (Main)', category: 'Commercial Operations', icon: CreditCard },
  { id: 'billing-quotation', label: 'Financial: Quotation', category: 'Commercial Operations', icon: FileText },
  { id: 'billing-invoice', label: 'Financial: Invoice', category: 'Commercial Operations', icon: Receipt },
  { id: 'billing-proforma', label: 'Financial: Proforma', category: 'Commercial Operations', icon: Building2 },
  { id: 'billing-inward', label: 'Financial: Inward', category: 'Commercial Operations', icon: ArrowDownLeft },
  { id: 'billing-outward', label: 'Financial: Outward', category: 'Commercial Operations', icon: ArrowUpRight },
  { id: 'billing-bank', label: 'Financial: Bank Ledger', category: 'Commercial Operations', icon: Landmark },
  { id: 'vendor', label: 'Supply Chain Partner', category: 'Commercial Operations', icon: Truck },
  { id: 'machine-utilization', label: 'Asset Fleet', category: 'Resources & Assets', icon: Cpu },
  { id: 'hr', label: 'HR Command Hub', category: 'Resources & Assets', icon: Users },
  { id: 'settings', label: 'Control Center', category: 'System Governance', icon: Settings },
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
  const [selectedMatrixModule, setSelectedMatrixModule] = useState<string>('all');

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
      // Hierarchical Selection Logic: If parent 'billing' is selected, show parent + all 'billing-*'
      let matchesModule = selectedMatrixModule === 'all' || node.id === selectedMatrixModule;
      if (selectedMatrixModule === 'billing') {
        matchesModule = node.id === 'billing' || node.id.startsWith('billing-');
      }

      return matchesModule;
    });
  }, [selectedMatrixModule]);

  const handleSaveProtocol = () => {
    if (!targetUser) return;

    setIsSaving(true);
    const updatedUser: SystemUser = {
      ...targetUser,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      username: formData.username,
      email: formData.username, 
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
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
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

        <div className="xl:col-span-8 space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-80">
              <Select value={selectedMatrixModule} onValueChange={setSelectedMatrixModule}>
                <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-inner">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Select Module Cluster" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  <SelectItem value="all" className="text-[10px] font-bold uppercase">All Operational Hubs</SelectItem>
                  {ACCESS_NODES.filter(n => !n.id.startsWith('billing-') || n.id === 'billing').map(node => (
                    <SelectItem key={node.id} value={node.id} className="text-[10px] font-bold uppercase py-3">
                      <div className="flex items-center gap-3">
                        <node.icon className="h-4 w-4 text-slate-400" />
                        {node.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="shrink-0">
              <Button 
                disabled={isSaving}
                onClick={handleSaveProtocol}
                className="h-14 px-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-red-600/30 flex gap-4 group"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Matrix Protocol
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
            <div className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">In Selected Matrix</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-28">No Access</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-28">Read Only</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-28">Only Edit</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-28">Full Control</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccessNodes.map(node => (
                      <TableRow key={node.id} className="h-20 border-b border-slate-100 hover:bg-slate-50/30 transition-all group">
                        <TableCell className="px-10">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-300 group-hover:text-primary transition-colors border border-slate-100">
                              <node.icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-[11px] font-bold uppercase text-slate-700 tracking-widest leading-none",
                                node.id.startsWith('billing-') && "text-primary/70"
                              )}>{node.label}</span>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{node.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell colSpan={4} className="p-0">
                          <RadioGroup 
                            value={formData.permissions[node.id] || 'none'} 
                            onValueChange={(val) => handleUpdatePermission(node.id, val as PermissionLevel)}
                            className="flex h-full"
                          >
                            <div className="flex-1 flex justify-center items-center border-r border-slate-100/50"><RadioGroupItem value="none" className="h-5 w-5" /></div>
                            <div className="flex-1 flex justify-center items-center border-r border-slate-100/50"><RadioGroupItem value="read" className="h-5 w-5" /></div>
                            <div className="flex-1 flex justify-center items-center border-r border-slate-100/50"><RadioGroupItem value="edit" className="h-5 w-5" /></div>
                            <div className="flex-1 flex justify-center items-center"><RadioGroupItem value="full" className="h-5 w-5" /></div>
                          </RadioGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
