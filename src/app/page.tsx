
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType, WorkLogEntry as WorkLogEntryType, SystemUser, Customer, Order, Machine, Vendor, InventoryItem, BillingRecord, PermissionLevel, ProductionBatch, UISettings, Training, TrainingAssignment, QualityReport } from '@/lib/types';
import { ShopFloorOverview } from '@/components/shop-floor-overview';
import { ShopFloorOrders } from '@/components/shop-floor-orders';
import { ShopFloorSQCDP } from '@/components/shop-floor-sqcdp';
import { MachineUtilization } from '@/components/machine-utilization';
import { HRManagement } from '@/components/hr-management';
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
import { ProductionPlanner } from '@/components/production-planner';
import { AgileBoard } from '@/components/agile-board';
import { LoginScreen } from '@/components/login-screen';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Command, Menu, LogOut, User, Settings, Sparkles, ShieldAlert, KeyRound, AlertTriangle, Kanban } from 'lucide-react';
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

const DEFAULT_UI_SETTINGS: UISettings = {
  fontSize: 13,
  tableDensity: 'compact',
  borderRadius: 1,
  primaryColor: '243 75% 59%',
  sidebarMode: 'slim'
};

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
  
  // UI Customization State
  const [uiSettings, setUISettings] = useState<UISettings>(DEFAULT_UI_SETTINGS);

  // Firestore Collections
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const customersQuery = useMemoFirebase(() => collection(db, 'customers'), [db]);
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const machinesQuery = useMemoFirebase(() => collection(db, 'machines'), [db]);
  const vendorsQuery = useMemoFirebase(() => collection(db, 'vendors'), [db]);
  const inventoryQuery = useMemoFirebase(() => collection(db, 'inventory'), [db]);
  const billingQuery = useMemoFirebase(() => collection(db, 'billing'), [db]);
  const logsQuery = useMemoFirebase(() => collection(db, 'work_logs'), [db]);
  const batchesQuery = useMemoFirebase(() => collection(db, 'production_batches'), [db]);
  const trainingsQuery = useMemoFirebase(() => collection(db, 'trainings'), [db]);
  const assignmentsQuery = useMemoFirebase(() => collection(db, 'training_assignments'), [db]);
  const reportsQuery = useMemoFirebase(() => collection(db, 'quality_reports'), [db]);

  const { data: ordersData } = useCollection<Order>(ordersQuery);
  const { data: customersData } = useCollection<Customer>(customersQuery);
  const { data: usersDataRaw } = useCollection<SystemUser>(usersQuery);
  const { data: machinesData } = useCollection<Machine>(machinesQuery);
  const { data: vendorsData } = useCollection<Vendor>(vendorsQuery);
  const { data: inventoryData } = useCollection<InventoryItem>(inventoryQuery);
  const { data: billingData } = useCollection<BillingRecord>(billingQuery);
  const { data: logsData } = useCollection<WorkLogEntryType>(logsQuery);
  const { data: batchesData } = useCollection<ProductionBatch>(batchesQuery);
  const { data: trainingsData } = useCollection<Training>(trainingsQuery);
  const { data: assignmentsData } = useCollection<TrainingAssignment>(assignmentsQuery);
  const { data: reportsData } = useCollection<QualityReport>(reportsQuery);

  const orders = ordersData || [];
  const customers = customersData || [];
  const usersData = usersDataRaw || [];
  const machines = machinesData || [];
  const vendors = vendorsData || [];
  const inventory = inventoryData || [];
  const billing = billingData || [];
  const logs = logsData || [];
  const batches = batchesData || [];
  const trainings = trainingsData || [];
  const assignments = assignmentsData || [];
  const reports = reportsData || [];

  // Derive Current User Data and Permissions
  const currentUserData = useMemo(() => {
    if (!currentUser || !usersData) return null;
    return usersData.find(u => u.name === currentUser || u.email === currentUser);
  }, [currentUser, usersData]);

  // Apply UI Settings when changed or on mount
  useEffect(() => {
    const targetSettings = currentUserData?.uiSettings || DEFAULT_UI_SETTINGS;
    setUISettings(targetSettings);
    
    document.documentElement.style.setProperty('--base-font-size', `${targetSettings.fontSize}px`);
    document.documentElement.style.setProperty('--radius', `${targetSettings.borderRadius}rem`);
    document.documentElement.style.setProperty('--primary', targetSettings.primaryColor);
    
    const densityMap = {
      compact: '0.5rem',
      standard: '1rem',
      comfortable: '1.5rem'
    };
    document.documentElement.style.setProperty('--table-cell-padding', densityMap[targetSettings.tableDensity]);
  }, [currentUserData?.uiSettings]);

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
        description: `Your login key will expire in ${45 - daysSinceChange} days.`,
        variant: "destructive",
      });
    }
  }, [currentUserData, isLoggedIn, toast]);

  const handleForcePasswordChange = () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Security Protocol Failure",
        description: "Password must be at least 6 characters.",
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
        title: "Security Updated",
        description: "Credentials synchronized."
      });
    }
  };

  const permissions = useMemo(() => {
    const isMasterAdmin = currentUser === 'Master Admin';
    const isPlantController = currentUserData?.role === 'Plant Controller';

    if (isMasterAdmin || isPlantController) {
      const clearance: Record<string, PermissionLevel> = {
        overview: 'full',
        agile: 'full',
        orders: 'full',
        sqcdp: 'full',
        operations: 'full',
        'machine-utilization': 'full',
        hr: 'full',
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
        'holiday-matrix': 'full',
        'production-planner': 'full',
        training: 'full'
      };

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

  const hasAccess = useCallback((view: string): boolean => {
    if (currentUser === 'Master Admin') return true;
    if (currentUserData?.role === 'Plant Controller') {
      if (view === 'users' || view === 'matrix') return false;
      return true;
    }
    if (view === 'settings') return true;
    if (view === 'hr') return hasAccess('manpower') || hasAccess('training');
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

  const handleSearchChange = (val: string) => {
    setGlobalSearch(val);
    const isOrderPattern = val.length >= 5 && /^\d+$/.test(val);
    if (isOrderPattern && orders?.find(o => o.id === val) && hasAccess('operations')) {
      setActiveWorkOrderId(val);
      setCurrentView('operations');
    }
  };

  const handleNavigateToOperations = (orderId: string) => {
    if (!hasAccess('operations')) return;
    setActiveWorkOrderId(orderId);
    setCurrentView('operations');
  };

  const handleNavigateToOrderDetails = (orderId: string | null) => {
    const permKey = orderId ? 'orders' : 'order-create';
    if (!hasAccess(permKey)) return;
    setActiveWorkOrderId(orderId);
    setCurrentView('order-details');
  };

  const handleViewChange = (view: ViewType) => {
    setIsMobileMenuOpen(false);
    if (!hasAccess(view)) return;
    
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

  /**
   * Automated Expense Recalculation Node
   * Sums all inward billing records + all machine utilization costs from work logs.
   */
  const recalculateOrderExpenses = useCallback((orderId: string, additionalLog?: WorkLogEntryType, additionalBilling?: BillingRecord) => {
    if (!orderId) return;

    // Filter relevant inward billing records from state
    const inwardRecords = billing.filter(r => r.type === 'inward' && r.orderId === orderId);
    // Include the record currently being saved if not already in state
    if (additionalBilling && additionalBilling.type === 'inward' && additionalBilling.orderId === orderId && !inwardRecords.find(r => r.id === additionalBilling.id)) {
      inwardRecords.push(additionalBilling);
    }

    // Filter relevant work logs from state
    const relevantLogs = logs.filter(l => l.workOrderId === orderId);
    // Include the log currently being saved if not already in state
    if (additionalLog && additionalLog.workOrderId === orderId && !relevantLogs.find(l => l.id === additionalLog.id)) {
      relevantLogs.push(additionalLog);
    }

    // Calculate total from billing (material/external costs)
    const billingTotal = inwardRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Calculate total from logs (internal machine runtime costs)
    const logsTotal = relevantLogs.reduce((acc, log) => {
      const machine = machines.find(m => m.id === log.resourceId);
      if (machine) {
        const hours = parseFloat(log.duration.replace('h', '')) || 0;
        return acc + (hours * machine.costPerHour);
      }
      return acc;
    }, 0);

    const grandTotal = billingTotal + logsTotal;
    
    setDocumentNonBlocking(doc(db, 'orders', orderId), {
      amountSpent: `₹ ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    }, { merge: true });
  }, [billing, logs, machines, db]);

  const handleSaveBillingRecord = (record: BillingRecord) => {
    setDocumentNonBlocking(doc(db, 'billing', record.id), record, { merge: true });
    if (record.type === 'inward' && record.orderId) {
      recalculateOrderExpenses(record.orderId, undefined, record);
    }
  };

  const handleSaveWorkLog = (log: WorkLogEntryType) => {
    setDocumentNonBlocking(doc(db, 'work_logs', log.id), log, { merge: true });
    if (log.workOrderId) {
      recalculateOrderExpenses(log.workOrderId, log);
    }
  };

  const handleDeleteWorkLog = (id: string) => {
    const log = logs.find(l => l.id === id);
    deleteDocumentNonBlocking(doc(db, 'work_logs', id));
    if (log?.workOrderId) {
      // Small delay to allow firestore removal to reflect if possible, but recalculate works on latest snapshot via onSnapshot
      setTimeout(() => recalculateOrderExpenses(log.workOrderId!), 100);
    }
  };

  const handleDeleteBillingRecord = (id: string) => {
    const record = billing.find(r => r.id === id);
    deleteDocumentNonBlocking(doc(db, 'billing', id));
    if (record?.type === 'inward' && record.orderId) {
      // Small delay to ensure state reflects removal in recalculation if possible, 
      // or rely on next refresh. For non-blocking, we just re-run.
      setTimeout(() => recalculateOrderExpenses(record.orderId!), 100);
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteDocumentNonBlocking(doc(db, 'users', userId));
  };

  const handleSaveBatch = (batch: ProductionBatch) => {
    setDocumentNonBlocking(doc(db, 'production_batches', batch.id), batch, { merge: true });
  };

  const handleDeleteBatch = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'production_batches', id));
  };

  const handleSaveTraining = (training: Training) => {
    setDocumentNonBlocking(doc(db, 'trainings', training.id), training, { merge: true });
  };

  const handleDeleteTraining = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'trainings', id));
  };

  const handleSaveAssignment = (asg: TrainingAssignment) => {
    setDocumentNonBlocking(doc(db, 'training_assignments', asg.id), asg, { merge: true });
    
    // Performance Impact Logic
    if (asg.status === 'Completed') {
      const user = usersData.find(u => u.id === asg.userId);
      const training = trainings.find(t => t.id === asg.trainingId);
      if (user && training) {
        const currentEff = user.efficiency || 70;
        const newEff = Math.min(currentEff + (training.impactScore * 0.5), 100);
        handleSaveUser({ ...user, efficiency: newEff });
      }
    }
  };

  const handleDeleteAssignment = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'training_assignments', id));
  };

  const handleUpdateUISettings = (settings: UISettings) => {
    if (currentUserData) {
      handleSaveUser({
        ...currentUserData,
        uiSettings: settings
      });
    } else if (currentUser === 'Master Admin') {
       // For Master Admin if no user profile exists, apply locally
       setUISettings(settings);
       document.documentElement.style.setProperty('--base-font-size', `${settings.fontSize}px`);
       document.documentElement.style.setProperty('--radius', `${settings.borderRadius}rem`);
       document.documentElement.style.setProperty('--primary', settings.primaryColor);
       const densityMap = { compact: '0.5rem', standard: '1rem', comfortable: '1.5rem' };
       document.documentElement.style.setProperty('--table-cell-padding', densityMap[settings.tableDensity]);
    }
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

  const isSlimSidebar = uiSettings.sidebarMode === 'slim';

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-900 font-body overflow-hidden print:h-auto print:overflow-visible print:block print:bg-white">
      <div className={cn(
        "hidden lg:block print:hidden transition-all duration-500",
        isSlimSidebar ? "w-20" : "w-64"
      )}>
        <SidebarNav 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          permissions={permissions} 
          isSlim={isSlimSidebar}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        <header className="h-16 bg-white border-b border-slate-200 shrink-0 px-6 flex items-center justify-between shadow-sm z-50 print:hidden">
          <div className="flex items-center gap-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-lg">
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-20 bg-[#001F3D]">
                <SidebarNav 
                  currentView={currentView} 
                  onViewChange={handleViewChange} 
                  permissions={permissions} 
                  isSlim={true}
                />
              </SheetContent>
            </Sheet>

            <div className="flex flex-col">
              <h1 className="font-headline font-bold text-lg tracking-tight text-[#001F3D]">
                BHARAT<span className="text-primary">AXIS</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64 group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                placeholder="Global Search..." 
                className="h-9 pl-9 rounded-lg bg-slate-50 border-slate-200 text-xs focus-visible:ring-1"
                value={globalSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors relative">
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full" />
              </button>
              
              <div className="h-6 w-px bg-slate-200" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="text-right hidden md:block">
                      <p className="text-[11px] font-bold text-[#001F3D] leading-none">{currentUser}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{currentUserData?.role || 'User'}</p>
                    </div>
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src={currentUserData?.image} />
                      <AvatarFallback className="bg-slate-100 text-[#001F3D] text-[10px] font-bold">SA</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl border-slate-200">
                  <DropdownMenuItem onClick={() => handleViewChange('settings')} className="rounded-lg h-9 px-3 text-xs font-medium gap-2">
                    <User className="h-3.5 w-3.5" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg h-9 px-3 text-xs font-medium gap-2 text-red-600">
                    <LogOut className="h-3.5 w-3.5" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className={cn(
          "flex-1 overflow-y-auto w-full print:overflow-visible print:p-0 print:max-w-none print:m-0 print:block",
          currentView === 'gantt' || currentView === 'agile' ? "p-0" : "p-6"
        )}>
          <div className={cn(
            "animate-in fade-in slide-in-from-bottom-2 duration-500 print:animate-none print:block",
            (currentView === 'gantt' || currentView === 'agile') && "h-full"
          )}>
            {currentView === 'overview' && (
              <ShopFloorOverview 
                orders={orders}
                onNavigateToOrders={() => handleViewChange('orders')}
                onNavigateToMachine={() => handleViewChange('machine-utilization')}
                onNavigateToInventory={() => handleViewChange('inventory')}
                onNavigateToBilling={() => handleViewChange('billing')}
              />
            )}
            {currentView === 'agile' && <AgileBoard orders={orders} />}
            {currentView === 'smart-quote' && <SmartQuotingAssistant machines={machines} />}
            {currentView === 'production-planner' && (
              <ProductionPlanner 
                batches={batches}
                orders={orders}
                machines={machines}
                users={usersData}
                onSaveBatch={handleSaveBatch}
                onDeleteBatch={handleDeleteBatch}
              />
            )}
            {currentView === 'orders' && (
              <ShopFloorOrders 
                orders={orders}
                billing={billing}
                logs={logs}
                machines={machines}
                onNavigateToOperations={handleNavigateToOperations} 
                onNavigateToOrderDetails={handleNavigateToOrderDetails}
              />
            )}
            {currentView === 'billing' && (
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
            {currentView === 'inventory' && (
              <InventoryManagement 
                items={inventory}
                onSaveItem={handleSaveInventoryItem}
              />
            )}
            {currentView === 'hr' && (
              <HRManagement 
                users={usersData}
                trainings={trainings}
                assignments={assignments}
                onSaveUser={handleSaveUser}
                onSaveTraining={handleSaveTraining}
                onDeleteTraining={handleDeleteTraining}
                onSaveAssignment={handleSaveAssignment}
                onDeleteAssignment={handleDeleteAssignment}
                currentUser={currentUser}
              />
            )}
            {currentView === 'work-log' && (
              <WorkLogEntry 
                logs={logs} 
                machines={machines}
                users={usersData}
                orders={orders}
                currentUser={currentUser}
                onAddLog={handleSaveWorkLog} 
                onDeleteLog={handleDeleteWorkLog}
              />
            )}
            {currentView === 'sqcdp' && (
              <ShopFloorSQCDP 
                orders={orders}
                reports={reports}
                logs={logs}
                users={usersData}
                assignments={assignments}
              />
            )}
            {currentView === 'machine-utilization' && (
              <MachineUtilization 
                machines={machines}
                orders={orders}
                onSaveMachine={handleSaveMachine}
              />
            )}
            {currentView === 'customer-orders' && (
              <CustomerOrders 
                customers={customers} 
                onSaveCustomer={handleSaveCustomer} 
              />
            )}
            {currentView === 'weekly-plan' && (
              <WeeklyPlan 
                logs={logs} 
                onNavigateToGantt={() => handleViewChange('gantt')}
              />
            )}
            {currentView === 'vendor' && (
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
                uiSettings={uiSettings}
                onUpdateUISettings={handleUpdateUISettings}
                currentUserData={currentUserData}
              />
            )}
            {currentView === 'gantt' && (
              <ProductionGantt 
                orders={orders}
                searchTerm={globalSearch}
                onNavigateToSchedule={() => handleViewChange('weekly-plan')}
                onNavigateToOperations={handleNavigateToOperations}
              />
            )}
            {currentView === 'quality' && (
              <QualityManagement 
                orders={orders}
                users={usersData}
                vendors={vendors}
                onUpdateStatus={handleUpdateStatusFromQC} 
                permissions={permissions}
              />
            )}
            {currentView === 'order-details' && (
              <OrderDetails 
                orderId={activeWorkOrderId} 
                onBack={() => handleViewChange('orders')} 
                customers={customers}
                staff={usersData}
                onSave={handleSaveOrder}
                orders={orders}
              />
            )}
            {currentView === 'operations' && (
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
          </div>
        </main>
      </div>

      <Dialog open={isPasswordChangeOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Security Rotation Required</DialogTitle>
            <DialogDescription>Your security token has exceeded the 45-day window.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>New Security Token</Label>
              <Input 
                type="password"
                className="h-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleForcePasswordChange} className="w-full h-10 bg-[#001F3D]">Update Node</Button>
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
