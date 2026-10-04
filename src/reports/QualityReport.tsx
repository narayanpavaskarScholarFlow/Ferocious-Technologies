'use client';
import React from 'react';
import { ERPPage } from '@/design-system/ERPPage';
import { ERPHeader } from '@/design-system/ERPHeader';
import { ERPCard } from '@/design-system/ERPCard';
import { ShieldCheck } from 'lucide-react';

export function QualityReport() {
  return (
    <ERPPage>
      <ERPHeader breadcrumb={['Administration', 'Reports']} title="Quality Report" description="Inspection pass/fail rates and compliance audit matrix." />
      <ERPCard className="h-96 flex flex-col items-center justify-center opacity-30">
        <ShieldCheck className="h-16 w-16 mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Report Matrix Generating...</p>
      </ERPCard>
    </ERPPage>
  );
}
