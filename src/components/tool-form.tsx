"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tool, ToolStatus } from '@/lib/types';
import { aiToolCategorization } from '@/ai/flows/ai-tool-categorization-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sparkles, Loader2, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is too short." }),
  description: z.string().min(10, { message: "Provide a more detailed description." }),
  category: z.string().min(1, { message: "Category is required." }),
  tags: z.string(),
  status: z.enum(['active', 'obsolete', 'maintenance', 'fault']),
  technicalId: z.string().min(3, { message: "Technical ID is required." }),
  imageUrl: z.string().url({ message: "Provide a valid image URL." }),
});

interface ToolFormProps {
  tool?: Tool;
  onSave: (tool: Tool) => void;
  onCancel: () => void;
}

export function ToolForm({ tool, onSave, onCancel }: ToolFormProps) {
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

  // Handle generation of random ID after mount to avoid hydration mismatch
  useEffect(() => {
    if (!tool) {
      const randomId = `TR-${Math.floor(Math.random() * 9000) + 1000}`;
      form.setValue('technicalId', randomId);
    }
  }, [tool, form]);

  const handleAICategorize = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 10) {
      toast({
        title: "More info needed",
        description: "Please write at least 10 characters in description for the AI to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsCategorizing(true);
    try {
      const result = await aiToolCategorization({ description });
      if (result.categories.length > 0) {
        form.setValue('category', result.categories[0]);
      }
      form.setValue('tags', result.tags.join(', '));
      toast({
        title: "Smart Categorization Complete",
        description: `Suggested category: ${result.categories[0]} and ${result.tags.length} tags.`,
      });
    } catch (error) {
      toast({
        title: "AI Analysis Failed",
        description: "Could not categorize tool. Please try again or manual enter.",
        variant: "destructive"
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const toolData: Tool = {
      id: tool?.id || Math.random().toString(36).substr(2, 9),
      name: values.name,
      description: values.description,
      category: values.category as any,
      tags: values.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      status: values.status,
      technicalId: values.technicalId,
      imageUrl: values.imageUrl,
      createdAt: tool?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(toolData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tool Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Laser Cutter X1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technicalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technical ID</FormLabel>
                <FormControl>
                  <Input placeholder="TR-001" className="font-code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-2">
                <FormLabel>Description</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2 border-primary/20 hover:bg-primary/10 text-primary"
                  onClick={handleAICategorize}
                  disabled={isCategorizing}
                >
                  {isCategorizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Smart Categorize
                </Button>
              </div>
              <FormControl>
                <Textarea 
                  placeholder="Describe the tool's functions, technical specs, and usage..." 
                  className="min-h-[120px] resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                AI uses this description to suggest categories and tags.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Fabrication" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tool status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="obsolete">Obsolete</SelectItem>
                    <SelectItem value="fault">Fault</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="laser, cutting, heavy-duty" {...field} />
              </FormControl>
              <div className="flex flex-wrap gap-1 mt-2">
                {field.value.split(',').filter(t => t.trim() !== '').map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag.trim()}</Badge>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Save Tool
          </Button>
        </div>
      </form>
    </Form>
  );
}
