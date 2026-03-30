"use client";

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, ExternalLink, Star, Phone } from 'lucide-react';
import { Vendor } from '@/lib/types';
import { cn } from '@/lib/utils';

const mockVendors: Vendor[] = [
  { id: 'V-001', name: 'Precision Heat Treats', type: 'Heat Treatment', activeOrders: 3, rating: 4.8, contact: '+1 555-0123', status: 'Active' },
  { id: 'V-002', name: 'Global Logistics Inc.', type: 'Logistics', activeOrders: 12, rating: 4.5, contact: '+1 555-0456', status: 'Active' },
  { id: 'V-003', name: 'Electro-Chem Finishing', type: 'Surface Finishing', activeOrders: 1, rating: 3.9, contact: '+1 555-0789', status: 'Under Review' },
  { id: 'V-004', name: 'Alpha Machining Services', type: 'Sub-contracting', activeOrders: 0, rating: 4.2, contact: '+1 555-0101', status: 'Inactive' },
];

export function VendorManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-headline font-bold uppercase text-slate-800">Vendor Management Portal</h2>
        </div>
        <Button className="gap-2 bg-primary">
          <Truck className="h-4 w-4" /> Onboard New Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Partners</p>
          <p className="text-2xl font-bold text-slate-800">24</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Open Sub-Contracts</p>
          <p className="text-2xl font-bold text-blue-600">16</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Avg. Lead Time</p>
          <p className="text-2xl font-bold text-green-600">4.2 Days</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase text-slate-500">Vendor ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-500">Partner Name</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-500">Service Type</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-500 text-center">Active Jobs</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-500">Rating</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-500">Status</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockVendors.map((vendor) => (
              <TableRow key={vendor.id} className="hover:bg-slate-50 transition-colors h-16">
                <TableCell className="font-code text-xs text-slate-500">{vendor.id}</TableCell>
                <TableCell className="font-bold text-slate-700">{vendor.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase bg-slate-100">
                    {vendor.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-code font-bold text-primary">
                  {vendor.activeOrders}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-600">{vendor.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={cn(
                      "text-[9px] uppercase font-bold px-3 py-0.5",
                      vendor.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' :
                      vendor.status === 'Under Review' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-400 border border-slate-200'
                    )}
                  >
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
