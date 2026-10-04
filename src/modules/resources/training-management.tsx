"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  BookOpen,
  History,
  Trash2,
  Target
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Training, TrainingAssignment, SystemUser } from '@/lib/types';

interface TrainingManagementProps {
  trainings: Training[];
  assignments: TrainingAssignment[];
  users: SystemUser[];
  onSaveTraining: (training: Training) => void;
  onDeleteTraining: (id: string) => void;
  onSaveAssignment: (assignment: TrainingAssignment) => void;
  onDeleteAssignment: (id: string) => void;
  isFullControl?: boolean;
}

export function TrainingManagement({ trainings, assignments, users, onSaveTraining, onSaveAssignment, isFullControl }: TrainingManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <header className="flex justify-between items-center px-2">
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-display font-bold text-[#001F3D] uppercase">Global Training Matrix</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Governance Node</p>
         </div>
         {isFullControl && <Button className="rounded-xl bg-[#001F3D] text-white font-bold h-11 px-8 uppercase text-[10px]" onClick={() => setIsAssignOpen(true)}><Plus className="h-4 w-4 mr-2" /> Deploy Training</Button>}
      </header>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
         <Table>
            <TableHeader className="bg-slate-50/50">
               <TableRow><TableHead className="px-8 py-5 text-[10px] font-bold uppercase">Module</TableHead><TableHead className="text-[10px] font-bold uppercase">Personnel</TableHead><TableHead className="text-center text-[10px] font-bold uppercase">State</TableHead></TableRow>
            </TableHeader>
            <TableBody>{assignments.map(asg => (
              <TableRow key={asg.id} className="h-20 border-slate-50 hover:bg-slate-50/30">
                 <TableCell className="px-8 font-bold text-primary uppercase">{asg.trainingTitle}</TableCell>
                 <TableCell className="text-[11px] font-bold text-slate-600 uppercase">{asg.userName}</TableCell>
                 <TableCell className="text-center"><Badge className="bg-blue-50 text-blue-700 uppercase text-[8px] font-bold">{asg.status}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
         </Table>
      </Card>
    </div>
  );
}
