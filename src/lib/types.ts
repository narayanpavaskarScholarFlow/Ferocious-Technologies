
export type ToolStatus = 'active' | 'obsolete' | 'maintenance';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  status: ToolStatus;
  technicalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogFilter {
  search: string;
  category: string;
  status: ToolStatus | 'all';
}
