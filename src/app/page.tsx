"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType, WorkLogEntry as WorkLogEntryType, SystemUser, Customer, Order, Machine, Vendor, InventoryItem, BillingRecord, PermissionLevel } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Command, Menu, LogOut, User, Settings, Sparkles, ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
  FirebaseClientProvider
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { differenceInDays, parseISO } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';

function IndustrialERPInternal() {
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  // Firestore Collections
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const customersQuery = useMemoFirebase(() => collection(db, 'customers'), [db]);
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const machinesQuery = useMemoFirebase(() => collection(db, 'machines'), [db]);
  const vendorsQuery = useMemoFirebase(() => collection(db, 'vendors'), [db]);
  const inventoryQuery = useMemoFirebase(() => collection(db, 'inventory'), [db]);
  const billingQuery = useMemoFirebase(() => collection(db, 'billing'), [db]);
  const logsQuery = useMemoFirebase(() => collection(db, 'work_logs'), [db]);

  const { data: ordersData } = useCollection<Order>(ordersQuery);
  const { data: customersData } = useCollection<Customer>(customersQuery);
  const { data: usersDataRaw } = useCollection<SystemUser>(usersQuery);
  const { data: machinesData } = useCollection<Machine>(machinesQuery);
  const { data: vendorsData } = useCollection<Vendor>(vendorsQuery);
  const { data: inventoryData } = useCollection<InventoryItem>(inventoryQuery);
  const { data: billingData } = useCollection<BillingRecord>(billingQuery);
  const { data: logsData } = useCollection<WorkLogEntryType>(logsQuery);

  const orders = ordersData || [];
  const customers = customersData || [];
  const usersData = usersDataRaw || [];
  const machines = machinesData || [];
  const vendors = vendorsData || [];
  const inventory = inventoryData || [];
  const billing = billingData || [];
  const logs = logsData || [];

  // Derive Current User Data and Permissions
  const currentUserData = useMemo(() => {
    if (!currentUser || !usersData) return null;
    return usersData.find(u => u.name === currentUser || u.email === currentUser);
  }, [currentUser, usersData]);

  // Password Policy Logic
  useEffect(() => {
    if (!currentUserData || !isLoggedIn) return;

    const lastChange = currentUserData.lastPasswordChange ? parseISO(currentUserData.lastPasswordChange) : new Date(0);
    const daysSinceChange = differenceInDays(new Date(), lastChange);

    if (daysSinceChange >= 45) {
      setIsPasswordChangeOpen(true);
    } else if (daysSinceChange >= 40) {
      toast({
        title: "Security Warning",
        description: `Your login key will expire in ${45 - daysSinceChange} days. Please update your security token.`,
        variant: "destructive",
      });
    }
  }, [currentUserData, isLoggedIn, toast]);

  const handleForcePasswordChange = () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Security Protocol Failure",
        description: "Password must be at least 6 characters for industrial grade encryption.",
        variant: "destructive"
      });
      return;
    }

    if (currentUserData) {
      setDocumentNonBlocking(doc(db, 'users', currentUserData.id), {
        ...currentUserData,
        lastPasswordChange: new Date().toISOString()
      }, { merge: true });
      
      setIsPasswordChangeOpen(false);
      setNewPassword('');
      toast({
        title: "Security Matrix Updated",
        description: "Your session token has been successfully rotated."
      });
    }
  };

  const permissions = useMemo(() => {
    const isMasterAdmin = currentUser === 'Master Admin';
    const isPlantController = currentUserData?.role === 'Plant Controller';

    if (isMasterAdmin || isPlantController) {
      const clearance: Record<string, PermissionLevel> = {
        overview: 'full',
        orders: 'full',
        sqcdp: 'full',
        operations: 'full',
        'machine-utilization': 'full',
        manpower: 'full',
        'customer-orders': 'full',
        'weekly-plan': 'full',
        vendor: 'full',
        'order-details': 'full',
        billing: 'full',
        'work-log': 'full',
        inventory: 'full',
        quality: 'full',
        settings: 'full',
        gantt: 'full',
        'smart-quote': 'full',
        'quality-review': 'full',
        'quality-release': 'full',
        'quality-report-delete': 'full',
        'order-create': 'full',
        'billing-quotation': 'full',
        'billing-invoice': 'full',
        'billing-proforma': 'full',
        'billing-inward': 'full',
        'billing-outward': 'full',
        'billing-create': 'full',
        'billing-delete': 'full',
        'vendor-onboard': 'full',
        'maintenance': 'full',
        'hr-planning': 'full',
        'holiday-matrix': 'full'
      };

      // User Directory and Access Matrix are strictly reserved for Master Admin
      if (isMasterAdmin) {
        clearance.users = 'full';
        clearance.matrix = 'full';
      } else {
        clearance.users = 'none';
        clearance.matrix = 'none';
      }

      return clearance;
    }
    return currentUserData?.permissions || {};
  }, [currentUser, currentUserData]);

  // Access Control Helper
  const hasAccess = useCallback((view: string): boolean => {
    // Master Admin has keys to every operational and administrative node
    if (currentUser === 'Master Admin') return true;
    
    // Plant Controller role is restricted from identity management and access matrix
    if (currentUserData?.role === 'Plant Controller') {
      if (view === 'users' || view === 'matrix') return false;
      return true;
    }

    if (view === 'settings') return true;
    const level = permissions[view];
    return level && level !== 'none';
  }, [permissions, currentUser, currentUserData]);

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

  const handleLogout = useCallback(() => {
    localStorage.removeItem('bharat_axis_user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('overview');
  }, []);

  // Automatic Logout Logic (3 minutes of inactivity)
  useEffect(() => {
    if (!isLoggedIn) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
        toast({
          variant: "destructive",
          title: "Session Timeout",
          description: "You have been logged out due to 3 minutes of inactivity.",
        });
      }, 3 * 60 * 1000);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [isLoggedIn, handleLogout, toast]);

  const handleSearchChange = (val: string) => {
    setGlobalSearch(val);
    const isOrderPattern = val.length >= 5 && /^\d+$/.test(val);
    if (isOrderPattern && orders?.find(o => o.id === val) && hasAccess('operations')) {
      setActiveWorkOrderId(val);
      setCurrentView('operations');
    }
  };

  const handleNavigateToOperations = (orderId: string) => {
    if (!hasAccess('operations')) {
      toast({ variant: "destructive", title: "Access Denied", description: "You do not have clearance for the Operational Spreadsheet." });
      return;
    }
    setActiveWorkOrderId(orderId);
    setCurrentView('operations');
  };

  const handleNavigateToOrderDetails = (orderId: string | null) => {
    const permKey = orderId ? 'orders' : 'order-create';
    if (!hasAccess(permKey)) {
      toast({ variant: "destructive", title: "Access Denied", description: "Unauthorized protocol execution attempted." });
      return;
    }
    setActiveWorkOrderId(orderId);
    setCurrentView('order-details');
  };

  const handleViewChange = (view: ViewType) => {
    setIsMobileMenuOpen(false);
    if (!hasAccess(view)) {
      toast({ variant: "destructive", title: "Security Matrix Alert", description: `Your identity node does not have '${view}' clearance.` });
      return;
    }
    
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

  // Data Persistence Handlers
  const handleSaveOrder = (order: Order) => {
    setDocumentNonBlocking(doc(db, 'orders', order.id), order, { merge: true });
    setCurrentView('orders');
  };

  const handleSaveMachine = (machine: Machine) => {
    setDocumentNonBlocking(doc(db, 'machines', machine.id), machine, { merge: true });
  };

  const handleSaveCustomer = (customer: Customer) => {
    setDocumentNonBlocking(doc(db, 'customers', customer.id), customer, { merge: true });
  };

  const handleSaveUser = (user: SystemUser) => {
    setDocumentNonBlocking(doc(db, 'users', user.id), user, { merge: true });
  };

  const handleSaveVendor = (vendor: Vendor) => {
    setDocumentNonBlocking(doc(db, 'vendors', vendor.id), vendor, { merge: true });
  };

  const handleSaveInventoryItem = (item: InventoryItem) => {
    setDocumentNonBlocking(doc(db, 'inventory', item.id), item, { merge: true });
  };

  const handleSaveBillingRecord = (record: BillingRecord) => {
    setDocumentNonBlocking(doc(db, 'billing', record.id), record, { merge: true });
  };

  const handleDeleteBillingRecord = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'billing', id));
  };

  const handleDeleteUser = (userId: string) => {
    deleteDocumentNonBlocking(doc(db, 'users', userId));
  };

  const handleUpdateStatusFromQC = (orderId: string, operation: string, status: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.routing) return;

    const updatedRouting = order.routing.map(op => 
      op.name === operation ? { ...op, status } : op
    );

    const activeOps = updatedRouting.filter(op => op.status !== 'NA');
    const completedTasksCount = updatedRouting.reduce((acc, op) => {
      if (op.status === 'NA') return acc;
      if (op.subTasks && op.subTasks.length > 0) {
        return acc + (op.subTasks.filter(s => s.status === 'Completed').length / op.subTasks.length);
      }
      return acc + (op.status === 'Completed' ? 1 : op.status === 'WIP' ? 0.5 : 0);
    }, 0);

    const progress = activeOps.length > 0 ? Math.round((completedTasksCount / activeOps.length) * 100) : 0;

    setDocumentNonBlocking(doc(db, 'orders', orderId), {
      routing: updatedRouting,
      progress: progress,
      status: progress === 100 ? 'Completed' : 'Pending'
    }, { merge: true });
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} users={usersData} />
        <Toaster />
      </>
    );
  }

  // Redirect to overview if current view access is revoked while active
  if (currentView !== 'overview' && currentView !== 'settings' && !hasAccess(currentView)) {
    setCurrentView('overview');
  }

  return (
    <div className="flex min-h-screen bg-blue-50/30 text-slate-900 font-body overflow-hidden print:h-auto print:overflow-visible print:block print:bg-white">
      <div className="hidden lg:block print:hidden">
        <SidebarNav currentView={currentView} onViewChange={handleViewChange} permissions={permissions} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-blue-100/60 shrink-0 px-6 md:px-10 flex items-center justify-between shadow-sm shadow-blue-200/20 z-50 print:hidden">
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
                <SidebarNav currentView={currentView} onViewChange={handleViewChange} permissions={permissions} />
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
                {hasAccess('smart-quote') && (
                  <button 
                    onClick={() => setCurrentView('smart-quote')}
                    className="h-11 w-11 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 transition-all text-primary"
                  >
                    <Sparkles className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="h-10 w-[1px] bg-slate-200 hidden xs:block" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-4 pl-2 group cursor-pointer">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-bold leading-none text-[#0f172a]">{currentUser}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1.5 group-hover:text-primary transition-colors">{currentUserData?.role || (currentUser === 'Master Admin' ? 'Root Controller' : 'Plant Controller')}</p>
                    </div>
                    <div className="relative">
                      <Avatar className="h-11 w-11 border-2 border-white shadow-xl shadow-slate-200 transition-transform group-hover:scale-105">
                        <AvatarImage src={currentUserData?.image || `https://picsum.photos/seed/${currentUser}/100/100`} />
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
                  {hasAccess('matrix') && (
                    <DropdownMenuItem onClick={() => { setCurrentView('settings'); setSettingsActiveTab('matrix'); }} className="rounded-xl h-11 px-3 text-xs font-bold gap-3 cursor-pointer">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Settings className="h-4 w-4" /></div> System Matrix
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-11 px-3 text-xs font-bold gap-3 text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-700">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><LogOut className="h-4 w-4" /></div> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className={cn(
          "flex-1 overflow-y-auto w-full print:overflow-visible print:p-0 print:max-w-none print:m-0 print:block",
          currentView === 'gantt' ? "p-0" : "p-6 md:p-10 max-w-[1800px] mx-auto"
        )}>
          <div className={cn(
            "animate-in fade-in slide-in-from-bottom-4 duration-1000 print:animate-none print:slide-in-from-bottom-0 print:duration-0 print:block",
            currentView === 'gantt' && "h-full"
          )}>
            {currentView === 'overview' && hasAccess('overview') && (
              <ShopFloorOverview 
                orders={orders}
                onNavigateToOrders={() => handleViewChange('orders')}
                onNavigateToMachine={() => handleViewChange('machine-utilization')}
                onNavigateToInventory={() => handleViewChange('inventory')}
                onNavigateToBilling={() => handleViewChange('billing')}
              />
            )}
            {currentView === 'smart-quote' && hasAccess('smart-quote') && <SmartQuotingAssistant machines={machines} />}
            {currentView === 'orders' && hasAccess('orders') && (
              <ShopFloorOrders 
                orders={orders}
                onNavigateToOperations={handleNavigateToOperations} 
                onNavigateToOrderDetails={handleNavigateToOrderDetails}
              />
            )}
            {currentView === 'billing' && hasAccess('billing') && (
              <BillingManagement 
                customers={customers} 
                vendors={vendors} 
                records={billing}
                orders={orders}
                users={usersData}
                onSaveRecord={handleSaveBillingRecord}
                onDeleteRecord={handleDeleteBillingRecord}
              />
            )}
            {currentView === 'inventory' && hasAccess('inventory') && (
              <InventoryManagement 
                items={inventory}
                onSaveItem={handleSaveInventoryItem}
              />
            )}
            {currentView === 'work-log' && hasAccess('work-log') && (
              <WorkLogEntry 
                logs={logs} 
                machines={machines}
                users={usersData}
                onAddLog={(l) => setDocumentNonBlocking(doc(db, 'work_logs', l.id), l, { merge: true })} 
              />
            )}
            {currentView === 'sqcdp' && hasAccess('sqcdp') && <ShopFloorSQCDP />}
            {currentView === 'machine-utilization' && hasAccess('machine-utilization') && (
              <MachineUtilization 
                machines={machines}
                orders={orders}
                onSaveMachine={handleSaveMachine}
              />
            )}
            {currentView === 'manpower' && hasAccess('manpower') && (
              <ManpowerUtilization 
                users={usersData}
                onSaveUser={handleSaveUser}
              />
            )}
            {currentView === 'customer-orders' && hasAccess('customer-orders') && (
              <CustomerOrders 
                customers={customers} 
                onSaveCustomer={handleSaveCustomer} 
              />
            )}
            {currentView === 'weekly-plan' && hasAccess('weekly-plan') && (
              <WeeklyPlan 
                logs={logs} 
                onNavigateToGantt={() => handleViewChange('gantt')}
              />
            )}
            {currentView === 'vendor' && hasAccess('vendor') && (
              <VendorManagement 
                vendors={vendors}
                onSaveVendor={handleSaveVendor}
              />
            )}
            {currentView === 'settings' && (
              <ProfileSettings 
                activeTab={settingsActiveTab} 
                onTabChange={setSettingsActiveTab} 
                onLogout={handleLogout}
                currentUser={currentUser}
                users={usersData}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
            {currentView === 'gantt' && hasAccess('gantt') && (
              <ProductionGantt 
                orders={orders}
                searchTerm={globalSearch}
                onNavigateToSchedule={() => handleViewChange('weekly-plan')}
                onNavigateToOperations={handleNavigateToOperations}
              />
            )}
            {currentView === 'quality' && hasAccess('quality') && (
              <QualityManagement 
                orders={orders}
                users={usersData}
                vendors={vendors}
                onUpdateStatus={handleUpdateStatusFromQC} 
                permissions={permissions}
              />
            )}
            {currentView === 'order-details' && (hasAccess('orders') || hasAccess('order-create')) && (
              <OrderDetails 
                orderId={activeWorkOrderId} 
                onBack={() => handleViewChange('orders')} 
                customers={customers}
                staff={usersData}
                onSave={handleSaveOrder}
                orders={orders}
              />
            )}
            {currentView === 'operations' && hasAccess('operations') && (
              <OperationsStatus 
                initialOrderId={activeWorkOrderId} 
                onOrderIdChange={setActiveWorkOrderId} 
                onNavigateToVendor={() => handleViewChange('vendor')}
                onStatusChange={(o, op, s) => {}}
                orders={orders}
                users={usersData}
                vendors={vendors}
                machines={machines}
              />
            )}

            {/* Un-authorized View Placeholder */}
            {currentView !== 'overview' && currentView !== 'settings' && !hasAccess(currentView) && (
              <div className="h-[60vh] flex flex-col items-center justify-center opacity-40 text-center">
                <div className="p-8 bg-slate-100 rounded-full mb-6">
                  <ShieldAlert className="h-16 w-16 text-slate-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Access Protocol Rejected</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                  Your identity node lacks clearance for this module. Contact the System Administrator to modify your Access Matrix credentials.
                </p>
                <Button onClick={() => handleViewChange('overview')} variant="outline" className="mt-8 rounded-xl font-bold uppercase text-[10px] tracking-widest border-slate-200">
                  Return to Dashboard
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mandatory Password Rotation Dialog */}
      <Dialog open={isPasswordChangeOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[2rem] p-10">
          <DialogHeader className="space-y-4">
            <div className="p-4 bg-red-50 rounded-2xl w-fit">
              <KeyRound className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Security Protocol Violation</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Your security token has exceeded the 45-day rotation window. Access is restricted until rotation is complete.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">New Security Token (Password)</Label>
              <Input 
                type="password"
                placeholder="Enter new master key..." 
                className="h-14 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">Mandatory rotation required every 45 days as per Bharat Axis security protocols.</p>
            </div>
            <Button onClick={handleForcePasswordChange} className="w-full h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20">Rotate Security Node</Button>
          </div>
        </DialogContent>
      </Dialog>

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
