"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Shield, User, Trash2, MoreHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const usersData = [
  { id: '1', name: 'Admin Root', email: 'admin@toolroom.io', role: 'System Admin', lastLogin: '2 mins ago', status: 'online' },
  { id: '2', name: 'Miloš Kovařík', email: 'm.kovarik@toolroom.io', role: 'Plant Manager', lastLogin: '1 hour ago', status: 'offline' },
  { id: '3', name: 'Sarah Miller', email: 's.miller@toolroom.io', role: 'Operator', lastLogin: 'Yesterday', status: 'offline' },
];

export function UserManagement() {
  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Shield className="h-4 w-4" />
            Security Governance
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            System Access Control
          </h2>
          <p className="text-muted-foreground font-medium">Manage identity verification and role-based permissions.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-8 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20">
             <UserPlus className="h-4 w-4" /> Register New User
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main User Matrix */}
        <Card className="lg:col-span-8 overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-[300px]">User Identity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Permissions</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Last Activity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {user.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-code">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase gap-2 px-3 py-1 bg-white border-slate-200",
                      user.role === 'System Admin' ? "text-red-600" : "text-slate-600"
                    )}>
                      {user.role === 'System Admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-medium">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary">
                         <MoreHorizontal className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Security Summary Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-8">Security Summary</h3>
            
            <div className="space-y-6">
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Active Sessions</p>
                  <p className="text-4xl font-display font-bold text-slate-900">12</p>
                  <div className="h-1 w-12 bg-primary rounded-full mt-4" />
               </div>
               
               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Login Failures (24h)</p>
                  <p className="text-4xl font-display font-bold text-red-500">0</p>
                  <div className="h-1 w-12 bg-red-500 rounded-full mt-4" />
               </div>

               <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Audit Log Integrity</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Verified ✓</span>
                  </div>
               </div>
            </div>
          </Card>

          <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <p className="text-xs font-medium text-slate-600 leading-snug">
              Two-factor authentication is currently <span className="font-bold text-primary">enforced</span> for all administrative accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
