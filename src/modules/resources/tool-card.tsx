"use client";

import Image from 'next/image';
import { Tool } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Tag, Box } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
}

export function ToolCard({ tool, onEdit, onDelete }: ToolCardProps) {
  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300 border-slate-200 shadow-sm rounded-2xl bg-white">
      <div className="relative h-48 w-full overflow-hidden">
        <Image src={tool.imageUrl} alt={tool.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 right-2">
          <Badge className={cn("text-[9px] font-bold uppercase", tool.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
            {tool.status}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#001F3D] uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{tool.name}</h3>
            <p className="text-[10px] font-code text-slate-400 mt-1 uppercase tracking-wider">{tool.technicalId}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary" onClick={() => onEdit(tool)}><Edit2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => onDelete(tool.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{tool.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-100 text-slate-400 bg-slate-50">
            <Box className="h-2 w-2 mr-1.5" /> {tool.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }
