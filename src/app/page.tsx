"use client";

import { useState, useEffect } from 'react';
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
import { VendorManagement } from '@/components/vendor-management';
import { OrderDetails } from '@/components/order-details';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VisualShopFloor() {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigateToOperations = (orderId: string) => {
    setActiveWorkOrderId(orderId);
    setCurrentView('operations');
  };

  const handleNavigateToOrderDetails = (orderId: string | null) => {
    setActiveWorkOrderId(orderId);
    setCurrentView('order-details');
  };

  const handleNavigateToVendor = () => {
    setCurrentView('vendor');
  };

  const handleBackToOrders = () => {
    setCurrentView('orders');
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-black" />;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7]">
      <SidebarNav currentView={currentView} onViewChange={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-6">
            <h1 className="font-display font-bold text-xl tracking-tight">
              TOOLROOM<span className="text-primary">2.0</span>
            </h1>
            <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10" />
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {currentView.replace('-', ' ')}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-80 hidden lg:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                suppressHydrationWarning 
                placeholder="Search resources..." 
                className="h-10 pl-10 pr-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-muted-foreground pointer-events-none border border-black/10 dark:border-white/10 rounded px-1.5 py-0.5 bg-white dark:bg-black">
                <Command className="h-2.5 w-2.5" /> K
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button suppressHydrationWarning className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white dark:border-black" />
              </button>
              <div className="h-10 w-[1px] bg-black/10 dark:bg-white/10 mx-2" />
              <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-none">Plant Admin</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-1 group-hover:text-primary transition-colors">View Profile</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary/20 transition-all">
                  <AvatarImage src="https://picsum.photos/seed/apple-user/100/100" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">PA</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full overflow-visible">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {currentView === 'overview' && <ShopFloorOverview />}
            {currentView === 'orders' && (
              <ShopFloorOrders 
                onNavigateToOperations={handleNavigateToOperations} 
                onNavigateToOrderDetails={handleNavigateToOrderDetails}
              />
            )}
            {currentView === 'sqcdp' && <ShopFloorSQCDP />}
            {currentView === 'machine-utilization' && <MachineUtilization />}
            {currentView === 'manpower' && <ManpowerUtilization />}
            {currentView === 'customer-orders' && <CustomerOrders />}
            {currentView === 'weekly-plan' && <WeeklyPlan />}
            {currentView === 'users' && <UserManagement />}
            {currentView === 'vendor' && <VendorManagement />}
            {currentView === 'order-details' && (
              <OrderDetails 
                orderId={activeWorkOrderId} 
                onBack={handleBackToOrders} 
              />
            )}
            {currentView === 'operations' && (
              <OperationsStatus 
                initialOrderId={activeWorkOrderId} 
                onOrderIdChange={setActiveWorkOrderId} 
                onNavigateToVendor={handleNavigateToVendor}
              />
            )}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}