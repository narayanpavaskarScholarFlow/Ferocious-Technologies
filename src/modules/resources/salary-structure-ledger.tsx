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
  Plus
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
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const [formData, setFormData] = useState<SalaryStructure>({
    basePay: 0, hra: 0, conveyance: 0, specialAllowance: 0, otRate: 0, panNumber: '', bankAccount: '', ifscCode: ''
  });

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData(user.salary || { basePay: 0, hra: 0, conveyance: 0, specialAllowance: 0, otRate: 0, panNumber: '', bankAccount: '', ifscCode: '' });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#001F3D] rounded-xl shadow-lg"><Banknote className="h-6 w-6 text-white" /></div>
            <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Payroll Structure Ledger</h3>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Personnel Node</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Monthly CTC</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Bank Identity</TableHead>
              <TableHead className="text-right px-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id} className="h-24 hover:bg-slate-50/50 border-slate-50 group">
                <TableCell className="px-10"><span className="text-sm font-bold text-[#001F3D] uppercase">{user.name}</span></TableCell>
                <TableCell><span className="text-sm font-display font-bold text-primary">₹ {user.salary ? (user.salary.basePay + user.salary.hra).toLocaleString() : '0.00'}</span></TableCell>
                <TableCell><span className="text-[10px] font-bold text-slate-400 uppercase">{user.salary?.bankAccount || '---'}</span></TableCell>
                <TableCell className="text-right px-10"><Button variant="ghost" size="icon" onClick={() => handleEdit(user)}><Edit3 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
