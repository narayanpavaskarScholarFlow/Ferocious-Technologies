"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table as UITable, 
  TableBody as UITableBody, 
  TableCell as UITableCell, 
  TableHead as UITableHead, 
  TableHeader as UITableHeader, 
  TableRow as UITableRow 
} from '@/components/ui/table';
import { 
  Landmark, 
  FileText, 
  Target, 
  Plus, 
  Trash2, 
  Save, 
  Edit3, 
  Maximize2, 
  Calculator,
  CalendarDays,
  Printer,
  ChevronRight,
  TrendingUp,
  Building2,
  DollarSign,
  Type,
  Baseline,
  Highlighter,
  ChevronDown,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  TableProperties,
  Heading1,
  AlignJustify,
  ZoomIn,
  ZoomOut,
  X,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Tiptap Imports for Rich Text
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapTable from '@tiptap/extension-table';
import TiptapTableRow from '@tiptap/extension-table-row';
import TiptapTableCell from '@tiptap/extension-table-cell';
import TiptapTableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import TiptapImage from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
});

const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      bulletType: {
        default: 'disc',
        parseHTML: element => element.getAttribute('data-bullet-type'),
        renderHTML: attributes => {
          return { 'data-bullet-type': attributes.bulletType }
        },
      },
    }
  },
});

const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      listType: {
        default: 'decimal',
        parseHTML: element => element.getAttribute('data-list-type'),
        renderHTML: attributes => {
          return { 'data-list-type': attributes.listType }
        },
      },
    }
  },
});

const REPORT_SEQUENCE = [
  { id: 'coverDetails', label: '00. Cover Metadata' },
  { id: 'executiveSummary', label: '01. Executive Summary' },
  { id: 'aboutCompany', label: '02. About Company' },
  { id: 'visionMission', label: '03. Vision & Mission' },
  { id: 'promoterProfile', label: '04. Promoter Profile' },
  { id: 'projectDetails', label: '05. Project Details' },
  { id: 'productServices', label: '06. Product & Services' },
  { id: 'marketAnalysis', label: '07. Market Analysis' },
  { id: 'swotAnalysis', label: '08. SWOT Analysis' },
  { id: 'businessModel', label: '09. Business Model' },
  { id: 'operationsPlan', label: '10. Operations Plan' },
  { id: 'layout', label: '11. Layout' },
  { id: 'locationAnalysis', label: '12. Location Analysis' },
  { id: 'orgStructure', label: '13. Organizational Structure' },
  { id: 'marketingStrategy', label: '14. Marketing Strategy' },
  { id: 'techIntegration', label: '15. Technology Integration' },
  { id: 'projectCost', label: '16. Project Cost' },
  { id: 'meansOfFinance', label: '17. Means of Finance' },
  { id: 'workingCapitalRequirement', label: '18. Working Capital' },
  { id: 'financialProjections', label: '19. Projections' },
  { id: 'cashFlowStatement', label: '20. Cash Flow' },
  { id: 'turnoverAnalysis', label: '21. Turnover Analysis' },
  { id: 'breakevenAnalysis', label: '22. Break-even Analysis' },
  { id: 'dscrMatrix', label: '23. DSCR Matrix' },
  { id: 'keyRatios', label: '24. Key Ratios' },
  { id: 'mpbfCalculation', label: '25. MPBF Calculation' },
  { id: 'amortizationSchedule', label: '26. Amortization' },
  { id: 'riskMitigation', label: '27. Risk & Mitigation' },
  { id: 'govtSchemes', label: '28. Government Schemes' },
  { id: 'licensesRegistrations', label: '29. Licenses' },
  { id: 'roadmap', label: '30. Roadmap' },
  { id: 'conclusion', label: '31. Conclusion' }
];

const FONT_FAMILIES = [
  { name: 'Standard Sans', value: 'Inter' },
  { name: 'Space Grotesk', value: 'Space Grotesk' },
  { name: 'Source Code', value: 'Source Code Pro' },
];

const FONT_SIZES = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'];

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: false, orderedList: false }),
      CustomBulletList, CustomOrderedList, ListItem, Underline,
      TextAlign.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList'] }),
      Link.configure({ openOnClick: false }), TiptapTable.configure({ resizable: true }),
      TiptapTableRow, TiptapTableCell, TiptapTableHeader, TiptapImage.configure({ inline: true, allowBase64: true }),
      TextStyle, Color, FontFamily, FontSize, Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-8 text-slate-700 leading-relaxed bg-white' } }
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <div className="bg-slate-950 text-white p-2 flex flex-wrap items-center gap-1 border-b border-slate-800 sticky top-0 z-50">
        <Button variant="ghost" size="icon" className={cn("h-7 w-7", editor.isActive('bold') && "bg-white/20")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className={cn("h-7 w-7", editor.isActive('italic') && "bg-white/20")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className={cn("h-7 w-7", editor.isActive('underline') && "bg-white/20")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-3.5 w-3.5" /></Button>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <Button variant="ghost" size="icon" className={cn("h-7 w-7", editor.isActive('bulletList') && "bg-white/20")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className={cn("h-7 w-7", editor.isActive('orderedList') && "bg-white/20")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export function LoanProjectHub({ brandLogo = '' }: { brandLogo?: string }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');
  const [activeEditingSection, setActiveEditingSection] = useState<string>('coverDetails');
  const [zoom, setZoom] = useState(1);

  const strategyRef = useMemoFirebase(() => doc(db, 'settings', 'loan_strategy'), [db]);
  const { data: savedStrategy } = useDoc<any>(strategyRef);

  const [foundationalData, setFormData] = useState<any>({
    projectName: 'Establishment of Precision VMC Facility',
    businessFirmName: 'Ferocious Tech',
    businessIndustry: 'Precision Engineering',
    executiveSummary: '<p>Initial summary matrix node...</p>',
    visionMission: '<p>Standard vision and mission...</p>',
    coverTitleFontSize: 60,
    coverTitleColor: '#001F3D',
  });

  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    REPORT_SEQUENCE.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );

  useEffect(() => {
    if (savedStrategy) {
      if (savedStrategy.foundationalData) setFormData(savedStrategy.foundationalData);
      if (savedStrategy.checklist) setChecklist(savedStrategy.checklist);
    }
  }, [savedStrategy]);

  const handleSaveStrategy = () => {
    setDocumentNonBlocking(strategyRef, { foundationalData, checklist, updatedAt: new Date().toISOString() }, { merge: true });
    toast({ title: "Strategy Synchronized", description: "All project nodes committed." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Landmark className="h-4 w-4" /> Strategic Hub
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">Loan Project Hub</h2>
        </div>
        <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleSaveStrategy}><Save className="h-4 w-4" /> Save Strategy</Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">DPR Constructor</TabsTrigger>
          <TabsTrigger value="display" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Preview Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="m-0 space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                 <Card className="p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] min-h-[600px] space-y-8">
                    <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">{REPORT_SEQUENCE.find(s=>s.id === activeEditingSection)?.label}</h3>
                    <RichTextEditor value={foundationalData[activeEditingSection] || ""} onChange={(val)=>setFormData({...foundationalData, [activeEditingSection]: val})} />
                 </Card>
              </div>
              <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] h-fit sticky top-24">
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-8">Report Matrix</h3>
                 <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                        {REPORT_SEQUENCE.map((item) => (
                          <div key={item.id} className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer", activeEditingSection === item.id ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10")} onClick={() => setActiveEditingSection(item.id)}>
                              <Checkbox checked={checklist[item.id]} onCheckedChange={() => setChecklist({...checklist, [item.id]: !checklist[item.id]})} />
                              <span className={cn("text-[10px] font-bold uppercase tracking-widest", activeEditingSection === item.id ? "text-white" : "text-white/60")}>{item.label}</span>
                          </div>
                        ))}
                    </div>
                 </ScrollArea>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="display" className="m-0 flex flex-col items-center">
           <div className="w-full bg-slate-900/5 p-8 border-b border-slate-200/60 sticky top-16 z-50 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-xl border border-slate-200">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                  <span className="text-[10px] font-bold font-code w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
              </div>
              <Button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-12 font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print DPR Matrix
              </Button>
           </div>
           <div className="w-full overflow-x-auto pb-20 px-4">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm' }} className="mx-auto bg-white shadow-2xl p-20 min-h-[297mm]">
                {REPORT_SEQUENCE.map(s => checklist[s.id] && (
                  <div key={s.id} className="mb-20 space-y-8">
                    <h2 className="text-3xl font-display font-bold text-primary tracking-tight uppercase border-b-2 border-primary pb-2">{s.label}</h2>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: foundationalData[s.id] || '<p class="text-slate-300 italic">Node metadata empty...</p>' }} />
                  </div>
                ))}
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
