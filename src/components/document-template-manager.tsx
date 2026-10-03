"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Settings2, 
  Layout, 
  Palette, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight, 
  Printer, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut,
  Building2,
  Mail,
  Phone,
  Globe,
  Landmark,
  Image as ImageIcon,
  QrCode,
  Check,
  Type,
  AlignLeft,
  AlignCenter,
  Columns
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Letterhead, PrintTemplate } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const DOCUMENT_TYPES = [
  "Quotation", "Sales Order", "Sales Invoice", "Purchase Order", 
  "Delivery Challan", "Proforma", "Credit Note", "Debit Note", "General Letter"
];

const LAYOUT_OPTIONS = [
  { id: 'classic', label: 'Classic Business', desc: 'Standard formal ERP layout' },
  { id: 'corporate', label: 'Corporate Professional', desc: 'Modern high-fidelity design' },
  { id: 'industrial', label: 'Industrial Manufacturing', desc: 'High-density technical matrix' },
  { id: 'compact', label: 'Compact ERP Format', desc: 'Optimized for paper saving' },
];

export function DocumentTemplateManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [zoom, setZoom] = useState(0.8);
  
  // Letterhead State
  const [letterheads, setLetterheads] = useState<Letterhead[]>([
    {
      id: 'lh-1',
      name: 'Main Corporate Letterhead',
      companyName: 'Ferocious Tech',
      tagline: 'Precision Engineering & Tooling Excellence',
      address: 'Plot No. 45, Industrial Estate, Sector 12, Pune, MH 411026',
      contactNumber: '+91 98765 43210',
      email: 'contact@ferocious.tech',
      website: 'www.ferocious.tech',
      gstNumber: '27AAAAF0000A1Z5',
      headerLayout: 1,
      bankDetails: {
        bankName: 'HDFC Bank',
        accountNo: '50100012345678',
        ifscCode: 'HDFC0001234',
        branch: 'Industrial Estate Branch'
      },
      signatory: {
        name: 'Jayant Patil',
        designation: 'Authorized Signatory'
      }
    }
  ]);
  const [activeLetterheadId, setActiveLetterheadId] = useState('lh-1');
  const activeLetterhead = useMemo(() => letterheads.find(l => l.id === activeLetterheadId)!, [letterheads, activeLetterheadId]);

  // Templates State
  const [templates, setTemplates] = useState<PrintTemplate[]>([
    { id: 'tmp-1', name: 'Standard VMC Quote', documentType: 'Quotation', layout: 'industrial', letterheadId: 'lh-1', isDefault: true },
    { id: 'tmp-2', name: 'Corporate Invoice', documentType: 'Sales Invoice', layout: 'corporate', letterheadId: 'lh-1', isDefault: true }
  ]);

  const handleUpdateLetterhead = (field: string, value: any) => {
    setLetterheads(prev => prev.map(lh => 
      lh.id === activeLetterheadId ? { ...lh, [field]: value } : lh
    ));
  };

  const handleUpdateBank = (field: string, value: string) => {
    const updatedBank = { ...activeLetterhead.bankDetails!, [field]: value };
    handleUpdateLetterhead('bankDetails', updatedBank);
  };

  const handleSave = () => {
    toast({ title: "Architecture Synchronized", description: "All print and letterhead protocols committed to database." });
  };

  const LetterheadPreview = () => (
    <div 
      className="bg-white shadow-2xl origin-top mx-auto p-12 transition-all duration-500"
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        transform: `scale(${zoom})`,
        border: '1px solid #e2e8f0'
      }}
    >
      {/* Header Layouts */}
      <header className={cn(
        "border-b-2 border-slate-900 pb-10 mb-10",
        activeLetterhead.headerLayout === 1 && "flex justify-between items-start",
        activeLetterhead.headerLayout === 2 && "flex flex-col items-center text-center",
        activeLetterhead.headerLayout === 3 && "grid grid-cols-3 items-center",
        activeLetterhead.headerLayout === 4 && "flex flex-col items-start"
      )}>
        {activeLetterhead.headerLayout === 1 && (
          <>
            <div className="flex items-center gap-6">
               <div className="h-20 w-20 bg-slate-50 border rounded-2xl flex items-center justify-center p-2">
                 {activeLetterhead.logoUrl ? <img src={activeLetterhead.logoUrl} className="max-h-full max-w-full" /> : <ImageIcon className="h-8 w-8 text-slate-200" />}
               </div>
               <div>
                  <h1 className="text-3xl font-display font-black text-[#001F3D] uppercase tracking-tighter">{activeLetterhead.companyName}</h1>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{activeLetterhead.tagline}</p>
               </div>
            </div>
            <div className="text-right max-w-xs space-y-1">
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase">{activeLetterhead.address}</p>
               <div className="flex flex-col gap-0.5 mt-2">
                 <span className="text-[9px] font-bold text-slate-700">GST: {activeLetterhead.gstNumber}</span>
                 <span className="text-[9px] font-bold text-slate-700">{activeLetterhead.email} • {activeLetterhead.contactNumber}</span>
               </div>
            </div>
          </>
        )}

        {activeLetterhead.headerLayout === 2 && (
          <>
            <div className="h-24 w-24 bg-slate-50 border rounded-full flex items-center justify-center p-3 mb-6">
               {activeLetterhead.logoUrl ? <img src={activeLetterhead.logoUrl} className="max-h-full max-w-full" /> : <ImageIcon className="h-10 w-10 text-slate-200" />}
            </div>
            <h1 className="text-4xl font-display font-black text-[#001F3D] uppercase tracking-tighter">{activeLetterhead.companyName}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">{activeLetterhead.tagline}</p>
            <div className="mt-8 space-y-1">
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase max-w-md mx-auto">{activeLetterhead.address}</p>
               <p className="text-[9px] font-bold text-slate-700 mt-2">GSTIN: {activeLetterhead.gstNumber} • PAN: {activeLetterhead.panNumber}</p>
               <p className="text-[9px] font-bold text-primary">{activeLetterhead.website} • {activeLetterhead.email}</p>
            </div>
          </>
        )}

        {activeLetterhead.headerLayout === 3 && (
          <>
            <div className="flex items-center gap-4">
               <div className="h-16 w-16 bg-slate-50 border rounded-xl flex items-center justify-center p-2">
                  {activeLetterhead.logoUrl ? <img src={activeLetterhead.logoUrl} /> : <ImageIcon className="h-6 w-6 text-slate-200" />}
               </div>
            </div>
            <div className="text-center">
               <h1 className="text-2xl font-display font-black text-[#001F3D] uppercase">{activeLetterhead.companyName}</h1>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeLetterhead.tagline}</p>
            </div>
            <div className="flex justify-end">
               <div className="h-16 w-16 bg-slate-50 border rounded-lg flex items-center justify-center p-1">
                  <QrCode className="h-10 w-10 text-slate-200" />
               </div>
            </div>
          </>
        )}

        {activeLetterhead.headerLayout === 4 && (
          <div className="w-full bg-slate-900 text-white -mx-12 -mt-12 p-12 mb-10">
             <div className="flex justify-between items-center">
               <div>
                 <h1 className="text-5xl font-display font-black uppercase tracking-tighter">{activeLetterhead.companyName}</h1>
                 <p className="text-sm font-bold text-primary uppercase tracking-[0.3em] mt-2">{activeLetterhead.tagline}</p>
               </div>
               <div className="h-24 w-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center p-4">
                  {activeLetterhead.logoUrl ? <img src={activeLetterhead.logoUrl} /> : <ImageIcon className="h-8 w-8 text-white/20" />}
               </div>
             </div>
          </div>
        )}
      </header>

      {/* Simulated Document Body */}
      <main className="space-y-16 py-10 opacity-10">
         <div className="flex justify-between border-b-2 border-slate-100 pb-8">
            <div className="space-y-2"><div className="h-4 w-32 bg-slate-200 rounded" /><div className="h-3 w-48 bg-slate-100 rounded" /></div>
            <div className="text-right space-y-2"><div className="h-8 w-40 bg-slate-900 rounded ml-auto" /><div className="h-3 w-24 bg-slate-100 rounded ml-auto" /></div>
         </div>
         <div className="grid grid-cols-2 gap-10">
            <div className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl" />
            <div className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl" />
         </div>
         <div className="space-y-4">
            <div className="h-10 w-full bg-slate-900 rounded-xl" />
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 w-full bg-slate-50 border border-slate-100 rounded-lg" />)}
         </div>
      </main>

      {/* Footer Nodes */}
      <footer className="mt-auto border-t-2 border-slate-100 pt-10">
         <div className="grid grid-cols-2 gap-20">
            <div className="space-y-6">
               <div className="space-y-2">
                 <h4 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest border-b pb-1">Bank Settlement Protocol</h4>
                 <div className="text-[9px] text-slate-500 font-medium leading-relaxed">
                   <p>Bank: {activeLetterhead.bankDetails?.bankName}</p>
                   <p>A/C: {activeLetterhead.bankDetails?.accountNo}</p>
                   <p>IFSC: {activeLetterhead.bankDetails?.ifscCode}</p>
                 </div>
               </div>
               <div className="space-y-2">
                 <h4 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest border-b pb-1">Terms & Conditions</h4>
                 <p className="text-[8px] text-slate-400 leading-tight">1. Standard terms of trade apply. 2. Subject to industrial jurisdiction.</p>
               </div>
            </div>
            <div className="flex flex-col items-center justify-end text-center space-y-6">
               <div className="h-20 w-40 border-2 border-dashed border-slate-100 flex items-center justify-center relative">
                  <p className="text-[7px] text-slate-200 font-bold uppercase tracking-widest">DIGITAL_SEAL_NODE</p>
                  {activeLetterhead.signatory?.sealUrl && <img src={activeLetterhead.signatory.sealUrl} className="absolute inset-0 h-full w-full object-contain" />}
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-[#001F3D] uppercase">{activeLetterhead.signatory?.name}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{activeLetterhead.signatory?.designation}</p>
               </div>
            </div>
         </div>
         <div className="text-center mt-12 pt-4 border-t border-slate-50">
            <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.5em]">{activeLetterhead.companyName} • Institutional Verification v2.4</p>
         </div>
      </footer>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4 no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Printer className="h-4 w-4" /> System Administration
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">Document <span className="text-slate-400 font-medium">Templates</span></h2>
        </div>
        <div className="flex gap-4">
           <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleSave}><Save className="h-4 w-4" /> Save Architecture</Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full no-print">
        <div className="px-4">
          <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
            <TabsTrigger value="templates" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Template Gallery</TabsTrigger>
            <TabsTrigger value="letterhead" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Letterhead Designer</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="templates" className="m-0 space-y-12 px-4">
           {DOCUMENT_TYPES.map(type => (
             <div key={type} className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-900 rounded-lg text-white shadow-lg"><FileText className="h-4 w-4" /></div>
                      <h3 className="text-lg font-display font-bold text-[#001F3D] uppercase tracking-tight">{type} Protocol</h3>
                   </div>
                   <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-widest px-4 h-8">Active Selection: {templates.find(t => t.documentType === type)?.name || 'Default'}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {LAYOUT_OPTIONS.map(layout => {
                     const isDefault = templates.some(t => t.documentType === type && t.layout === layout.id && t.isDefault);
                     return (
                       <Card key={layout.id} className={cn(
                         "p-0 border-2 transition-all cursor-pointer group overflow-hidden rounded-[2rem] relative",
                         isDefault ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-slate-200 bg-white hover:border-primary/40"
                       )}>
                          <div className="aspect-[1/1.4] bg-slate-50 relative overflow-hidden flex flex-col p-4 gap-3">
                             {/* Abstract Layout Representation */}
                             <div className="h-6 w-full bg-slate-200 rounded" />
                             <div className="flex gap-4">
                                <div className="h-20 w-1/2 bg-slate-100 rounded-xl" />
                                <div className="h-20 w-1/2 bg-slate-100 rounded-xl" />
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded" />
                             <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{layout.id}_MATRIX</span>
                             </div>
                             {isDefault && (
                               <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full shadow-lg">
                                 <CheckCircle2 className="h-5 w-5" />
                               </div>
                             )}
                             <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Button className="rounded-full bg-white text-[#001F3D] font-bold text-[10px] uppercase px-6 h-10 shadow-2xl">Preview A4</Button>
                             </div>
                          </div>
                          <div className="p-6 space-y-2 bg-white">
                             <h4 className="font-bold text-[#001F3D] uppercase text-[11px] tracking-tight">{layout.label}</h4>
                             <p className="text-[9px] text-slate-400 font-medium leading-relaxed">{layout.desc}</p>
                             {!isDefault && (
                               <Button variant="ghost" className="w-full mt-4 h-9 rounded-xl border border-slate-100 text-[8px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-all">Set As Default</Button>
                             )}
                          </div>
                       </Card>
                     );
                   })}
                </div>
             </div>
           ))}
        </TabsContent>

        <TabsContent value="letterhead" className="m-0 space-y-10 px-4">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Designer Form */}
              <div className="lg:col-span-4 space-y-8">
                 <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-10">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                       <Settings2 className="h-5 w-5 text-primary" />
                       <h3 className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Design Parameters</h3>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-3">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Letterhead Name (Internal)</Label>
                          <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={activeLetterhead.name} onChange={(e) => handleUpdateLetterhead('name', e.target.value)} />
                       </div>
                       
                       <div className="space-y-4">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Header Logic Matrix</Label>
                          <div className="grid grid-cols-4 gap-3">
                             {[1, 2, 3, 4].map(l => (
                               <button 
                                 key={l} 
                                 onClick={() => handleUpdateLetterhead('headerLayout', l)}
                                 className={cn(
                                   "h-14 w-full rounded-xl border-2 transition-all flex items-center justify-center shadow-sm",
                                   activeLetterhead.headerLayout === l ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-white text-slate-300 hover:border-slate-200"
                                 )}
                               >
                                  {l === 1 && <AlignLeft className="h-5 w-5" />}
                                  {l === 2 && <AlignCenter className="h-5 w-5" />}
                                  {l === 3 && <Columns className="h-5 w-5" />}
                                  {l === 4 && <Type className="h-5 w-5" />}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-8 pt-6 border-t">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">Institutional Branding</Label>
                             <Input placeholder="Company Name" className="bg-white border-slate-200 rounded-xl font-bold text-xs" value={activeLetterhead.companyName} onChange={(e) => handleUpdateLetterhead('companyName', e.target.value)} />
                             <Input placeholder="Branding Tagline" className="bg-white border-slate-200 rounded-xl text-xs font-medium" value={activeLetterhead.tagline} onChange={(e) => handleUpdateLetterhead('tagline', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">Geospatial Identity</Label>
                             <Textarea placeholder="Full Registered Address" className="bg-white border-slate-200 rounded-xl text-xs font-medium min-h-[80px]" value={activeLetterhead.address} onChange={(e) => handleUpdateLetterhead('address', e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase text-slate-400">GSTIN Node</Label>
                                <Input className="bg-white border-slate-200 rounded-xl font-code text-xs uppercase" value={activeLetterhead.gstNumber} onChange={(e) => handleUpdateLetterhead('gstNumber', e.target.value)} />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase text-slate-400">PAN Registry</Label>
                                <Input className="bg-white border-slate-200 rounded-xl font-code text-xs uppercase" value={activeLetterhead.panNumber} onChange={(e) => handleUpdateLetterhead('panNumber', e.target.value)} />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6 pt-6 border-t">
                          <div className="flex items-center gap-3">
                             <Landmark className="h-4 w-4 text-emerald-600" />
                             <h4 className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest">Bank Settlement Matrix</h4>
                          </div>
                          <div className="space-y-2">
                             <Input placeholder="Bank Name" className="h-10 text-xs" value={activeLetterhead.bankDetails?.bankName} onChange={(e) => handleUpdateBank('bankName', e.target.value)} />
                             <Input placeholder="Account Number" className="h-10 text-xs font-code" value={activeLetterhead.bankDetails?.accountNo} onChange={(e) => handleUpdateBank('accountNo', e.target.value)} />
                             <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="IFSC Code" className="h-10 text-xs font-code uppercase" value={activeLetterhead.bankDetails?.ifscCode} onChange={(e) => handleUpdateBank('ifscCode', e.target.value)} />
                                <Input placeholder="Branch Node" className="h-10 text-xs" value={activeLetterhead.bankDetails?.branch} onChange={(e) => handleUpdateBank('branch', e.target.value)} />
                             </div>
                          </div>
                       </div>
                    </div>
                 </Card>
              </div>

              {/* High-Fidelity Preview Area */}
              <div className="lg:col-span-8 flex flex-col items-center">
                 <div className="w-full mb-10 flex justify-between items-center bg-slate-900/5 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center gap-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                          <span className="text-[10px] font-bold font-code text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom(Math.min(1.2, zoom + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                       </div>
                       <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[8px] uppercase px-4 py-1.5 h-fit tracking-widest">A4_Portrait_Matrix</Badge>
                    </div>
                    <div className="flex gap-4">
                       <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white font-bold uppercase text-[9px] tracking-widest gap-2 shadow-sm"><Maximize2 className="h-3.5 w-3.5" /> Full Scaler</Button>
                       <Button className="h-11 bg-primary text-white rounded-xl px-8 font-bold uppercase text-[9px] tracking-widest shadow-xl flex gap-3"><Printer className="h-3.5 w-3.5" /> Print Test Page</Button>
                    </div>
                 </div>

                 <ScrollArea className="w-full h-[1000px] bg-slate-100 rounded-[3rem] p-20 shadow-inner border-4 border-white/50 overflow-hidden scrollbar-hide">
                    <LetterheadPreview />
                 </ScrollArea>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
