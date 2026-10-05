
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType, WorkLogEntry as WorkLogEntryType, SystemUser, Customer, Order, Machine, Vendor, InventoryItem, BillingRecord, PermissionLevel, UISettings, TrainingAssignment, QualityReport, UserLeave, SalarySlip, ViewMetadata, ProductMaster } from '@/lib/types';

// COMMAND CENTER MODULES
import { ShopFloorOverview } from '@/modules/command-center/shop-floor-overview';
import { ShopFloorSQCDP } from '@/modules/command-center/shop-floor-sqcdp';
import { ActivityFeed } from '@/modules/command-center/activity-feed';
import { AnalyticsDashboard } from '@/modules/command-center/analytics-dashboard';

// FINANCIAL HUB MODULES
import { BillingManagement } from '@/modules/financial/billing-management';
import { ProductRegistry } from '@/modules/financial/product-registry';
import { CustomerOrders } from '@/modules/financial/customer-orders';
import { VendorManagement } from '@/modules/financial/vendor-management';
import { DocumentTemplateManager } from '@/modules/financial/document-template-manager';

// PRODUCTION HUB MODULES
import { ShopFloorOrders } from '@/modules/production/shop-floor-orders';
import { OrderDetails } from '@/modules/production/order-details';
import { OperationsStatus } from '@/modules/production/operations-status';
import { ProductionPlanner } from '@/modules/production/production-planner';
import { ProductionGantt } from '@/modules/production/production-gantt';
import { QualityManagement } from '@/modules/production/quality-management';
import { DispatchLedger } from '@/modules/production/dispatch-ledger';
import { InventoryManagement } from '@/modules/production/inventory-management';
import { WeeklyPlan } from '@/modules/production/weekly-plan';
import { WorkLogEntry } from '@/modules/production/work-log-entry';

// RESOURCE HUB MODULES
import { MachineUtilization } from '@/modules/resources/machine-utilization';
import { PersonnelPortal } from '@/modules/resources/personnel-portal';
import { HRManagement } from '@/modules/resources/hr-management';

// ADMINISTRATION MODULES
import { UserManagement } from '@/modules/administration/user-management';
import { UserDetailView } from '@/modules/administration/user-detail-view';
import { ProfileSettings } from '@/modules/administration/profile-settings';
import { LogApprovalMatrix } from '@/modules/administration/log-approval-matrix';

// STRATEGIC HUB MODULES
import { SmartQuotingAssistant } from '@/modules/strategic/smart-quoting-assistant';
import { LoanProjectHub } from '@/modules/strategic/loan-project-hub';
import { ExternalDashboard } from '@/modules/strategic/external-dashboard';

import { LoginScreen } from '@/components/login-screen';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, ChevronRight, Lock, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  borderRadius: 0.5,
  primaryColor: '221.2 83.2% 53.3%',
  sidebarMode: 'full',
  cardShadow: 'sm',
  labelCase: 'uppercase',
  headerAlignment: 'left',
  customTitles: {},
  woPrefix: 'WO-',
  woNextNumber: 1001,
  logoSize: 32,
  dashboardLayout: 'executive',
  currencySymbol: '₹',
  taxLabel: 'GST',
  erpCompanyName: 'Ferocious Tech',
  erpTagline: 'Advanced Tool Management Platform',
  enableNotifications: true,
  billingTableSettings: {
    colWidths: { description: 400, hsn: 112, qty: 96, unit: 112, price: 160, discount: 96, gst: 96, total: 192 },
    rowHeight: 40,
  }
};

const VIEW_CONFIG: Record<ViewType | string, ViewMetadata> = {
  overview: { title: 'Executive Dashboard', category: 'Command Center' },
  analytics: { title: 'Analytics Dashboard', category: 'Command Center' },
  activity: { title: 'Performance Hub', category: 'Command Center' },
  sqcdp: { title: 'Quality Metrics', category: 'Command Center' },
  'customer-master': { title: 'Customer Master', category: 'Financial Hub' },
  'vendor-master': { title: 'Vendor Master', category: 'Financial Hub' },
  'product-master': { title: 'Product Registry', category: 'Financial Hub' },
  quotation: { title: 'Quotation Ledger', category: 'Financial Hub' },
  'sale-invoice': { title: 'Sales Invoice Ledger', category: 'Financial Hub' },
  'purchase-order': { title: 'Purchase Order Ledger', category: 'Financial Hub' },
  payments: { title: 'Payment Ledger', category: 'Financial Hub' },
  orders: { title: 'Work Orders', category: 'Production Hub' },
  'order-details': { title: 'Order Identity', category: 'Production Hub' },
  operations: { title: 'Operations Status', category: 'Production Hub' },
  'production-planner': { title: 'Production Planner', category: 'Production Hub' },
  gantt: { title: 'Production Timeline', category: 'Production Hub' },
  quality: { title: 'Quality Control', category: 'Production Hub' },
  delivery: { title: 'Dispatch Ledger', category: 'Production Hub' },
  inventory: { title: 'Inventory Ledger', category: 'Production Hub' },
  'machine-utilization': { title: 'Asset Management', category: 'Resource Hub' },
  'my-portal': { title: 'Employee Portal', category: 'Resource Hub' },
  hr: { title: 'Employee Management', category: 'Resource Hub' },
  users: { title: 'User Directory', category: 'Administration' },
  'print-templates': { title: 'Document Designer', category: 'Administration' },
  settings: { title: 'System Settings', category: 'Administration' },
  'smart-quote': { title: 'AI Quoting Assistant', category: 'Strategic Hub' },
  'strategy-hub': { title: 'Loan Project Hub', category: 'Strategic Hub' },
};

function IndustrialERPInternal() {
  const db = useFirestore();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [selectedDetailUserId, setSelectedDetailUserId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [uiSettings, setUISettings] = useState<UISettings>(DEFAULT_UI_SETTINGS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const customersQuery = useMemoFirebase(() => collection(db, 'customers'), [db]);
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const machinesQuery = useMemoFirebase(() => collection(db, 'machines'), [db]);
  const vendorsQuery = useMemoFirebase(() => collection(db, 'vendors'), [db]);
  const inventoryQuery = useMemoFirebase(() => collection(db, 'inventory'), [db]);
  const billingQuery = useMemoFirebase(() => collection(db, 'billing'), [db]);
  const logsQuery = useMemoFirebase(() => collection(db, 'work_logs'), [db]);
  const reportsQuery = useMemoFirebase(() => collection(db, 'quality_reports'), [db]);
  const leavesQuery = useMemoFirebase(() => collection(db, 'leaves'), [db]);
  const slipsQuery = useMemoFirebase(() => collection(db, 'salary_slips'), [db]);
  const assignmentsQuery = useMemoFirebase(() => collection(db, 'training_assignments'), [db]);
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);

  const { data: orders } = useCollection<Order>(ordersQuery);
  const { data: customers } = useCollection<Customer>(customersQuery);
  const { data: usersData } = useCollection<SystemUser>(usersQuery);
  const { data: machines } = useCollection<Machine>(machinesQuery);
  const { data: vendors } = useCollection<Vendor>(vendorsQuery);
  const { data: inventory } = useCollection<InventoryItem>(inventoryQuery);
  const { data: billing } = useCollection<BillingRecord>(billingQuery);
  const { data: logs } = useCollection<WorkLogEntryType>(logsQuery);
  const { data: reports } = useCollection<QualityReport>(reportsQuery);
  const { data: leaves } = useCollection<UserLeave>(leavesQuery);
  const { data: slips } = useCollection<SalarySlip>(slipsQuery);
  const { data: assignments } = useCollection<TrainingAssignment>(assignmentsQuery);
  const { data: products } = useCollection<ProductMaster>(productsQuery);

  const currentUserData = useMemo(() => {
    if (!currentUser || !usersData) return null;
    return usersData.find(u => u.name === currentUser || u.email === currentUser);
  }, [currentUser, usersData]);

  const isMasterAdmin = useMemo(() => currentUser?.toLowerCase() === 'master admin', [currentUser]);

  const permissions = useMemo(() => {
    if (isMasterAdmin) {
      const p: Record<string, PermissionLevel> = {};
      Object.keys(VIEW_CONFIG).forEach(k => p[k] = 'full');
      return p;
    }
    return currentUserData?.permissions || {};
  }, [isMasterAdmin, currentUserData]);

  const isAuthorizedToView = useMemo(() => {
    if (isMasterAdmin) return true;
    if (['overview', 'settings', 'my-portal'].includes(currentView)) return true;
    const level = permissions[currentView];
    return level && level !== 'none';
  }, [permissions, currentView, isMasterAdmin]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('jayasimha_user');
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('jayasimha_user');
    if (saved) { setCurrentUser(saved); setIsLoggedIn(true); }
  }, []);

  useEffect(() => {
    const masterAdmin = usersData?.find(u => u.role === 'Master Admin' || u.name?.toLowerCase() === 'master admin');
    if (masterAdmin?.uiSettings) {
      setUISettings(prev => ({ ...prev, ...masterAdmin.uiSettings }));
    }
  }, [usersData]);

  if (!mounted) return null;
  if (!isLoggedIn) return <><LoginScreen onLogin={(u) => { localStorage.setItem('jayasimha_user', u); setCurrentUser(u); setIsLoggedIn(true); }} users={usersData || []} brandLogo={uiSettings.brandLogo} /><Toaster /></>;

  const currentViewMetadata = VIEW_CONFIG[currentView] || { title: 'Unknown Page', category: 'Hub' };

  return (
    <div className={cn("flex h-screen text-[#0F172A] font-body overflow-hidden transition-colors duration-500", uiSettings.theme === 'dark' ? 'bg-[#020617] dark' : 'bg-[#F8FAFC]')}>
      <div className={cn("hidden lg:block shrink-0 transition-all duration-300", uiSettings.sidebarMode === 'slim' ? "w-20" : "w-64")}>
        <SidebarNav 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          permissions={permissions} 
          isSlim={uiSettings.sidebarMode === 'slim'}
          userRole={currentUserData?.role}
          brandLogo={uiSettings.brandLogo}
          logoSize={uiSettings.logoSize}
          customTitles={uiSettings.customTitles}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-card border-b border-slate-200 dark:border-border shrink-0 px-4 md:px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-none w-72 bg-[#1E293B]">
                  <SidebarNav 
                    currentView={currentView} 
                    onViewChange={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }} 
                    permissions={permissions} 
                    userRole={currentUserData?.role}
                    brandLogo={uiSettings.brandLogo}
                    logoSize={uiSettings.logoSize}
                    customTitles={uiSettings.customTitles}
                    isMobile
                  />
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex flex-col">
               <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="hidden sm:inline">{currentViewMetadata.category}</span>
                  <ChevronRight className="h-2 w-2 hidden sm:inline" />
                  <span className="text-blue-600 truncate">{currentViewMetadata.title}</span>
               </div>
               <h2 className="text-lg md:text-xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{currentViewMetadata.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">{currentUser}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{currentUserData?.role || 'Personnel'}</p>
             </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-slate-200 dark:border-border cursor-pointer hover:ring-4 ring-blue-50 transition-all">
                      <AvatarImage src={currentUserData?.image} />
                      <AvatarFallback className="bg-slate-100 text-slate-400 text-[10px] font-bold">FT</AvatarFallback>
                   </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-2xl border-slate-100 dark:border-border">
                   <DropdownMenuItem onClick={() => setCurrentView('settings')} className="text-xs gap-2"><User className="h-3.5 w-3.5" /> Profile Settings</DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout} className="text-xs gap-2 text-red-600"><LogOut className="h-3.5 w-3.5" /> Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto">
            {!isAuthorizedToView ? <div className="p-20 text-center opacity-30 text-xs font-bold uppercase tracking-widest">Access Protocol Restricted</div> : (
              <>
                {currentView === 'overview' && <ShopFloorOverview orders={orders || []} reports={reports || []} logs={logs || []} machines={machines || []} inventory={inventory || []} billing={billing || []} permissions={permissions} isMasterAdmin={isMasterAdmin} />}
                {currentView === 'analytics' && <AnalyticsDashboard orders={orders || []} billing={billing || []} reports={reports || []} logs={logs || []} machines={machines || []} users={usersData || []} />}
                {currentView === 'sqcdp' && <ShopFloorSQCDP orders={orders || []} reports={reports || []} logs={logs || []} users={usersData || []} assignments={assignments || []} />}
                {currentView === 'activity' && <ActivityFeed orders={orders || []} billing={billing || []} reports={reports || []} assignments={assignments || []} users={usersData || []} logs={logs || []} leaves={leaves || []} currentUser={currentUser} />}
                {currentView === 'customer-master' && <CustomerOrders customers={customers || []} vendors={vendors || []} billing={billing || []} orders={orders || []} onSaveCustomer={(c)=>setDocumentNonBlocking(doc(db,'customers',c.id),c,{merge:true})} onSaveVendor={(v)=>setDocumentNonBlocking(doc(db,'vendors',v.id),v,{merge:true})} />}
                {currentView === 'vendor-master' && <VendorManagement vendors={vendors || []} billing={billing || []} orders={orders || []} machines={machines || []} onSaveVendor={(v)=>setDocumentNonBlocking(doc(db,'vendors',v.id),v,{merge:true})} />}
                {currentView === 'product-master' && <ProductRegistry products={products || []} vendors={vendors || []} machines={machines || []} users={usersData || []} />}
                {currentView === 'quotation' && <BillingManagement currentUser={currentUser} customers={customers || []} records={billing || []} products={products || []} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="quotation" />}
                {currentView === 'sale-invoice' && <BillingManagement currentUser={currentUser} customers={customers || []} records={billing || []} products={products || []} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="invoice" />}
                {currentView === 'purchase-order' && <BillingManagement currentUser={currentUser} customers={customers || []} records={billing || []} products={products || []} onSaveRecord={(r)=>setDocumentNonBlocking(doc(db,'billing',r.id),r,{merge:true})} onDeleteRecord={(id)=>deleteDocumentNonBlocking(doc(db,'billing',id))} initialTab="purchase_order" />}
                {currentView === 'orders' && <ShopFloorOrders orders={orders || []} billing={billing || []} logs={logs || []} machines={machines || []} onNavigateToOrderDetails={(id) => { setSelectedOrderId(id); setCurrentView('order-details'); }} onNavigateToOperations={(id) => { setCurrentView('operations'); }} />}
                {currentView === 'order-details' && <OrderDetails orderId={selectedOrderId} orders={orders || []} customers={customers || []} staff={usersData || []} billing={billing || []} onBack={() => setCurrentView('orders')} onSave={(o)=>setDocumentNonBlocking(doc(db,'orders',o.id),o,{merge:true})} uiSettings={uiSettings} />}
                {currentView === 'operations' && <OperationsStatus initialOrderId={selectedOrderId} orders={orders || []} users={usersData || []} machines={machines || []} />}
                {currentView === 'production-planner' && <ProductionPlanner batches={[]} orders={orders || []} machines={machines || []} users={usersData || []} onSaveBatch={(b)=>setDocumentNonBlocking(doc(db,'production_batches',b.id),b,{merge:true})} onDeleteBatch={(id)=>deleteDocumentNonBlocking(doc(db,'production_batches',id))} />}
                {currentView === 'gantt' && <ProductionGantt orders={orders || []} onNavigateToOperations={(id) => { setCurrentView('operations'); }} />}
                {currentView === 'quality' && <QualityManagement orders={orders || []} users={usersData || []} vendors={vendors || []} permissions={permissions} />}
                {currentView === 'delivery' && <DispatchLedger orders={orders || []} reports={reports || []} billing={billing || []} onSaveOrder={(o)=>setDocumentNonBlocking(doc(db,'orders',o.id),o,{merge:true})} />}
                {currentView === 'inventory' && <InventoryManagement items={inventory || []} onSaveItem={(i)=>setDocumentNonBlocking(doc(db,'inventory',i.id),i,{merge:true})} />}
                {currentView === 'work-log' && <WorkLogEntry logs={logs || []} machines={machines || []} users={usersData || []} orders={orders || []} currentUser={currentUser} onAddLog={(l)=>setDocumentNonBlocking(doc(db,'work_logs',l.id),l,{merge:true})} onDeleteLog={(id)=>deleteDocumentNonBlocking(doc(db,'work_logs',id))} />}
                {currentView === 'machine-utilization' && <MachineUtilization machines={machines || []} orders={orders || []} onSaveMachine={(m)=>setDocumentNonBlocking(doc(db,'machines',m.id),m,{merge:true})} />}
                {currentView === 'my-portal' && <PersonnelPortal currentUser={currentUserData} assignments={assignments || []} leaves={leaves || []} slips={slips || []} holidays={[]} users={usersData || []} onNavigateToLogs={() => setCurrentView('work-log')} />}
                {currentView === 'hr' && <HRManagement users={usersData || []} trainings={[]} assignments={assignments || []} onSaveUser={(u)=>setDocumentNonBlocking(doc(db,'users',u.id),u,{merge:true})} onSaveTraining={(t)=>setDocumentNonBlocking(doc(db,'trainings',t.id),t,{merge:true})} onDeleteTraining={(id)=>deleteDocumentNonBlocking(doc(db,'trainings',id))} onSaveAssignment={(a)=>setDocumentNonBlocking(doc(db,'training_assignments',a.id),a,{merge:true})} onDeleteAssignment={(id)=>deleteDocumentNonBlocking(doc(db,'training_assignments',id))} currentUser={currentUser} />}
                {currentView === 'users' && <UserManagement users={usersData || []} onSaveUser={(u)=>setDocumentNonBlocking(doc(db,'users',u.id),u,{merge:true})} onDeleteUser={(id)=>deleteDocumentNonBlocking(doc(db,'users',id))} onNavigateToDetail={(id)=>{setSelectedDetailUserId(id); setCurrentView('user-detail');}} />}
                {currentView === 'user-detail' && <UserDetailView userId={selectedDetailUserId} users={usersData || []} onBack={() => setCurrentView('users')} onSaveUser={(u)=>setDocumentNonBlocking(doc(db,'users',u.id),u,{merge:true})} onVerifyPortal={(n)=>{ setCurrentUser(n); setCurrentView('my-portal'); }} />}
                {currentView === 'settings' && <ProfileSettings currentUser={currentUser} users={usersData || []} onSaveUser={(u)=>setDocumentNonBlocking(doc(db,'users',u.id),u,{merge:true})} onDeleteUser={(id)=>deleteDocumentNonBlocking(doc(db,'users',id))} uiSettings={uiSettings} onUpdateUISettings={setUISettings} currentUserData={currentUserData} onNavigateToDetail={(id)=>{setSelectedDetailUserId(id); setCurrentView('user-detail');}} />}
                {currentView === 'smart-quote' && <SmartQuotingAssistant machines={machines || []} />}
                {currentView === 'strategy-hub' && <LoanProjectHub />}
                {currentView === 'print-templates' && <DocumentTemplateManager />}
              </>
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
