"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Shield, User, Trash2 } from 'lucide-react';

const usersData = [
  { id: '1', name: 'Admin Root', email: 'admin@toolroom.io', role: 'System Admin', lastLogin: '2 mins ago' },
  { id: '2', name: 'Miloš Kovařík', email: 'm.kovarik@toolroom.io', role: 'Plant Manager', lastLogin: '1 hour ago' },
  { id: '3', name: 'Sarah Miller', email: 's.miller@toolroom.io', role: 'Operator', lastLogin: 'Yesterday' },
];

export function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold uppercase">System Access Control</h2>
        <Button className="gap-2 bg-primary">
          <UserPlus className="h-4 w-4" /> Register New User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-[10px] uppercase">User</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">Permissions</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">Last Activity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-code">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] gap-1 font-bold">
                        {user.role === 'System Admin' ? <Shield className="h-3 w-3 text-red-500" /> : <User className="h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <Card className="p-6 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase">Security Summary</h3>
          <div className="space-y-4">
             <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Active Sessions</p>
                <p className="text-2xl font-bold">12</p>
             </div>
             <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Login Failures (24h)</p>
                <p className="text-2xl font-bold text-red-500">0</p>
             </div>
             <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Audit Log Integrity</p>
                <p className="text-xs font-bold text-green-600">VERIFIED ✓</p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
