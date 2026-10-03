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
  status: 'active' | 'maintenance' | 'fault';
  image: string;
}

export type ViewType = 
  | 'overview' 
  | 'orders' 
  | 'sqcdp' 
  | 'operations' 
  | 'machine-utilization' 
  | 'hr' 
  | 'my-portal'
  | 'customer-orders' 
  | 'weekly-plan' 
  | 'users'
  | 'user-detail'
  | 'vendor'
  | 'order-details'
  | 'billing'
  | 'billing-quotation'
  | 'billing-invoice'
  | 'billing-po'
  | 'billing-proforma'
  | 'billing-inward'
  | 'billing-outward'
  | 'billing-bank'
  | 'billing-dc'
  | 'work-log'
  | 'inventory'
  | 'quality'
  | 'settings'
  | 'gantt'
  | 'smart-quote'
  | 'production-planner'
  | 'agile'
  | 'training'
  | 'manpower'
  | 'salary'
  | 'team-matrix'
  | 'delivery';

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
  status?: string;
  subTasks: SubTask[];
}

export interface Order {
  id: string;
  customer: string;
  poNumber?: string;
  typeOfWork?: string;
  startDate: string;
  endDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Pending' | 'Completed' | 'Delayed' | 'Yet to start' | 'Ready for Delivery' | 'Delivered';
  owner?: string;
  progress?: number;
  amountSpent?: string;
  materialCost?: string;
  laborCost?: string;
  taxAmount?: string;
  totalQuoted?: string;
  targetBudget?: string;
  routing?: RoutingOperation[];
  deliveredAt?: string;
}

export interface BillingLineItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  gstRate: number;
  total: number;
}

export interface BillingRecord {
  id: string;
  type: string; // 'invoice' | 'purchase_invoice' | 'quotation' | 'delivery_challan' | 'proforma' | 'purchase_order' | 'sale_order' | 'credit_note' | 'debit_note' | 'inward' | 'outward'
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
  companyType?: 'Customer' | 'Both';
  registrationType?: string;
  pan?: string;
  email: string;
  location: string;
  totalOrders: number;
  outstanding?: string;
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
  address: string;
  email: string;
  gstNumber: string;
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

export interface UISettings {
  fontSize: number;
  tableDensity: 'compact' | 'standard' | 'comfortable';
  borderRadius: number;
  primaryColor: string; // HSL string "243 75% 59%"
  sidebarMode: 'slim' | 'full';
  cardShadow: 'none' | 'sm' | 'xl';
  labelCase: 'uppercase' | 'capitalize';
  headerAlignment: 'left' | 'center';
  customTitles: Record<string, string>;
  woPrefix: string;
  woNextNumber: number;
  brandLogo?: string; // High-fidelity corporate logo data URI
  logoSize: number; // Unified scaling node for branding identities
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
  name: string; // Full composite name
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
  impactScore: number; // How much it affects efficiency (0-10)
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
