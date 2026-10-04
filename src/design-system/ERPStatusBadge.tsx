'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Draft' | 'Pending Approval' | 'Rejected' | 'Released' | string;

export function ERPStatusBadge({ status }: { status: StatusType }) {
  const getStyles = (s: string) => {
    switch (s) {
      case 'Planning': return "bg-blue-50 text-blue-600 border-blue-200";
      case 'In Progress': return "bg-orange-50 text-orange-600 border-orange-200";
      case 'Completed': 
      case 'Released': return "bg-green-50 text-green-600 border-green-200";
      case 'On Hold':
      case 'Rejected': return "bg-red-50 text-red-600 border-red-200";
      case 'Pending Approval': return "bg-purple-50 text-purple-600 border-purple-200";
      case 'Draft': return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  return (
    <Badge className={cn("text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm", getStyles(status))}>
      {status}
    </Badge>
  );
}
