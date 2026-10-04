
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Kanban,
  Edit3,
  Trash2,
  PackageCheck,
  Globe,
  DollarSign,
  TrendingUp,
  Activity,
  Bell,
  UserCheck,
  FileBarChart,
  FileCheck,
  Box
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemUser, PermissionLevel, ViewType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ACCESS_NODES: { id: ViewType | string; label: string; category: string; icon: any }[] = [
  { id: 'overview', label: 'Command Matrix', category: 'Functional Hub', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics Dashboard', category: 'Functional Hub', icon: LineChart },
  { id: 'customer-master', label: 'Customer Master', category: 'Functional Hub', icon: Building2 },
  { id: 'vendor-master', label: 'Vendor Master', category: 'Functional Hub', icon: Truck },
  { id: 'product-master', label: 'Product Registry', category: 'Functional Hub', icon: Box },
  { id: 'quotation', label: 'Quotation Ledger', category: 'Functional Hub', icon: FileText },
  { id: 'sale-invoice', label: 'Sales Invoice Ledger', category: 'Functional Hub', icon: Receipt },
  { id: 'purchase-order', label: 'Purchase Order Ledger', category: 'Functional Hub', icon: PackageCheck },
  { id: 'orders', label: 'Work Order Management', category: 'Functional Hub', icon: ShoppingCart },
  { id: 'production-planner', label: 'Production Planner', category: 'Functional Hub', icon: Factory },
  { id: 'gantt', label: 'Production Timeline', category: 'Functional Hub', icon: Calendar },
  { id: 'quality', label: 'Quality Control Hub', category: 'Functional Hub', icon: ShieldCheck },
  { id: 'inventory', label: 'Inventory Ledger', category: 'Functional Hub', icon: Boxes },
  { id: 'hr', label: 'Employee Management', category: 'Functional Hub', icon: Users },
  { id: 'settings', label: 'System Control Center', category: 'Functional Hub', icon: Settings },

  { id: 'dash-billing', label: 'Metric: Monthly Billing', category: 'Dashboard Matrix', icon: TrendingUp },
  { id: 'dash-outstanding', label: 'Metric: Outstanding Coll.', category: 'Dashboard Matrix', icon: Landmark },
  { id: 'dash-po', label: 'Metric: Customer PO Value', category: 'Dashboard Matrix', icon: Receipt },
  { id: 'dash-machine', label: 'Metric: Asset OEE', category: 'Dashboard Matrix', icon: Cpu },
  { id: 'dash-production', label: 'Metric: Production Achieve.', category: 'Dashboard Matrix', icon: Factory },
  { id: 'dash-health', label: 'Metric: Business Health', category: 'Dashboard Matrix', icon: Activity },
  { id: 'dash-ai', label: 'Widget: AI Business Insights', category: 'Dashboard Matrix', icon: BrainCircuit },
  { id: 'dash-alerts', label: 'Widget: System Alert Panel', category: 'Dashboard Matrix', icon: Bell },
  { id: 'dash-approvals', label: 'Widget: Approval Gateway', category: 'Dashboard Matrix', icon: UserCheck },
  
  { id: 'report-sales', label: 'Report: Sales & Revenue', category: 'Reports Matrix', icon: FileBarChart },
  { id: 'report-quality', label: 'Report: Quality Audit', category: 'Reports Matrix', icon: ShieldCheck },
  { id: 'report-production', label: 'Report: Yield Analysis', category: 'Reports Matrix', icon: Factory },
  { id: 'report-dispatch', label: 'Report: Dispatch Ledger', category: 'Reports Matrix', icon: PackageCheck },
  { id: 'report-machine', label: 'Report: Machine Load', category: 'Reports Matrix', icon: Cpu },
  { id: 'report-financial', label: 'Report: Financial Liquidity', category: 'Reports Matrix', icon: Landmark },

  { id: 'approve-quotation', label: 'Auth: Quotation Release', category: 'Certification Matrix', icon: FileCheck },
  { id: 'approve-wo', label: 'Auth: Work Order Start', category: 'Certification Matrix', icon: ShoppingCart },
  { id: 'approve-dispatch', label: 'Auth: Dispatch Protocol', category: 'Certification Matrix', icon: Truck },
  { id: 'approve-invoice', label: 'Auth: Invoice Finalization', category: 'Certification Matrix', icon: Receipt },
  { id: 'approve-payment', label: 'Auth: Payment Settlement', category: 'Certification Matrix', icon: Landmark },
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
  const [activeTab, setActiveTab] = useState('access');
  const [localUser, setLocalUser] = useState<SystemUser | null>(null);

  useEffect(() => {
    if (userId) {
      const found = users.find(u => u.id === userId);
      if (found) setLocalUser({ ...found, permissions: found.permissions || {} });
    }
  }, [userId, users]);

  const handleUpdatePermission = (nodeId: string, level: PermissionLevel) => {
    if (!localUser) return;
    const updated = {
      ...localUser,
      permissions: { ...localUser.permissions, [nodeId]: level }
    };
    setLocalUser(updated);
  };

  const handleSave = () => {
    if (!localUser) return;
    onSaveUser(localUser);
    toast({ title: "Matrix Synchronized", description: `Identity permissions for ${localUser.name} updated.` });
  };

  if (!localUser) return null;

  const categories = Array.from(new Set(ACCESS_NODES.map(n => n.category)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-2xl text-slate-400 hover:text-[#001F3D] hover:bg-slate-100">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-400 text-xl shadow-lg">
              {localUser.image ? <img src={localUser.image} alt="" className="h-full w-full object-cover" /> : localUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{localUser.name}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{localUser.role} • {localUser.dept} • ID: {localUser.id}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-6 font-bold uppercase text-[10px] tracking-widest gap-2" onClick={() => onVerifyPortal(localUser.name)}>
            <Unlock className="h-4 w-4" /> Verify My Portal
          </Button>
          <Button className="rounded-xl bg-[#001F3D] hover:bg-black text-white h-12 px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleSave}>
            <Save className="h-4 w-4" /> Commit Permissions
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="access" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            <ShieldCheck className="h-4 w-4 mr-2" /> Access Matrix
          </TabsTrigger>
          <TabsTrigger value="info" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            <Fingerprint className="h-4 w-4 mr-2" /> System Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="m-0 space-y-10">
          <div className="grid grid-cols-1 gap-10">
            {categories.map((cat) => (
              <Card key={cat} className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-[2rem]">
                <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">{cat}</h3>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[8px] font-bold px-3">GATED_NODES</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-white">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-5 px-10">Functional Node</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">None</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Read-Only</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Standard Access</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Full Control</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACCESS_NODES.filter(n => n.category === cat).map((node) => (
                      <TableRow key={node.id} className="hover:bg-slate-50/30 h-20 border-b border-slate-50 transition-colors">
                        <TableCell className="px-10">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><node.icon className="h-4 w-4" /></div>
                            <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">{node.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <RadioGroup value={localUser.permissions[node.id] || 'none'} onValueChange={(val) => handleUpdatePermission(node.id, val as any)}>
                              <RadioGroupItem value="none" className="h-5 w-5 border-slate-200 text-slate-400" />
                            </RadioGroup>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <RadioGroup value={localUser.permissions[node.id] || 'none'} onValueChange={(val) => handleUpdatePermission(node.id, val as any)}>
                              <RadioGroupItem value="read" className="h-5 w-5 border-slate-200 text-blue-500" />
                            </RadioGroup>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <RadioGroup value={localUser.permissions[node.id] || 'none'} onValueChange={(val) => handleUpdatePermission(node.id, val as any)}>
                              <RadioGroupItem value="edit" className="h-5 w-5 border-slate-200 text-primary" />
                            </RadioGroup>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <RadioGroup value={localUser.permissions[node.id] || 'none'} onValueChange={(val) => handleUpdatePermission(node.id, val as any)}>
                              <RadioGroupItem value="full" className="h-5 w-5 border-slate-200 text-emerald-500" />
                            </RadioGroup>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="info" className="m-0 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] space-y-12">
               <div className="flex items-center gap-4 border-l-4 border-[#001F3D] pl-6">
                  <div className="p-3 bg-[#001F3D] rounded-2xl text-white"><Briefcase className="h-7 w-7" /></div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Metadata</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel organizational nodes.</p>
                  </div>
               </div>
               <div className="space-y-6">
                   <div className="flex justify-between items-center py-4 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Email</span>
                      <span className="text-sm font-bold text-slate-700">{localUser.email}</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departmental Node</span>
                      <span className="text-sm font-bold text-primary uppercase">{localUser.dept}</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporting Node</span>
                      <span className="text-sm font-bold text-slate-700">{localUser.reportingManager || '---'}</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Auth Sync</span>
                      <span className="text-xs font-code font-bold text-slate-500">{localUser.lastLogin}</span>
                   </div>
               </div>
            </Card>

            <div className="space-y-8">
              <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] space-y-8">
                 <div className="flex items-center gap-4 border-l-4 border-emerald-600 pl-6">
                    <div className="p-3 bg-emerald-600/10 rounded-2xl text-emerald-600"><DollarSign className="h-7 w-7" /></div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Commercial Node</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Financial Authorization Limits.</p>
                    </div>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approval Limit (₹)</span>
                    <span className="text-2xl font-display font-bold text-[#001F3D]">₹ {(localUser.approvalLimit || 0).toLocaleString()}</span>
                 </div>
              </Card>

              <Card className="p-10 border-slate-200 bg-white shadow-2xl rounded-[2.5rem] space-y-8">
                 <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Cpu className="h-7 w-7" /></div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Asset Authorization</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorized machine access nodes.</p>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {localUser.machineAccess && localUser.machineAccess.length > 0 ? (
                      localUser.machineAccess.map(m => (
                        <Badge key={m} variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold text-[10px] px-4 py-1.5 rounded-full uppercase">{m}</Badge>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-300 font-bold uppercase italic py-4">No Asset Authorization Nodes Discovered</p>
                    )}
                 </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
