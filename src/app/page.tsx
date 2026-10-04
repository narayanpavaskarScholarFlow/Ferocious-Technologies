"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType, WorkLogEntry as WorkLogEntryType, SystemUser, Customer, Order, Machine, Vendor, InventoryItem, BillingRecord, PermissionLevel, ProductionBatch, UISettings, Training, TrainingAssignment, QualityReport, UserLeave, SalarySlip, ViewMetadata, ProductMaster } from '@/lib/types';
import { ShopFloorOverview } from '@/components/shop-floor-overview';
import { ShopFloorOrders } from '@/components/shop-floor-orders';
import { ShopFloorSQCDP } from '@/components/shop-floor-sqcdp';
import { MachineUtilization } from '@/components/machine-utilization';
import { HRManagement } from '@/components/hr-management';
import { PersonnelPortal } from '@/components/personnel-portal';
import { CustomerOrders } from '@/components/customer-orders';
import { WeeklyPlan } from '@/components/weekly-plan';
import { OperationsStatus } from '@/components/operations-status';
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
import { UserDetailView } from '@/components/user-detail-view';
import { DispatchLedger } from '@/components/dispatch-ledger'; 
import { DocumentTemplateManager } from '@/components/document-template-manager';
import { ReportCenter } from '@/components/report-center';
import { VendorManagement } from '@/components/vendor-management';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, LogOut, User, ChevronRight, Home, Sun, Moon, ShieldCheck, ShieldAlert } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import placeholderImages from '@/app/lib/placeholder-images.json';

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
  theme: 'light',
  fontSize: 13,
  tableDensity: 'compact',
  borderRadius: 0.25,
  primaryColor: '215 60% 12%',
  sidebarMode: 'full',
  cardShadow: 'sm',
  labelCase: 'uppercase',
  headerAlignment: 'left',
  customTitles: {},
  woPrefix: 'WO-',
  woNextNumber: 1001,
  logoSize: 32,
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
    rowHeight: 40,
  }
};

const VIEW_CONFIG: Record<ViewType, ViewMetadata> = {
  overview: { title: 'Dashboard', category: 'Command Center' },
  analytics: { title: 'Analytics Dashboard', category: 'Command Center' },
  activity: { title: 'Activity Feed', category: 'Command Center' },
  approvals: { title: 'Approvals', category: 'Command Center' },
  notifications: { title: 'Notifications', category: 'Command Center' },
  sqcdp: { title: 'SQCDP Dashboard', category: 'Command Center' },
  'customer-master': { title: 'Customer Master', category: 'Financial Hub' },
  'vendor-master': { title: 'Vendor Master', category: 'Financial Hub' },
  'product-master': { title: 'Product Master', category: 'Financial Hub' },
  quotation: { title: 'Quotation Ledger', category: 'Financial Hub' },
  'customer-po': { title: 'Customer Purchase Orders', category: 'Financial Hub' },
  'sale-order': { title: 'Sales Order Ledger', category: 'Financial Hub' },
  'sale-invoice': { title: 'Sales Invoice Ledger', category: 'Financial Hub' },
  'purchase-order': { title: 'Purchase Order Ledger', category: 'Financial Hub' },
  'purchase-invoice': { title: 'Purchase Invoice Ledger', category: 'Financial Hub' },
  'delivery-challan': { title: 'Delivery Challan Ledger', category: 'Financial Hub' },
  payments: { title: 'Payment Ledger', category: 'Financial Hub' },
  'credit-note': { title: 'Credit Note Ledger', category: 'Financial Hub' },
  'debit-note': { title: 'Debit Note Ledger', category: 'Financial Hub' },
  orders: { title: 'Work Orders', category: 'Production Hub' },
  'order-details': { title: 'Order Details', category: 'Production Hub' },
  operations: { title: 'Operations Status', category: 'Production Hub' },
  'production-planner': { title: 'Production Planner', category: 'Production Hub' },
  gantt: { title: 'Production Gantt', category: 'Production Hub' },
  'shop-floor': { title: 'Shop Floor', category: 'Production Hub' },
  quality: { title: 'Quality Management', category: 'Production Hub' },
  delivery: { title: 'Dispatch Ledger', category: 'Production Hub' },
  inventory: { title: 'Inventory Management', category: 'Production Hub' },
  'machine-utilization': { title: 'Machine Utilization', category: 'Resource Hub' },
  'machine-load-plan': { title: 'Machine Load Planning', category: 'Resource Hub' },
  'tool-catalog': { title: 'Tool Catalog', category: 'Resource Hub' },
  'tool-cards': { title: 'Tool Cards', category: 'Resource Hub' },
  'my-portal': { title: 'Employee Portal', category: 'Resource Hub' },
  manpower: { title: 'Manpower Utilization', category: 'Resource Hub' },
  training: { title: 'Training Management', category: 'Resource Hub' },
  hr: { title: 'HR Management', category: 'Resource Hub' },
  salary: { title: 'Salary Structure', category: 'Resource Hub' },
  users: { title: 'User Management', category: 'Administration' },
  roles: { title: 'Roles', category: 'Administration' },
  permissions: { title: 'Permissions', category: 'Administration' },
  'approval-matrix': { title: 'Approval Matrix', category: 'Administration' },
  'print-templates': { title: 'Document Template Manager', category: 'Administration' },
  reports: { title: 'Report Center', category: 'Administration' },
  settings: { title: 'Settings', category: 'Administration' },
  'smart-quote': { title: 'Smart Quoting Assistant', category: 'Strategic Hub' },
  'strategy-hub': { title: 'Loan Project Hub', category: 'Strategic Hub' },
  'business-planning': { title: 'Business Planning', category: 'Strategic Hub' },
  'dpr-generator': { title: 'DPR Generator', category: 'Strategic Hub' },
  'financial-projections': { title: 'Financial Projections', category: 'Strategic Hub' },
  // Compatibility mappings
  'customer-orders': { title: 'Customer Master', category: 'Financial Hub' },
  'user-detail': { title: 'User Identity', category: 'Administration' },
  'weekly-plan': { title: 'Master Schedule', category: 'Production Hub' },
  'work-log': { title: 'Daily Yield Logs', category: 'Production Hub' },
  billing: { title: 'Financial Hub', category: 'Financial Hub' },
  agile: { title: 'Agile Kanban', category: 'Command Center' },
  'team-matrix': { title: 'My Team Matrix', category: 'Command Center' },
};

function IndustrialERPInternal() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  const [selectedDetailUserId, setSelectedDetailUserId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);

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
  const { data: productsData } = useCollection<ProductMaster>(productsQuery);

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
  const products = productsData || [];

  // Current User Context
  const currentUserData = useMemo(() => {
    if (!currentUser || !usersData) return null;
    return usersData.find(u => 
      u.name?.toLowerCase() === currentUser.toLowerCase() || 
      u.email?.toLowerCase() === currentUser.toLowerCase() || 
      u.username?.toLowerCase() === currentUser.toLowerCase()
    );
  }, [currentUser, usersData]);

  const masterAdmin = useMemo(() => {
    return usersData.find(u => u.role === 'Master Admin' || u.username === 'admin');
  }, [usersData]);

  const brandLogo = useMemo(() => {
    return masterAdmin?.uiSettings?.brandLogo || placeholderImages.placeholderImages.find(i => i.id === 'brand-logo')?.imageUrl || '';
  }, [masterAdmin]);

  const globalSystemSettings = useMemo(() => {
    return masterAdmin?.uiSettings || DEFAULT_UI_SETTINGS;
  }, [masterAdmin]);

  useEffect(() => {
    const targetSettings = { ...DEFAULT_UI_SETTINGS, ...(currentUserData?.uiSettings || {}) };
    setUISettings(targetSettings);
    
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary', targetSettings.primaryColor);
      document.documentElement.style.setProperty('--radius', `${targetSettings.borderRadius}rem`);
      
      if (targetSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [currentUserData?.uiSettings]);

  const handleToggleTheme = useCallback(() => {
    if (!currentUserData) return;
    const nextTheme = uiSettings.theme === 'dark' ? 'light' : 'dark';
    const updatedSettings = { ...uiSettings, theme: nextTheme };
    
    setUISettings(updatedSettings);
    setDocumentNonBlocking(doc(db, 'users', currentUserData.id), {
      uiSettings: updatedSettings
    }, { merge: true });

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [uiSettings, currentUserData, db]);

  const isReportingManager = useMemo(() => {
    if (!currentUser || !usersData) return false;
    return usersData.some(u => u.reportingManager === currentUser);
  }, [usersData, currentUser]);

  const permissions = useMemo(() => {
    const isMasterAdminUser = currentUser?.toLowerCase() === 'master admin';
    if (isMasterAdminUser) {
      const clearance: Record<string, PermissionLevel> = {};
      Object.keys(VIEW_CONFIG).forEach(k => clearance[k] = 'full');
      return clearance;
    }
    return currentUserData?.permissions || {};
  }, [currentUser, currentUserData]);

  const hasAccess = useCallback((view: string): boolean => {
    if (currentUser?.toLowerCase() === 'master admin') return true;
    if (view === 'my-portal' || view === 'settings' || view === 'user-detail') return true;
    const level = permissions[view];
    return level && level !== 'none';
  }, [permissions, currentUser]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('jayasimha_user');
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);

  const handleViewChange = (view: ViewType) => {
    if (!hasAccess(view)) return;
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('jayasimha_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  if (!mounted) return null;

  if (!isLoggedIn) {
    return <><LoginScreen onLogin={(user) => { localStorage.setItem('jayasimha_user', user); setCurrentUser(user); setIsLoggedIn(true); }} users={usersData} brandLogo={brandLogo} /><Toaster /></>;
  }

  const currentViewMetadata = VIEW_CONFIG[currentView] || { title: 'Mission Control', category: 'Command Center' };
  const pageDisplayTitle = uiSettings.customTitles[currentView] || currentViewMetadata.title;

  return (
    <div className={cn("flex h-screen bg-background text-foreground font-body overflow-hidden transition-colors duration-500", uiSettings.theme === 'dark' ? "dark" : "")}>
      <div className={cn("hidden lg:block shrink-0 transition-all duration-300", uiSettings.sidebarMode === 'slim' ? "w-20" : "w-64")}>
        <SidebarNav 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          permissions={permissions} 
          isSlim={uiSettings.sidebarMode === 'slim'}
          customTitles={uiSettings.customTitles}
          userRole={currentUserData?.role || 'User'}
          isReportingManager={isReportingManager}
          brandLogo={brandLogo}
          logoSize={uiSettings.logoSize}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-14 bg-white dark:bg-card border-b border-slate-200 dark:border-border shrink-0 px-6 flex items-center justify-between shadow-sm z-50">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-[#001F3D] text-white border-none">
                <SidebarNav 
                  currentView={currentView} 
                  onViewChange={handleViewChange} 
                  permissions={permissions} 
                  isSlim={false}
                  brandLogo={brandLogo}
                />
              </SheetContent>
            </Sheet>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Home className="h-2.5 w-2.5" />
                <span>{currentViewMetadata.category}</span>
                <ChevronRight className="h-2.5 w-2.5" />
                <span className="text-primary">{pageDisplayTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <Button variant="ghost" size="icon" onClick={handleToggleTheme} className="h-9 w-9 text-slate-400 hover:text-primary">
                {uiSettings.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </Button>
             <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-[#001F3D] dark:text-white leading-none">{currentUser}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{currentUserData?.role || 'Personnel'}</p>
             </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Avatar className="h-9 w-9 border cursor-pointer hover:ring-2 ring-primary/10">
                      <AvatarImage src={currentUserData?.image} />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary text-[10px] font-bold">FT</AvatarFallback>
                   </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 rounded-md shadow-xl dark:bg-card">
                   <DropdownMenuItem onClick={() => handleViewChange('settings')} className="text-xs gap-2"><User className="h-3.5 w-3.5" /> Profile Matrix</DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout} className="text-xs gap-2 text-red-600"><LogOut className="h-3.5 w-3.5" /> Secure Exit</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-6 bg-background">
          <div className="animate-in fade-in duration-500">
            {currentView === 'overview' && <ShopFloorOverview orders={orders} reports={reports} logs={logs} machines={machines} inventory={inventory} billing={billing} onNavigateToOrders={() => handleViewChange('orders')} onNavigateToMachine={() => handleViewChange('machine-utilization')} onNavigateToInventory={() => handleViewChange('inventory')} onNavigateToBilling={() => handleViewChange('billing')} />}
            {currentView === 'analytics' && <ShopFloorSQCDP orders={orders} reports={reports} logs={logs} users={usersData} assignments={assignments} />}
            {currentView === 'sqcdp' && <ShopFloorSQCDP orders={orders} reports={reports} logs={logs} users={usersData} assignments={assignments} />}
            {currentView === 'my-portal' && <PersonnelPortal currentUser={currentUserData} assignments={assignments} leaves={leaves} slips={slips} holidays={[]} users={usersData} onNavigateToLogs={() => handleViewChange('work-log')} />}
            {currentView === 'hr' && <HRManagement users={usersData} trainings={trainings} assignments={assignments} onSaveUser={(u)=>setDocumentNonBlocking(doc(db,'users',u.id),u,{merge:true})} onSaveTraining={()=>{}} onDeleteTraining={()=>{}} onSaveAssignment={()=>{}} onDeleteAssignment={()=>{}} currentUser={currentUser} isReportingManager={isReportingManager} />}
            {currentView === 'user-detail' && <UserDetailView userId={selectedDetailUserId} users={usersData} onBack={() => handleViewChange('settings')} onSaveUser={(u)=>setDocumentNonBlocking(doc(db,'users',u.id),u,{merge:true})} onVerifyPortal={(n)=>{ setCurrentUser(n); handleViewChange('my-portal'); }} />}
            {currentView === 'agile' && <AgileBoard orders={orders} />}
            {currentView === 'orders' && <ShopFloorOrders orders={orders} billing={billing} logs={logs} machines={machines} onNavigateToOrderDetails={(id) => { setSelectedOrderId(id); setCurrentView('order-details'); }} onNavigateToOperations={(id) => { setActiveWorkOrderId(id); setCurrentView('operations'); }} />}
            {currentView === 'order-details' && <OrderDetails orderId={selectedOrderId} orders={orders} customers={customers} staff={usersData} billing={billing} onBack={() => handleViewChange('orders')} onSave={(o)=>setDocumentNonBlocking(doc(db,'orders',o.id),o,{merge:true})} uiSettings={globalSystemSettings} />}
            {currentView === 'operations' && <OperationsStatus initialOrderId={activeWorkOrderId} onOrderIdChange={setActiveWorkOrderId} orders={orders} users={usersData} machines={machines} />}
            {currentView === 'billing' && <BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} onTabChange={(tab: any) => handleViewChange(tab)} />}
            {currentView === 'work-log' && <WorkLogEntry logs={logs} machines={machines} users={usersData} orders={orders} currentUser={currentUser} onAddLog={(l)=>setDocumentNonBlocking(doc(db,'work_logs',l.id),l,{merge:true})} onDeleteLog={(id)=>deleteDocumentNonBlocking(doc(db,'work_logs',id))} />}
            {currentView === 'inventory' && <InventoryManagement items={inventory} onSaveItem={(i)=>setDocumentNonBlocking(doc(db,'inventory',i.id),i,{merge:true})} />}
            {currentView === 'machine-utilization' && <MachineUtilization machines={machines} orders={orders} onSaveMachine={(m)=>setDocumentNonBlocking(doc(db,'machines',m.id),m,{merge:true})} />}
            {currentView === 'settings' && <ProfileSettings currentUser={currentUser} users={usersData} onSaveUser={(u)=>setDocumentNonBlocking(doc(db,'users',u.id),u,{merge:true})} onDeleteUser={(id)=>deleteDocumentNonBlocking(doc(db,'users',id))} uiSettings={uiSettings} onUpdateUISettings={setUISettings} currentUserData={currentUserData} onNavigateToDetail={(id)=>{setSelectedDetailUserId(id); setCurrentView('user-detail');}} />}
            {currentView === 'gantt' && <ProductionGantt orders={orders} onNavigateToOperations={(id) => { setActiveWorkOrderId(id); setCurrentView('operations'); }} />}
            {currentView === 'quality' && <QualityManagement orders={orders} users={usersData} vendors={vendors} permissions={permissions} />}
            {currentView === 'delivery' && <DispatchLedger orders={orders} reports={reports} billing={billing} onSaveOrder={(o)=>setDocumentNonBlocking(doc(db,'orders',o.id),o,{merge:true})} />}
            {currentView === 'production-planner' && <ProductionPlanner batches={batches} orders={orders} machines={machines} users={usersData} onSaveBatch={(b)=>setDocumentNonBlocking(doc(db,'production_batches',b.id),b,{merge:true})} onDeleteBatch={(id)=>deleteDocumentNonBlocking(doc(db,'production_batches',id))} />}
            {currentView === 'smart-quote' && <SmartQuotingAssistant machines={machines} />}
            {currentView === 'print-templates' && <DocumentTemplateManager />}
            {currentView === 'reports' && <ReportCenter billing={billing} orders={orders} machines={machines} logs={logs} reports={reports} />}
            {currentView === 'customer-master' && <CustomerOrders customers={customers} vendors={vendors} onSaveCustomer={(c)=>setDocumentNonBlocking(doc(db,'customers',c.id),c,{merge:true})} onSaveVendor={(v)=>setDocumentNonBlocking(doc(db,'vendors',v.id),v,{merge:true})} />}
            {currentView === 'vendor-master' && <div className="p-4"><VendorManagement vendors={vendors} onSaveVendor={(v)=>setDocumentNonBlocking(doc(db,'vendors',v.id),v,{merge:true})} /></div>}
            {currentView === 'product-master' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={()=>{}} onDeleteRecord={()=>{}} initialTab="product-master" /></div>}
            {currentView === 'quotation' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="quotation" /></div>}
            {currentView === 'customer-po' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="purchase_order" /></div>}
            {currentView === 'sale-order' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="sale_order" /></div>}
            {currentView === 'sale-invoice' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="invoice" /></div>}
            {currentView === 'purchase-order' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="purchase_order" /></div>}
            {currentView === 'purchase-invoice' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="purchase_invoice" /></div>}
            {currentView === 'delivery-challan' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="delivery_challan" /></div>}
            {currentView === 'payments' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="inward_payment" /></div>}
            {currentView === 'credit-note' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="credit_note" /></div>}
            {currentView === 'debit-note' && <div className="p-4"><BillingManagement uiSettings={uiSettings} customers={customers} vendors={vendors} records={billing} orders={orders} users={usersData} inventory={inventory} products={products} permissions={permissions} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="debit_note" /></div>}
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
