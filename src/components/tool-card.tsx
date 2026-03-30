
"use client";

import Image from 'next/image';
import { Tool } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Cpu, Tag, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
}

export function ToolCard({ tool, onEdit, onDelete }: ToolCardProps) {
  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300 tool-card-gradient border-border/40">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={tool.imageUrl}
          alt={tool.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={tool.status === 'active' ? 'default' : 'secondary'} className="bg-background/80 backdrop-blur-sm border-white/10">
            {tool.status}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-xl font-headline font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <p className="text-xs font-code text-muted-foreground mt-1 uppercase tracking-wider">
              {tool.technicalId}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(tool)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(tool.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
          {tool.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-md">
            <Box className="h-3 w-3" />
            {tool.category}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0 border-white/10 text-muted-foreground">
              <Tag className="h-2 w-2 mr-1" />
              {tag}
            </Badge>
          ))}
          {tool.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center">+{tool.tags.length - 3} more</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
