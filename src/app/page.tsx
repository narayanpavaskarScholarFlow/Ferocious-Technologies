
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType, WorkLogEntry as WorkLogEntryType, SystemUser, Customer, Order, Machine, Vendor, InventoryItem, BillingRecord, PermissionLevel, ProductionBatch, UISettings, Training, TrainingAssignment, QualityReport, UserLeave, SalarySlip } from '@/lib/types';
import { ShopFloorOverview } from '@/components/shop-floor-overview';
import { ShopFloorOrders } from '@/components/shop-floor-orders';
import { ShopFloorSQCDP } from '@/components/shop-floor-sqcdp';
import { MachineUtilization } from '@/components/machine-utilization';
import { HRManagement } from '@/components/hr-management';
import { PersonnelPortal } from '@/components/personnel-portal';
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
import { UserManagement } from '@/components/user-management';
import { UserDetailView } from '@/components/user-detail-view';
import { DispatchLedger } from '@/components/dispatch-ledger';
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

const DEFAULT_UI_SETTINGS: UISettings = {
  fontSize: 13,
  tableDensity: 'compact',
  borderRadius: 1,
  primaryColor: '243 75% 59%',
  sidebarMode: 'slim',
  cardShadow: 'xl',
  labelCase: 'uppercase',
  headerAlignment: 'left',
  customTitles: {},
  woPrefix: 'WO-',
  woNextNumber: 1001,
  billingTableSettings: {
    colWidths: {
      description: 400,
      hsn: 112,
      qty: 96,
      unit: 112,
      price: 160,
      discount: 96,
      gst: 96,
      total: 192,
    },
    rowHeight: 48,
  }
};

function IndustrialERPInternal() {
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  const [selectedDetailUserId, setSelectedDetailUserId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
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
  const leavesQuery = useMemoFirebase(() => collection(db, 'leaves'), [db]);
  const slipsQuery = useMemoFirebase(() => collection(db, 'salary_slips'), [db]);
  const annualQuery = useMemoFirebase(() => collection(db, 'annual_leaves'), [db]);

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
  const { data: leavesData } = useCollection<UserLeave>(leavesQuery);
  const { data: slipsData } = useCollection<SalarySlip>(slipsQuery);
  const { data: annualData } = useCollection<any>(annualQuery);

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
  const leaves = leavesData || [];
  const slips = slipsData || [];
  const annualLeaves = annualData || [];

  // Derive Current User Data and Permissions
  const currentUserData = useMemo(() => {
    if (!currentUser || !usersData) return null;
    return usersData.find(u => u.name === currentUser || u.email === currentUser);
  }, [currentUser, usersData]);

  const masterAdmin = useMemo(() => {
    return usersData.find(u => u.name === 'Master Admin');
  }, [usersData]);

  const globalSequenceSettings = useMemo(() => {
    const settings = masterAdmin?.uiSettings || DEFAULT_UI_SETTINGS;
    return {
      ...DEFAULT_UI_SETTINGS,
      ...settings,
      woPrefix: settings.woPrefix ?? DEFAULT_UI_SETTINGS.woPrefix,
      woNextNumber: settings.woNextNumber ?? DEFAULT_UI_SETTINGS.woNextNumber
    };
  }, [masterAdmin]);

  useEffect(() => {
    const targetSettings = { ...DEFAULT_UI_SETTINGS, ...(currentUserData?.uiSettings || {}) };
    setUISettings(targetSettings);
    
    document.documentElement.style.setProperty('--base-font-size', `${targetSettings.fontSize}px`);
    document.documentElement.style.setProperty('--radius', `${targetSettings.borderRadius}rem`);
    document.documentElement.style.setProperty('--primary', targetSettings.primaryColor);
    
    const densityMap = { compact: '0.5rem', standard: '1rem', comfortable: '1.5rem' };
    document.documentElement.style.setProperty('--table-cell-padding', densityMap[targetSettings.tableDensity]);
  }, [currentUserData?.uiSettings]);

  const isReportingManager = useMemo(() => {
    if (!currentUser) return false;
    return usersData.some(u => u.reportingManager === currentUser);
  }, [usersData, currentUser]);

  const permissions = useMemo(() => {
    const isMasterAdminUser = currentUser === 'Master Admin';
    const isHR = currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager';

    if (isMasterAdminUser || isHR) {
      const clearance: Record<string, PermissionLevel> = {
        overview: 'full', agile: 'full', orders: 'full', sqcdp: 'full', operations: 'full',
        'machine-utilization': 'full', hr: 'full', 'my-portal': 'full', 'customer-orders': 'full',
        'weekly-plan': 'full', vendor: 'full', 'order-details': 'full', billing: 'full',
        'work-log': 'full', inventory: 'full', quality: 'full', settings: 'full', gantt: 'full',
        'smart-quote': 'full', 'quality-review': 'full', 'production-planner': 'full', training: 'full',
        'team-matrix': 'full', delivery: 'full',
        'billing-quotation': 'full',
        'billing-invoice': 'full',
        'billing-dc': 'full',
        'billing-proforma': 'full',
        'billing-inward': 'full',
        'billing-outward': 'full',
        'billing-bank': 'full',
        'billing-edit': 'full',
        'billing-delete': 'full',
      };
      if (isMasterAdminUser) clearance.users = 'full';
      return clearance;
    }
    
    return currentUserData?.permissions || {};
  }, [currentUser, currentUserData]);

  const hasAccess = useCallback((view: string): boolean => {
    if (currentUser === 'Master Admin') return true;
    if (view === 'my-portal' || view === 'settings' || view === 'user-detail') return true;
    const level = permissions[view];
    return level && level !== 'none';
  }, [permissions, currentUser]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('bharat_axis_user');
    sessionStorage.removeItem('bharat_axis_verify');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('overview');
  }, []);

  const handleViewChange = (view: ViewType) => {
    if (!hasAccess(view)) return;
    setCurrentView(view);
  };

  const handleLogin = (user: string) => {
    localStorage.setItem('bharat_axis_user', user);
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleSaveUser = (user: SystemUser) => {
    setDocumentNonBlocking(doc(db, 'users', user.id), user, { merge: true });
  };

  const handleSaveCustomer = (customer: Customer) => {
    setDocumentNonBlocking(doc(db, 'customers', customer.id), customer, { merge: true });
  };

  const handleNavigateToUserDetail = (userId: string) => {
    setSelectedDetailUserId(userId);
    setCurrentView('user-detail');
  };

  const handleVerifyPortal = (userName: string) => {
    handleLogin(userName);
    setCurrentView('my-portal');
  };

  const handleSaveOrder = (order: Order) => {
    const isNew = !orders.find(o => o.id === order.id);
    setDocumentNonBlocking(doc(db, 'orders', order.id), order, { merge: true });
    
    if (isNew && masterAdmin) {
      const currentUISettings = masterAdmin.uiSettings || DEFAULT_UI_SETTINGS;
      setDocumentNonBlocking(doc(db, 'users', masterAdmin.id), {
        uiSettings: {
          ...DEFAULT_UI_SETTINGS,
          ...currentUISettings,
          woNextNumber: (currentUISettings.woNextNumber || 1001) + 1
        }
      }, { merge: true });
    }
    setCurrentView('orders');
  };

  const handleSaveTraining = (training: Training) => setDocumentNonBlocking(doc(db, 'trainings', training.id), training, { merge: true });
  const handleDeleteTraining = (id: string) => deleteDocumentNonBlocking(doc(db, 'trainings', id));
  const handleSaveAssignment = (asg: TrainingAssignment) => setDocumentNonBlocking(doc(db, 'training_assignments', asg.id), asg, { merge: true });
  const handleDeleteAssignment = (id: string) => deleteDocumentNonBlocking(doc(db, 'training_assignments', id));

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const verifyUser = params.get('verifyUser');
    
    if (verifyUser) {
      sessionStorage.setItem('bharat_axis_verify', verifyUser);
      setCurrentUser(verifyUser);
      setIsLoggedIn(true);
      setCurrentView('my-portal');
      window.history.replaceState({}, '', '/');
      return;
    }

    const verifiedUser = sessionStorage.getItem('bharat_axis_verify');
    if (verifiedUser) {
      setCurrentUser(verifiedUser);
      setIsLoggedIn(true);
      setCurrentView('my-portal');
      return;
    }

    const savedUser = localStorage.getItem('bharat_axis_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  if (!mounted) return null;

  if (!isLoggedIn) {
    return <><LoginScreen onLogin={handleLogin} users={usersData} /><Toaster /></>;
  }

  const isSlimSidebar = uiSettings.sidebarMode === 'slim';

  return (
    <div className={cn(
      "flex min-h-screen bg-slate-50/50 text-slate-900 font-body overflow-hidden print:h-auto print:block print:bg-white",
      uiSettings.labelCase === 'uppercase' ? "labels-uppercase" : "labels-capitalize"
    )}>
      <div className={cn("hidden lg:block print:hidden transition-all duration-500", isSlimSidebar ? "w-20" : "w-64")}>
        <SidebarNav 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          permissions={permissions} 
          isSlim={isSlimSidebar}
          customTitles={uiSettings.customTitles}
          userRole={currentUser === 'Master Admin' ? 'Master Admin' : (currentUserData?.role || 'User')}
          isReportingManager={isReportingManager}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:block">
        <header className="h-16 bg-white border-b border-slate-200 shrink-0 px-6 flex items-center justify-between shadow-sm z-50 print:hidden">
          <div className="flex items-center gap-6">
            <h1 className="font-headline font-bold text-lg tracking-tight text-[#001F3D]">
              BHARAT<span className="text-primary">AXIS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-[11px] font-bold text-[#001F3D] leading-none">{currentUser}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{currentUserData?.role || (currentUser === 'Master Admin' ? 'Master Admin' : 'User')}</p>
             </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Avatar className="h-8 w-8 border cursor-pointer hover:ring-2 ring-primary/20">
                      <AvatarImage src={currentUserData?.image} />
                      <AvatarFallback className="bg-slate-100 text-[#001F3D] text-[10px] font-bold">BA</AvatarFallback>
                   </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl">
                   <DropdownMenuItem onClick={() => handleViewChange('settings')} className="rounded-lg h-9 text-xs gap-2"><User className="h-3.5 w-3.5" /> Profile</DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout} className="rounded-lg h-9 text-xs gap-2 text-red-600"><LogOut className="h-3.5 w-3.5" /> Log Out</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-6 print:p-0">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {currentView === 'overview' && <ShopFloorOverview orders={orders} onNavigateToOrders={() => handleViewChange('orders')} onNavigateToMachine={() => handleViewChange('machine-utilization')} onNavigateToInventory={() => handleViewChange('inventory')} onNavigateToBilling={() => handleViewChange('billing')} />}
            {currentView === 'my-portal' && <PersonnelPortal currentUser={currentUserData} assignments={assignments} leaves={leaves} slips={slips} holidays={annualLeaves} users={usersData} onNavigateToLogs={() => handleViewChange('work-log')} />}
            {currentView === 'hr' && <HRManagement users={usersData} trainings={trainings} assignments={assignments} onSaveUser={handleSaveUser} onSaveTraining={handleSaveTraining} onDeleteTraining={handleDeleteTraining} onSaveAssignment={handleSaveAssignment} onDeleteAssignment={handleDeleteAssignment} currentUser={currentUser} isReportingManager={isReportingManager} />}
            {currentView === 'user-detail' && <UserDetailView userId={selectedDetailUserId} users={usersData} onBack={() => setCurrentView('settings')} onSaveUser={handleSaveUser} onVerifyPortal={handleVerifyPortal} />}
            {currentView === 'agile' && <AgileBoard orders={orders} />}
            {currentView === 'orders' && <ShopFloorOrders orders={orders} billing={billing} logs={logs} machines={machines} onNavigateToOrderDetails={(id) => { setSelectedOrderId(id); setCurrentView('order-details'); }} onNavigateToOperations={(id) => { setActiveWorkOrderId(id); setCurrentView('operations'); }} />}
            {currentView === 'order-details' && <OrderDetails orderId={selectedOrderId} orders={orders} customers={customers} staff={usersData} onBack={() => setCurrentView('orders')} onSave={handleSaveOrder} uiSettings={globalSequenceSettings} />}
            {currentView === 'operations' && <OperationsStatus initialOrderId={activeWorkOrderId} onOrderIdChange={setActiveWorkOrderId} orders={orders} users={usersData} machines={machines} />}
            {currentView === 'billing' && <BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db, 'billing', r.id), r, {merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} />}
            {currentView === 'work-log' && <WorkLogEntry logs={logs} machines={machines} users={usersData} orders={orders} currentUser={currentUser} onAddLog={(l)=>setDocumentNonBlocking(doc(db,'work_logs',l.id),l,{merge:true})} onDeleteLog={(id)=>deleteDocumentNonBlocking(doc(db,'work_logs',id))} />}
            {currentView === 'inventory' && <InventoryManagement items={inventory} onSaveItem={(i)=>setDocumentNonBlocking(doc(db,'inventory',i.id),i,{merge:true})} />}
            {currentView === 'machine-utilization' && <MachineUtilization machines={machines} orders={orders} onSaveMachine={(m)=>setDocumentNonBlocking(doc(db,'machines',m.id),m,{merge:true})} />}
            {currentView === 'settings' && <ProfileSettings currentUser={currentUser} users={usersData} onSaveUser={handleSaveUser} onDeleteUser={(id)=>deleteDocumentNonBlocking(doc(db, 'users', id))} uiSettings={uiSettings} onUpdateUISettings={setUISettings} currentUserData={currentUserData} onNavigateToDetail={handleNavigateToUserDetail} />}
            {currentView === 'gantt' && <ProductionGantt orders={orders} onNavigateToOperations={(id) => { setActiveWorkOrderId(id); setCurrentView('operations'); }} />}
            {currentView === 'quality' && <QualityManagement orders={orders} users={usersData} vendors={vendors} permissions={permissions} />}
            {currentView === 'customer-orders' && <CustomerOrders customers={customers} onSaveCustomer={handleSaveCustomer} />}
            {currentView === 'delivery' && <DispatchLedger orders={orders} reports={reports} billing={billing} onSaveOrder={handleSaveOrder} />}
            {currentView === 'production-planner' && <ProductionPlanner batches={batches} orders={orders} machines={machines} users={usersData} onSaveBatch={(b)=>setDocumentNonBlocking(doc(db,'production_batches',b.id),b,{merge:true})} onDeleteBatch={(id)=>deleteDocumentNonBlocking(doc(db,'production_batches',id))} />}
            {currentView === 'smart-quote' && <SmartQuotingAssistant machines={machines} />}
            {currentView === 'sqcdp' && <ShopFloorSQCDP orders={orders} reports={reports} logs={logs} users={usersData} assignments={assignments} />}
            {currentView === 'vendor' && <VendorManagement vendors={vendors} onSaveVendor={(v)=>setDocumentNonBlocking(doc(db, 'vendors', v.id), v, {merge:true})} />}
            {currentView === 'weekly-plan' && <WeeklyPlan logs={logs} onNavigateToGantt={()=>handleViewChange('gantt')} />}
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
