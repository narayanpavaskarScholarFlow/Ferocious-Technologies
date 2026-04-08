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
  | 'gantt';

export interface Order {
  id: string;
  customer: string;
  startDate: string;
  endDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Pending' | 'Completed' | 'Delayed';
  owner?: string;
  progress?: number;
  amountSpent?: string;
  materialCost?: string;
  laborCost?: string;
  taxAmount?: string;
  totalQuoted?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  type: 'Service' | 'Material' | 'Full';
}

export interface SQCDPData {
  category: 'S' | 'Q' | 'C' | 'D' | 'P';
  label: string;
  value: number;
  history: { date: string; value: number }[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: 'active' | 'break' | 'off';
  shift: 'Morning' | 'Evening' | 'Night';
  efficiency: number;
}

export interface LeaveBalance {
  id: string;
  resourceName: string;
  annual: number;
  sick: number;
  casual: number;
  totalTaken: number;
}

export interface LeaveRequest {
  id: string;
  resourceName: string;
  startDate: string;
  endDate: string;
  type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
  status: 'Approved' | 'Pending' | 'Rejected';
  reason?: string;
}

export interface CustomerOrder {
  siNo: number;
  id: string;
  customer: string;
  customerType: string;
  numberOfPOs: number;
  value: string;
  quantity: number;
  location: string;
  status: 'Pending' | 'Production' | 'Shipping' | 'Delivered';
}

export interface Customer {
  id: string;
  name: string; // Company name
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

export interface OperationStep {
  id: string;
  partId: string;
  operationName: string;
  machineId: string;
  status: 'Queued' | 'In Progress' | 'Completed' | 'Blocked';
  startTime?: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  activeOrders: number;
  rating: number;
  contact: string;
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
  category: 'Raw Material' | 'Tooling' | 'Finished Goods' | 'Consumable';
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface QualityCheck {
  id: string;
  operation: string;
  status: 'Pass' | 'Fail' | 'Pending' | 'NA';
  remarks?: string;
}

export type PermissionLevel = 'read' | 'edit' | 'full';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  permissions: Record<string, PermissionLevel>;
  lastLogin: string;
  status: 'online' | 'offline';
}
