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
  | 'vendor';

export interface Order {
  id: string;
  customer: string;
  startDate: string;
  endDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Pending' | 'Completed' | 'Delayed';
  owner?: string;
  progress?: number;
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
  status: 'active' | 'break' | 'off';
  shift: 'Morning' | 'Evening' | 'Night';
  efficiency: number;
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
