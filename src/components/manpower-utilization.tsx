"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StaffMember } from '@/lib/types';

const staffData: StaffMember[] = [
  { id: '1', name: 'Miloš Kovařík', role: 'Lead Engineer', status: 'active', shift: 'Morning', efficiency: 98 },
  { id: '2', name: 'Sarah Miller', role: 'Machine Operator', status: 'active', shift: 'Morning', efficiency: 85 },
  { id: '3', name: 'A. Chen', role: 'QC Specialist', status: 'break', shift: 'Morning', efficiency: 92 },
  { id: '4', name: 'J. Doe', role: 'Maintenance', status: 'off', shift: 'Evening', efficiency: 70 },
  { id: '5', name: 'Elena Petrova', role: 'Operator', status: 'active', shift: 'Morning', efficiency: 88 },
];

export function ManpowerUtilization() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold uppercase">Manpower & Resource Planning</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-700">Active: 14</Badge>
          <Badge variant="outline" className="bg-amber-100 text-amber-700">Break: 3</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffData.map((staff) => (
          <Card key={staff.id} className="p-4 flex items-center justify-between border-slate-200">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-slate-100">
                <AvatarImage src={`https://picsum.photos/seed/${staff.id}/100/100`} />
                <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold">{staff.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-medium">{staff.role}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] font-bold uppercase",
                  staff.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' :
                  staff.status === 'break' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-slate-50 text-slate-400 border-slate-200'
                )}
              >
                {staff.status}
              </Badge>
              <p className="text-xs font-code mt-1 text-slate-400">{staff.shift} Shift</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Skill Matrix & Availability</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold">Milling (Expert)</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[80%]" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold">Turning (Expert)</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[65%]" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold">Quality Control</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[95%]" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold">Logistics</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[40%]" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
