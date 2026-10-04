"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  BrainCircuit, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Maximize, 
  Clock, 
  ShieldCheck, 
  Box, 
  Cpu, 
  Palette,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { quoteAnalysis, type QuoteAnalysisOutput } from '@/ai/flows/quote-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Machine } from '@/lib/types';

export function SmartQuotingAssistant({ machines }: { machines: Machine[] }) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [partName, setPartName] = useState('');
  const [description, setDescription] = useState('');
  const [operations, setOperations] = useState([{ name: '', costPerHour: 0 }]);
  const [result, setResult] = useState<QuoteAnalysisOutput | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await quoteAnalysis({ partName, modelDescription: description, operations });
      if (res.success) {
        setResult(res.data);
        toast({ title: "Analysis Synchronized", description: "Industrial estimations calculated." });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-accent font-bold text-xs uppercase tracking-[0.3em]">
            <BrainCircuit className="h-4 w-4" />
            AI Intelligence Hub
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">Smart Quoting Assistant</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Part Identity</Label>
                <Input placeholder="e.g. Spindle Block TC1" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={partName} onChange={(e) => setPartName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Model Geometry & Features</Label>
                <Textarea placeholder="Describe raw material, complexity, and color coding..." className="min-h-[150px] bg-slate-50 border-none rounded-2xl" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <Button disabled={isAnalyzing} onClick={handleAnalyze} className="w-full h-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs shadow-2xl flex gap-4">
              {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Execute AI Analysis Protocol
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-5">
          {result ? (
            <Card className="bg-[#001F3D] text-white p-10 border-none shadow-2xl rounded-[2.5rem] space-y-10 animate-in zoom-in-95">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight">{partName}</h3>
                <Badge className="bg-accent text-white border-none text-[10px] uppercase font-bold">{result.complexityScore}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2">Raw Material</p>
                    <p className="text-lg font-bold">{result.rawMaterial.length}x{result.rawMaterial.width}x{result.rawMaterial.height}mm</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2">Lead Time</p>
                    <p className="text-lg font-bold text-accent">{result.leadTimeWithBuffer}h</p>
                 </div>
              </div>
              <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Estimated Cost</p>
                  <p className="text-4xl font-display font-black text-white">₹ {result.totalMachiningCost.toLocaleString()}</p>
                </div>
                <Button className="bg-white text-[#001F3D] hover:bg-white/90 rounded-xl font-bold uppercase text-[10px]">Export Quote</Button>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center border-4 border-dashed border-slate-200 rounded-[2.5rem] p-20">
               <BrainCircuit className="h-16 w-16 mb-6 text-slate-300" />
               <p className="text-xs font-bold uppercase tracking-widest">Awaiting Analysis Protocol</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
