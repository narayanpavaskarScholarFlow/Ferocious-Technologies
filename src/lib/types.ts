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
  | 'manpower' 
  | 'customer-orders' 
  | 'weekly-plan' 
  | 'users'
  | 'vendor'
  | 'order-details'
  | 'billing'
  | 'work-log'
  | 'inventory'
  | 'quality'
  | 'settings'
  | 'gantt'
  | 'smart-quote';

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
  startDate: string;
  endDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Pending' | 'Completed' | 'Delayed' | 'Yet to start';
  owner?: string;
  progress?: number;
  amountSpent?: string;
  materialCost?: string;
  laborCost?: string;
  taxAmount?: string;
  totalQuoted?: string;
  routing?: RoutingOperation[];
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
  contactNumber: string;
  gstNumber: string;
  contactPerson: string;
  type: 'Corporate' | 'Individual';
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
  date: string;
  shift: 'Morning' | 'Evening' | 'Night';
  activity: string;
  duration: string;
  type: 'Production' | 'Maintenance' | 'Idle' | 'Setup';
  workOrderId?: string;
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

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  image?: string;
  phone?: string;
  reportingManager?: string;
  permissions: Record<string, PermissionLevel>;
  lastLogin: string;
  status: 'online' | 'offline' | 'active' | 'break' | 'off';
  shift?: 'Morning' | 'Evening' | 'Night';
  efficiency?: number;
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
  drawingFile?: string; // Data URI or URL of the attached blueprint
  dimensions: DimensionRecord[];
  checks: Record<string, string>;
  status: 'Draft' | 'Review Pending' | 'Released';
  verdict: 'Pass' | 'Fail' | 'Pending';
  inspector: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}
