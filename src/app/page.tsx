
"use client";

import { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType, WorkLogEntry as WorkLogEntryType, SystemUser, Customer, Order, Machine, Vendor } from '@/lib/types';
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
import { SmartQuotingAssistant } from '@/components/smart-quoting-assistant';
import { LoginScreen } from '@/components/login-screen';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Command, Menu, LogOut, User, Settings, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking,
  FirebaseClientProvider
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';

function IndustrialERPInternal() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  
  // Firestore Collections
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const customersQuery = useMemoFirebase(() => collection(db, 'customers'), [db]);
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const machinesQuery = useMemoFirebase(() => collection(db, 'machines'), [db]);
  const vendorsQuery = useMemoFirebase(() => collection(db, 'vendors'), [db]);
  const logsQuery = useMemoFirebase(() => collection(db, 'work_logs'), [db]);

  const { data: orders = [] } = useCollection<Order>(ordersQuery);
  const { data: customers = [] } = useCollection<Customer>(customersQuery);
  const { data: usersData = [] } = useCollection<SystemUser>(usersQuery);
  const { data: machines = [] } = useCollection<Machine>(machinesQuery);
  const { data: vendors = [] } = useCollection<Vendor>(vendorsQuery);
  const { data: logs = [] } = useCollection<WorkLogEntryType>(logsQuery);

  const [globalSearch, setGlobalSearch] = useState('');
  const [settingsActiveTab, setSettingsActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('bharat_axis_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleSearchChange = (val: string) => {
    setGlobalSearch(val);
    const isOrderPattern = val.length >= 5 && /^\d+$/.test(val);
    if (isOrderPattern && orders?.find(o => o.id === val)) {
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
    setIsMobileMenuOpen(false);
    if (view === 'users') {
      setCurrentView('settings');
      setSettingsActiveTab('access');
    } else {
      setCurrentView(view);
      if (view === 'settings') setSettingsActiveTab('profile');
    }
  };

  const handleLogin = (user: string) => {
    localStorage.setItem('bharat_axis_user', user);
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('bharat_axis_user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('overview');
  };

  const handleSaveOrder = (order: Order) => {
    setDocumentNonBlocking(doc(db, 'orders', order.id), order, { merge: true });
    setCurrentView('orders');
  };

  const handleMachinesChange = (updatedMachines: Machine[]) => {
    updatedMachines.forEach(m => {
      setDocumentNonBlocking(doc(db, 'machines', m.id), m, { merge: true });
    });
  };

  const handleCustomersChange = (updatedCustomers: Customer[]) => {
    updatedCustomers.forEach(c => {
      setDocumentNonBlocking(doc(db, 'customers', c.id), c, { merge: true });
    });
  };

  const handleUsersChange = (updatedUsers: SystemUser[]) => {
    updatedUsers.forEach(u => {
      setDocumentNonBlocking(doc(db, 'users', u.id), u, { merge: true });
    });
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
    <div className="flex min-h-screen bg-blue-50/30 text-slate-900 font-body">
      <div className="hidden lg:block">
        <SidebarNav currentView={currentView} onViewChange={handleViewChange} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-blue-100/60 sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between shadow-sm shadow-blue-200/20">
          <div className="flex items-center gap-2 md:gap-8">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 -ml-2 rounded-xl hover:bg-slate-100">
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-24 bg-[#0f172a] border-none">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Access all Bharat Axis Pvt Ltd modules</SheetDescription>
                <SidebarNav currentView={currentView} onViewChange={handleViewChange} />
              </SheetContent>
            </Sheet>

            <div className="flex flex-col">
              <h1 className="font-headline font-bold text-lg md:text-xl tracking-tighter text-[#0f172a] flex items-center gap-2">
                BHARAT<span className="text-primary">AXIS</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-widest hidden xs:block">PRO</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden sm:block">
                {currentView.replace('-', ' ')} protocol active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative w-48 md:w-80 group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Global Search WO..." 
                className="h-11 pl-11 pr-12 rounded-[1.25rem] bg-slate-100/80 border-none text-xs font-bold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                value={globalSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[9px] font-bold text-slate-400 border border-slate-200 rounded-lg px-1.5 py-1 bg-white">
                <Command className="h-2.5 w-2.5" /> K
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2">
                <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-all relative">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-3 right-3 h-2 w-2 bg-accent rounded-full border-2 border-white shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                </button>
                <button 
                  onClick={() => setCurrentView('smart-quote')}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 transition-all text-primary"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>

              <div className="h-10 w-[1px] bg-slate-200 hidden xs:block" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-4 pl-2 group cursor-pointer">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-bold leading-none text-[#0f172a]">{currentUser}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1.5 group-hover:text-primary transition-colors">Plant Controller</p>
                    </div>
                    <div className="relative">
                      <Avatar className="h-11 w-11 border-2 border-white shadow-xl shadow-slate-200 transition-transform group-hover:scale-105">
                        <AvatarImage src="https://picsum.photos/seed/axis-user/100/100" />
                        <AvatarFallback className="bg-primary text-white text-xs font-bold">SA</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-[1.5rem] shadow-2xl border-slate-100 animate-in slide-in-from-top-2 duration-300">
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-3 py-2">Administrative Node</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleViewChange('settings')} className="rounded-xl h-11 px-3 text-xs font-bold gap-3 cursor-pointer">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><User className="h-4 w-4" /></div> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange('settings')} className="rounded-xl h-11 px-3 text-xs font-bold gap-3 cursor-pointer">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Settings className="h-4 w-4" /></div> System Matrix
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-11 px-3 text-xs font-bold gap-3 text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-700">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><LogOut className="h-4 w-4" /></div> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-[1800px] mx-auto w-full overflow-x-hidden">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {currentView === 'overview' && (
              <ShopFloorOverview 
                orders={orders || []}
                onNavigateToOrders={() => setCurrentView('orders')}
                onNavigateToMachine={() => setCurrentView('machine-utilization')}
                onNavigateToInventory={() => setCurrentView('inventory')}
                onNavigateToBilling={() => setCurrentView('billing')}
              />
            )}
            {currentView === 'smart-quote' && <SmartQuotingAssistant machines={machines || []} />}
            {currentView === 'orders' && (
              <ShopFloorOrders 
                orders={orders || []}
                onNavigateToOperations={handleNavigateToOperations} 
                onNavigateToOrderDetails={handleNavigateToOrderDetails}
              />
            )}
            {currentView === 'billing' && <BillingManagement customers={customers || []} vendors={vendors || []} />}
            {currentView === 'inventory' && <InventoryManagement />}
            {currentView === 'work-log' && (
              <WorkLogEntry 
                logs={logs || []} 
                onAddLog={(l) => setDocumentNonBlocking(doc(db, 'work_logs', l.id), l, { merge: true })} 
              />
            )}
            {currentView === 'sqcdp' && <ShopFloorSQCDP />}
            {currentView === 'machine-utilization' && (
              <MachineUtilization 
                machines={machines || []}
                onMachinesChange={handleMachinesChange}
              />
            )}
            {currentView === 'manpower' && (
              <ManpowerUtilization 
                users={usersData || []}
                onUsersChange={handleUsersChange}
              />
            )}
            {currentView === 'customer-orders' && (
              <CustomerOrders 
                customers={customers || []} 
                onCustomersChange={handleCustomersChange} 
              />
            )}
            {currentView === 'weekly-plan' && (
              <WeeklyPlan 
                logs={logs || []} 
                onNavigateToGantt={() => setCurrentView('gantt')}
              />
            )}
            {currentView === 'vendor' && <VendorManagement />}
            {currentView === 'settings' && (
              <ProfileSettings 
                activeTab={settingsActiveTab} 
                onTabChange={setSettingsActiveTab} 
                onLogout={handleLogout}
                users={usersData || []}
                onUsersChange={handleUsersChange}
              />
            )}
            {currentView === 'gantt' && (
              <ProductionGantt 
                orders={orders || []}
                searchTerm={globalSearch}
                onNavigateToSchedule={() => setCurrentView('weekly-plan')}
                onNavigateToOperations={handleNavigateToOperations}
              />
            )}
            {currentView === 'quality' && <QualityManagement onUpdateStatus={(o, op, s) => {
              // Quality updates can be persisted here if needed
            }} />}
            {currentView === 'order-details' && (
              <OrderDetails 
                orderId={activeWorkOrderId} 
                onBack={handleBackToOrders} 
                customers={customers || []}
                staff={usersData || []}
                onSave={handleSaveOrder}
                orders={orders || []}
              />
            )}
            {currentView === 'operations' && (
              <OperationsStatus 
                initialOrderId={activeWorkOrderId} 
                onOrderIdChange={setActiveWorkOrderId} 
                onNavigateToVendor={() => setCurrentView('vendor')}
                onStatusChange={(o, op, s) => {
                  // Persistence for operations status if mapped to a schema
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

export default function IndustrialERP() {
  return (
    <FirebaseClientProvider>
      <IndustrialERPInternal />
    </FirebaseClientProvider>
  );
}
