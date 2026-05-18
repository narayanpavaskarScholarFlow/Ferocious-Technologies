
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Banknote, 
  DollarSign, 
  Edit3, 
  Save, 
  Search, 
  Calculator, 
  User, 
  ArrowRight,
  TrendingUp,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import { SystemUser, SalaryStructure } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SalaryStructureLedgerProps {
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
}

export function SalaryStructureLedger({ users, onSaveUser }: SalaryStructureLedgerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const [formData, setFormData] = useState<SalaryStructure>({
    basePay: 0,
    hra: 0,
    conveyance: 0,
    specialAllowance: 0,
    otRate: 0,
    panNumber: '',
    bankAccount: '',
    ifscCode: ''
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData(user.salary || {
      basePay: 0,
      hra: 0,
      conveyance: 0,
      specialAllowance: 0,
      otRate: 0,
      panNumber: '',
      bankAccount: '',
      ifscCode: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedUser) return;

    onSaveUser({
      ...selectedUser,
      salary: formData
    });

    toast({
      title: "Salary Structure Synchronized",
      description: `Payroll protocols for ${selectedUser.name} have been updated.`,
    });
    setIsEditDialogOpen(false);
  };

  const calculateTotal = (s: SalaryStructure) => {
    return s.basePay + s.hra + s.conveyance + s.specialAllowance;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#001F3D] rounded-xl shadow-lg"><Banknote className="h-6 w-6 text-white" /></div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Payroll Identity Matrix</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Master Salary Structure Ledger</p>
            </div>
          </div>
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search resource node..." 
              className="pl-10 h-11 bg-white border-slate-200 text-xs rounded-xl shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Personnel Node</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Monthly CTC (Base)</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">OT Rate (₹/hr)</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Bank Identity</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
              <TableHead className="text-right px-10 w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                <TableCell className="px-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D] uppercase">{user.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-display font-bold text-primary">₹ {user.salary ? calculateTotal(user.salary).toLocaleString() : '0.00'}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">Net Monthly Baseline</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-code text-xs">
                    ₹ {user.salary?.otRate || '0'}.00 /hr
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-[150px]">{user.salary?.bankAccount || '---'}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">IFSC: {user.salary?.ifscCode || 'UNSET'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={cn(
                    "text-[9px] font-bold uppercase px-3",
                    user.salary ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
                  )}>
                    {user.salary ? 'Configured' : 'Missing Node'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-10">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100" onClick={() => handleEdit(user)}>
                    <Edit3 className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Personnel Salary Protocol</DialogTitle>
            <DialogDescription>Modify financial configuration for workforce identity.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col md:flex-row min-h-[600px]">
            <div className="w-full md:w-80 bg-[#001F3D] p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
              
              <div className="space-y-10 relative z-10">
                <div className="p-4 bg-primary rounded-2xl w-fit shadow-xl shadow-primary/20"><Calculator className="h-10 w-10" /></div>
                <div>
                  <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Salary Protocol</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mt-3">Personnel Identity: {selectedUser?.name}</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10 pt-10 border-t border-white/10">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span>Net Baseline</span>
                  <span className="text-xl text-white">₹ {calculateTotal(formData).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <p className="text-[8px] text-white/30 uppercase font-bold tracking-[0.2em]">Validated Protocol v2.4</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-12 space-y-10 overflow-y-auto hide-scrollbar bg-white">
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Yield Matrix</h4>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Base Compensation</Label>
                    <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner" value={formData.basePay} onChange={(e) => setFormData({...formData, basePay: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">HRA Allocation</Label>
                    <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner" value={formData.hra} onChange={(e) => setFormData({...formData, hra: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Conveyance</Label>
                    <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner" value={formData.conveyance} onChange={(e) => setFormData({...formData, conveyance: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">OT Hourly Rate (₹)</Label>
                    <Input type="number" className="h-12 bg-emerald-50/50 border-none rounded-xl text-xs font-bold text-emerald-700 shadow-inner" value={formData.otRate} onChange={(e) => setFormData({...formData, otRate: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="space-y-8 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                  <Landmark className="h-5 w-5 text-accent" />
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement Node (Bank)</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Bank Account Number</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold font-code shadow-inner" value={formData.bankAccount} onChange={(e) => setFormData({...formData, bankAccount: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">IFSC Code</Label>
                      <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner" value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">PAN Number</Label>
                      <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner" value={formData.panNumber} onChange={(e) => setFormData({...formData, panNumber: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] text-slate-400" onClick={() => setIsEditDialogOpen(false)}>Abort</Button>
                <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] shadow-2xl flex gap-3 group" onClick={handleSave}>
                  Synchronize Structure <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
