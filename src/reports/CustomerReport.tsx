'use client';
import React from 'react';
import { ERPPage } from '@/design-system/ERPPage';
import { ERPHeader } from '@/design-system/ERPHeader';
import { ERPCard } from '@/design-system/ERPCard';
import { Building2 } from 'lucide-react';

export function CustomerReport() {
  return (
    <ERPPage>
      <ERPHeader breadcrumb={['Administration', 'Reports']} title="Customer Report" description="CRM analytics and account profitability matrix." />
      <ERPCard className="h-96 flex flex-col items-center justify-center opacity-30">
        <Building2 className="h-16 w-16 mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Report Matrix Generating...</p>
      </ERPCard>
    </ERPPage>
  );
}
