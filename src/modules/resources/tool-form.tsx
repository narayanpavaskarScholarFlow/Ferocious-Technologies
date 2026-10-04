"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tool } from '@/lib/types';
import { aiToolCategorization } from '@/ai/flows/ai-tool-categorization-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sparkles, Loader2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(1),
  tags: z.string(),
  status: z.enum(['active', 'obsolete', 'maintenance', 'fault']),
  technicalId: z.string().min(3),
  imageUrl: z.string().url(),
});

export function ToolForm({ tool, onSave, onCancel }: { tool?: Tool; onSave: (tool: Tool) => void; onCancel: () => void }) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tool?.name || '',
      description: tool?.description || '',
      category: tool?.category || '',
      tags: tool?.tags.join(', ') || '',
      status: tool?.status || 'active',
      technicalId: tool?.technicalId || 'TR-XXXX',
      imageUrl: tool?.imageUrl || 'https://picsum.photos/seed/tool/600/400',
    },
  });

  const handleAICategorize = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 10) return;
    setIsCategorizing(true);
    try {
      const result = await aiToolCategorization({ description });
      if (result.categories.length > 0) form.setValue('category', result.categories[0]);
      form.setValue('tags', result.tags.join(', '));
      toast({ title: "Smart Categorization Complete" });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const toolData: Tool = {
      id: tool?.id || Math.random().toString(36).substr(2, 9),
      ...values,
      tags: values.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      createdAt: tool?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(toolData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tool Name</FormLabel><FormControl><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="technicalId" render={({ field }) => (
            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Technical ID</FormLabel><FormControl><Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold uppercase" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center mb-2">
              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Description Matrix</FormLabel>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 text-primary hover:bg-primary/5 font-bold uppercase text-[8px]" onClick={handleAICategorize} disabled={isCategorizing}>
                {isCategorizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Smart Protocol
              </Button>
            </div>
            <FormControl><Textarea className="min-h-[120px] bg-slate-50 border-none rounded-2xl font-medium" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="ghost" className="h-12 px-8 rounded-xl uppercase font-bold text-[10px]" onClick={onCancel}>Abort</Button>
          <Button type="submit" className="h-12 px-10 bg-[#001F3D] hover:bg-black text-white rounded-xl uppercase font-bold text-[10px] shadow-xl flex gap-3"><Save className="h-4 w-4" /> Commit Resource</Button>
        </div>
      </form>
    </Form>
  );
}
