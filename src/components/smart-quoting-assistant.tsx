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
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { quoteAnalysis, type QuoteAnalysisOutput } from '@/ai/flows/quote-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Machine } from '@/lib/types';

interface SmartQuotingAssistantProps {
  machines: Machine[];
}

const INITIAL_OPERATIONS = [
  { name: '', costPerHour: 0 },
];

const STANDARD_COLOR_CODES = [
  { color: '#3b82f6', name: 'Blue', op: 'Milling / Surface' },
  { color: '#06b6d4', name: 'Cyan', op: 'Reaming / Precision' },
  { color: '#ef4444', name: 'Red', op: 'Tapping / Threads' },
  { color: '#22c55e', name: 'Green', op: 'Grinding' },
  { color: '#eab308', name: 'Yellow', op: 'Drilling' },
  { color: '#d946ef', name: 'Magenta', op: 'EDM / Wire Cut' },
  { color: '#f97316', name: 'Orange', op: 'Turning' },
];

export function SmartQuotingAssistant({ machines }: SmartQuotingAssistantProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [partName, setPartName] = useState('');
  const [description, setDescription] = useState('');
  const [operations, setOperations] = useState(INITIAL_OPERATIONS);
  const [result, setResult] = useState<QuoteAnalysisOutput | null>(null);

  const handleAddOp = () => {
    setOperations([...operations, { name: '', costPerHour: 0 }]);
  };

  const updateOp = (idx: number, field: string, value: any) => {
    const newOps = [...operations];
    (newOps[idx] as any)[field] = field === 'costPerHour' ? parseFloat(value) || 0 : value;
    
    if (field === 'name') {
      const machine = machines.find(m => m.name === value);
      if (machine) {
        newOps[idx].costPerHour = machine.costPerHour;
      }
    }
    
    setOperations(newOps);
  };

  const removeOp = (idx: number) => {
    setOperations(operations.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUploaded(true);
      toast({ title: "Model Metadata Cached", description: `${file.name} sequence initialized.` });
    }
  };

  const handleAnalyze = async () => {
    if (!description || !partName || operations.some(o => !o.name)) {
      toast({ 
        variant: "destructive", 
        title: "Protocol Incomplete", 
        description: "Please provide Part Name, Description, and valid Operations Matrix." 
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const result = await quoteAnalysis({
        partName,
        modelDescription: description,
        operations
      });

      if (result.success) {
        setResult(result.data);
        toast({ title: "Analysis Synchronized", description: "Industrial estimations calculated successfully." });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Analysis Protocol Error", 
          description: result.error 
        });
      }
    } catch (error: any) {
      console.error('Critical Analysis Failure:', error);
      toast({ 
        variant: "destructive", 
        title: "Critical System Error", 
        description: "The analysis sequence encountered a fatal error. Check network and retry."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-accent font-bold text-xs uppercase tracking-[0.3em]">
            <BrainCircuit className="h-4 w-4" />
            AI Intelligence Gateway
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D]">
            Smart Quoting <span className="text-slate-400 font-medium">Assistant</span>
          </h2>
          <p className="text-muted-foreground font-medium">Predictive cost estimation and material analysis from STEP/IGS metadata.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Analysis Engine v1.2</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="p-8 bg-white border-slate-200/60 shadow-xl rounded-[2rem] space-y-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                <Box className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Part Specification</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Part Name / ID</Label>
                  <Input 
                    placeholder="e.g. Spindle Block TC1" 
                    className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Upload Model (STEP/IGS)</Label>
                  <div className="relative">
                    <input 
                      type="file" 
                      id="cad-upload" 
                      className="hidden" 
                      accept=".step,.stp,.igs,.iges"
                      onChange={handleFileUpload}
                    />
                    <label 
                      htmlFor="cad-upload"
                      className={cn(
                        "h-12 w-full flex items-center gap-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all border border-dashed",
                        fileUploaded ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-primary/50"
                      )}
                    >
                      <Upload className="h-4 w-4" />
                      {fileUploaded ? fileName : "Attach CAD Metadata"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Model Complexity & Color Coding</Label>
                  <Badge variant="outline" className="text-[8px] font-bold uppercase gap-1.5 border-amber-200 text-amber-600 bg-amber-50">
                    <AlertCircle className="h-2.5 w-2.5" /> Required for Precise Costing
                  </Badge>
                </div>
                <Textarea 
                  placeholder="e.g. Aluminum 6061 Block. Blue faces are milling, Red holes are tapping. High complexity pockets." 
                  className="min-h-[120px] bg-slate-50 border-none rounded-2xl text-xs font-medium resize-none focus-visible:ring-primary/20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-[9px] text-slate-400 font-medium italic">
                  * Tip: Detailed descriptions of setup requirements help AI calculate billable hours accurately.
                </p>
              </div>
            </div>

            <div className="space-y-8 relative z-10 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                  <Cpu className="h-5 w-5 text-accent" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Cost Matrix</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={handleAddOp} className="text-[10px] font-bold uppercase gap-2 text-primary hover:bg-primary/5">
                  <Plus className="h-3.5 w-3.5" /> Append Row
                </Button>
              </div>

              <div className="space-y-4">
                {operations.map((op, idx) => (
                  <div key={idx} className="flex gap-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[8px] font-bold uppercase text-slate-400">Operation Included (from Assets)</Label>
                      <Select value={op.name} onValueChange={(val) => updateOp(idx, 'name', val)}>
                        <SelectTrigger className="h-10 bg-white border-none rounded-lg text-xs font-bold shadow-sm">
                          <SelectValue placeholder="Select machine..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                          {machines.map(m => (
                            <SelectItem key={m.id} value={m.name} className="text-xs font-bold uppercase">
                              {m.name} (₹{m.costPerHour}/hr)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-40 space-y-2">
                      <Label className="text-[8px] font-bold uppercase text-slate-400">Rate (₹/hr)</Label>
                      <Input 
                        type="number"
                        placeholder="0.00" 
                        value={op.costPerHour}
                        onChange={(e) => updateOp(idx, 'costPerHour', e.target.value)}
                        className="h-10 bg-white border-none rounded-lg text-xs font-bold text-center shadow-sm"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeOp(idx)}
                      className="h-10 w-10 text-slate-200 hover:text-red-500 rounded-xl mb-[1px]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              className="w-full h-16 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs shadow-2xl shadow-primary/20 flex gap-4 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Synchronizing AI sequence...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Execute Smart Analysis Protocol
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          {result ? (
            <Card className="bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-10 space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-accent text-white border-none text-[8px] font-bold uppercase px-3 mb-2">Analysis Result</Badge>
                    <h3 className="text-2xl font-display font-bold tracking-tight uppercase truncate max-w-[200px]">{partName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Complexity</p>
                    <p className="text-lg font-bold text-accent">{result.complexityScore}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      <Maximize className="h-3.5 w-3.5 text-accent" />
                      Raw Material Block
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-display font-bold">{result.rawMaterial.length} × {result.rawMaterial.width} × {result.rawMaterial.height}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Millimeters (MM)</p>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-[8px] uppercase">{result.rawMaterial.materialType}</Badge>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      Lead Time Buffer
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-display font-bold text-accent">{result.leadTimeWithBuffer}h</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Inc. +2h Buffer</p>
                    </div>
                    <p className="text-[8px] text-white/20 font-bold uppercase italic">Base: {result.totalLeadTime}h</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Operation Color Analysis</p>
                    <Palette className="h-3.5 w-3.5 text-white/20" />
                  </div>
                  <div className="space-y-3">
                    {result.estimations.map((est, i) => (
                      <div key={i} className="flex flex-col gap-2 py-4 px-5 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {est.hexColor && (
                              <div 
                                className="h-3 w-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                                style={{ backgroundColor: est.hexColor }} 
                              />
                            )}
                            <span className="text-xs font-bold text-white/90">{est.operationName}</span>
                          </div>
                          <span className="text-sm font-bold font-code text-accent">₹ {est.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                          <div className="flex gap-2">
                            <span className="text-white/40">Setup: {est.setupHours}h</span>
                            <span className="text-white/40">Mach: {est.machiningHours}h</span>
                          </div>
                          <span className="text-white/60">Total: {est.totalOperationHours} Hours</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total Machining Cost</p>
                    <p className="text-4xl font-display font-bold text-white">₹ {result.totalMachiningCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <Button className="bg-white hover:bg-white/90 text-[#001F3D] rounded-xl font-bold uppercase text-[9px] tracking-widest h-12 px-6 flex gap-2">
                    Export to Quote <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="bg-accent h-1.5 w-full overflow-hidden">
                <div className="bg-white/20 h-full animate-pulse" />
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-32 opacity-30 text-center border-4 border-dashed border-slate-200 rounded-[2.5rem]">
              <div className="p-8 bg-slate-50 rounded-full mb-6">
                <Palette className="h-16 w-16 text-slate-300" />
              </div>
              <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Operation Identification</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto font-medium leading-relaxed">
                {isAnalyzing 
                  ? "AI sequence initialized. Analyzing industrial complexity and applying setup buffers..."
                  : "Provide a detailed geometry and material description. AI analysis factors in setup times and feature complexity for ₹ accuracy."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Standard CAD Color Protocol Sheet */}
      <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
            <Palette className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Standard CAD Color Protocol</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Global reference for model geometry identification</p>
            </div>
          </div>

          <div className="max-w-md p-4 bg-slate-50/50 border border-slate-200 rounded-2xl flex gap-4 items-start animate-in fade-in slide-in-from-right-2 duration-700">
            <div className="p-2 bg-primary rounded-lg text-white shrink-0 shadow-lg shadow-primary/10">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Commercial Safety Rule</p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                The system automatically applies a <span className="font-bold text-accent">+2 hour operational buffer</span> to the total lead time. AI estimations now explicitly include <span className="font-bold text-[#001F3D]">billable setup times</span> per operation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {STANDARD_COLOR_CODES.map((item) => (
            <div key={item.name} className="flex flex-col items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all text-center group">
              <div 
                className="h-8 w-8 rounded-full mb-3 shadow-lg transform group-hover:scale-110 transition-transform" 
                style={{ backgroundColor: item.color, border: '2px solid white' }} 
              />
              <p className="text-[10px] font-bold text-slate-900 uppercase">{item.name}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-1 leading-tight">{item.op}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
