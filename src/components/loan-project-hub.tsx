
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
  ImageIcon, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  Printer,
  TrendingUp,
  DollarSign,
  Save,
  Upload,
  Box,
  ShieldCheck,
  Zap,
  Calculator,
  Clock,
  Factory,
  Settings2,
  X,
  Receipt,
  FileBarChart,
  Edit3,
  Maximize2,
  Hammer,
  ShieldAlert,
  Info,
  LineChart as LineChartIcon,
  Check,
  Building2,
  CreditCard,
  Type,
  Baseline,
  Square,
  Highlighter,
  Palette,
  ArrowUpRight,
  ChevronDown,
  Download,
  Send,
  Coins,
  History,
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
  ZoomOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
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
import { Slider } from '@/components/ui/slider';

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

interface ProprietaryProduct {
  id: string;
  name: string;
  market: string;
  price: string;
  annualTargetQty: string;
  imageUrl: string;
  yoyGrowth?: number[];
}

interface IndustrialService {
  id: string;
  name: string;
  description: string;
  price: string;
  annualTargetQty: string;
  imageUrl: string;
  yoyGrowth?: number[];
}

interface MachineryItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  total: number;
}

interface LoanProjectHubProps {
  brandLogo?: string;
}

const REPORT_SEQUENCE = [
  { id: 'coverDetails', label: '00. Cover Metadata' },
  { id: 'executiveSummary', label: '01. Executive Summary' },
  { id: 'aboutCompany', label: '02. About Company' },
  { id: 'visionMission', label: '03. Vision & Mission' },
  { id: 'promoterProfile', label: '04. Promoter / Entrepreneur Profile' },
  { id: 'projectDetails', label: '05. Project Details' },
  { id: 'productServices', label: '06. Product & Services' },
  { id: 'marketAnalysis', label: '07. Market Analysis' },
  { id: 'swotAnalysis', label: '08. SWOT Analysis' },
  { id: 'businessModel', label: '09. Business Model' },
  { id: 'operationsPlan', label: '10. Operations / Production Plan' },
  { id: 'layout', label: '11. Layout' },
  { id: 'locationAnalysis', label: '12. Location Analysis' },
  { id: 'orgStructure', label: '13. Organizational Structure' },
  { id: 'marketingStrategy', label: '14. Marketing Strategy' },
  { id: 'techIntegration', label: '15. Technology Integration (Firebase)' },
  { id: 'projectCost', label: '16. Project Cost (One-Time Investment)' },
  { id: 'meansOfFinance', label: '17. Means of Finance' },
  { id: 'workingCapitalRequirement', label: '18. Working Capital Requirement' },
  { id: 'financialProjections', label: '19. Financial Projections' },
  { id: 'cashFlowStatement', label: '20. Cash Flow Statement' },
  { id: 'turnoverAnalysis', label: '21. Turnover Analysis' },
  { id: 'breakevenAnalysis', label: '22. Break-even Analysis' },
  { id: 'dscrMatrix', label: '23. DSCR Matrix' },
  { id: 'keyRatios', label: '24. Key Ratios' },
  { id: 'mpbfCalculation', label: '25. MPBF Calculation' },
  { id: 'amortizationSchedule', label: '26. Amortization Schedule' },
  { id: 'riskMitigation', label: '27. Risk & Mitigation' },
  { id: 'govtSchemes', label: '28. Government Schemes (CGTMSE)' },
  { id: 'licensesRegistrations', label: '29. Licenses & Registrations' },
  { id: 'roadmap', label: '30. Roadmap (5 Years)' },
  { id: 'conclusion', label: '31. Conclusion' }
];

const FONT_FAMILIES = [
  { name: 'Standard Sans', value: 'Inter' },
  { name: 'Space Grotesk', value: 'Space Grotesk' },
  { name: 'Source Code', value: 'Source Code Pro' },
  { name: 'Serif', value: 'serif' },
  { name: 'Monospace', value: 'monospace' },
];

const FONT_SIZES = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

const COLOR_PALETTE = [
  '#000000', '#475569', '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ffffff'
];

const BULLET_STYLES = [
  { label: 'None', value: 'none', char: 'None' },
  { label: 'Disc', value: 'disc', char: '•' },
  { label: 'Circle', value: 'circle', char: '○' },
  { label: 'Square', value: 'square', char: '■' },
  { label: 'Diamond', value: 'diamond', char: '◆' },
  { label: 'Matrix', value: 'diamond-matrix', char: '❖' },
  { label: 'Arrow', value: 'arrow', char: '➤' },
  { label: 'Check', value: 'check', char: '✓' },
];

const ORDERED_STYLES = [
  { label: '1. 2. 3.', value: 'decimal' },
  { label: 'a. b. b.', value: 'lower-alpha' },
  { label: 'i. ii. iii.', value: 'lower-roman' },
  { label: 'A. B. C.', value: 'upper-alpha' },
  { label: 'I. II. III.', value: 'upper-roman' },
];

const RichTextEditor = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      CustomBulletList,
      CustomOrderedList,
      ListItem,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList'] }),
      Link.configure({ openOnClick: false }),
      TiptapTable.configure({ resizable: true }),
      TiptapTableRow,
      TiptapTableCell,
      TiptapTableHeader,
      TiptapImage.configure({ inline: true, allowBase64: true }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-8 text-slate-700 font-medium leading-relaxed bg-white',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleFixtureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const setBulletStyle = (type: string) => {
    if (!editor) return;
    if (type === 'none') {
      editor.chain().focus().liftListItem('listItem').run();
      return;
    }
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run();
    }
    editor.chain().focus().updateAttributes('bulletList', { bulletType: type }).run();
  };

  const setOrderedStyle = (type: string) => {
    if (!editor) return;
    if (type === 'none') {
      editor.chain().focus().liftListItem('listItem').run();
      return;
    }
    if (!editor.isActive('orderedList')) {
      editor.chain().focus().toggleOrderedList().run();
    }
    editor.chain().focus().updateAttributes('orderedList', { listType: type }).run();
  };

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <div className="bg-slate-950 text-white p-2 flex flex-wrap items-center gap-1 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-2 px-2 text-white hover:bg-white/10 font-bold text-[9px] uppercase tracking-tighter">
                <Type className="h-3 w-3" /> Font
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-slate-900 border-slate-800 text-white p-1">
              {FONT_FAMILIES.map(f => (
                <DropdownMenuItem key={f.value} onClick={() => editor.chain().focus().setFontFamily(f.value).run()} className="rounded-lg h-8 text-[10px] font-medium hover:bg-white/10" style={{ fontFamily: f.value }}>
                  {f.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-2 px-2 text-white hover:bg-white/10 font-bold text-[9px] uppercase">
                Size
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-20 bg-slate-900 border-slate-800 text-white p-1">
              {FONT_SIZES.map(s => (
                <DropdownMenuItem key={s} onClick={() => (editor.chain().focus() as any).setFontSize(s).run()} className="rounded-lg h-7 text-[10px] font-bold text-center">
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("h-7 gap-1 px-1 text-white hover:bg-white/10", editor.isActive('bulletList') && "bg-white/20")}>
                <List className="h-3.5 w-3.5" />
                <ChevronDown className="h-2 w-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-slate-900 border-slate-800 p-2">
              <DropdownMenuLabel className="text-[9px] uppercase font-bold text-white/40 mb-2">Bullet Library</DropdownMenuLabel>
              <div className="grid grid-cols-4 gap-2">
                {BULLET_STYLES.map(s => (
                  <button 
                    key={s.value} 
                    type="button"
                    onClick={() => setBulletStyle(s.value)}
                    className="h-12 w-full flex flex-col items-center justify-center rounded-lg border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-lg font-bold text-white group-hover:scale-125 transition-transform">{s.char}</span>
                    <span className="text-[7px] uppercase mt-1 text-white/40">{s.label}</span>
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("h-7 gap-1 px-1 text-white hover:bg-white/10", editor.isActive('orderedList') && "bg-white/20")}>
                <ListOrdered className="h-3.5 w-3.5" />
                <ChevronDown className="h-2 w-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-slate-900 border-slate-800 p-1">
              <DropdownMenuLabel className="text-[9px] uppercase font-bold text-white/40 mb-1 px-2">Numbering Library</DropdownMenuLabel>
              {ORDERED_STYLES.map(s => (
                <DropdownMenuItem key={s.value} onClick={() => setOrderedStyle(s.value)} className="rounded-lg h-9 text-[10px] font-bold uppercase gap-3 hover:bg-white/10">
                   <span className="text-primary font-code">{s.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
          <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-white hover:bg-white/10", editor.isActive('bold') && "bg-white/20")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-white hover:bg-white/10", editor.isActive('italic') && "bg-white/20")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-white hover:bg-white/10", editor.isActive('underline') && "bg-white/20")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" title="Text Color">
                <Baseline className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-slate-900 border-slate-800 p-2">
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_PALETTE.map(c => (
                  <button key={c} type="button" onClick={() => editor.chain().focus().setColor(c).run()} className="h-5 w-full rounded-md border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" title="Box / Highlight Color">
                <Highlighter className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-slate-900 border-slate-800 p-2">
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_PALETTE.map(c => (
                  <button key={c} type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} className="h-5 w-full rounded-md border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
          <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-white hover:bg-white/10", editor.isActive('heading', { level: 1 }) && "bg-white/20")} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-white hover:bg-white/10", editor.isActive({ textAlign: 'justify' }) && "bg-white/20")} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
            <AlignJustify className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" title="Table Matrix">
                <TableProperties className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-slate-900 border-slate-800 text-white p-1">
              <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="rounded-lg h-8 text-[9px] font-bold uppercase gap-2 hover:bg-white/10"><Plus className="h-2.5 w-2.5" /> Insert Matrix</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()} className="rounded-lg h-8 text-[9px] font-bold uppercase hover:bg-white/10">Add Row</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} className="rounded-lg h-8 text-[9px] font-bold uppercase hover:bg-white/10">Add Col</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" title="Insert Fixture" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFixtureUpload} />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="tiptap-editor-container" />
    </div>
  );
};

export function LoanProjectHub({ brandLogo = '' }: LoanProjectHubProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');
  const [activeEditingSection, setActiveEditingSection] = useState<string>('coverDetails');
  const [editingSectionInPreview, setEditingSectionInPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isCostBreakupOpen, setIsCostBreakupOpen] = useState(false);

  const strategyRef = useMemoFirebase(() => doc(db, 'settings', 'loan_strategy'), [db]);
  const { data: savedStrategy } = useDoc<any>(strategyRef);

  const initialChecklist: Record<string, boolean> = {};
  REPORT_SEQUENCE.forEach(item => { initialChecklist[item.id] = true; });
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);

  const [foundationalData, setFormData] = useState<any>({
    projectName: 'Establishment of High-Precision VMC Tool Room',
    reportMainTitle: 'Techno-Economic Feasibility Analysis',
    reportSubTitle: 'Detailed Project Report (DPR)',
    businessFirmName: 'Ferocious Tech',
    businessIndustry: 'Precision Engineering & Tool Manufacturing',
    natureOfBusiness: 'Design and manufacturing of high-precision moulds, dies, jigs, and aerospace components.',
    legalConstitution: 'Proprietorship',
    businessAddress: 'Plot No. 45, Industrial Estate, Phase II, Pune, Maharashtra',
    pinCode: '411026',
    contactPhone: '+91 98765 43210',
    typeOfLoanNeeded: 'Term Loan & Working Capital (OD/CC)',
    promoterName: 'Jayant Patil',
    location: 'Pune, MH',
    totalLoanRequirement: '5500000',
    coverLogoSize: 192,
    coverTitleFontSize: 60,
    coverTitleColor: '#001F3D',
    coverLogoMarginTop: 0,
    coverTitleMarginTop: 32,
    coverProjectEntityMarginTop: 80,
  });

  const [proprietaryProducts, setProprietaryProducts] = useState<ProprietaryProduct[]>([
    { id: 'p1', name: 'Precision Curved Conduit Connector', market: 'Automotive/Electrical', price: '450', annualTargetQty: '5000', imageUrl: 'https://picsum.photos/seed/conduit/600/400', yoyGrowth: [0, 10, 10, 10, 10] },
    { id: 'p2', name: 'VMC Machined Engine Plate', market: 'Heavy Machinery', price: '2800', annualTargetQty: '1200', imageUrl: 'https://picsum.photos/seed/engineplate/600/400', yoyGrowth: [0, 10, 10, 10, 10] }
  ]);

  const [industrialServices, setIndustrialServices] = useState<IndustrialService[]>([
    { id: 's1', name: 'High-Precision VMC Job-Work', description: 'Accuracy within 5 microns on Haas VMC.', price: '1800', annualTargetQty: '2500', imageUrl: 'https://picsum.photos/seed/milling/600/400', yoyGrowth: [0, 15, 15, 15, 15] },
    { id: 's2', name: 'Mould Design & Prototyping', description: 'CAD/CAM integrated solution.', price: '45000', annualTargetQty: '24', imageUrl: 'https://picsum.photos/seed/3dprint/600/400', yoyGrowth: [0, 10, 10, 10, 10] }
  ]);

  const [machineryItems, setMachineryItems] = useState<MachineryItem[]>([
    { id: 'm1', name: 'VMC Haas VF-2', qty: 1, rate: 3500000, total: 3500000 },
    { id: 'm2', name: 'Precision Grinding Unit', qty: 1, rate: 800000, total: 800000 },
    { id: 'm3', name: 'CMM Inspection Probe', qty: 1, rate: 200000, total: 200000 }
  ]);

  const [financials, setFinancials] = useState({
    loanROI: 10.75,
    loanTenure: 84, 
    loanMoratorium: 6,
    expenseRent: 65000,
    expensePower: 25000,
    expenseMaintenance: 15000,
    expenseConsumables: 40000,
    investMachinery: 4500000,
    investCivil: 200000,
    investElectrical: 300000,
    investFurniture: 150000,
    investPreOp: 200000,
    investSoftware: 250000,
    investSystem: 150000,
    investShedAdvance: 400000,
    yearlyGrowthTargets: [0, 15, 15, 15, 15],
    targetNetMargin: 20,
    ownCapital: 1500000,
    loanFriendsFamily: 500000,
    workingCapitalLimit: 1200000,
    wcInterestRate: 11.5,
    wcMarginPercent: 25, 
    variableCostPercent: 60, 
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (savedStrategy && !isDataLoaded) {
      if (savedStrategy.foundationalData) setFormData((prev: any) => ({ ...prev, ...savedStrategy.foundationalData }));
      if (Array.isArray(savedStrategy.proprietaryProducts)) setProprietaryProducts(savedStrategy.proprietaryProducts);
      if (Array.isArray(savedStrategy.industrialServices)) setIndustrialServices(savedStrategy.industrialServices);
      if (Array.isArray(savedStrategy.machineryItems)) setMachineryItems(savedStrategy.machineryItems);
      if (savedStrategy.financials) setFinancials(prev => ({ ...prev, ...savedStrategy.financials }));
      if (savedStrategy.checklist) setChecklist(prev => ({ ...prev, ...savedStrategy.checklist }));
      setIsDataLoaded(true);
    }
  }, [savedStrategy, isDataLoaded]);

  const handleSaveStrategy = useCallback((silent = false) => {
    const data = {
      foundationalData,
      proprietaryProducts,
      industrialServices,
      machineryItems,
      financials,
      checklist,
      updatedAt: new Date().toISOString()
    };
    setDocumentNonBlocking(strategyRef, data, { merge: true });
    if (!silent) toast({ title: "Strategy Matrix Committed", description: "All strategic nodes synchronized." });
  }, [foundationalData, proprietaryProducts, industrialServices, machineryItems, financials, checklist, strategyRef, toast]);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.focus();
      window.print();
    }
  }, []);

  const calculations = useMemo(() => {
    const fixedAssetsAtCost = (financials.investMachinery || 0) + 
                            (financials.investCivil || 0) + 
                            (financials.investElectrical || 0) + 
                            (financials.investFurniture || 0) + 
                            (financials.investPreOp || 0) +
                            (financials.investShedAdvance || 0) +
                            (financials.investSoftware || 0) +
                            (financials.investSystem || 0);
    
    const monthlyOpExBase = (financials.expenseRent || 0) + 
                           (financials.expensePower || 0) + 
                           (financials.expenseMaintenance || 0) + 
                           (financials.expenseConsumables || 0);
    
    const workingCapitalRequirement = monthlyOpExBase * 3;
    const totalProjectCost = fixedAssetsAtCost + workingCapitalRequirement;
    const totalOwnFunds = (financials.ownCapital || 0) + (financials.loanFriendsFamily || 0);

    const termLoanAmt = totalProjectCost - totalOwnFunds - financials.workingCapitalLimit;

    // Amortization Schedule
    const monthlyRate = (financials.loanROI / 100) / 12;
    const totalTenure = financials.loanTenure;
    const moratorium = financials.loanMoratorium;
    const activeRepaymentTenure = totalTenure - moratorium;

    let emi = 0;
    if (activeRepaymentTenure > 0 && monthlyRate > 0) {
      emi = (termLoanAmt * monthlyRate * Math.pow(1 + monthlyRate, activeRepaymentTenure)) / (Math.pow(1 + monthlyRate, activeRepaymentTenure) - 1);
    }

    const schedule: any[] = [];
    let remainingBalance = termLoanAmt;
    for (let m = 1; m <= totalTenure; m++) {
      const isMoratorium = m <= moratorium;
      const interest = remainingBalance * monthlyRate;
      const principal = isMoratorium ? 0 : emi - interest;
      remainingBalance = Math.max(0, remainingBalance - principal);
      schedule.push({ month: m, payment: isMoratorium ? 0 : emi, interest, principal, balance: remainingBalance });
    }

    const projections: any[] = [];
    let accumulatedDepreciation = 0;
    const depreciationRate = 0.15;
    let currentEquity = totalOwnFunds;
    let closingCash = workingCapitalRequirement; // Starting buffer

    for (let y = 1; y <= 5; y++) {
      // Calculate Revenue based on YoY Growth targets from Catalogues
      let yearRevenue = 0;
      proprietaryProducts.forEach(p => {
        const baseRev = (parseFloat(p.price) || 0) * (parseInt(p.annualTargetQty.toString().replace(/,/g, '')) || 0);
        const growth = (p.yoyGrowth?.[y-1] || 0) / 100;
        yearRevenue += baseRev * (1 + growth);
      });
      industrialServices.forEach(s => {
        const baseRev = (parseFloat(s.price) || 0) * (parseInt(s.annualTargetQty.toString().replace(/,/g, '')) || 0);
        const growth = (s.yoyGrowth?.[y-1] || 0) / 100;
        yearRevenue += baseRev * (1 + growth);
      });

      const yearOpEx = monthlyOpExBase * 12 * (1 + ((y-1) * 0.05));
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearDepreciation = (fixedAssetsAtCost - accumulatedDepreciation) * depreciationRate;
      accumulatedDepreciation += yearDepreciation;

      const yearEBITDA = yearRevenue - yearOpEx;
      const yearPBT = yearEBITDA - yearInterest - yearDepreciation;
      const yearPAT = yearPBT > 0 ? yearPBT * 0.75 : 0;
      
      currentEquity += yearPAT;
      closingCash += (yearPAT + yearDepreciation) - schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0);

      projections.push({
        year: `Year ${y}`,
        revenue: yearRevenue,
        ebitda: yearEBITDA,
        pat: yearPAT,
        interest: yearInterest,
        depreciation: yearDepreciation,
        principal: schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0),
        equity: currentEquity,
        cash: closingCash,
        loanBal: schedule[y * 12 - 1]?.balance || 0,
        dscr: ((yearPAT + yearDepreciation + yearInterest) / (yearInterest + (schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0)) || 1)).toFixed(2)
      });
    }

    return {
      totalProjectCost,
      loanAmt: termLoanAmt,
      totalOwnFunds,
      projections,
      avgDSCR: (projections.reduce((acc, p) => acc + parseFloat(p.dscr), 0) / 5).toFixed(2),
      monthlySchedule: schedule,
      fixedAssetsAtCost,
      workingCapitalRequirement
    };
  }, [financials, proprietaryProducts, industrialServices]);

  const renderActiveEditor = (sectionId: string) => {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">{REPORT_SEQUENCE.find(s=>s.id === sectionId)?.label}</h3>
        <RichTextEditor value={foundationalData[sectionId] || ""} onChange={(val)=>setFormData({...foundationalData, [sectionId]: val})} />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20 print:pb-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Landmark className="h-4 w-4" /> Strategic Architect
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#001F3D]">Strategy Hub</h2>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 rounded-xl border-slate-200 px-8 font-bold text-[10px] uppercase tracking-widest gap-2" onClick={() => {}}><FileText className="h-4 w-4 mr-2" /> MS Word</Button>
           <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={() => handleSaveStrategy()}><Save className="h-4 w-4" /> Commit Strategy</Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full no-print">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="input" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">01. Identity Matrix</TabsTrigger>
          <TabsTrigger value="catalogues" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">02. Catalogues</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">03. Financial Projection</TabsTrigger>
          <TabsTrigger value="display" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">04. Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                 <Card className="p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-10 min-h-[600px]">
                    {renderActiveEditor(activeEditingSection)}
                 </Card>
              </div>
              <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] h-fit lg:h-[calc(100vh-300px)] sticky top-24 flex flex-col">
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-8 shrink-0">Report Matrix</h3>
                 <ScrollArea className="flex-1 pr-4 -mr-4">
                  <div className="space-y-3 pb-6">
                      {REPORT_SEQUENCE.map((item) => (
                        <div key={item.id} className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group", activeEditingSection === item.id ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10")} onClick={() => setActiveEditingSection(item.id)}>
                            <Checkbox checked={checklist[item.id]} onCheckedChange={() => setChecklist({...checklist, [item.id]: !checklist[item.id]})} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", activeEditingSection === item.id ? "text-white" : "text-white/60 group-hover:text-white")}>{item.label}</span>
                        </div>
                      ))}
                  </div>
                 </ScrollArea>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="catalogues" className="m-0 space-y-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Proprietary Products</h3>
                  <Button variant="ghost" size="sm" onClick={() => setProprietaryProducts([...proprietaryProducts, { id: Date.now().toString(), name: '', market: '', price: '0', annualTargetQty: '0', imageUrl: '', yoyGrowth: [0, 10, 10, 10, 10] }])}><Plus className="h-4 w-4" /></Button>
                </div>
                {proprietaryProducts.map((p, i) => (
                  <div key={p.id} className="p-6 bg-slate-50 rounded-xl border space-y-6">
                    <Input placeholder="Product Name" value={p.name} onChange={(e) => {
                      const updated = [...proprietaryProducts];
                      updated[i].name = e.target.value;
                      setProprietaryProducts(updated);
                    }} className="h-11 bg-white border-slate-200" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Price (₹)" type="number" value={p.price} onChange={(e) => {
                        const updated = [...proprietaryProducts];
                        updated[i].price = e.target.value;
                        setProprietaryProducts(updated);
                      }} className="h-11 bg-white border-slate-200" />
                      <Input placeholder="Annual Target Qty" type="number" value={p.annualTargetQty} onChange={(e) => {
                        const updated = [...proprietaryProducts];
                        updated[i].annualTargetQty = e.target.value;
                        setProprietaryProducts(updated);
                      }} className="h-11 bg-white border-slate-200" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[9px] font-bold uppercase text-slate-400">YoY Sales Growth (%)</Label>
                       <div className="grid grid-cols-5 gap-2">
                          {p.yoyGrowth?.map((g, gi) => (
                            <Input key={gi} type="number" value={g} onChange={(e) => {
                              const updated = [...proprietaryProducts];
                              const newGrowth = [...(updated[i].yoyGrowth || [0,0,0,0,0])];
                              newGrowth[gi] = parseInt(e.target.value) || 0;
                              updated[i].yoyGrowth = newGrowth;
                              setProprietaryProducts(updated);
                            }} className="h-8 text-[10px] text-center" />
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </Card>

              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-accent pl-4">Industrial Services</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIndustrialServices([...industrialServices, { id: Date.now().toString(), name: '', description: '', price: '0', annualTargetQty: '0', imageUrl: '', yoyGrowth: [0, 15, 15, 15, 15] }])}><Plus className="h-4 w-4" /></Button>
                </div>
                {industrialServices.map((s, i) => (
                  <div key={s.id} className="p-6 bg-slate-50 rounded-xl border space-y-6">
                    <Input placeholder="Service Name" value={s.name} onChange={(e) => {
                      const updated = [...industrialServices];
                      updated[i].name = e.target.value;
                      setIndustrialServices(updated);
                    }} className="h-11 bg-white border-slate-200" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Price/Rate (₹)" type="number" value={s.price} onChange={(e) => {
                        const updated = [...industrialServices];
                        updated[i].price = e.target.value;
                        setIndustrialServices(updated);
                      }} className="h-11 bg-white border-slate-200" />
                      <Input placeholder="Annual Load Hours" type="number" value={s.annualTargetQty} onChange={(e) => {
                        const updated = [...industrialServices];
                        updated[i].annualTargetQty = e.target.value;
                        setIndustrialServices(updated);
                      }} className="h-11 bg-white border-slate-200" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[9px] font-bold uppercase text-slate-400">YoY Revenue Growth (%)</Label>
                       <div className="grid grid-cols-5 gap-2">
                          {s.yoyGrowth?.map((g, gi) => (
                            <Input key={gi} type="number" value={g} onChange={(e) => {
                              const updated = [...industrialServices];
                              const newGrowth = [...(updated[i].yoyGrowth || [0,0,0,0,0])];
                              newGrowth[gi] = parseInt(e.target.value) || 0;
                              updated[i].yoyGrowth = newGrowth;
                              setIndustrialServices(updated);
                            }} className="h-8 text-[10px] text-center" />
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-10">
           <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
              <div className="flex justify-between items-center px-4">
                <h3 className="text-xl font-display font-bold uppercase tracking-tight text-[#001F3D]">Projected Financial Core</h3>
                <Button variant="outline" className="rounded-xl font-bold uppercase text-[9px] tracking-widest gap-2" onClick={() => setIsCostBreakupOpen(true)}>
                  <Calculator className="h-4 w-4" /> View Cost Breakup
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Project Cost</p>
                    <p className="text-xl font-display font-bold text-[#001F3D]">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-2">Term Loan Requirement</p>
                    <p className="text-xl font-display font-bold text-primary">₹ {calculations.loanAmt.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Own Capital Matrix</p>
                    <p className="text-xl font-display font-bold text-emerald-600">₹ {calculations.totalOwnFunds.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <p className="text-[8px] font-bold text-purple-400 uppercase tracking-widest mb-2">Average DSCR</p>
                    <p className="text-xl font-display font-bold text-purple-700">{calculations.avgDSCR}</p>
                 </div>
              </div>

              <div className="pt-8 border-t space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Loan ROI (%)</Label>
                    <Input type="number" step="0.25" value={financials.loanROI} onChange={(e) => setFinancials({...financials, loanROI: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Tenure (Months)</Label>
                    <Input type="number" value={financials.loanTenure} onChange={(e) => setFinancials({...financials, loanTenure: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">WC Limit (₹)</Label>
                    <Input type="number" value={financials.workingCapitalLimit} onChange={(e) => setFinancials({...financials, workingCapitalLimit: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>
           </Card>

           <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#001F3D] mb-8 border-l-4 border-primary pl-4">Yearly Growth Targets (%)</h3>
              <div className="grid grid-cols-5 gap-6">
                {financials.yearlyGrowthTargets.map((g, i) => (
                  <div key={i} className="space-y-3">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase">Year {i+1}</Label>
                    <Input type="number" value={g} onChange={(e) => {
                      const updated = [...financials.yearlyGrowthTargets];
                      updated[i] = parseInt(e.target.value) || 0;
                      setFinancials({...financials, yearlyGrowthTargets: updated});
                    }} className="bg-slate-50" />
                  </div>
                ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="display" className="m-0 flex flex-col items-center">
           <div className="w-full bg-slate-900/5 p-8 border-b border-slate-200/60 sticky top-16 z-50 flex justify-between items-center backdrop-blur-md no-print">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <Printer className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Print Protocol Active</span>
                 </div>
                 <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-xl border border-slate-200">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                    <span className="text-[10px] font-bold font-code w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                 </div>
              </div>
              <Button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-12 font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3 group" onClick={handlePrint}>
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> Print PDF Matrix
              </Button>
           </div>

           <div className="w-full overflow-x-auto pb-20 px-4 scrollbar-hide">
              <div 
                id="institutional-report-matrix"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm' }} 
                className="mx-auto bg-white shadow-2xl print:shadow-none print-matrix"
              >
                <div className="p-10 md:p-20 min-h-[297mm] space-y-16 print:p-12 relative bg-white">
                   {/* Cover Page Logic */}
                   <div className="min-h-[297mm] flex flex-col items-center justify-center text-center border-b-2 border-slate-900 pb-20 page-break relative z-10">
                      {brandLogo && (
                        <div 
                          className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border flex items-center justify-center p-4 transition-all"
                          style={{ width: `${foundationalData.coverLogoSize || 192}px`, height: `${foundationalData.coverLogoSize || 192}px`, marginTop: `${foundationalData.coverLogoMarginTop || 0}px` }}
                        >
                           <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-4" />
                        </div>
                      )}
                      <div className="space-y-4" style={{ marginTop: `${foundationalData.coverTitleMarginTop || 32}px` }}>
                         <h1 className="font-display font-bold tracking-tighter uppercase leading-none" style={{ fontSize: `${foundationalData.coverTitleFontSize || 60}px`, color: foundationalData.coverTitleColor || '#001F3D' }}>{foundationalData.reportMainTitle}</h1>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">{foundationalData.reportSubTitle}</p>
                      </div>
                      
                      <div className="w-full border-t-2 border-slate-100 pt-16 flex flex-col items-center" style={{ marginTop: `${foundationalData.coverProjectEntityMarginTop || 80}px` }}>
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Identity</p>
                            <h2 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{foundationalData.projectName}</h2>
                         </div>
                         <div className="mt-12 space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Lead</p>
                            <h3 className="text-lg font-bold text-[#001F3D] uppercase">{foundationalData.businessFirmName}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1">{foundationalData.businessAddress} • {foundationalData.pinCode}</p>
                         </div>
                      </div>
                   </div>

                   {REPORT_SEQUENCE.map((section) => (
                     checklist[section.id] && section.id !== 'coverDetails' && (
                       <div key={section.id} className="space-y-8 page-break relative z-10 py-10 min-h-[297mm]">
                         <div className="flex justify-between items-center border-b-2 border-primary pb-2 mb-8">
                           <h2 className="text-2xl md:text-3xl font-display font-bold text-primary tracking-tight uppercase">{section.label}</h2>
                           <button type="button" className="no-print text-primary hover:bg-primary/10 font-bold text-[10px] uppercase tracking-widest gap-2 h-8 rounded-lg flex items-center p-2" onClick={() => setEditingSectionInPreview(section.id)}>
                              <Edit3 className="h-3.5 w-3.5" /> Edit Matrix Node
                           </button>
                         </div>
                         
                         {section.id === 'projectCost' && (
                           <div className="space-y-10">
                              <UITable className="border-2 border-slate-900">
                                <UITableHeader className="bg-slate-900 text-white">
                                  <UITableRow className="hover:bg-slate-900 border-none">
                                    <UITableHead className="text-white uppercase font-bold text-[10px] px-6 py-4">Component</UITableHead>
                                    <UITableHead className="text-white uppercase font-bold text-[10px] text-right px-6">Amount (₹)</UITableHead>
                                  </UITableRow>
                                </UITableHeader>
                                <UITableBody>
                                  <UITableRow className="border-b border-slate-200">
                                    <UITableCell className="font-bold text-[11px] px-6 py-4">Machinery & Equipment</UITableCell>
                                    <UITableCell className="text-right font-display font-bold text-[11px] px-6">₹ {financials.investMachinery.toLocaleString()}</UITableCell>
                                  </UITableRow>
                                  <UITableRow className="border-b border-slate-200">
                                    <UITableCell className="font-bold text-[11px] px-6 py-4">Civil & Electrical Works</UITableCell>
                                    <UITableCell className="text-right font-display font-bold text-[11px] px-6">₹ {(financials.investCivil + financials.investElectrical).toLocaleString()}</UITableCell>
                                  </UITableRow>
                                  <UITableRow className="border-b border-slate-200">
                                    <UITableCell className="font-bold text-[11px] px-6 py-4">Software & IT Systems</UITableCell>
                                    <UITableCell className="text-right font-display font-bold text-[11px] px-6">₹ {(financials.investSoftware + financials.investSystem).toLocaleString()}</UITableCell>
                                  </UITableRow>
                                  <UITableRow className="border-b border-slate-200">
                                    <UITableCell className="font-bold text-[11px] px-6 py-4">Working Capital Margin (3 Months)</UITableCell>
                                    <UITableCell className="text-right font-display font-bold text-[11px] px-6">₹ {calculations.workingCapitalRequirement.toLocaleString()}</UITableCell>
                                  </UITableRow>
                                  <UITableRow className="bg-slate-50">
                                    <UITableCell className="font-black text-[12px] px-6 py-6 uppercase">Total Project Cost</UITableCell>
                                    <UITableCell className="text-right font-display font-black text-[14px] px-6">₹ {calculations.totalProjectCost.toLocaleString()}</UITableCell>
                                  </UITableRow>
                                </UITableBody>
                              </UITable>
                           </div>
                         )}

                         {section.id === 'financialProjections' && (
                           <div className="space-y-10">
                              <h3 className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Projected Profitability Matrix (₹ Lakhs)</h3>
                              <UITable className="border-2 border-slate-900">
                                <UITableHeader className="bg-slate-900 text-white">
                                  <UITableRow className="hover:bg-slate-900 border-none">
                                    <UITableHead className="text-white uppercase font-bold text-[10px] px-4 py-4">Indicators</UITableHead>
                                    <UITableHead className="text-white uppercase font-bold text-[10px] text-center">Year 1</UITableHead>
                                    <UITableHead className="text-white uppercase font-bold text-[10px] text-center">Year 2</UITableHead>
                                    <UITableHead className="text-white uppercase font-bold text-[10px] text-center">Year 3</UITableHead>
                                    <UITableHead className="text-white uppercase font-bold text-[10px] text-center">Year 4</UITableHead>
                                    <UITableHead className="text-white uppercase font-bold text-[10px] text-center">Year 5</UITableHead>
                                  </UITableRow>
                                </UITableHeader>
                                <UITableBody>
                                  <UITableRow className="border-b border-slate-200">
                                    <UITableCell className="font-bold text-[10px] px-4 py-4">Revenue</UITableCell>
                                    {calculations.projections.map((p, idx) => <UITableCell key={idx} className="text-center font-display font-bold text-[10px]">{(p.revenue / 100000).toFixed(2)}</UITableCell>)}
                                  </UITableRow>
                                  <UITableRow className="border-b border-slate-200">
                                    <UITableCell className="font-bold text-[10px] px-4 py-4">EBITDA</UITableCell>
                                    {calculations.projections.map((p, idx) => <UITableCell key={idx} className="text-center font-display font-bold text-[10px]">{(p.ebitda / 100000).toFixed(2)}</UITableCell>)}
                                  </UITableRow>
                                  <UITableRow className="border-b border-slate-200">
                                    <UITableCell className="font-bold text-[10px] px-4 py-4">PAT</UITableCell>
                                    {calculations.projections.map((p, idx) => <UITableCell key={idx} className="text-center font-display font-bold text-[10px] text-emerald-600">{(p.pat / 100000).toFixed(2)}</UITableCell>)}
                                  </UITableRow>
                                </UITableBody>
                              </UITable>
                           </div>
                         )}

                         {section.id === 'amortizationSchedule' && (
                           <div className="space-y-8">
                             <h3 className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">84-Month Debt Settlement Schedule</h3>
                             <div className="grid grid-cols-2 gap-10">
                               {[0, 42].map(offset => (
                                 <UITable key={offset} className="border border-slate-200 text-[9px]">
                                   <UITableHeader className="bg-slate-50">
                                     <UITableRow>
                                       <UITableHead className="font-bold text-[8px] uppercase py-2">Mth</UITableHead>
                                       <UITableHead className="font-bold text-[8px] uppercase py-2">Prin.</UITableHead>
                                       <UITableHead className="font-bold text-[8px] uppercase py-2">Int.</UITableHead>
                                       <UITableHead className="font-bold text-[8px] uppercase py-2 text-right">Bal.</UITableHead>
                                     </UITableRow>
                                   </UITableHeader>
                                   <UITableBody>
                                     {calculations.monthlySchedule.slice(offset, offset + 42).map(s => (
                                       <UITableRow key={s.month} className="h-6">
                                         <UITableCell className="font-bold">{s.month}</UITableCell>
                                         <UITableCell>{Math.round(s.principal).toLocaleString()}</UITableCell>
                                         <UITableCell>{Math.round(s.interest).toLocaleString()}</UITableCell>
                                         <UITableCell className="text-right font-medium">{Math.round(s.balance).toLocaleString()}</UITableCell>
                                       </UITableRow>
                                     ))}
                                   </UITableBody>
                                 </UITable>
                               ))}
                             </div>
                           </div>
                         )}

                         {foundationalData[section.id] && (
                            <div className="editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData[section.id] }} />
                         )}
                         
                         {/* Fallback for empty sections */}
                         {!['projectCost', 'financialProjections', 'amortizationSchedule'].includes(section.id) && !foundationalData[section.id] && (
                           <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-20">
                              <FileText className="h-10 w-10 mb-4" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">Section Metadata Empty</p>
                           </div>
                         )}
                       </div>
                     )
                   ))}
                </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingSectionInPreview} onOpenChange={(open) => !open && setEditingSectionInPreview(null)}>
        <DialogContent className="max-w-4xl h-[80vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#001F3D] rounded-2xl text-white"><Edit3 className="h-7 w-7" /></div>
              <div><DialogTitle className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Edit Matrix Node: {REPORT_SEQUENCE.find(s => s.id === editingSectionInPreview)?.label}</DialogTitle></div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditingSectionInPreview(null)}><X className="h-6 w-6" /></Button>
          </div>
          <ScrollArea className="flex-1 p-10">{editingSectionInPreview && renderActiveEditor(editingSectionInPreview)}</ScrollArea>
          <div className="p-8 border-t bg-slate-50/50 flex justify-end">
            <Button className="h-12 bg-[#001F3D] hover:bg-black text-white px-10 rounded-xl font-bold uppercase text-[10px] shadow-xl" onClick={() => { handleSaveStrategy(); setEditingSectionInPreview(null); }}>Commit Node Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCostBreakupOpen} onOpenChange={setIsCostBreakupOpen}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
          <div className="p-10 bg-[#001F3D] text-white flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl"><Calculator className="h-8 w-8" /></div>
                <div>
                   <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Total Project Breakup</h3>
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Capital & Operational Investment Matrix</p>
                </div>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setIsCostBreakupOpen(false)} className="text-white/40 hover:text-white"><X className="h-6 w-6" /></Button>
          </div>
          <ScrollArea className="max-h-[500px] p-10">
             <div className="space-y-10">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l-4 border-primary pl-4">Fixed Capital (CAPEX)</h4>
                   <div className="space-y-3">
                      {[
                        { label: 'Machinery & Equipment', val: financials.investMachinery },
                        { label: 'Civil & Interior Works', val: financials.investCivil },
                        { label: 'Electrical Infrastructure', val: financials.investElectrical },
                        { label: 'Industrial Furniture', val: financials.investFurniture },
                        { label: 'Engineering Software (CAD/CAM)', val: financials.investSoftware },
                        { label: 'Pre-operative Expenses', val: financials.investPreOp },
                        { label: 'Shed/Security Deposit', val: financials.investShedAdvance },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                           <span className="text-[11px] font-bold text-slate-600 uppercase">{item.label}</span>
                           <span className="text-xs font-display font-bold text-[#001F3D]">₹ {item.val.toLocaleString()}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l-4 border-accent pl-4">Operational Liquidity (OPEX Buffer)</h4>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Working Capital Margin (3 Months)</span>
                      <span className="text-xs font-display font-bold text-[#001F3D]">₹ {calculations.workingCapitalRequirement.toLocaleString()}</span>
                   </div>
                </div>
             </div>
          </ScrollArea>
          <div className="p-10 border-t bg-slate-50/50 flex justify-between items-center">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregate Investment</span>
             <span className="text-2xl font-display font-bold text-[#001F3D]">₹ {calculations.totalProjectCost.toLocaleString()}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
