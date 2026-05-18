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
  ShieldCheck,
  FileText,
  Plus,
  History
} from 'lucide-react';
import { SystemUser, SalaryStructure, SalarySlip } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

interface SalaryStructureLedgerProps {
  users: SystemUser[];
  onSaveUser: (user: SystemUser) => void;
}

export function SalaryStructureLedger({ users, onSaveUser }: SalaryStructureLedgerProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSlipDialogOpen, setIsSlipDialogOpen] = useState(false);
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

  const [slipMonth, setSlipMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [slipYear, setSlipYear] = useState(new Date().getFullYear());

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData(user.salary || {
      basePay: 0, hra: 0, conveyance: 0, specialAllowance: 0, otRate: 0,
      panNumber: '', bankAccount: '', ifscCode: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedUser) return;
    onSaveUser({ ...selectedUser, salary: formData });
    toast({ title: "Salary Structure Synchronized", description: `Payroll protocols for ${selectedUser.name} updated.` });
    setIsEditDialogOpen(false);
  };

  const handleGenerateSlip = (user: SystemUser) => {
    setSelectedUser(user);
    setIsSlipDialogOpen(true);
  };

  const commitSlip = () => {
    if (!selectedUser || !selectedUser.salary) return;
    
    const slipId = `SLIP-${selectedUser.id}-${slipMonth}-${slipYear}`;
    const totalPay = selectedUser.salary.basePay + selectedUser.salary.hra + selectedUser.salary.conveyance + selectedUser.salary.specialAllowance;
    
    const slip: SalarySlip = {
      id: slipId,
      userId: selectedUser.id,
      month: slipMonth,
      year: slipYear,
      generatedDate: new Date().toISOString().split('T')[0],
      netPay: totalPay,
      status: 'Published'
    };

    setDocumentNonBlocking(doc(db, 'salary_slips', slipId), slip, { merge: true });
    toast({ title: "Slip Generated", description: `Official salary slip for ${selectedUser.name} published to portal.` });
    setIsSlipDialogOpen(false);
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
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Bank Identity</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
              <TableHead className="text-right px-10 w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                <TableCell className="px-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">{user.name.charAt(0)}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D] uppercase">{user.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   <span className="text-sm font-display font-bold text-primary">₹ {user.salary ? calculateTotal(user.salary).toLocaleString() : '0.00'}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-[150px]">{user.salary?.bankAccount || '---'}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">IFSC: {user.salary?.ifscCode || 'UNSET'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={cn("text-[9px] font-bold uppercase px-3", user.salary ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100")}>
                    {user.salary ? 'Configured' : 'Missing Node'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-10">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary" onClick={() => handleEdit(user)}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-slate-200 font-bold text-[8px] uppercase tracking-widest gap-2" onClick={() => handleGenerateSlip(user)}><Plus className="h-3.5 w-3.5" /> Gen Slip</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-[600px]">
            <div className="w-full md:w-80 bg-[#001F3D] p-12 text-white flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-4 bg-primary rounded-2xl w-fit shadow-xl shadow-primary/20"><Calculator className="h-10 w-10" /></div>
                <h3 className="text-3xl font-display font-bold uppercase tracking-tight leading-tight">Salary Protocol: {selectedUser?.name}</h3>
              </div>
              <div className="pt-10 border-t border-white/10">
                <span className="text-[10px] font-bold text-white/40 uppercase">Net Monthly</span>
                <p className="text-2xl font-display font-bold text-white">₹ {calculateTotal(formData).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex-1 p-12 space-y-8 bg-white overflow-y-auto">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Base Pay</Label><Input type="number" className="bg-slate-50" value={formData.basePay} onChange={(e)=>setFormData({...formData, basePay: Number(e.target.value)})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">HRA</Label><Input type="number" className="bg-slate-50" value={formData.hra} onChange={(e)=>setFormData({...formData, hra: Number(e.target.value)})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Conveyance</Label><Input type="number" className="bg-slate-50" value={formData.conveyance} onChange={(e)=>setFormData({...formData, conveyance: Number(e.target.value)})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Special Allowance</Label><Input type="number" className="bg-slate-50" value={formData.specialAllowance} onChange={(e)=>setFormData({...formData, specialAllowance: Number(e.target.value)})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">OT Hourly Rate (₹)</Label><Input type="number" className="bg-emerald-50 border-emerald-100" value={formData.otRate} onChange={(e)=>setFormData({...formData, otRate: Number(e.target.value)})} /></div>
               </div>
               <div className="space-y-4 pt-6 border-t">
                  <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Bank Account No.</Label><Input className="bg-slate-50 font-code" value={formData.bankAccount} onChange={(e)=>setFormData({...formData, bankAccount: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">IFSC Code</Label><Input className="bg-slate-50 uppercase" value={formData.ifscCode} onChange={(e)=>setFormData({...formData, ifscCode: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">PAN Number</Label><Input className="bg-slate-50 uppercase" value={formData.panNumber} onChange={(e)=>setFormData({...formData, panNumber: e.target.value})} /></div>
                  </div>
               </div>
               <div className="flex gap-4 pt-6">
                  <Button variant="ghost" className="flex-1 rounded-xl uppercase font-bold text-[10px]" onClick={()=>setIsEditDialogOpen(false)}>Abort</Button>
                  <Button className="flex-[2] bg-[#001F3D] hover:bg-black text-white rounded-xl uppercase font-bold text-[10px]" onClick={handleSave}>Sync Structure</Button>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSlipDialogOpen} onOpenChange={setIsSlipDialogOpen}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[2rem] p-10">
          <DialogHeader className="mb-6">
             <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4"><FileText className="h-6 w-6 text-primary" /></div>
             <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase">Publish Salary Slip</DialogTitle>
             <DialogDescription className="text-xs text-slate-400">Generating monthly settlement protocol for {selectedUser?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-[9px] uppercase font-bold text-slate-400">Month</Label>
                   <Select value={slipMonth} onValueChange={setSlipMonth}>
                      <SelectTrigger className="bg-slate-50 border-none rounded-xl h-12 text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                         {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                            <SelectItem key={m} value={m} className="text-xs font-bold uppercase">{m}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[9px] uppercase font-bold text-slate-400">Year</Label>
                   <Input type="number" className="bg-slate-50 border-none rounded-xl h-12 text-xs font-bold" value={slipYear} onChange={(e)=>setSlipYear(Number(e.target.value))} />
                </div>
             </div>
             <Button className="w-full h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl uppercase font-bold text-[10px] tracking-widest shadow-xl flex gap-3" onClick={commitSlip}>
                <Save className="h-4 w-4" /> Publish to Portal
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}