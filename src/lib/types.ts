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
  | 'tasks' 
  | 'machine-utilization' 
  | 'manpower' 
  | 'customer-orders' 
  | 'operations' 
  | 'weekly-plan' 
  | 'users';

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
  id: string;
  customer: string;
  partName: string;
  quantity: number;
  dueDate: string;
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
