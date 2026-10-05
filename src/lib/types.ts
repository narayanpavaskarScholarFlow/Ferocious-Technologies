export type ToolStatus = 'active' | 'obsolete' | 'maintenance' | 'fault';

export type MachineCategory = 
  | 'Milling' 
  | 'Turning' 
  | 'Grinding' 
  | '3D Printing' 
  | 'EDM' 
  | 'Double Column Milling'
  | 'All';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Exclude<MachineCategory, 'All'>;
  tags: string[];
  imageUrl: string;
  status: ToolStatus;
  technicalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Machine {
  id: string;
  name: string;
  type: Exclude<MachineCategory, 'All'>;
  mcNumber: string;
  make: string;
  bedSize: string;
  costPerHour: number;
  load: number;
  status: 'active' | 'maintenance' | 'fault' | 'Running' | 'Idle' | 'Maintenance' | 'Breakdown';
  image: string;
}

export type ViewType = 
  | 'overview' 
  | 'analytics'
  | 'activity'
  | 'approvals'
  | 'notifications'
  | 'sqcdp'
  | 'customer-master'
  | 'vendor-master'
  | 'product-master'
  | 'quotation'
  | 'customer-po'
  | 'sale-order'
  | 'sale-invoice'
  | 'purchase-order'
  | 'purchase-invoice'
  | 'delivery-challan'
  | 'payments'
  | 'credit-note'
  | 'debit-note'
  | 'orders' 
  | 'order-details'
  | 'operations' 
  | 'production-planner'
  | 'gantt'
  | 'shop-floor'
  | 'quality'
  | 'delivery'
  | 'inventory'
  | 'machine-utilization'
  | 'machine-load-plan'
  | 'tool-catalog'
  | 'tool-cards'
  | 'my-portal'
  | 'manpower'
  | 'training'
  | 'hr' 
  | 'salary'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'approval-matrix'
  | 'print-templates'
  | 'reports'
  | 'settings'
  | 'smart-quote'
  | 'strategy-hub'
  | 'business-planning'
  | 'dpr-generator'
  | 'financial-projections'
  | 'user-detail'
  | 'weekly-plan'
  | 'work-log'
  | 'billing'
  | 'dash-billing' | 'dash-outstanding' | 'dash-po' | 'dash-production' | 'dash-health' | 'dash-ai' | 'dash-alerts' | 'dash-approvals' | 'dash-personnel' | 'dash-flow'
  | 'report-sales' | 'report-quality' | 'report-production' | 'report-dispatch' | 'report-machine' | 'report-financial'
  | 'approve-quotation' | 'approve-wo' | 'approve-dispatch' | 'approve-invoice' | 'approve-payment';

export interface ViewMetadata {
  title: string;
  category: string;
  description?: string;
  parent?: string;
}

export interface SubTask {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  machineId?: string;
  isCompleted?: boolean;
  status?: string;
}

export interface RoutingOperation {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status?: 'Yet To Start' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled' | 'NA';
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  department?: string;
  progress?: number;
  subTasks: SubTask[];
}

export interface Order {
  id: string;
  customer: string;
  customerId?: string;
  poNumber?: string;
  poId?: string;
  quotationNumber?: string;
  quotationId?: string;
  typeOfWork?: string;
  startDate: string;
  endDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Planning' | 'Production' | 'Inspection' | 'Dispatch' | 'Completed' | 'Delivered' | 'Active' | 'Yet to start' | 'Pending';
  owner?: string;
  progress?: number;
  amountSpent?: string;
  targetBudget?: string;
  routing?: RoutingOperation[];
  items?: BillingLineItem[];
  deliveredAt?: string;
}

export interface BillingLineItem {
  id: string;
  productId?: string;
  description: string;
  note?: string;
  hsn: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  gstRate: number;
  total: number;
  drawingNumber?: string;
  revisionNumber?: string;
  material?: string;
  standardCost?: number;
}

export interface ProductMaster {
  id: string;
  code: string;
  name: string;
  description: string;
  hsn: string;
  gstRate: number;
  uom: string;
  saleRate: number;
  purchaseRate: number;
  drawingNumber?: string;
  revisionNumber?: string;
  category: string; 
  subCategory?: string;
  type: string; 
  status: 'Active' | 'Inactive';
  updatedAt: string;
  
  // Business Info
  businessUnit: 'Manufacturing' | 'Electricals';
  brand?: string;
  launchDate?: string;
  
  // Engineering Information
  internalPartNumber?: string;
  material?: string;
  materialGrade?: string;
  weight?: string;
  surfaceFinish?: string;
  tolerance?: string;
  application?: string;
  industry?: string;
  processRoute?: string;
  customerPartNumber?: string;
  
  // Manufacturing Information
  machinesRequired?: string[]; 
  cycleTimeSec?: number;
  setupTimeMin?: number;
  inspectionTimeMin?: number;
  assemblyTimeMin?: number;
  
  // Commercial Information
  standardCost?: number;
  currentCost?: number;
  sellingPrice?: number;
  marketPrice?: number;
  marginPercent?: number;
  profitPercent?: number;
  targetMarginPercent?: number;

  // Cost Breakup
  materialCost?: number;
  machiningCost?: number;
  toolingCost?: number;
  inspectionCost?: number;
  assemblyCost?: number;
  packagingCost?: number;
  
  // Market Intelligence
  annualRequirement?: number;
  potentialAnnualRequirement?: number;
  projectedDemand?: number;
  competitorProducts?: string;
  competitorPrice?: number;
  forecastGrowth?: string;
  targetIndustry?: string;
  targetCustomerType?: string;
  
  // Outsourcing Analysis
  inHousePercent?: number;
  outsourcedPercent?: number;
  annualOutsourcingValue?: number;
  currentFYOutsourcing?: number;
  currentMonthOutsourcing?: number;
  outsourcingReason?: string[];
  mostOutsourcedProcess?: string;
  canManufactureInHouse?: boolean;
  preferredVendorId?: string;
  backupVendorId?: string;
  
  // Partner / Supply Chain
  primaryVendorId?: string;
  leadTime?: number;
  moq?: number;
  paymentTerms?: string;
  vendorRating?: number;

  // Media Matrix
  imageUrls?: string[];
  drawingUrls?: string[];
  modelUrls?: string[];
  datasheetUrls?: string[];
  catalogUrls?: string[];
  
  // BOM Structure
  bom?: {
    id: string;
    componentId: string;
    name: string;
    qty: number;
    cost: number;
    supplier?: string;
    revision?: string;
    type: 'Purchased' | 'Manufactured' | 'Outsourced';
  }[];
  
  // Performance & Scoring
  rejectedQty?: number;
  lifetimeRev?: number;
  finalProductScore?: number;
}

export interface BillingRecord {
  id: string;
  type: string;
  customerName: string;
  customerId: string;
  date: string;
  number: string;
  amount: number;
  status: string;
  note: string;
  itemName?: string;
  orderId?: string;
  receiverName?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer';
  transactionDetails?: string;
  items?: BillingLineItem[];
  subTotal?: number;
  taxTotal?: number;
  discountTotal?: number;
  transportationCharges?: number;
  packingCharges?: number;
  paymentTerms?: string;
  dueDate?: string;
  placeOfSupply?: string;
  vehicleNo?: string;
  terms?: string;
  revCharge?: 'Yes' | 'No';
  shipTo?: string;
  distanceEWay?: string;
  challanNo?: string;
  challanDate?: string;
  deliveryMode?: string;
  tcsRate?: number;
  tcsAmount?: number;
  roundOff?: number;
  isRoundOffActive?: boolean;
  contactPerson?: string;
  contactNumber?: string;
  gstNumber?: string;
  panNumber?: string;
  quotationId?: string;
  fy?: string;
  salesExecutive?: string;
  deliveryTerms?: string;
  cgst?: number;
  sgst?: number;
  igst?: number;
  taxableValue?: number;
  marginPercent?: number;
  estimatedProfit?: number;
  referenceNumber?: string;
}

export interface SQCDPData {
  category: 'S' | 'Q' | 'C' | 'D' | 'P';
  label: string;
  value: number;
  history: { date: string; value: number }[];
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  shippingAddress: string;
  contactNumber: string;
  gstNumber: string;
  contactPerson: string;
  type: 'Corporate' | 'Individual';
  companyType?: 'Customer' | 'Vendor' | 'Both';
  registrationType?: string;
  pan?: string;
  email: string;
  location: string;
  totalOrders: number;
  outstanding?: string;
  outstandingDays?: number;
  pendingPOs?: number;
  status?: 'Active' | 'Closed';
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  activeOrders: number;
  rating: number;
  contact: string;
  address?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  shippingAddress?: string;
  email: string;
  gstNumber: string;
  pan?: string;
  registrationType?: string;
  status: 'Active' | 'Under Review' | 'Inactive';
}

export interface WorkLogEntry {
  id: string;
  resourceId: string;
  resourceName: string;
  operator: string;
  operatorId: string;
  date: string;
  shift: 'Morning' | 'Evening' | 'Night';
  activity: string;
  duration: string;
  type: 'Production' | 'Maintenance' | 'Idle' | 'Setup';
  workOrderId?: string;
  status: 'Draft' | 'Submitted' | 'Approved';
  approvedBy?: string;
  approvedAt?: string;
  isOT?: boolean;
  otHours?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export type PermissionLevel = 'read' | 'edit' | 'full' | 'none';

export interface UserLeaveBalance {
  annual: number;
  sick: number;
  casual: number;
}

export interface SalarySlip {
  id: string;
  userId: string;
  month: string;
  year: number;
  generatedDate: string;
  netPay: number;
  status: 'Published' | 'Pending';
}

export interface SalaryStructure {
  basePay: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  otRate: number;
  panNumber: string;
  bankAccount: string;
  ifscCode: string;
}

export interface NumberSeries {
  prefix: string;
  startingNumber: number;
  currentNumber: number;
  length: number;
  fyFormat: 'YYYY' | 'YY-YY' | 'NONE';
  separator: string;
  resetEveryFY: boolean;
  manualOverride: boolean;
}

export interface UISettings {
  theme?: 'light' | 'dark';
  fontSize: number;
  tableDensity: 'compact' | 'standard' | 'comfortable';
  borderRadius: number;
  primaryColor: string;
  sidebarMode: 'slim' | 'full';
  cardShadow: 'none' | 'sm' | 'xl';
  labelCase: 'uppercase' | 'capitalize';
  headerAlignment: 'left' | 'center';
  customTitles: Record<string, string>;
  woPrefix: string;
  woNextNumber: number;
  brandLogo?: string;
  logoSize: number;
  numberSeries?: Record<string, NumberSeries>;
  monthlyBillingTargets?: Record<string, number>;
  dashboardLayout?: 'executive' | 'compact' | 'focused';
  widgetVisibility?: Record<string, boolean>;
  currencySymbol?: string;
  taxLabel?: string;
  woDefaultView?: 'list' | 'kanban';
  showOperationsInWO?: boolean;
  enableNotifications?: boolean;
  notificationTone?: 'none' | 'subtle' | 'industrial';
  sidebarAutoCollapse?: boolean;
  erpCompanyName?: string;
  erpTagline?: string;
  billingTableSettings?: {
    colWidths: {
      description: number;
      hsn: number;
      qty: number;
      unit: number;
      price: number;
      discount: number;
      gst: number;
      total: number;
    };
    rowHeight: number;
  };
}

export interface SystemUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  dept: string;
  image?: string;
  phone?: string;
  reportingManager?: string;
  permissions: Record<string, PermissionLevel>;
  lastLogin: string;
  lastPasswordChange?: string;
  status: 'online' | 'offline' | 'active' | 'break' | 'off';
  shift?: 'Morning' | 'Evening' | 'Night';
  efficiency?: number;
  leaveBalance?: UserLeaveBalance;
  salary?: SalaryStructure;
  uiSettings?: UISettings;
  machineAccess?: string[];
  approvalLimit?: number;
}

export interface QualityReport {
  id: string;
  workOrderId: string;
  drawingId: string;
  drawingName: string;
  drawingFile?: string; 
  dimensions: DimensionRecord[];
  checks: Record<string, string>;
  status: 'Draft' | 'Review Pending' | 'Released';
  verdict: 'Pass' | 'Fail' | 'Pending';
  inspector: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DimensionRecord {
  id: string;
  balloonNo: string;
  typeOfDim: string;
  instrument: string;
  target: string;
  tolerance: string;
  upperLimit: string;
  lowerLimit: string;
  actual: string;
  status: 'OK' | 'NOT OK' | 'NA' | 'Pending';
  remark: string;
}

export interface ProductionBatch {
  id: string;
  orderId: string;
  partName: string;
  machineId: string;
  machineName: string;
  operatorId: string;
  operatorName: string;
  targetQty: number;
  actualQty: number;
  scrapQty: number;
  cycleTimeSec: number;
  cavities: number;
  status: 'Running' | 'Paused' | 'Completed' | 'Setup';
  startTime: string;
  endTime?: string;
  lastSync: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  department: string;
  durationHours: number;
  impactScore: number;
  materialsUrl?: string;
  videoUrl?: string;
  quiz?: QuizQuestion[];
}

export interface TrainingAssignment {
  id: string;
  trainingId: string;
  trainingTitle: string;
  userId: string;
  userName: string;
  assignedDate: string;
  targetDate: string;
  completionDate?: string;
  status: 'Assigned' | 'In-Progress' | 'Completed' | 'Overdue' | 'Failed';
  score?: number;
}

export interface UserLeave {
  id: string;
  userId: string;
  userName: string;
  type: 'Annual' | 'Sick' | 'Casual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isPlannedMatrix?: boolean;
  plannedMonth?: string;
}

export interface Letterhead {
  id: string;
  name: string;
  logoUrl?: string;
  companyName: string;
  tagline?: string;
  address: string;
  gstNumber?: string;
  panNumber?: string;
  contactNumber: string;
  email: string;
  website?: string;
  qrCodeUrl?: string;
  headerLayout: 1 | 2 | 3 | 4;
  footerNotes?: string;
  bankDetails?: {
    bankName: string;
    accountNo: string;
    ifscCode: string;
    branch: string;
  };
  signatory?: {
    name: string;
    designation: string;
    sealUrl?: string;
  };
}

export interface PrintTemplate {
  id: string;
  name: string;
  documentType: string;
  layout: 'classic' | 'corporate' | 'industrial' | 'compact';
  letterheadId: string;
  isDefault: boolean;
}

export interface SystemActivity {
  id: string;
  type: 'usage' | 'ai_update' | 'alert' | 'maintenance';
  message: string;
  timestamp: string;
  user?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface CatalogFilter {
  search: string;
  category: string;
  status: 'all' | ToolStatus;
}
