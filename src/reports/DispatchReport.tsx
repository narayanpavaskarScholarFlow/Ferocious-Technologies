'use client';
import React from 'react';
import { ERPPage } from '@/design-system/ERPPage';
import { ERPHeader } from '@/design-system/ERPHeader';
import { ERPCard } from '@/design-system/ERPCard';
import { PackageCheck } from 'lucide-react';

export function DispatchReport() {
  return (
    <ERPPage>
      <ERPHeader breadcrumb={['Administration', 'Reports']} title="Dispatch Report" description="Terminal logistics yield and delivery performance matrix." />
      <ERPCard className="h-96 flex flex-col items-center justify-center opacity-30">
        <PackageCheck className="h-16 w-16 mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Report Matrix Generating...</p>
      </ERPCard>
    </ERPPage>
  );
}
