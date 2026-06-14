"use client";

import { LoanProjectHub } from '@/components/loan-project-hub';
import { FirebaseClientProvider, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { SystemUser } from '@/lib/types';
import { useMemo } from 'react';
import placeholderImages from '@/app/lib/placeholder-images.json';

function StrategyHubInternal() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: usersData } = useCollection<SystemUser>(usersQuery);

  const currentUserData = useMemo(() => {
    if (!user || !usersData) return null;
    return usersData.find(u => u.email === user.email || u.id === user.uid);
  }, [user, usersData]);

  const masterAdmin = useMemo(() => {
    return usersData?.find(u => u.role === 'Master Admin' || u.name?.toLowerCase() === 'master admin');
  }, [usersData]);

  const brandLogo = useMemo(() => {
    return masterAdmin?.uiSettings?.brandLogo || placeholderImages.placeholderImages.find(i => i.id === 'brand-logo')?.imageUrl || '';
  }, [masterAdmin]);

  if (isUserLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Strategy Hub...</p>
      </div>
    );
  }

  // Identity verification node
  const isAuthorized = masterAdmin || currentUserData?.permissions?.['loan-project'] === 'full';

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#001F3D] text-white">
        <ShieldAlert className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-2xl font-display font-bold uppercase tracking-tight">Identity Authentication Required</h1>
        <p className="text-xs text-white/40 mt-2 uppercase tracking-widest">Access Strategy Hub at the primary command gateway.</p>
        <a href="/" className="mt-10 px-8 py-3 bg-white text-[#001F3D] rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl">Return to Gateway</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <LoanProjectHub brandLogo={brandLogo} />
      </div>
    </div>
  );
}

export default function StrategyHub() {
  return (
    <FirebaseClientProvider>
      <StrategyHubInternal />
    </FirebaseClientProvider>
  );
}