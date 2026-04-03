"use client";

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, ExternalLink, Star, Phone, ShieldCheck, FileCheck, Activity, PackageX } from 'lucide-react';
import { Vendor } from '@/lib/types';
import { cn } from '@/lib/utils';

const mockVendors: Vendor[] = [];

export function VendorManagement() {
  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Truck className="h-4 w-4" />
            Supply Chain Governance
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Partner Ecosystem
          </h2>
          <p className="text-muted-foreground font-medium">Manage external dependencies, sub-contracts, and logistics partners.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-8 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20">
             <Truck className="h-4 w-4" /> Onboard New Vendor
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-primary/50 transition-colors">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Total Partners</p>
          <p className="text-3xl font-display font-bold text-slate-900">{mockVendors.length}</p>
        </Card>
        <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-blue-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Open Sub-Contracts</p>
          <p className="text-3xl font-display font-bold text-blue-600">0</p>
        </Card>
        <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-green-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Avg. Lead Time</p>
          <p className="text-3xl font-display font-bold text-green-600">0.0 Days</p>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200">
          <TabsTrigger value="partners" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Active Partners
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Performance Index
          </TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Contracts
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Onboarding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="m-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Vendor ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Partner Name</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Service Type</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Active Jobs</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Rating</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Status</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                    <TableCell className="px-8 font-code text-xs text-slate-400">{vendor.id}</TableCell>
                    <TableCell className="font-bold text-sm text-slate-900">{vendor.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase py-1 px-3 bg-white border-slate-200">
                        {vendor.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-code font-bold text-primary">
                      {vendor.activeOrders}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-600">{vendor.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "text-[9px] uppercase font-bold px-3 py-1",
                          vendor.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' :
                          vendor.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-50 text-slate-400 border border-slate-100'
                        )}
                      >
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {mockVendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20 py-10">
                        <PackageX className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-slate-500 font-code text-xs italic uppercase tracking-widest">No vendor partners found in database</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-2xl text-center opacity-40">
            <Activity className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Aggregating Vendor Quality Compliance Records</p>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-2xl text-center opacity-40">
            <FileCheck className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Legal Document Management | 0 Active NDAs</p>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-2xl text-center opacity-40">
            <ShieldCheck className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Vendor Security Governance Protocol</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}