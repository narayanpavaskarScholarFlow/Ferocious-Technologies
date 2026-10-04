"use client";

import { useState, useMemo, useEffect } from 'react';
import { Tool, CatalogFilter } from '@/lib/types';
import { ToolCard } from '@/modules/resources/tool-card';
import { ToolForm } from '@/modules/resources/tool-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Box, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ToolCatalog() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | undefined>();
  const [filters, setFilters] = useState<CatalogFilter>({
    search: '', category: 'all', status: 'all',
  });

  useEffect(() => { setTools([]); }, []);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          tool.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'all' || tool.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [tools, filters]);

  const handleSaveTool = (tool: Tool) => {
    if (editingTool) setTools(tools.map(t => t.id === tool.id ? tool : t));
    else setTools([...tools, tool]);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center px-2">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search Catalog..." className="pl-10 h-11 bg-white border-slate-200 rounded-xl" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
         </div>
         <Button className="bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] h-11 px-8" onClick={() => { setEditingTool(undefined); setIsFormOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Add Resource</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} onEdit={setEditingTool} onDelete={(id)=>setTools(tools.filter(t=>t.id!==id))} />
        ))}
        {filteredTools.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-30">
             <Box className="h-16 w-16 mx-auto mb-4" />
             <p className="text-xs font-bold uppercase tracking-widest">Resource Matrix Offline</p>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-[2rem]">
           <ToolForm tool={editingTool} onSave={handleSaveTool} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
