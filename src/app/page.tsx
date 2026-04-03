
"use client";

import { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType, WorkLogEntry as WorkLogEntryType, SystemUser, Customer } from '@/lib/types';
import { ShopFloorOverview } from '@/components/shop-floor-overview';
import { ShopFloorOrders } from '@/components/shop-floor-orders';
import { ShopFloorSQCDP } from '@/components/shop-floor-sqcdp';
import { MachineUtilization } from '@/components/machine-utilization';
import { ManpowerUtilization } from '@/components/manpower-utilization';
import { CustomerOrders } from '@/components/customer-orders';
import { WeeklyPlan } from '@/components/weekly-plan';
import { OperationsStatus } from '@/components/operations-status';
import { VendorManagement } from '@/components/vendor-management';
import { OrderDetails } from '@/components/order-details';
import { BillingManagement } from '@/components/billing-management';
import { WorkLogEntry } from '@/components/work-log-entry';
import { InventoryManagement } from '@/components/inventory-management';
import { QualityManagement } from '@/components/quality-management';
import { ProductionGantt } from '@/components/production-gantt';
import { ProfileSettings } from '@/components/profile-settings';
import { LoginScreen } from '@/components/login-screen';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Command, X, ShieldAlert, LogOut, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const INITIAL_LOGS: WorkLogEntryType[] = [];

const INITIAL_OP_STATUSES: Record<string, Record<string, string>> = {};

export default function IndustrialERP() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkLogEntryType[]>(INITIAL_LOGS);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [globalOpStatuses, setGlobalOpStatuses] = useState<Record<string, Record<string, string>>>(INITIAL_OP_STATUSES);
  const [globalSearch, setGlobalSearch] = useState('');
  const [settingsActiveTab, setSettingsActiveTab] = useState('profile');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchChange = (val: string) => {
    setGlobalSearch(val);
    const isOrderPattern = val.length >= 5 && /^\d+$/.test(val);
    if (isOrderPattern) {
      setActiveWorkOrderId(val);
      setCurrentView('operations');
    }
  };

  const handleNavigateToOperations = (orderId: string) => {
    setActiveWorkOrderId(orderId);
    setCurrentView('operations');
  };

  const handleNavigateToOrderDetails = (orderId: string | null) => {
    setActiveWorkOrderId(orderId);
    setCurrentView('order-details');
  };

  const handleBackToOrders = () => {
    setCurrentView('orders');
  };

  const handleViewChange = (view: ViewType) => {
    if (view === 'users') {
      setCurrentView('settings');
      setSettingsActiveTab('access');
    } else {
      setCurrentView(view);
      if (view === 'settings') setSettingsActiveTab('profile');
    }
  };

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('overview');
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-body">
      <SidebarNav currentView={currentView} onViewChange={handleViewChange} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/60 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-headline font-bold text-lg tracking-tight text-[#001F3D]">
              TOOLROOM<span className="text-accent">2.0</span>
            </h1>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {currentView.replace('-', ' ')}
              </span>
              <div className="h-1 w-1 rounded-full bg-accent animate-pulse-red" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                placeholder="Search Work_Order_ID..." 
                className="h-9 pl-9 pr-10 rounded-lg bg-slate-100 border-none text-[11px] focus-visible:ring-1 focus-visible:ring-primary/20"
                value={globalSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-bold text-slate-400 border border-slate-200 rounded px-1 py-0.5 bg-white">
                <Command className="h-2 w-2" /> K
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors relative">
                <Bell className="h-4.5 w-4.5 text-slate-600" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-accent rounded-full border-2 border-white" />
              </button>
              <div className="h-8 w-[1px] bg-slate-200" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] font-bold leading-none text-[#001F3D]">{currentUser}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1 group-hover:text-accent transition-colors">Plant Controller</p>
                    </div>
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src="https://picsum.photos/seed/erp-user/100/100" />
                      <AvatarFallback className="bg-primary text-white text-[10px] font-bold">SA</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-slate-100">
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Account Matrix</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleViewChange('settings')} className="text-xs font-bold gap-2 cursor-pointer rounded-lg h-10">
                    <User className="h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange('settings')} className="text-xs font-bold gap-2 cursor-pointer rounded-lg h-10">
                    <Settings className="h-4 w-4" /> Control Center
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-xs font-bold gap-2 text-red-600 cursor-pointer rounded-lg h-10 focus:bg-red-50 focus:text-red-700">
                    <LogOut className="h-4 w-4" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full overflow-visible">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {currentView === 'overview' && (
              <ShopFloorOverview 
                onNavigateToOrders={() => setCurrentView('orders')}
                onNavigateToMachine={() => setCurrentView('machine-utilization')}
                onNavigateToInventory={() => setCurrentView('inventory')}
                onNavigateToBilling={() => setCurrentView('billing')}
              />
            )}
            {currentView === 'orders' && (
              <ShopFloorOrders 
                onNavigateToOperations={handleNavigateToOperations} 
                onNavigateToOrderDetails={handleNavigateToOrderDetails}
              />
            )}
            {currentView === 'billing' && <BillingManagement />}
            {currentView === 'inventory' && <InventoryManagement />}
            {currentView === 'work-log' && <WorkLogEntry logs={logs} onAddLog={(l) => setLogs([l, ...logs])} />}
            {currentView === 'sqcdp' && <ShopFloorSQCDP />}
            {currentView === 'machine-utilization' && <MachineUtilization />}
            {currentView === 'manpower' && <ManpowerUtilization />}
            {currentView === 'customer-orders' && (
              <CustomerOrders 
                customers={customers} 
                onCustomersChange={setCustomers} 
              />
            )}
            {currentView === 'weekly-plan' && (
              <WeeklyPlan 
                logs={logs} 
                onNavigateToGantt={() => setCurrentView('gantt')}
              />
            )}
            {currentView === 'vendor' && <VendorManagement />}
            {currentView === 'settings' && (
              <ProfileSettings 
                activeTab={settingsActiveTab} 
                onTabChange={setSettingsActiveTab} 
                onLogout={handleLogout}
                users={users}
                onUsersChange={setUsers}
              />
            )}
            {currentView === 'gantt' && (
              <ProductionGantt 
                searchTerm={globalSearch}
                onNavigateToSchedule={() => setCurrentView('weekly-plan')}
                onNavigateToOperations={handleNavigateToOperations}
              />
            )}
            {currentView === 'quality' && <QualityManagement onUpdateStatus={(o, op, s) => {
              setGlobalOpStatuses(prev => ({
                ...prev, [o]: { ...(prev[o] || {}), [op]: s }
              }))
            }} />}
            {currentView === 'order-details' && (
              <OrderDetails 
                orderId={activeWorkOrderId} 
                onBack={handleBackToOrders} 
                customers={customers}
                users={users}
              />
            )}
            {currentView === 'operations' && (
              <OperationsStatus 
                initialOrderId={activeWorkOrderId} 
                onOrderIdChange={setActiveWorkOrderId} 
                onNavigateToVendor={() => setCurrentView('vendor')}
                externalOpStatuses={globalOpStatuses}
                onStatusChange={(o, op, s) => {
                  setGlobalOpStatuses(prev => ({
                    ...prev, [o]: { ...(prev[o] || {}), [op]: s }
                  }))
                }}
              />
            )}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
