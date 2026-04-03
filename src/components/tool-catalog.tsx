"use client";

import { useState, useMemo, useEffect } from 'react';
import { Tool, CatalogFilter } from '@/lib/types';
import { ToolCard } from '@/components/tool-card';
import { ToolForm } from '@/components/tool-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Box, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function ToolCatalog() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | undefined>();
  const [filters, setFilters] = useState<CatalogFilter>({
    search: '',
    category: 'all',
    status: 'all',
  });

  // Initial Data Load - Empty for run
  useEffect(() => {
    setTools([]);
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          tool.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                          tool.tags.some(t => t.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesCategory = filters.category === 'all' || tool.category === filters.category;
      const matchesStatus = filters.status === 'all' || tool.status === filters.status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tools, filters]);

  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category));
    return Array.from(cats);
  }, [tools]);

  const handleSaveTool = (tool: Tool) => {
    if (editingTool) {
      setTools(tools.map(t => t.id === tool.id ? tool : t));
    } else {
      setTools([...tools, tool]);
    }
    setIsFormOpen(false);
    setEditingTool(undefined);
  };

  const handleDeleteTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by tool name, description or tags..." 
            className="pl-10 bg-secondary/50 border-white/5 focus-visible:ring-primary"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select value={filters.category} onValueChange={(val) => setFilters({...filters, category: val})}>
            <SelectTrigger className="w-[160px] bg-secondary/50 border-white/5">
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val as any})}>
            <SelectTrigger className="w-[140px] bg-secondary/50 border-white/5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="obsolete">Obsolete</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => { setEditingTool(undefined); setIsFormOpen(true); }} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Tool
          </Button>
        </div>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onEdit={handleEditTool}
              onDelete={handleDeleteTool}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-effect rounded-xl border-dashed border-2">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-headline font-medium text-muted-foreground">No tools found</h3>
          <p className="text-muted-foreground max-w-xs mt-2">
            The tool catalog is currently empty. Register your first resource to begin.
          </p>
          <Button variant="outline" className="mt-6 border-primary/20 text-primary" onClick={() => setFilters({search: '', category: 'all', status: 'all'})}>
            Clear All Filters
          </Button>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              {editingTool ? 'Edit Tool Information' : 'Register New Tool'}
            </DialogTitle>
            <DialogDescription>
              {editingTool 
                ? 'Update specifications and status for this resource.' 
                : 'Enter the details of the new tool. Use AI to automatically categorize based on description.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ToolForm 
              tool={editingTool} 
              onSave={handleSaveTool} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
