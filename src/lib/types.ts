
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

export interface CatalogFilter {
  search: string;
  category: MachineCategory;
  status: ToolStatus | 'all';
}

export interface SystemActivity {
  id: string;
  type: 'usage' | 'maintenance' | 'ai_update' | 'alert';
  message: string;
  timestamp: string;
  user?: string;
  severity?: 'low' | 'medium' | 'high';
}
