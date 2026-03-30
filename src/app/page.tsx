"use client";

import { useState } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType } from '@/lib/types';
import { ShopFloorOverview } from '@/components/shop-floor-overview';
import { ShopFloorOrders } from '@/components/shop-floor-orders';
import { ShopFloorSQCDP } from '@/components/shop-floor-sqcdp';
import { MachineUtilization } from '@/components/machine-utilization';
import { ManpowerUtilization } from '@/components/manpower-utilization';
import { CustomerOrders } from '@/components/customer-orders';
import { WeeklyPlan } from '@/components/weekly-plan';
import { UserManagement } from '@/components/user-management';
import { OperationsStatus } from '@/components/operations-status';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VisualShopFloor() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);

  const handleNavigateToOperations = (orderId: string) => {
    setActiveWorkOrderId(orderId);
    setCurrentView('operations');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav currentView={currentView} onViewChange={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="font-headline font-bold text-slate-800 uppercase tracking-tight text-lg">
              visual shop floor <span className="text-primary">2.0</span>
            </h1>
            <div className="h-4 w-[1px] bg-slate-200 mx-2" />
            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Section: {currentView.replace('-', ' ')}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input suppressHydrationWarning placeholder="Global search..." className="h-8 pl-8 text-xs bg-slate-50 border-none focus-visible:ring-1" />
            </div>
            <div className="flex items-center gap-4 border-l pl-4">
              <button className="text-slate-400 hover:text-primary transition-colors" suppressHydrationWarning>
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-none">Admin User</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">Plant Manager</p>
                </div>
                <Avatar className="h-8 w-8 border border-slate-200">
                  <AvatarImage src="https://picsum.photos/seed/admin-user/100/100" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {currentView === 'overview' && <ShopFloorOverview />}
          {currentView === 'orders' && (
            <ShopFloorOrders onNavigateToOperations={handleNavigateToOperations} />
          )}
          {currentView === 'sqcdp' && <ShopFloorSQCDP />}
          {currentView === 'machine-utilization' && <MachineUtilization />}
          {currentView === 'manpower' && <ManpowerUtilization />}
          {currentView === 'customer-orders' && <CustomerOrders />}
          {currentView === 'weekly-plan' && <WeeklyPlan />}
          {currentView === 'users' && <UserManagement />}
          {currentView === 'operations' && (
            <OperationsStatus 
              initialOrderId={activeWorkOrderId} 
              onOrderIdChange={setActiveWorkOrderId} 
            />
          )}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
