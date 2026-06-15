
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
  Compass,
  ShieldCheck,
  Zap,
  UserCircle,
  Shield,
  ZoomIn,
  ZoomOut,
  Calculator,
  Clock,
  Factory,
  Table as TableIcon,
  Activity,
  FileCheck,
  Settings2,
  Gauge,
  X,
  Receipt,
  FileBarChart,
  Scale,
  Edit3,
  Maximize2,
  RefreshCcw,
  Hammer,
  ShieldAlert,
  Info,
  BarChart3,
  LineChart as LineChartIcon,
  ClipboardList,
  Check,
  Building2,
  CreditCard,
  Briefcase,
  Monitor,
  LayoutGrid,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  TableProperties,
  MoreVertical,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Eraser,
  Type,
  Baseline,
  Square,
  Highlighter,
  Palette,
  Circle,
  ArrowUpRight,
  MousePointer2,
  ChevronDown,
  Download
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
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  Cell
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
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
import UnderlineExtension from '@tiptap/extension-underline';
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
}

interface IndustrialService {
  id: string;
  name: string;
  description: string;
  price: string;
  annualTargetQty: string;
  imageUrl: string;
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
  { label: 'a. b. c.', value: 'lower-alpha' },
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
      UnderlineExtension,
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
            <Underline className="h-3.5 w-3.5" />
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
  const [isMachineryBreakupOpen, setIsMachineryBreakupOpen] = useState(false);
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  const [pendingDrawingFile, setPendingDrawingFile] = useState<string | undefined>();

  const strategyRef = useMemoFirebase(() => doc(db, 'settings', 'loan_strategy'), [db]);
  const { data: savedStrategy } = useDoc<any>(strategyRef);

  const initialChecklist: Record<string, boolean> = {};
  REPORT_SEQUENCE.forEach(item => { initialChecklist[item.id] = true; });
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);

  const [foundationalData, setFormData] = useState<any>({
    projectName: 'Precision VMC Machining & Tool Room Hub',
    reportMainTitle: 'Techno-Economic Feasibility Analysis',
    reportSubTitle: 'Detailed Project Report (DPR) v2.4',
    businessFirmName: 'Ferocious Tech',
    businessIndustry: 'Manufacturing',
    natureOfBusiness: 'Manufacturing and service',
    legalConstitution: 'Proprietorship',
    businessAddress: 'Plot No. 42, Industrial Area Phase II, Pune',
    pinCode: '411026',
    contactPhone: '+91 98765 43210',
    typeOfLoanNeeded: 'MSME Loan',
    promoterName: 'Jayant Patil',
    location: 'Pune, Maharashtra',
    totalLoanRequirement: '45,00,000',
    coverLogoSize: 192,
    coverTitleFontSize: 60,
    coverTitleColor: '#001F3D',
    coverLogoMarginTop: 0,
    coverTitleMarginTop: 32,
    coverProjectEntityMarginTop: 80,
    executiveSummary: 'This feasibility study outlines the establishment of a precision manufacturing node focused on high-accuracy industrial outputs.',
    aboutCompany: 'Ferocious Tech is an emerging industrial leader in precision engineering, focused on technical excellence and automated manufacturing protocols.',
    visionMission: 'VISION: To establish Ferocious Tech as the global benchmark for precision machining.\nMISSION: Providing exceptional technical value through specialized engineering.',
    promoterProfile: 'Jayant Patil - B.E. Mechanical / MBA Operations. 15+ Years in Tool Room & VMC Operations. Highly technical leadership with a proven track record in precision engineering.',
    projectDetails: 'The proposed project involves the setup of a high-fidelity VMC Machining Center and Tool Room in Pune.',
    productServices: 'Combined Proprietary Products and Industrial Services matrix.',
    marketAnalysis: "India's electrical sector is witnessing an unprecedented surge. The Indian Tooling Industry is valued at approximately ₹18,500 Crores.",
    swotAnalysis: "Strategic analysis of operational nodes.",
    swot_strengths: "",
    swot_weaknesses: "",
    swot_opportunities: "",
    swot_threats: "",
    businessModel: "Revenue-driven B2B model focusing on high-precision job work and proprietary industrial connectors.",
    operationsPlan: "Multi-shift precision machining utilizing 3-axis and 4-axis VMC centers with integrated QC cycles.",
    layout: "The layout of the manufacturing facility is designed for streamlined material movement and high-fidelity VMC operations.",
    locationAnalysis: "Strategically located in Pune's industrial belt, providing seamless access to Tier 1 supply chains and skilled labor.",
    orgStructure: "Lean organizational matrix consisting of a Promoter, Shift Supervisors, VMC Operators, and Quality Leads.",
    marketingStrategy: "Direct industrial liaison, digital cataloging, and exhibition presence at IMTEX and related trade nodes.",
    techIntegration: "System uses Firebase and Next.js for real-time manufacturing execution system (MES) and inventory synchronization.",
    projectCost: 'One-time capital investment details.',
    meansOfFinance: '90/10 Debt-Equity financing structure.',
    workingCapitalRequirement: 'Liquidity reserve for 3 months operational buffer.',
    financialProjections: 'Detailed Sources and Application of Funds matrix tracking project liquidity and capital adequacy.',
    cashFlowStatement: 'Annual operational and financing liquidity analysis.',
    turnoverAnalysis: 'Revenue realization and growth targets.',
    breakevenAnalysis: 'Operational threshold for profitability.',
    dscrMatrix: 'Debt Service Coverage Ratio analysis for institutional stability.',
    keyRatios: 'Liquidity, Solvency, and Profitability ratios.',
    mpbfCalculation: 'Maximum Permissible Bank Finance assessment.',
    amortizationSchedule: 'Monthly and annual debt settlement timeline.',
    riskMitigation: "Comprehensive insurance coverage, multi-vendor raw material sourcing, and dynamic debt-service reserves.",
    govtSchemes: "The project identifies the CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises) as the primary credit risk mitigation matrix.",
    licensesRegistrations: "Udyam Registration, GST, ISO 9001:2015 compliance, and local municipal NOCs verified.",
    roadmap: '5-year strategic evolution plan.',
    conclusion: "Based on the Techno-Economic analysis, the project demonstrates high viability with strong debt-service coverage and technical stability."
  });

  const [proprietaryProducts, setProprietaryProducts] = useState<ProprietaryProduct[]>([
    { id: '1', name: 'Precision Curved Conduit Connector', market: 'Electrical / Construction', price: '45.00', annualTargetQty: '50,000', imageUrl: 'https://picsum.photos/seed/conduit/600/400' },
    { id: '2', name: 'VMC Machined Engine Plate', market: 'Automotive Tier 1', price: '1,800.00', annualTargetQty: '1,200', imageUrl: 'https://picsum.photos/seed/engineplate/600/400' },
  ]);

  const [industrialServices, setIndustrialServices] = useState<IndustrialService[]>([
    { id: 'S1', name: 'High-Precision VMC Job-Work', description: 'Specialized 3-axis and 4-axis VMC machining services for complex aerospace geometries.', price: '1,250.00', annualTargetQty: '2,500', imageUrl: 'https://picsum.photos/seed/milling/600/400' },
    { id: 'S2', name: 'Mould Design & Prototyping', description: 'End-to-end mould fabrication from Dfm analysis to final polishing and testing.', price: '45,000.00', annualTargetQty: '24', imageUrl: 'https://picsum.photos/seed/edm/600/400' },
    { id: 'S3', name: 'Jig & Fixture Certification', description: 'CMM verified fixture manufacturing for Tier 1 assembly lines.', price: '15,000.00', annualTargetQty: '48', imageUrl: 'https://picsum.photos/seed/jig/600/400' },
  ]);

  const [machineryItems, setMachineryItems] = useState<MachineryItem[]>([
    { id: 'M1', name: 'VMC 3-Axis Center', qty: 1, rate: 4500000, total: 4500000 },
  ]);

  const [financials, setFinancials] = useState({
    loanROI: 10.75,
    loanTenure: 84, // 7 Years
    loanMoratorium: 6,
    expenseRent: 35000,
    expensePower: 20000,
    expenseMaintenance: 50000,
    expenseConsumables: 100000,
    investMachinery: 4500000,
    investCivil: 150000,
    investElectrical: 50000,
    investFurniture: 30000,
    investPreOp: 200000,
    investSoftware: 200000,
    investSystem: 150000,
    investShedAdvance: 400000,
    yearlyGrowthTargets: [0, 15, 15, 15, 15],
    targetNetMargin: 20,
    ownCapital: 700000,
    loanFriendsFamily: 0,
    workingCapitalLimit: 0,
    wcInterestRate: 10.75,
    wcMarginPercent: 20, 
    variableCostPercent: 60, // Industrial standard for direct manufacturing (Material + Power + Consumables)
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
    if (!silent) toast({ title: "Strategy Matrix Committed", description: "All strategic nodes synchronized with master ledger." });
  }, [foundationalData, proprietaryProducts, industrialServices, machineryItems, financials, checklist, strategyRef, toast]);

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
    
    const workingCapitalValue = monthlyOpExBase * 3;
    const totalProjectCost = fixedAssetsAtCost + workingCapitalValue;
    const requiredWCMargin = workingCapitalValue * (financials.wcMarginPercent / 100);

    const annualProductRevenue = proprietaryProducts.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (parseInt(p.annualTargetQty.replace(/,/g, '')) || 0), 0);
    const annualServiceRevenue = industrialServices.reduce((acc, s) => acc + (parseFloat(s.price) || 0) * (parseInt(s.annualTargetQty.replace(/,/g, '')) || 0), 0);
    const totalCapacityAnnualRevenue = annualProductRevenue + annualServiceRevenue;
    
    const totalOwnFunds = (financials.ownCapital || 0) + (financials.loanFriendsFamily || 0);
    const suggestedWCLimit = financials.workingCapitalLimit || (totalCapacityAnnualRevenue * 0.25 * 0.75);

    const termLoanAmt = totalProjectCost - totalOwnFunds - (financials.workingCapitalLimit || 0);
    const totalFinance = totalOwnFunds + termLoanAmt + (financials.workingCapitalLimit || 0);

    const shareOwn = totalFinance > 0 ? (financials.ownCapital / totalFinance * 100) : 0;
    const shareFF = totalFinance > 0 ? (financials.loanFriendsFamily / totalFinance * 100) : 0;
    const shareTotalOwn = totalFinance > 0 ? (totalOwnFunds / totalFinance * 100) : 0;
    const shareTerm = totalFinance > 0 ? (termLoanAmt / totalFinance * 100) : 0;
    const shareWC = totalFinance > 0 ? (financials.workingCapitalLimit / totalFinance * 100) : 0;

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
    const cashFlow: any[] = [];
    const loanRepayment: any[] = [];
    const ratioMatrix: any[] = [];
    const mpbfMatrix: any[] = [];
    const dscrMatrix: any[] = [];
    const breakevenMatrix: any[] = [];
    const balanceSheet: any[] = [];

    let currentTNW = totalOwnFunds;
    let accumulatedDepreciation = 0;
    const depreciationRate = 0.15;
    let openingCash = workingCapitalValue * 0.2;

    for (let y = 1; y <= 5; y++) {
      const growth = financials.yearlyGrowthTargets?.[y-1] ?? (y === 1 ? 0 : 15);
      const revMultiplier = Math.pow(1 + (growth / 100), y - 1);
      
      const yearRevenue = y === 1 ? (totalCapacityAnnualRevenue * 0.7) : (totalCapacityAnnualRevenue * revMultiplier);
      const yearOpExBase = monthlyOpExBase * 12 * (1 + (y * 0.05));
      const yearDepreciation = Math.max(0, (fixedAssetsAtCost - accumulatedDepreciation) * depreciationRate);
      accumulatedDepreciation += yearDepreciation;
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearPrincipal = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0);
      
      const yearEBITDA = yearRevenue - yearOpExBase;
      const yearPBT = yearEBITDA - yearDepreciation - yearInterest;
      const yearPAT = yearPBT > 0 ? yearPBT * 0.25 : 0;
      
      currentTNW += yearPAT * 0.8;
      const yearTermLoan = schedule[Math.min(y * 12, schedule.length) - 1]?.balance || 0;
      const yearCurrentLiabilities = workingCapitalValue * (1 + (y * 0.1)); 
      const yearTOL = yearTermLoan + yearCurrentLiabilities;
      
      // DSCR Components
      const numerator = yearPAT + yearDepreciation + yearInterest;
      const interestPayment = yearInterest;
      const termLoanPrincipal = yearPrincipal;
      const wcPrincipal = 0; // Assume revolving for MVP
      const totalRepayment = interestPayment + termLoanPrincipal + wcPrincipal;
      const dscr = numerator / (totalRepayment || 1);

      // Break-even Components
      const variableCosts = yearRevenue * (financials.variableCostPercent / 100);
      const grossProfit = yearRevenue - variableCosts; // Contribution (B)
      const totalFixedCost = yearOpExBase - variableCosts + yearDepreciation + yearInterest; // (C)
      const bepSales = (yearRevenue * totalFixedCost) / (grossProfit || 1); // (A*C)/B

      projections.push({
        year: `FY ${25+y}-${26+y}`,
        revenue: Math.round(yearRevenue),
        ebitda: Math.round(yearEBITDA),
        pat: Math.round(yearPAT),
        margin: parseFloat((yearPAT / yearRevenue * 100).toFixed(1)),
        ratio: parseFloat((yearTOL / currentTNW).toFixed(2)),
        dscr: dscr.toFixed(2)
      });

      breakevenMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        revenue: yearRevenue,
        variableCosts,
        grossProfit,
        otherFixedCosts: Math.max(0, yearOpExBase - variableCosts),
        depreciation: yearDepreciation,
        interest: yearInterest,
        totalFixedCost,
        bepSales
      });

      dscrMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        numerator,
        interestPayment,
        termLoanPrincipal,
        wcPrincipal,
        totalRepayment,
        dscr: dscr.toFixed(2)
      });

      ratioMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        debtEquity: ((yearTermLoan + suggestedWCLimit) / currentTNW).toFixed(2),
        debtRatio: ((yearTermLoan + suggestedWCLimit) / (currentTNW + yearTOL)).toFixed(2),
        tolTnw: (yearTOL / currentTNW).toFixed(2),
        interestCoverage: (yearEBITDA / (yearInterest || 1)).toFixed(2),
        dscr: dscr.toFixed(2),
        currentRatio: ((workingCapitalValue * 1.5) / yearCurrentLiabilities).toFixed(2),
        quickRatio: ((workingCapitalValue * 0.8) / yearCurrentLiabilities).toFixed(2),
        gpMargin: ((yearEBITDA / yearRevenue) * 100).toFixed(2),
        ebitdaMargin: ((yearEBITDA / yearRevenue) * 100).toFixed(2),
        npMargin: ((yearPAT / yearRevenue) * 100).toFixed(2),
        roa: ((yearPAT / fixedAssetsAtCost) * 100).toFixed(2)
      });

      const cf_A_OperatingProfitBeforeWC = yearPAT + yearInterest + yearDepreciation;
      const cf_A_NetCashFromOperating = cf_A_OperatingProfitBeforeWC; 

      const cf_B_InterestExp = -yearInterest;
      const cf_B_TermLoanRepay = -yearPrincipal;
      const cf_B_TotalFinancing = cf_B_InterestExp + cf_B_TermLoanRepay + (y === 1 ? (totalOwnFunds + termLoanAmt + financials.workingCapitalLimit) : 0);

      const cf_C_PurchaseAssets = y === 1 ? -fixedAssetsAtCost : 0;

      const totalCashInflow = cf_A_NetCashFromOperating + cf_B_TotalFinancing + cf_C_PurchaseAssets;
      const yearClosingCash = openingCash + totalCashInflow;

      cashFlow.push({
        year: `FY ${25+y}-${26+y}`,
        pat: yearPAT,
        interest: yearInterest,
        depreciation: yearDepreciation,
        opProfitBeforeWC: cf_A_OperatingProfitBeforeWC,
        netOpCash: cf_A_NetCashFromOperating,
        financing: {
          interest: cf_B_InterestExp,
          termLoan: y === 1 ? termLoanAmt : cf_B_TermLoanRepay,
          wcLoan: y === 1 ? financials.workingCapitalLimit : 0,
          ownFunds: y === 1 ? totalOwnFunds : 0,
          total: cf_B_TotalFinancing
        },
        investing: cf_C_PurchaseAssets,
        totalInflow: totalCashInflow,
        openingCash,
        closingCash: yearClosingCash
      });

      loanRepayment.push({
        year: `FY ${25+y}-${26+y}`,
        opening: schedule[(y-1)*12]?.balance || (y === 1 ? termLoanAmt : 0),
        interest: yearInterest,
        principal: yearPrincipal,
        closing: yearTermLoan
      });

      const currentAssets = (yearRevenue * 45 / 365) + (workingCapitalValue * 0.8) + yearClosingCash;
      const currentLiabsOtherThanBank = (yearOpExBase / 12 * 30 / 365);
      const wcGap = currentAssets - currentLiabsOtherThanBank;
      
      const minNetWC_Method1 = wcGap * 0.25;
      const mpbf_Method1 = wcGap - minNetWC_Method1;
      
      const minNetWC_Method2 = currentAssets * 0.25;
      const mpbf_Method2 = wcGap - minNetWC_Method2;
      
      const salesMethod = yearRevenue * 0.25;
      
      mpbfMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        currentAssets,
        currentLiabs: currentLiabsOtherThanBank,
        wcGap,
        method1: { minNetWC: minNetWC_Method1, mpbf: mpbf_Method1 },
        method2: { minNetWC: minNetWC_Method2, mpbf: mpbf_Method2 },
        salesMethod: { revenue: yearRevenue, mpbf: salesMethod }
      });

      // BALANCE SHEET CALCULATION
      balanceSheet.push({
        year: `FY ${25+y}-${26+y}`,
        sources: {
          ownFunds: {
            opening: y === 1 ? totalOwnFunds : currentTNW - (yearPAT * 0.8),
            additional: 0,
            profit: yearPAT,
            subsidy: 0,
            drawings: yearPAT * 0.2, // Simplified assumption
            total: currentTNW
          },
          longTermLiabs: {
            bankLoan: yearTermLoan,
            friendsFamily: financials.loanFriendsFamily * (1 - (y * 0.1)) // Assuming slight repayment
          },
          currentLiabs: {
            wcLoan: financials.workingCapitalLimit,
            interestPayable: yearInterest / 12,
            taxProvision: yearPAT * 0.25,
            creditors: currentLiabsOtherThanBank * 0.7,
            others: currentLiabsOtherThanBank * 0.3
          },
          total: currentTNW + yearTermLoan + (financials.loanFriendsFamily * (1-(y*0.1))) + financials.workingCapitalLimit + (yearInterest/12) + (yearPAT*0.25) + currentLiabsOtherThanBank
        },
        application: {
          nonCurrentAssets: {
            grossBlock: fixedAssetsAtCost,
            additions: 0,
            depreciation: accumulatedDepreciation,
            netBlock: fixedAssetsAtCost - accumulatedDepreciation
          },
          currentAssets: {
            cashBank: yearClosingCash,
            receivables: yearRevenue * 45 / 365,
            rawMaterial: workingCapitalValue * 0.4,
            wip: workingCapitalValue * 0.2,
            finishedGoods: workingCapitalValue * 0.2,
            advanceTax: yearPAT * 0.25 * 0.8,
            others: workingCapitalValue * 0.05
          },
          total: (fixedAssetsAtCost - accumulatedDepreciation) + yearClosingCash + (yearRevenue * 45 / 365) + workingCapitalValue
        }
      });

      openingCash = yearClosingCash;
    }

    const avgDSCR = projections.reduce((acc, p) => acc + parseFloat(p.dscr), 0) / 5;
    const avgDSCRTermOnly = projections.reduce((acc, p) => {
        const item = dscrMatrix.find(d => d.year === p.year);
        const termOnlyRepayment = (item?.interestPayment || 0) + (item?.termLoanPrincipal || 0);
        return acc + ((item?.numerator || 0) / (termOnlyRepayment || 1));
    }, 0) / 5;

    return {
      monthlyOpEx: monthlyOpExBase,
      workingCapitalValue,
      totalProjectCost,
      loanAmt: termLoanAmt,
      totalOwnFunds,
      shareOwn,
      shareFF,
      shareTotalOwn,
      shareTerm,
      shareWC,
      emi,
      projections,
      cashFlow,
      loanRepayment,
      ratioMatrix,
      mpbfMatrix,
      dscrMatrix,
      breakevenMatrix,
      balanceSheet,
      monthlySchedule: schedule,
      avgDSCR: avgDSCR.toFixed(2),
      avgDSCRTermOnly: avgDSCRTermOnly.toFixed(2),
      fixedCapital: fixedAssetsAtCost,
      mpbf: (totalCapacityAnnualRevenue * 0.25 * 0.75),
      requiredWCMargin,
      totalCapacityAnnualRevenue
    };
  }, [financials, proprietaryProducts, industrialServices]);

  const handleUpdateDimension = (idx: number, field: string, value: any) => {
    const updated = [...machineryItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'qty' || field === 'rate') updated[idx].total = updated[idx].qty * updated[idx].rate;
    setMachineryItems(updated);
    setFinancials(prev => ({ ...prev, investMachinery: updated.reduce((acc, i) => acc + i.total, 0) }));
  };

  const updateProduct = (idx: number, field: keyof ProprietaryProduct, value: string) => {
    const newP = [...proprietaryProducts];
    newP[idx] = { ...newP[idx], [field]: value || '' };
    setProprietaryProducts(newP);
  };

  const updateService = (idx: number, field: keyof IndustrialService, value: string) => {
    const newS = [...industrialServices];
    newS[idx] = { ...newS[idx], [field]: value || '' };
    setIndustrialServices(newS);
  };

  const handleImageUpload = (idx: number, type: 'product' | 'service', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') {
          updateProduct(idx, 'imageUrl', reader.result as string);
        } else {
          updateService(idx, 'imageUrl', reader.result as string);
        }
        toast({ title: "Visual Node Cached", description: "Image synchronization pending master commit." });
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToWord = useCallback(() => {
    const reportElement = document.getElementById('institutional-report-matrix');
    if (!reportElement) {
      toast({ variant: "destructive", title: "Export Error", description: "Report matrix not found in DOM." });
      return;
    }

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: 21cm 29.7cm; margin: 2cm; }
          body { font-family: 'Calibri', 'Inter', sans-serif; line-height: 1.5; color: #334155; }
          h1 { color: #001F3D; font-size: 28pt; text-align: center; text-transform: uppercase; margin-bottom: 20pt; }
          h2 { color: #8B5CF6; font-size: 22pt; border-bottom: 2pt solid #8B5CF6; margin-top: 30pt; padding-bottom: 5pt; text-transform: uppercase; }
          h3 { color: #001F3D; font-size: 16pt; text-transform: uppercase; border-left: 4pt solid #6366f1; padding-left: 10pt; margin: 15pt 0; }
          table { border-collapse: collapse; width: 100%; margin: 15pt 0; border: 0.5pt solid #cbd5e1; }
          th, td { border: 0.5pt solid #cbd5e1; padding: 8pt; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; color: #001F3D; font-size: 10pt; }
          td { font-size: 10pt; }
          .page-break { page-break-after: always; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          img { max-width: 100%; height: auto; display: block; margin: 10pt auto; border-radius: 8pt; }
        </style>
      </head>
      <body>
    `;
    const footer = "</body></html>";
    const reportHtml = reportElement.innerHTML;
    
    const blob = new Blob(['\ufeff', header + reportHtml + footer], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ferocious_Tech_Project_Report_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "MS Word Export Protocol", description: "Strategic matrix converted to institutional Word document." });
  }, [toast]);

  const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden print:visible">
      <div className="relative w-[60%] aspect-square">
         {brandLogo && <img src={brandLogo} alt="Corporate Identity Watermark" className="w-full h-full object-contain" />}
      </div>
    </div>
  );

  const NoteWrapper = ({ sectionId, children }: { sectionId: string, children: React.ReactNode }) => (
    <div className="space-y-6">
       <div className="space-y-2">
          <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-widest px-1">Header Annotation</Label>
          <RichTextEditor value={foundationalData[sectionId] || ""} onChange={(val) => setFormData({...foundationalData, [sectionId]: val})} />
       </div>
       {children}
       <div className="space-y-2">
          <Label className="text-[8px] font-bold uppercase text-slate-400 tracking-widest px-1">Footer Annotation</Label>
          <RichTextEditor value={foundationalData[sectionId + '_footer'] || ""} onChange={(val) => setFormData({...foundationalData, [sectionId + '_footer']: val})} />
       </div>
    </div>
  );

  const KeyDataAtGlance = ({ isReport = false }: { isReport?: boolean }) => (
    <div className={cn("space-y-12", isReport ? "mt-12" : "")}>
      <h3 className={cn("font-display font-bold uppercase tracking-tight", isReport ? "text-2xl text-[#001F3D]" : "text-lg text-primary")}>Key Data at a Glance</h3>
      
      <div className="space-y-16">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Projected Sales & Profitability</p>
          <div className={cn("w-full", isReport ? "h-[350px]" : "h-[300px]")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calculations.projections}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                <ChartTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar name="Revenue Income / Gross Sales" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="EBITDA" dataKey="ebitda" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="PROFIT AFTER TAX" dataKey="pat" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">TOL/TNW Ratio Trendline</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calculations.projections}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="ratio" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} name="TOL/TNW Ratio" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Net Profit Margin Trendline</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calculations.projections}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="margin" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} name="Net Profit Margin (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveEditor = (sectionId: string) => {
    switch(sectionId) {
      case 'coverDetails':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
             <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Cover Metadata Architecture</h3>
             
             <Tabs defaultValue="content" className="w-full">
               <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
                 <TabsTrigger value="content" className="text-[10px] font-bold uppercase">Content</TabsTrigger>
                 <TabsTrigger value="layout" className="text-[10px] font-bold uppercase">Layout & Style</TabsTrigger>
               </TabsList>

               <TabsContent value="content" className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Report Main Title</Label>
                        <Input value={foundationalData.reportMainTitle} onChange={(e)=>setFormData({...foundationalData, reportMainTitle: e.target.value})} className="h-14 bg-slate-50 border-none rounded-2xl text-xl font-display font-bold uppercase" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Subtitle / Version</Label>
                        <Input value={foundationalData.reportSubTitle} onChange={(e)=>setFormData({...foundationalData, reportSubTitle: e.target.value})} className="h-12 bg-slate-50 border-none rounded-xl font-medium" />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Project Entity Name</Label>
                            <Input value={foundationalData.projectName} onChange={(e)=>setFormData({...foundationalData, projectName: e.target.value})} className="h-12 bg-slate-50 border-none rounded-xl font-bold" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Promoter Name</Label>
                            <Input value={foundationalData.promoterName} onChange={(e)=>setFormData({...foundationalData, promoterName: e.target.value})} className="h-12 bg-slate-50 border-none rounded-xl font-bold" />
                        </div>
                      </div>
                  </div>
               </TabsContent>

               <TabsContent value="layout" className="space-y-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex justify-between">Logo UI Scaling (px) <span className="text-primary font-code">{foundationalData.coverLogoSize || 192}px</span></Label>
                        <Slider value={[foundationalData.coverLogoSize || 192]} min={100} max={400} step={8} onValueChange={([v]) => setFormData({...foundationalData, coverLogoSize: v})} />
                     </div>
                     <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex justify-between">Title Font Size (px) <span className="text-primary font-code">{foundationalData.coverTitleFontSize || 60}px</span></Label>
                        <Slider value={[foundationalData.coverTitleFontSize || 60]} min={24} max={120} step={2} onValueChange={([v]) => setFormData({...foundationalData, coverTitleFontSize: v})} />
                     </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Main Title Color (HEX)</Label>
                    <div className="flex gap-4 items-center">
                       <Input value={foundationalData.coverTitleColor || '#001F3D'} onChange={(e)=>setFormData({...foundationalData, coverTitleColor: e.target.value})} className="h-12 bg-white border-slate-200 rounded-xl font-code font-bold w-48" />
                       <div className="h-10 w-10 rounded-lg border shadow-sm" style={{ backgroundColor: foundationalData.coverTitleColor || '#001F3D' }} />
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex justify-between">Logo Top Margin <span className="text-slate-900 font-code">{foundationalData.coverLogoMarginTop || 0}px</span></Label>
                        <Slider value={[foundationalData.coverLogoMarginTop || 0]} min={0} max={200} step={4} onValueChange={([v]) => setFormData({...foundationalData, coverLogoMarginTop: v})} />
                     </div>
                     <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex justify-between">Title Top Margin <span className="text-slate-900 font-code">{foundationalData.coverTitleMarginTop || 32}px</span></Label>
                        <Slider value={[foundationalData.coverTitleMarginTop || 32]} min={0} max={200} step={4} onValueChange={([v]) => setFormData({...foundationalData, coverTitleMarginTop: v})} />
                     </div>
                     <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex justify-between">Footer Top Margin <span className="text-slate-900 font-code">{foundationalData.coverProjectEntityMarginTop || 80}px</span></Label>
                        <Slider value={[foundationalData.coverProjectEntityMarginTop || 80]} min={40} max={400} step={8} onValueChange={([v]) => setFormData({...foundationalData, coverProjectEntityMarginTop: v})} />
                     </div>
                  </div>
               </TabsContent>
             </Tabs>
          </div>
        );
      case 'swotAnalysis':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
             <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Strategic SWOT Matrix</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 space-y-4 shadow-sm">
                   <Label className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest ml-1">Strengths</Label>
                   <RichTextEditor value={foundationalData.swot_strengths || ""} onChange={(val) => setFormData({...foundationalData, swot_strengths: val})} />
                </div>
                <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 space-y-4 shadow-sm">
                   <Label className="text-[10px] font-bold uppercase text-rose-600 tracking-widest ml-1">Weaknesses</Label>
                   <RichTextEditor value={foundationalData.swot_weaknesses || ""} onChange={(val) => setFormData({...foundationalData, swot_weaknesses: val})} />
                </div>
                <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 space-y-4 shadow-sm">
                   <Label className="text-[10px] font-bold uppercase text-blue-600 tracking-widest ml-1">Opportunities</Label>
                   <RichTextEditor value={foundationalData.swot_opportunities || ""} onChange={(val) => setFormData({...foundationalData, swot_opportunities: val})} />
                </div>
                <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 space-y-4 shadow-sm">
                   <Label className="text-[10px] font-bold uppercase text-amber-600 tracking-widest ml-1">Threats</Label>
                   <RichTextEditor value={foundationalData.swot_threats || ""} onChange={(val) => setFormData({...foundationalData, swot_threats: val})} />
                </div>
             </div>
          </div>
        );
      case 'projectCost':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-6">
               <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest">Asset Matrix (CAPEX)</h3>
                  <Button variant="ghost" size="sm" className="text-primary font-bold text-[9px] uppercase" onClick={()=>setIsMachineryBreakupOpen(true)}>
                     <Edit3 className="h-3.5 w-3.5 mr-2" /> Edit Machinery Breakup
                  </Button>
               </div>
               <div className="overflow-x-auto border-2 border-slate-900 rounded-sm bg-white shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-900">
                        <tr className="text-[10px] font-bold uppercase">
                           <th className="p-3 border-r border-slate-900">Expenditure Node</th>
                           <th className="p-3 text-right">Amount (₹)</th>
                        </tr>
                     </thead>
                     <tbody className="text-xs">
                        <tr className="border-b border-slate-300">
                           <td className="p-3 border-r border-slate-900 font-medium">Plant & Machinery (VMC/CNC Fleet)</td>
                           <td className="p-1 text-right font-bold"><Input readOnly className="bg-slate-100 h-9 border-none text-right" value={financials.investMachinery.toLocaleString()} /></td>
                        </tr>
                        <tr className="border-b border-slate-300">
                           <td className="p-3 border-r border-slate-900 font-medium">Shed Advance (Security Deposit)</td>
                           <td className="p-1 text-right font-bold"><Input type="number" className="h-9 border-none text-right" value={financials.investShedAdvance} onChange={(e)=>setFinancials({...financials,investShedAdvance:Number(e.target.value)})} /></td>
                        </tr>
                        <tr className="border-b border-slate-300">
                           <td className="p-3 border-r border-slate-900 font-medium">Civil, Electrical & Infrastructure</td>
                           <td className="p-1 text-right font-bold"><Input type="number" className="h-9 border-none text-right" value={financials.investCivil} onChange={(e)=>setFinancials({...financials,investCivil:Number(e.target.value)})} /></td>
                        </tr>
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                           <td className="p-3 border-r border-slate-900 uppercase">Total Fixed Capital (One-Time)</td>
                           <td className="p-3 text-right text-lg text-[#001F3D]">₹ {calculations.fixedCapital.toLocaleString('en-IN')}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'meansOfFinance':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-6">
               <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest px-1">Means & Cost of Finance</h3>
               <div className="overflow-x-auto border border-slate-300 rounded-sm bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-300">
                        <tr className="text-[10px] font-bold uppercase text-blue-800">
                           <th className="p-3 border-r border-slate-300">Source</th>
                           <th className="p-3 text-center border-r border-slate-300 w-24">Share</th>
                           <th className="p-3 text-right border-r border-slate-300">Amount (₹)</th>
                           <th className="p-3 text-center w-32">Interest Rate</th>
                        </tr>
                     </thead>
                     <tbody className="text-xs">
                        <tr className="border-b border-slate-200">
                           <td className="p-3 border-r border-slate-200">Own Capital</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareOwn.toFixed(0)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {financials.ownCapital.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center text-slate-400">N/A</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                           <td className="p-3 border-r border-slate-200">Loan from Friends & Family</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareFF.toFixed(0)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {financials.loanFriendsFamily.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center text-slate-400">N/A</td>
                        </tr>
                        <tr className="border-b-2 border-slate-300 font-bold bg-slate-50/50">
                           <td className="p-3 border-r border-slate-200">Total Own Funds</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareTotalOwn.toFixed(0)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {calculations.totalOwnFunds.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center"></td>
                        </tr>
                        <tr className="border-b border-slate-200">
                           <td className="p-3 border-r border-slate-200">Term Loan</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareTerm.toFixed(0)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {calculations.loanAmt.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center font-bold text-primary">{financials.loanROI}%</td>
                        </tr>
                        <tr className="border-b-2 border-slate-400">
                           <td className="p-3 border-r border-slate-200">Working Capital limit</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareWC.toFixed(0)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {financials.workingCapitalLimit.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center font-bold text-primary">{financials.wcInterestRate}%</td>
                        </tr>
                        <tr className="bg-slate-100 font-black border-t border-slate-900">
                           <td className="p-3 border-r border-slate-200 text-right uppercase">Total</td>
                           <td className="p-3 text-center border-r border-slate-200">100%</td>
                           <td className="p-3 text-right text-base text-[#001F3D]">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</td>
                           <td className="p-3"></td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="h-5 w-5 text-emerald-600" />
                     <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Borrower's Margin Requirement</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-full">Working Capital: {financials.wcMarginPercent}% (₹ {calculations.requiredWCMargin.toLocaleString()})</Badge>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'breakevenAnalysis':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-12">
               <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Institutional Break-even Analysis Matrix</h3>
               <div className="border-2 border-slate-900 rounded-sm bg-white shadow-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 border-b-2 border-slate-900">
                      <tr>
                        <th className="p-4 text-[10px] font-bold uppercase border-r border-slate-300 w-[30%]">Particulars</th>
                        <th className="p-4 text-[10px] font-bold uppercase text-center border-r border-slate-300 italic">Remaining Current Year</th>
                        {calculations.breakevenMatrix.map(m => <th key={m.year} className="p-4 text-[10px] font-bold uppercase text-right border-r border-slate-300 last:border-0">{m.year}</th>)}
                      </tr>
                    </thead>
                    <tbody className="text-[10px]">
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200 font-bold">Revenue Income / Gross Sales (A)</td>
                        <td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.revenue.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Variable Costs</td>
                        <td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.variableCosts.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b-2 border-slate-900 bg-slate-50 font-bold">
                        <td className="p-3 px-4 border-r border-slate-200">Gross Profit (B)</td>
                        <td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.grossProfit.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-100 h-2"></tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Other Costs (Fixed OpEx)</td>
                        <td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.otherFixedCosts.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Depreciation</td>
                        <td className="p-3 text-center border-r border-slate-200 font-bold">-</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.depreciation.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Interest Cost</td>
                        <td className="p-3 text-center border-r border-slate-200 font-bold">-</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b-2 border-slate-900 bg-slate-50 font-bold">
                        <td className="p-3 px-4 border-r border-slate-200">Total Fixed Cost (C)</td>
                        <td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.totalFixedCost.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-100 h-2"></tr>
                      <tr className="bg-[#001F3D] text-white font-black">
                        <td className="p-4 px-6 text-sm border-r border-white/10 uppercase">Break Even Sales (A*C)/B</td>
                        <td className="p-3 text-center border-r border-white/10 text-white/40">****</td>
                        {calculations.breakevenMatrix.map((m, i) => <td key={i} className="p-4 text-right text-base border-r border-white/10 last:border-0 text-emerald-400">₹ {m.bepSales.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                    </tbody>
                  </table>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'productServices':
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="space-y-8">
               <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                 <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Proprietary Products Portfolio</h4>
               </div>
               <div className="grid grid-cols-3 gap-3">
                 {proprietaryProducts.map(p => (
                   <div key={p.id} className="p-3 bg-white border border-slate-100 rounded-[1.25rem] flex gap-4 shadow-sm min-h-[110px] items-center product-card">
                      <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100">
                         {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-contain" /> : <ImageIcon className="h-6 w-6 text-slate-200" />}
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                         <p className="text-[11px] font-bold uppercase text-[#001F3D] truncate leading-tight mb-1">{p.name}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight truncate mb-3">{p.market}</p>
                         <div className="flex flex-col gap-2 mt-auto">
                            <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                               <span className="text-[7px] font-bold text-slate-300 uppercase">Valuation</span>
                               <span className="text-[10px] font-black text-red-600">₹ {p.price}</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-[7px] font-bold text-slate-300 uppercase">Target</span>
                               <span className="text-[9px] font-bold text-slate-600 truncate">{p.annualTargetQty} / yr</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>

             <div className="h-px bg-slate-100" />

             <div className="space-y-8">
               <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-6">
                 <h4 className="text-xl font-display font-bold text-blue-900 uppercase tracking-tight">Industrial Technical Services Portfolio</h4>
               </div>
               <div className="grid grid-cols-3 gap-3">
                 {industrialServices.map(s => (
                   <div key={s.id} className="p-3 bg-white border border-slate-100 rounded-[1.25rem] flex gap-4 shadow-sm min-h-[110px] items-center product-card">
                      <div className="w-24 h-24 bg-blue-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 border border-blue-100">
                         {s.imageUrl ? <img src={s.imageUrl} alt="" className="w-full h-full object-contain" /> : <Settings2 className="h-6 w-6 text-blue-300" />}
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                         <p className="text-[11px] font-bold uppercase text-blue-900 truncate leading-tight mb-1">{s.name}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight line-clamp-1 mb-3">{s.description}</p>
                         <div className="flex flex-col gap-2 mt-auto">
                            <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                               <span className="text-[7px] font-bold text-slate-300 uppercase">Rate</span>
                               <span className="text-[10px] font-black text-blue-600">₹ {s.price}</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-[7px] font-bold text-slate-300 uppercase">Target</span>
                               <span className="text-[9px] font-bold text-slate-600 truncate">{s.annualTargetQty} / yr</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        );
      case 'cashFlowStatement':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-6">
               <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest px-1">Projected 5-Year Cash Flow Matrix</h3>
               <div className="border border-slate-200 overflow-x-auto rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                     <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                           <th className="p-4 text-[9px] font-bold uppercase text-slate-400 border-r w-[25%]">Cash Particulars</th>
                           {calculations.projections.map(p=><th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r last:border-0">{p.year}</th>)}
                        </tr>
                     </thead>
                     <tbody className="text-[10px]">
                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-primary uppercase border-b">A. Cash Flow from Operating Activities</td></tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Net Profit After Tax (PAT)</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">{c.pat.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Add: Interest Expense</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">{c.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Add: Depreciation</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">{c.depreciation.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b bg-slate-50 font-bold"><td className="p-3 pl-6 uppercase border-r">Operating Profit before WC Changes</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">₹ {c.opProfitBeforeWC.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r text-slate-400">(Increase)/Decrease in Current Assets</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0 text-slate-400">---</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r text-slate-400">Increase/(Decrease) in Current Liabilities</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0 text-slate-400">---</td>)}</tr>
                        <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold"><td className="p-3 px-4 uppercase border-r text-emerald-700">Net Cash from Operating Activities</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0 text-emerald-700">₹ {c.netOpCash.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-blue-600 uppercase border-b">B. Cash Flow from Financing Activities</td></tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Interest Expense</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0 text-red-600">{c.financing.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Term Loan Taken / (Repaid)</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">{c.financing.termLoan.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Working Capital Loan Taken / (Repaid)</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">{c.financing.wcLoan.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Capital Introduced / Loan from F&F</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">{c.financing.ownFunds.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold"><td className="p-3 px-4 uppercase border-r text-blue-700">Net Cash from Financing Activities</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">₹ {c.financing.total.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-purple-600 uppercase border-b">C. Cash Flow from Investing Activities</td></tr>
                        <tr className="border-b-2 border-slate-300"><td className="p-3 pl-8 border-r">Purchase of Fixed Assets (CAPEX)</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0 text-red-600">{c.investing.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                        <tr className="bg-slate-200 font-bold border-t-2 border-slate-900"><td className="p-3 px-4 uppercase border-r">Total Cash Inflow / (Outflow) (A+B+C)</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">₹ {c.totalInflow.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 px-4 border-r bg-slate-50">Add: Opening Cash Balance</td>{calculations.cashFlow.map((c,i)=><td key={i} className="p-3 text-right border-r last:border-0">₹ {c.openingCash.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="bg-[#001F3D] text-white font-bold">
                           <td className="p-4 px-6 text-[11px] font-bold uppercase border-r border-white/10">Closing Cash Balance</td>
                           {calculations.cashFlow.map((c,i)=><td key={i} className="p-4 text-[12px] font-display font-bold text-emerald-400 text-right border-r border-white/10 last:border-0">₹ {c.closingCash.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'amortizationSchedule':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-12">
               <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Institutional Monthly Amortization Schedule</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">7-Year (84 Months) Strategic Debt Settlement Protocol</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-600 text-white border-none text-[10px] font-bold px-4 py-2 rounded-xl shadow-lg">Monthly EMI: ₹ {Math.round(calculations.emi).toLocaleString()}</Badge>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-10">
                  {/* First Column (Months 1-42) */}
                  <div className="border-2 border-slate-900 rounded-sm bg-white overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b-2 border-slate-900">
                        <tr className="text-[8px] font-bold uppercase">
                          <th className="p-2 border-r">Mth</th>
                          <th className="p-2 border-r text-right">Interest</th>
                          <th className="p-2 border-r text-right">Principal</th>
                          <th className="p-2 text-right">Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="text-[8px] font-code">
                        {calculations.monthlySchedule.slice(0, 42).map((m) => (
                          <tr key={m.month} className={cn("border-b border-slate-100", m.month % 12 === 0 ? "border-b-2 border-slate-300 bg-slate-50" : "")}>
                            <td className="p-2 border-r font-bold">{m.month.toString().padStart(2, '0')}</td>
                            <td className="p-2 border-r text-right text-red-600">{m.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                            <td className="p-2 border-r text-right text-emerald-600">{m.principal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                            <td className="p-2 text-right font-bold">{m.balance.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Second Column (Months 43-84) */}
                  <div className="border-2 border-slate-900 rounded-sm bg-white overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b-2 border-slate-900">
                        <tr className="text-[8px] font-bold uppercase">
                          <th className="p-2 border-r">Mth</th>
                          <th className="p-2 border-r text-right">Interest</th>
                          <th className="p-2 border-r text-right">Principal</th>
                          <th className="p-2 text-right">Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="text-[8px] font-code">
                        {calculations.monthlySchedule.slice(42, 84).map((m) => (
                          <tr key={m.month} className={cn("border-b border-slate-100", m.month % 12 === 0 ? "border-b-2 border-slate-300 bg-slate-50" : "")}>
                            <td className="p-2 border-r font-bold">{m.month.toString().padStart(2, '0')}</td>
                            <td className="p-2 border-r text-right text-red-600">{m.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                            <td className="p-2 border-r text-right text-emerald-600">{m.principal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                            <td className="p-2 text-right font-bold">{m.balance.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'mpbfCalculation':
        return (
          <NoteWrapper sectionId={sectionId}>
             <div className="space-y-12">
                <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Institutional MPBF Assessment Matrix</h3>
                <div className="border-2 border-slate-900 rounded-sm bg-white shadow-xl overflow-x-auto">
                   <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead className="bg-slate-950 text-white border-b-2 border-slate-900">
                         <tr>
                            <th className="p-4 text-[10px] font-bold uppercase border-r border-white/10 w-[30%]">MPBF Assessment Particulars</th>
                            {calculations.mpbfMatrix.map(m=><th key={m.year} className="p-4 text-[10px] font-bold uppercase text-right border-r border-white/10 last:border-0">{m.year}</th>)}
                         </tr>
                      </thead>
                      <tbody className="text-[10px]">
                         <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Total Current Assets (A)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.currentAssets.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                         <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Total Current Liabilities (other than Bank Borrowing) (B)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.currentLiabs.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                         <tr className="border-b-2 border-slate-900 bg-slate-50 font-black"><td className="p-3 px-4 border-r border-slate-200 uppercase">Working Capital Gap (C = A - B)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.wcGap.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                         
                         <tr className="bg-slate-100 font-bold"><td colSpan={6} className="p-3 px-4 border-b border-slate-900 text-blue-800 uppercase">1st Method of Lending</td></tr>
                         <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200 italic">Minimum Stipulated Net Working Capital (D = 25% of C)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method1.minNetWC.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                         <tr className="border-b-2 border-slate-400 bg-blue-50 font-bold"><td className="p-3 px-4 border-r border-slate-200 uppercase text-blue-900">MPBF 1st Method (C - D)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method1.mpbf.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                         <tr className="bg-slate-100 font-bold"><td colSpan={6} className="p-3 px-4 border-b border-slate-900 text-emerald-800 uppercase">2nd Method of Lending</td></tr>
                         <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200 italic">Minimum Stipulated Net Working Capital (E = 25% of A)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method2.minNetWC.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                         <tr className="border-b-2 border-slate-400 bg-emerald-50 font-bold"><td className="p-3 px-4 border-r border-slate-200 uppercase text-emerald-900">MPBF 2nd Method (C - E)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method2.mpbf.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                         <tr className="bg-slate-100 font-bold"><td colSpan={6} className="p-3 px-4 border-b border-slate-900 text-purple-800 uppercase">Percentage of Sales method</td></tr>
                         <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200 italic">Gross Revenue / Sales</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.salesMethod.revenue.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                         <tr className="border-b-2 border-slate-950 bg-purple-50 font-bold"><td className="p-3 px-4 border-r border-slate-200 uppercase text-purple-900">MPBF - 25% of Sales</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.salesMethod.mpbf.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                      </tbody>
                   </table>
                </div>
             </div>
          </NoteWrapper>
        );
      case 'dscrMatrix':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-12">
               <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Institutional DSCR Matrix Analysis</h3>
               <div className="border-2 border-slate-900 rounded-sm bg-white shadow-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-slate-50 border-b-2 border-slate-900">
                      <tr className="text-[10px] font-bold uppercase">
                        <th className="p-4 border-r border-slate-300 w-[30%]">Particulars</th>
                        {calculations.dscrMatrix.map(m => <th key={m.year} className="p-4 text-right border-r border-slate-300 last:border-0">{m.year}</th>)}
                      </tr>
                    </thead>
                    <tbody className="text-[10px]">
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">PAT + Depreciation + Interest</td>
                        {calculations.dscrMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0 font-bold">₹ {m.numerator.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Interest payment</td>
                        {calculations.dscrMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">{m.interestPayment.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Principal Repayment of Term Loan</td>
                        {calculations.dscrMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">{m.termLoanPrincipal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Principal Repayment of Working Capital Limit</td>
                        {calculations.dscrMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">{m.wcPrincipal > 0 ? `₹ ${m.wcPrincipal.toLocaleString()}` : '---'}</td>)}
                      </tr>
                      <tr className="border-b-2 border-slate-300 bg-slate-50 font-bold">
                        <td className="p-3 px-4 border-r border-slate-200 uppercase">Total Repayment during the year</td>
                        {calculations.dscrMatrix.map((m, i) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.totalRepayment.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="bg-[#001F3D] text-white font-black">
                        <td className="p-4 px-6 text-base border-r border-white/10 uppercase">DSCR</td>
                        {calculations.dscrMatrix.map((m, i) => <td key={i} className="p-4 text-right text-lg border-r border-white/10 last:border-0">{m.dscr}</td>)}
                      </tr>
                    </tbody>
                  </table>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-900 shadow-sm space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average DSCR (Term Loan + Working Capital Loan)</p>
                    <p className="text-3xl font-display font-bold text-[#001F3D]">{calculations.avgDSCR}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-900 shadow-sm space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average DSCR (Term Loan only)</p>
                    <p className="text-3xl font-display font-bold text-primary">{calculations.avgDSCRTermOnly}</p>
                  </div>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'roadmap':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-6">
               <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest px-1">5-Year Strategic Yield Road Map</h3>
               <div className="border-2 border-slate-900 overflow-x-auto rounded-sm bg-white shadow-sm">
                  <table className="w-full text-left min-w-[800px]">
                     <thead className="bg-slate-50 border-b-2 border-slate-900">
                        <tr>
                           <th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200 w-[20%]">Performance Particulars</th>
                           {calculations.projections.map(p=><th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="border-b font-bold"><td className="p-4 text-[10px] uppercase border-r bg-slate-50">Income from Operations</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-right border-r last:border-0">₹ {(p.revenue||0).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="border-b"><td className="p-4 text-[10px] uppercase border-r bg-slate-50">EBITDA Node</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-right border-r last:border-0">₹ {(p.ebitda||0).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                           <td className="p-4 text-[11px] uppercase border-r border-slate-900">Profit After Tax (PAT)</td>
                           {calculations.projections.map(p=><td key={p.year} className="p-4 text-right border-r last:border-0 text-emerald-600">₹ {(p.pat||0).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'workingCapitalRequirement':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-6">
               <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest px-1">Working Capital & Liquidity Matrix</h3>
               <div className="overflow-x-auto border-2 border-slate-900 rounded-sm bg-white shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-900">
                        <tr className="text-[10px] font-bold uppercase">
                           <th className="p-4 border-r border-slate-900">Operational Burn Item</th>
                           <th className="p-4 text-right">Monthly Burn (₹)</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="border-b border-slate-300">
                           <td className="p-4 border-r border-slate-900">Premises Rental Node</td>
                           <td className="p-4 text-right font-bold">₹ {financials.expenseRent.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                           <td className="p-4 border-r border-slate-900">Industrial Power & Utilities</td>
                           <td className="p-4 text-right font-bold">₹ {financials.expensePower.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                           <td className="p-4 border-r border-slate-900">Tooling & Consumables Reserve</td>
                           <td className="p-4 text-right font-bold">₹ {financials.expenseConsumables.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                           <td className="p-4 border-r border-slate-900 uppercase">3-Month Liquidity Requirement (Target)</td>
                           <td className="p-4 text-right text-lg text-[#001F3D]">₹ {calculations.workingCapitalValue.toLocaleString()}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'financialProjections':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-12">
               <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Projected Sources of Funds Matrix</h3>
                  <div className="border border-slate-300 rounded-sm bg-white overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead className="bg-slate-50 border-b-2 border-slate-300">
                        <tr className="text-[9px] font-bold uppercase">
                          <th className="p-4 border-r border-slate-200">Particulars</th>
                          {calculations.balanceSheet.map(b => <th key={b.year} className="p-4 text-right border-r border-slate-200">{b.year}</th>)}
                        </tr>
                      </thead>
                      <tbody className="text-[10px]">
                        <tr className="bg-blue-50 font-bold border-b border-slate-300"><td colSpan={6} className="p-2 px-4 uppercase text-blue-900">A. Own Funds</td></tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Initial Capital / Opening Balance</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.sources.ownFunds.opening.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Profit (+) or Loss (-) from current P&L</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r text-emerald-600 font-bold">₹ {b.sources.ownFunds.profit.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Less: Drawings / Dividend</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r text-red-600">₹ -{b.sources.ownFunds.drawings.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="bg-slate-50 font-bold border-b-2 border-slate-300">
                          <td className="p-3 px-6 border-r border-slate-200 uppercase">Total Own Funds</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r text-blue-700">₹ {b.sources.ownFunds.total.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>

                        <tr className="bg-purple-50 font-bold border-b border-slate-300"><td colSpan={6} className="p-2 px-4 uppercase text-purple-900">B. Long Term Liabilities</td></tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Term Loan from Bank</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.sources.longTermLiabs.bankLoan.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Loan from Friends & Family</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.sources.longTermLiabs.friendsFamily.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>

                        <tr className="bg-amber-50 font-bold border-b border-slate-300"><td colSpan={6} className="p-2 px-4 uppercase text-amber-900">C. Current Liabilities</td></tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Working Capital Loan</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.sources.currentLiabs.wcLoan.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Provision for Taxation</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.sources.currentLiabs.taxProvision.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Sundry Creditors & Provisions</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.sources.currentLiabs.creditors.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>

                        <tr className="bg-[#001F3D] text-white font-black border-t-2 border-slate-900">
                          <td className="p-4 px-6 border-r border-white/10 uppercase">Total Sources of Funds</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-4 text-right text-base border-r border-white/10">₹ {b.sources.total.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>

               <div className="space-y-6 pt-10">
                  <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Projected Application of Funds Matrix</h3>
                  <div className="border border-slate-300 rounded-sm bg-white overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead className="bg-slate-50 border-b-2 border-slate-300">
                        <tr className="text-[9px] font-bold uppercase">
                          <th className="p-4 border-r border-slate-200">Particulars</th>
                          {calculations.balanceSheet.map(b => <th key={b.year} className="p-4 text-right border-r border-slate-200">{b.year}</th>)}
                        </tr>
                      </thead>
                      <tbody className="text-[10px]">
                        <tr className="bg-blue-50 font-bold border-b border-slate-300"><td colSpan={6} className="p-2 px-4 uppercase text-blue-900">A. Non Current Assets (Fixed Assets)</td></tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Gross Block (Assets at Cost)</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.application.nonCurrentAssets.grossBlock.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Depreciation till Date</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r text-red-600">₹ -{b.application.nonCurrentAssets.depreciation.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="bg-slate-50 font-bold border-b-2 border-slate-300">
                          <td className="p-3 px-6 border-r border-slate-200 uppercase">Net Block (W.D.V)</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r text-blue-700">₹ {b.application.nonCurrentAssets.netBlock.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>

                        <tr className="bg-emerald-50 font-bold border-b border-slate-300"><td colSpan={6} className="p-2 px-4 uppercase text-emerald-900">B. Current Assets</td></tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Cash & Bank Balance</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.application.currentAssets.cashBank.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Trade Receivables (Debtors)</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.application.currentAssets.receivables.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Inventory (Raw Material, WIP, Finished)</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {(b.application.currentAssets.rawMaterial + b.application.currentAssets.wip + b.application.currentAssets.finishedGoods).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3 px-4 border-r border-slate-100">Other Current Assets & Advances</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-3 text-right border-r">₹ {b.application.currentAssets.others.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>

                        <tr className="bg-[#001F3D] text-white font-black border-t-2 border-slate-900">
                          <td className="p-4 px-6 border-r border-white/10 uppercase">Total Application of Funds</td>
                          {calculations.balanceSheet.map((b,i) => <td key={i} className="p-4 text-right text-base border-r border-white/10">₹ {b.application.total.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'turnoverAnalysis':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-12">
               <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest px-1">21. Turnover & Profitability Matrix</h3>
               <KeyDataAtGlance isReport={true} />
               <div className="border border-slate-200 overflow-x-auto rounded-xl bg-white shadow-sm mt-8">
                  <table className="w-full text-left min-w-[800px]">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[9px] font-bold uppercase text-slate-400">
                           <th className="p-4 border-r">Fiscal Window</th>
                           {calculations.projections.map(p=><th key={p.year} className="p-4 text-right border-r last:border-0">{p.year}</th>)}
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="border-b"><td className="p-4 font-bold border-r bg-slate-50 text-[10px] uppercase">Projected Turnover</td>{calculations.projections.map(p=><td key={p.year} className="p-4 text-right border-r text-[10px] font-bold">₹ {p.revenue.toLocaleString()}</td>)}</tr>
                        <tr className="bg-slate-100 font-bold"><td className="p-4 border-r text-[10px] uppercase">Yield Growth %</td>{financials.yearlyGrowthTargets.map((g,i)=><td key={i} className="p-4 text-right border-r text-[10px] text-primary">{g}%</td>)}</tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </NoteWrapper>
        );
      case 'keyRatios':
        return (
          <NoteWrapper sectionId={sectionId}>
            <div className="space-y-6">
               <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest px-1">24. Key Industrial Ratios Ledger</h3>
               <div className="border-2 border-slate-900 overflow-x-auto rounded-sm bg-white shadow-sm">
                  <table className="w-full text-left min-w-[900px] border-collapse">
                     <thead className="bg-slate-50 border-b-2 border-slate-900">
                        <tr>
                           <th className="p-4 text-[9px] font-bold uppercase border-r border-slate-200">Ratio Particulars</th>
                           {calculations.projections.map(p=><th key={p.year} className="p-4 text-[9px] font-bold uppercase text-right border-r border-slate-200 last:border-0">{p.year}</th>)}
                        </tr>
                     </thead>
                     <tbody className="text-[10px]">
                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-primary uppercase border-b">Long-term Solvency Ratios</td></tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Debt Equity Ratio</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.debtEquity}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Debt Ratio</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.debtRatio}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">TOL/TNW</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.tolTnw}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Interest Coverage</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.interestCoverage}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Debt Service Coverage Ratio (DSCR)</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.dscr}</td>)}</tr>

                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-blue-600 uppercase border-b">Short-term Solvency Ratios</td></tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Current Ratio</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.currentRatio}</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Quick Ratio or Liquid Ratio</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.quickRatio}</td>)}</tr>

                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-emerald-600 uppercase border-b">Profitability Ratios</td></tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">EBIDTA Margin (%)</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.ebitdaMargin}%</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Net Profit Margin (%)</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.npMargin}%</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Return on Assets (ROA %)</td>{calculations.ratioMatrix.map((r,i)=><td key={i} className="p-3 text-right border-r last:border-0">{r.roa}%</td>)}</tr>

                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-purple-600 uppercase border-b">Growth Ratios (Annualised)</td></tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Sales / Revenue Growth</td>{financials.yearlyGrowthTargets.map((g,i)=><td key={i} className="p-3 text-right border-r last:border-0">{g}%</td>)}</tr>

                        <tr className="bg-slate-50/50"><td colSpan={6} className="p-3 px-4 font-bold text-amber-600 uppercase border-b">Activity Ratios (Cycles)</td></tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Debtors Turnover (days)</td>{calculations.projections.map((_,i)=><td key={i} className="p-3 text-right border-r last:border-0">45</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Sundry Creditors (days)</td>{calculations.projections.map((_,i)=><td key={i} className="p-3 text-right border-r last:border-0">30</td>)}</tr>
                        <tr className="border-b"><td className="p-3 pl-8 border-r">Inventory Turnover (days)</td>{calculations.projections.map((_,i)=><td key={i} className="p-3 text-right border-r last:border-0">60</td>)}</tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </NoteWrapper>
        );
      default: 
        return (
          <div className="space-y-8 animate-in fade-in duration-1000">
            <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">{REPORT_SEQUENCE.find(s=>s.id === sectionId)?.label}</h3>
            <RichTextEditor 
              value={foundationalData[sectionId] || ""} 
              onChange={(val)=>setFormData({...foundationalData, [sectionId]: val})} 
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body pb-20 print:pb-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 no-print">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Landmark className="h-4 w-4" /> Strategic Architect
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#001F3D]">Strategy <span className="text-slate-400 font-medium">Engineer</span></h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
           <div className="flex items-center gap-4 bg-slate-50 px-5 h-12 rounded-xl border border-slate-200 mr-2 shadow-sm">
             <button onClick={()=>setZoom(Math.max(zoom-0.1, 0.5))} className="p-1 hover:bg-slate-200 rounded-md transition-colors"><ZoomOut className="h-4 w-4 text-slate-500" /></button>
             <span className="flex items-center text-[11px] font-bold w-12 justify-center text-[#001F3D]">{Math.round(zoom*100)}%</span>
             <button onClick={()=>setZoom(Math.min(zoom+0.1, 2))} className="p-1 hover:bg-slate-200 rounded-md transition-colors"><ZoomIn className="h-4 w-4 text-slate-500" /></button>
           </div>
           <Button variant="outline" className="h-12 rounded-xl border-slate-200 px-8 font-bold text-[10px] uppercase tracking-widest gap-2 flex-1 sm:flex-none" onClick={exportToWord}><FileText className="h-4 w-4 mr-2" /> MS Word</Button>
           <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3 flex-1 sm:flex-none" onClick={() => handleSaveStrategy()}><Save className="h-4 w-4" /> Commit Strategy</Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full no-print">
        <div className="overflow-x-auto pb-4">
          <TabsList className="bg-slate-100 p-1.5 rounded-full mb-2 h-14 inline-flex border border-slate-200 shadow-sm gap-2 min-w-max">
            <TabsTrigger value="input" className="rounded-full px-6 md:px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">01. Identity Matrix</TabsTrigger>
            <TabsTrigger value="catalogues" className="rounded-full px-6 md:px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">02. Catalogues</TabsTrigger>
            <TabsTrigger value="financials" className="rounded-full px-6 md:px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">03. Financial Projection</TabsTrigger>
            <TabsTrigger value="display" className="rounded-full px-6 md:px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">04. Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="input" className="m-0 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                 <Card className="p-6 md:p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-10 min-h-[600px]">
                    {renderActiveEditor(activeEditingSection)}
                 </Card>
              </div>
              <Card className="lg:col-span-4 p-6 md:p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] h-fit lg:h-[calc(100vh-300px)] sticky top-24 flex flex-col">
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/40 mb-8 shrink-0">Report Matrix</h3>
                 <ScrollArea className="flex-1 pr-4 -mr-4">
                  <div className="space-y-3 pb-6">
                      {REPORT_SEQUENCE.map((item) => (
                        <div key={item.id} className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group", activeEditingSection === item.id ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10")} onClick={() => setActiveEditingSection(item.id)}>
                            <Checkbox checked={checklist[item.id]} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-[#001F3D]" onCheckedChange={() => setChecklist({...checklist, [item.id]: !checklist[item.id]})} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", activeEditingSection === item.id ? "text-white" : "text-white/60 group-hover:text-white")}>{item.label}</span>
                        </div>
                      ))}
                  </div>
                 </ScrollArea>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="catalogues" className="m-0 space-y-10">
           <div className="grid grid-cols-1 gap-12">
              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                 <div className="flex justify-between items-center border-l-4 border-primary pl-6">
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Proprietary Product Matrix</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct manufactured yields.</p>
                    </div>
                    <button type="button" onClick={() => setProprietaryProducts([...proprietaryProducts, { id: Date.now().toString(), name: '', market: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])} className="text-primary font-bold text-[9px] uppercase gap-2 hover:bg-primary/5 flex items-center p-2 rounded-lg">
                       <Plus className="h-3.5 w-3.5" /> Append Node
                    </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proprietaryProducts.map((p, idx) => (
                      <div key={p.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-6 relative group transition-all hover:bg-white hover:border-primary/20">
                         <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-slate-300 group-hover:text-red-500" onClick={()=>setProprietaryProducts(proprietaryProducts.filter((_,i)=>i!==idx))}><Trash2 className="h-4 w-4" /></Button>
                         <div className="w-full h-32 bg-white border rounded-xl overflow-hidden shrink-0 relative group/img">
                           {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="h-8 w-8 text-slate-200 m-auto mt-10" />}
                           <input type="file" id={`p-cat-img-${p.id}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(idx, 'product', e)} />
                           <label htmlFor={`p-cat-img-${p.id}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                              <Upload className="h-5 w-5 text-white" />
                           </label>
                        </div>
                         <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                               <Label className="text-[8px] font-bold uppercase text-slate-400">Part Name</Label>
                               <Input value={p.name} onChange={(e)=>updateProduct(idx,'name',e.target.value)} className="h-8 mb-2 font-bold bg-white text-[11px] uppercase" placeholder="Product Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Price (₹)</Label>
                                <Input value={p.price} onChange={(e)=>updateProduct(idx,'price',e.target.value)} className="h-8 bg-white border-none font-bold text-xs" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Annual Qty</Label>
                                <Input value={p.annualTargetQty} onChange={(e)=>updateProduct(idx,'annualTargetQty',e.target.value)} className="h-8 bg-white border-none font-bold text-xs" />
                              </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </Card>

              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                 <div className="flex justify-between items-center border-l-4 border-blue-500 pl-6">
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Industrial Technical Services</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">External job work and specialized services.</p>
                    </div>
                    <button type="button" onClick={() => setIndustrialServices([...industrialServices, { id: Date.now().toString(), name: '', description: '', price: '0.00', annualTargetQty: '0', imageUrl: '' }])} className="text-blue-600 font-bold text-[9px] uppercase gap-2 hover:bg-blue-50 flex items-center p-2 rounded-lg">
                       <Plus className="h-3.5 w-3.5" /> Append Node
                    </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {industrialServices.map((s, idx) => (
                      <Card key={s.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-6 relative group transition-all hover:bg-white hover:border-blue-200">
                         <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={()=>setIndustrialServices(industrialServices.filter((_,i)=>i!==idx))}><Trash2 className="h-4 w-4" /></Button>
                         <div className="w-full h-32 bg-white rounded-xl overflow-hidden shrink-0 relative group/img">
                           {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-full w-full object-cover" /> : <Settings2 className="h-8 w-8 text-slate-200 m-auto mt-10" />}
                           <input type="file" id={`s-cat-img-${s.id}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(idx, 'service', e)} />
                           <label htmlFor={`s-cat-img-${s.id}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                              <Upload className="h-5 w-5 text-white" />
                           </label>
                        </div>
                         <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                               <Label className="text-[8px] font-bold uppercase text-slate-400">Service Node</Label>
                               <Input value={s.name} onChange={(e)=>updateService(idx,'name',e.target.value)} className="h-8 mb-2 font-bold bg-white text-[11px] uppercase" placeholder="Service Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Rate (₹)</Label>
                                <Input value={s.price} onChange={(e)=>updateService(idx,'price',e.target.value)} className="h-8 bg-white border-none font-bold text-xs" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[8px] font-bold uppercase text-slate-400">Annual Units</Label>
                                <Input value={s.annualTargetQty} onChange={(e)=>updateService(idx,'annualTargetQty',e.target.value)} className="h-8 bg-white border-none font-bold text-xs" />
                              </div>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-10 animate-in slide-in-from-bottom-2 duration-500">
           <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
              <div className="flex items-center justify-between border-l-4 border-purple-500 pl-6">
                 <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Executive Summary Snapshot</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Project vitals and institutional funding nodes.</p>
                 </div>
                 <Badge className="bg-purple-50 text-purple-700 border-none text-[8px] font-bold px-4 py-1.5 rounded-full">SYSTEM_READY</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Project Cost</p>
                    <p className="text-xl font-display font-bold text-[#001F3D]">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-2">Term Loan Node</p>
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
           </Card>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-8">
                 <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] border-l-4 border-primary pl-4">Means & Cost of Finance</h3>
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Own Funds Registry</Label>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold text-slate-500 uppercase">Own Capital (₹)</Label>
                                <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.ownCapital} onChange={(e)=>setFinancials({...financials, ownCapital: Number(e.target.value)})} />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold text-slate-500 uppercase">Friends & Family (₹)</Label>
                                <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.loanFriendsFamily} onChange={(e)=>setFinancials({...financials, loanFriendsFamily: Number(e.target.value)})} />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Institutional Finance Nodes</Label>
                            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold px-2">WC Margin: {financials.wcMarginPercent}%</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                  <Label className="text-[8px] font-bold text-slate-500 uppercase">Working Capital Limit (₹)</Label>
                                  <button type="button" onClick={() => setFinancials({...financials, workingCapitalLimit: Math.round(calculations.mpbf)})} className="text-[7px] font-bold uppercase text-primary hover:underline">Apply MPBF</button>
                                </div>
                                <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.workingCapitalLimit} onChange={(e)=>setFinancials({...financials, workingCapitalLimit: Number(e.target.value)})} />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold text-slate-500 uppercase">WC Interest Rate (%)</Label>
                                <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.wcInterestRate} onChange={(e)=>setFinancials({...financials, wcInterestRate: Number(e.target.value)})} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[8px] font-bold text-slate-500 uppercase">Borrower's Margin / Contribution (%)</Label>
                             <Input type="number" className="h-10 bg-emerald-50 border-none rounded-xl font-bold" value={financials.wcMarginPercent} onChange={(e)=>setFinancials({...financials, wcMarginPercent: Number(e.target.value)})} />
                             <p className="text-[7px] text-slate-400 uppercase font-bold">* Requirement: ₹ {calculations.requiredWCMargin.toLocaleString()} contribution based on WC cycle.</p>
                          </div>
                       </div>

                       <div className="space-y-2 pt-4 border-t">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Total Project Cost Node (₹)</Label>
                          <div className="p-5 bg-slate-50 rounded-2xl font-display font-bold text-xl text-[#001F3D] shadow-inner border border-slate-100">
                             {calculations.totalProjectCost.toLocaleString('en-IN')}
                          </div>
                       </div>
                    </div>
                 </Card>

                 <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] border-l-4 border-red-500 pl-4">Term Loan Governance</h3>
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">ROI (% P.A.)</Label>
                             <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.loanROI} onChange={(e)=>setFinancials({...financials, loanROI: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-400">Tenure (Months)</Label>
                             <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.loanTenure} onChange={(e)=>setFinancials({...financials, loanTenure: Number(e.target.value)})} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Moratorium (Months)</Label>
                          <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.loanMoratorium} onChange={(e)=>setFinancials({...financials, loanMoratorium: Number(e.target.value)})} />
                       </div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-7 space-y-8">
                 <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <h3 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.3em] border-l-4 border-[#001F3D] pl-4">16. Project Cost Matrix</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Plant & Machinery</Label>
                          <div className="relative">
                             <Input readOnly className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.investMachinery.toLocaleString()} />
                             <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary" onClick={()=>setIsMachineryBreakupOpen(true)}><Edit3 className="h-3.5 w-3.5" /></Button>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Civil & Infrastructure</Label>
                          <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.investCivil} onChange={(e)=>setFinancials({...financials, investCivil: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Electrical Setup</Label>
                          <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.investElectrical} onChange={(e)=>setFinancials({...financials, investElectrical: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">Shed Security Advance</Label>
                          <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.investShedAdvance} onChange={(e)=>setFinancials({...financials, investShedAdvance: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">CAD/CAM Software</Label>
                          <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.investSoftware} onChange={(e)=>setFinancials({...financials, investSoftware: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-slate-400">IT Systems/HW</Label>
                          <Input type="number" className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={financials.investSystem} onChange={(e)=>setFinancials({...financials, investSystem: Number(e.target.value)})} />
                       </div>
                    </div>
                 </Card>

                 <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                    <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] border-l-4 border-emerald-600 pl-4">Monthly Operational Burn (OpEx)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Rent</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.expenseRent} onChange={(e)=>setFinancials({...financials, expenseRent: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Power</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.expensePower} onChange={(e)=>setFinancials({...financials, expensePower: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Maintenance</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={financials.expenseMaintenance} onChange={(e)=>setFinancials({...financials, expenseMaintenance: Number(e.target.value)})} /></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Monthly EMI</Label><div className="h-12 bg-slate-100 rounded-xl flex items-center px-4 font-display font-bold text-primary shadow-inner">₹ {calculations.emi.toLocaleString('en-IN', {maximumFractionDigits:0})}</div></div>
                       <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Total Monthly Load</Label><div className="h-12 bg-emerald-50 rounded-xl flex items-center px-4 font-display font-bold text-emerald-700 shadow-inner">₹ {(calculations.monthlyOpEx + calculations.emi).toLocaleString('en-IN', {maximumFractionDigits: 0})}</div></div>
                    </div>
                 </Card>

                 <Card className="p-8 border-slate-200 bg-white shadow-xl rounded-[2rem] space-y-6">
                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-l-4 border-blue-600 pl-4">Variable Cost Assumptions</h3>
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest flex justify-between">Variable Cost (% of Revenue) <span className="text-blue-600 font-code">{financials.variableCostPercent}%</span></Label>
                          <Slider value={[financials.variableCostPercent]} min={30} max={80} step={1} onValueChange={([v]) => setFinancials({...financials, variableCostPercent: v})} />
                          <p className="text-[8px] text-slate-400 uppercase font-bold mt-2">* Includes Raw Materials, Consumables, and Direct Utilities.</p>
                       </div>
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-12">
                <Card className="p-10 border-slate-200 bg-white shadow-xl rounded-[2.5rem]">
                   <KeyDataAtGlance />
                </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="display" className="m-0 flex flex-col items-center overflow-x-hidden print:overflow-visible">
           <div className="w-full overflow-x-auto pb-20 px-4 scrollbar-hide print:overflow-visible print:px-0">
              <div 
                id="institutional-report-matrix"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm' }} 
                className="mx-auto print:transform-none bg-white shadow-2xl print:shadow-none print-matrix"
              >
                <div className="p-10 md:p-20 min-h-[297mm] space-y-16 print:p-12 print:shadow-none relative bg-white">
                   <div className="min-h-[297mm] flex flex-col items-center justify-center text-center border-b-2 border-slate-900 pb-20 page-break relative z-10">
                      <Watermark />
                      <button 
                        type="button"
                        className="absolute top-4 right-4 no-print text-[#001F3D] hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest gap-2 h-8 rounded-lg flex items-center p-2"
                        onClick={() => setEditingSectionInPreview('coverDetails')}
                      >
                         <Edit3 className="h-3.5 w-3.5" /> Edit Cover Meta
                      </button>
                      <div 
                        className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border flex items-center justify-center p-4 transition-all"
                        style={{ 
                          width: `${foundationalData.coverLogoSize || 192}px`, 
                          height: `${foundationalData.coverLogoSize || 192}px`,
                          marginTop: `${foundationalData.coverLogoMarginTop || 0}px`
                        }}
                      >
                         {brandLogo && <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-4" />}
                      </div>
                      <div className="space-y-4" style={{ marginTop: `${foundationalData.coverTitleMarginTop || 32}px` }}>
                         <h1 
                            className="font-display font-bold tracking-tighter uppercase leading-none"
                            style={{ 
                              fontSize: `${foundationalData.coverTitleFontSize || 60}px`,
                              color: foundationalData.coverTitleColor || '#001F3D'
                            }}
                          >
                            {foundationalData.reportMainTitle}
                          </h1>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">{foundationalData.reportSubTitle}</p>
                      </div>
                      <div className="h-1.5 w-24 md:w-32 bg-red-600 mx-auto rounded-full mt-8" />
                      <div 
                        className="pt-20 grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-20 w-full max-w-2xl text-left border-t border-slate-100"
                        style={{ marginTop: `${foundationalData.coverProjectEntityMarginTop || 80}px` }}
                      >
                         <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project Entity</p><h4 className="text-base md:text-lg font-bold text-[#001F3D] uppercase">{foundationalData.projectName}</h4></div>
                         <div className="sm:text-right"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submission Date</p><h4 className="text-base md:text-lg font-bold text-[#001F3D] uppercase">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h4></div>
                      </div>
                   </div>

                   {REPORT_SEQUENCE.map((section) => (
                     checklist[section.id] && section.id !== 'coverDetails' && (
                       <div key={section.id} className="space-y-8 page-break relative z-10 py-10 min-h-[297mm]">
                         <Watermark />
                         <div className="flex justify-between items-center border-b-2 border-[#8B5CF6] pb-2 mb-8">
                           <h2 className="text-2xl md:text-3xl font-display font-bold text-[#8B5CF6] tracking-tight uppercase">{section.label}</h2>
                           <button 
                              type="button"
                              className="no-print text-[#8B5CF6] hover:bg-[#8B5CF6]/10 font-bold text-[10px] uppercase tracking-widest gap-2 h-8 rounded-lg flex items-center p-2"
                              onClick={() => setEditingSectionInPreview(section.id)}
                           >
                              <Edit3 className="h-3.5 w-3.5" /> Edit Matrix Node
                           </button>
                         </div>
                         
                         <div className="space-y-6">
                            {['projectCost', 'meansOfFinance', 'cashFlowStatement', 'amortizationSchedule', 'roadmap', 'workingCapitalRequirement', 'financialProjections', 'dscrMatrix', 'mpbfCalculation', 'turnoverAnalysis', 'keyRatios', 'breakevenAnalysis'].includes(section.id) && foundationalData[section.id] && (
                               <div className="text-sm text-slate-700 editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData[section.id] }} />
                            )}

                            {section.id === 'swotAnalysis' && (
                              <div className="grid grid-cols-2 gap-8">
                                <div className="p-8 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 space-y-4">
                                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Strengths</h4>
                                  <div className="text-sm text-slate-700 editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData.swot_strengths || "" }} />
                                </div>
                                <div className="p-8 rounded-[2rem] bg-rose-50 border-2 border-rose-100 space-y-4">
                                  <h4 className="text-xs font-bold text-rose-600 uppercase tracking-widest">Weaknesses</h4>
                                  <div className="text-sm text-slate-700 editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData.swot_weaknesses || "" }} />
                                </div>
                                <div className="p-8 rounded-[2rem] bg-blue-50 border-2 border-blue-100 space-y-4">
                                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Opportunities</h4>
                                  <div className="text-sm text-slate-700 editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData.swot_opportunities || "" }} />
                                </div>
                                <div className="p-8 rounded-[2rem] bg-amber-50 border-2 border-amber-100 space-y-4">
                                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Threats</h4>
                                  <div className="text-sm text-slate-700 editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData.swot_threats || "" }} />
                                </div>
                              </div>
                            )}

                            {section.id === 'productServices' && (
                              <div className="space-y-16">
                                <div className="space-y-8">
                                  <div className="flex items-center gap-4 border-l-4 border-[#001F3D] pl-6">
                                    <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Proprietary Products Portfolio</h4>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                    {proprietaryProducts.map(p => (
                                      <div key={p.id} className="p-3 bg-white border border-slate-100 rounded-[1.25rem] flex gap-4 shadow-sm min-h-[110px] items-center product-card">
                                         <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100">
                                            {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-contain" /> : <ImageIcon className="h-6 w-6 text-slate-200" />}
                                         </div>
                                         <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                                            <p className="text-[11px] font-bold uppercase text-[#001F3D] truncate leading-tight mb-1">{p.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight truncate mb-3">{p.market}</p>
                                            <div className="flex flex-col gap-2 mt-auto">
                                               <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                                                  <span className="text-[7px] font-bold text-slate-300 uppercase">Valuation</span>
                                                  <span className="text-[10px] font-black text-red-600">₹ {p.price}</span>
                                               </div>
                                               <div className="flex items-center justify-between">
                                                  <span className="text-[7px] font-bold text-slate-300 uppercase">Target</span>
                                                  <span className="text-[9px] font-bold text-slate-600 truncate">{p.annualTargetQty} / yr</span>
                                               </div>
                                            </div>
                                         </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div className="space-y-8">
                                  <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-6">
                                    <h4 className="text-xl font-display font-bold text-blue-900 uppercase tracking-tight">Industrial Technical Services Portfolio</h4>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                    {industrialServices.map(s => (
                                      <div key={s.id} className="p-3 bg-white border border-slate-100 rounded-[1.25rem] flex gap-4 shadow-sm min-h-[110px] items-center product-card">
                                         <div className="w-24 h-24 bg-blue-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 border border-blue-100">
                                            {s.imageUrl ? <img src={s.imageUrl} alt="" className="w-full h-full object-contain" /> : <Settings2 className="h-6 w-6 text-blue-300" />}
                                         </div>
                                         <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                                            <p className="text-[11px] font-bold uppercase text-blue-900 truncate leading-tight mb-1">{s.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight line-clamp-1 mb-3">{s.description}</p>
                                            <div className="flex flex-col gap-2 mt-auto">
                                               <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                                                  <span className="text-[7px] font-bold text-slate-300 uppercase">Rate</span>
                                                  <span className="text-[10px] font-black text-blue-600">₹ {s.price}</span>
                                               </div>
                                               <div className="flex items-center justify-between">
                                                  <span className="text-[7px] font-bold text-slate-300 uppercase">Target</span>
                                                  <span className="text-[9px] font-bold text-slate-600 truncate">{s.annualTargetQty} / yr</span>
                                               </div>
                                            </div>
                                         </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {section.id === 'turnoverAnalysis' && (
                              <KeyDataAtGlance isReport={true} />
                            )}

                            {section.id === 'breakevenAnalysis' && (
                               <div className="space-y-12">
                                  <div className="border-2 border-slate-900 rounded-sm bg-white overflow-x-auto shadow-sm">
                                     <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="bg-slate-50 border-b-2 border-slate-900">
                                           <tr>
                                              <th className="p-4 text-[10px] font-bold uppercase border-r border-slate-300 w-[35%]">Particulars</th>
                                              <th className="p-4 text-[10px] font-bold uppercase text-center border-r border-slate-300 italic">Remaining Current Year</th>
                                              {calculations.breakevenMatrix.map(m=><th key={m.year} className="p-4 text-[10px] font-bold uppercase text-right border-r border-slate-300 last:border-0">{m.year}</th>)}
                                           </tr>
                                        </thead>
                                        <tbody className="text-[10px]">
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Revenue Income / Gross Sales (A)</td><td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>{calculations.breakevenMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.revenue.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Variable Costs</td><td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>{calculations.breakevenMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.variableCosts.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b-2 border-slate-900 bg-slate-50 font-black"><td className="p-3 px-4 border-r border-slate-200 uppercase">Gross Profit (B)</td><td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>{calculations.breakevenMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.grossProfit.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Other Costs (Fixed OpEx)</td><td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>{calculations.breakevenMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.otherFixedCosts.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Depreciation</td><td className="p-3 text-center border-r border-slate-200 font-bold">-</td>{calculations.breakevenMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.depreciation.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Interest Cost</td><td className="p-3 text-center border-r border-slate-200 font-bold">-</td>{calculations.breakevenMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b-2 border-slate-950 bg-slate-100 font-bold"><td className="p-3 px-4 border-r border-slate-200 uppercase">Total Fixed Cost (C)</td><td className="p-3 text-center border-r border-slate-200 text-slate-300">****</td>{calculations.breakevenMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.totalFixedCost.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                                           <tr className="bg-[#001F3D] text-white font-black">
                                              <td className="p-4 px-6 text-sm border-r border-white/10 uppercase">Break Even Sales (A*C)/B</td>
                                              <td className="p-3 text-center border-r border-white/10 text-white/40">****</td>
                                              {calculations.breakevenMatrix.map(m=><td key={m.year} className="p-4 text-right text-base border-r border-white/10 last:border-0 text-emerald-400">₹ {m.bepSales.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            )}

                            {section.id === 'mpbfCalculation' && (
                               <div className="space-y-12">
                                  <div className="border-2 border-slate-900 rounded-sm bg-white overflow-x-auto shadow-sm">
                                     <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="bg-slate-50 border-b-2 border-slate-900">
                                           <tr>
                                              <th className="p-4 text-[10px] font-bold uppercase border-r border-slate-300 w-[35%]">MPBF Assessment Particulars</th>
                                              {calculations.mpbfMatrix.map(m=><th key={m.year} className="p-4 text-[10px] font-bold uppercase text-right border-r border-slate-300 last:border-0">{m.year}</th>)}
                                           </tr>
                                        </thead>
                                        <tbody className="text-[10px]">
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Total Current Assets (A)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.currentAssets.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Total Current Liabilities (other than Bank Borrowing) (B)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.currentLiabs.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b-2 border-slate-900 bg-slate-50 font-black"><td className="p-3 px-4 border-r border-slate-200 uppercase">Working Capital Gap (C = A - B)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.wcGap.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           
                                           <tr className="bg-slate-100 font-bold"><td colSpan={6} className="p-3 px-4 border-b border-slate-900 text-blue-800 uppercase">1st Method of Lending</td></tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200 italic">Minimum Stipulated Net Working Capital (D = 25% of C)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method1.minNetWC.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b-2 border-slate-400 bg-blue-50 font-bold"><td className="p-3 px-4 border-r border-slate-200 uppercase text-blue-900">MPBF 1st method (C - D)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method1.mpbf.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                                           <tr className="bg-slate-100 font-bold"><td colSpan={6} className="p-3 px-4 border-b border-slate-900 text-emerald-800 uppercase">2nd Method of Lending</td></tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200 italic">Minimum Stipulated Net Working Capital (E = 25% of A)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method2.minNetWC.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b-2 border-slate-400 bg-emerald-50 font-bold"><td className="p-3 px-4 border-r border-slate-200 uppercase text-emerald-900">MPBF 2nd method (C - E)</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.method2.mpbf.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>

                                           <tr className="bg-slate-100 font-bold"><td colSpan={6} className="p-3 px-4 border-b border-slate-900 text-purple-800 uppercase">Percentage of Sales method</td></tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200 italic">Gross Revenue / Sales</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.salesMethod.revenue.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b-2 border-slate-950 bg-purple-50 font-bold"><td className="p-3 px-4 border-r border-slate-200 uppercase text-purple-900">MPBF - 25% of Sales</td>{calculations.mpbfMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.salesMethod.mpbf.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            )}

                            {section.id === 'amortizationSchedule' && (
                              <div className="space-y-12">
                                 <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4">
                                    <div>
                                      <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Institutional Monthly Amortization Schedule</h3>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">7-Year (84 Months) Strategic Debt Settlement Protocol</p>
                                    </div>
                                    <div className="text-right">
                                      <Badge className="bg-emerald-600 text-white border-none text-[10px] font-bold px-4 py-2 rounded-xl shadow-lg">Monthly EMI: ₹ {Math.round(calculations.emi).toLocaleString()}</Badge>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-10">
                                    <div className="border-2 border-slate-900 rounded-sm bg-white overflow-hidden shadow-sm">
                                      <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 border-b-2 border-slate-900">
                                          <tr className="text-[8px] font-bold uppercase">
                                            <th className="p-2 border-r">Mth</th>
                                            <th className="p-2 border-r text-right">Interest</th>
                                            <th className="p-2 border-r text-right">Principal</th>
                                            <th className="p-2 text-right">Balance (₹)</th>
                                          </tr>
                                        </thead>
                                        <tbody className="text-[8px] font-code">
                                          {calculations.monthlySchedule.slice(0, 42).map((m) => (
                                            <tr key={m.month} className={cn("border-b border-slate-100", m.month % 12 === 0 ? "border-b-2 border-slate-300 bg-slate-50" : "")}>
                                              <td className="p-2 border-r font-bold">{m.month.toString().padStart(2, '0')}</td>
                                              <td className="p-2 border-r text-right text-red-600">{m.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                                              <td className="p-2 border-r text-right text-emerald-600">{m.principal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                                              <td className="p-2 text-right font-bold">{m.balance.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                    <div className="border-2 border-slate-900 rounded-sm bg-white overflow-hidden shadow-sm">
                                      <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 border-b-2 border-slate-900">
                                          <tr className="text-[8px] font-bold uppercase">
                                            <th className="p-2 border-r">Mth</th>
                                            <th className="p-2 border-r text-right">Interest</th>
                                            <th className="p-2 border-r text-right">Principal</th>
                                            <th className="p-2 text-right">Balance (₹)</th>
                                          </tr>
                                        </thead>
                                        <tbody className="text-[8px] font-code">
                                          {calculations.monthlySchedule.slice(42, 84).map((m) => (
                                            <tr key={m.month} className={cn("border-b border-slate-100", m.month % 12 === 0 ? "border-b-2 border-slate-300 bg-slate-50" : "")}>
                                              <td className="p-2 border-r font-bold">{m.month.toString().padStart(2, '0')}</td>
                                              <td className="p-2 border-r text-right text-red-600">{m.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                                              <td className="p-2 border-r text-right text-emerald-600">{m.principal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                                              <td className="p-2 text-right font-bold">{m.balance.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                 </div>
                              </div>
                            )}

                            {section.id === 'dscrMatrix' && (
                               <div className="space-y-12">
                                  <div className="border-2 border-slate-900 rounded-sm bg-white overflow-x-auto shadow-sm">
                                     <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="bg-slate-50 border-b-2 border-slate-900">
                                           <tr>
                                              <th className="p-4 text-[10px] font-bold uppercase border-r border-slate-300 w-[35%]">Particulars</th>
                                              {calculations.dscrMatrix.map(m=><th key={m.year} className="p-4 text-[10px] font-bold uppercase text-right border-r border-slate-300 last:border-0">{m.year}</th>)}
                                           </tr>
                                        </thead>
                                        <tbody className="text-[10px]">
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">PAT + Depreciation + Interest</td>{calculations.dscrMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.numerator.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Interest payment</td>{calculations.dscrMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.interestPayment.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Principal Repayment of Term Loan</td>{calculations.dscrMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.termLoanPrincipal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="border-b border-slate-300"><td className="p-3 px-4 border-r border-slate-200">Principal Repayment of Working Capital Limit</td>{calculations.dscrMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">---</td>)}</tr>
                                           <tr className="border-b-2 border-slate-900 bg-slate-50 font-black"><td className="p-3 px-4 border-r border-slate-200 uppercase">Total Repayment during the year</td>{calculations.dscrMatrix.map(m=><td key={m.year} className="p-3 text-right border-r last:border-0">₹ {m.totalRepayment.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}</tr>
                                           <tr className="bg-[#001F3D] text-white font-black"><td className="p-4 px-6 text-base border-r border-white/10 uppercase">DSCR</td>{calculations.dscrMatrix.map(m=><td key={m.year} className="p-4 text-right text-lg border-r border-white/10 last:border-0">{m.dscr}</td>)}</tr>
                                        </tbody>
                                     </table>
                                  </div>
                                  <div className="grid grid-cols-2 gap-8">
                                     <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-900 shadow-sm space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average DSCR (Term Loan + Working Capital Loan)</p>
                                        <p className="text-3xl font-display font-bold text-[#001F3D]">{calculations.avgDSCR}</p>
                                     </div>
                                     <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-900 shadow-sm space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average DSCR (Term Loan only)</p>
                                        <p className="text-3xl font-display font-bold text-primary">{calculations.avgDSCRTermOnly}</p>
                                     </div>
                                  </div>
                               </div>
                            )}

                            {['projectCost', 'meansOfFinance', 'cashFlowStatement', 'amortizationSchedule', 'roadmap', 'workingCapitalRequirement', 'financialProjections', 'dscrMatrix', 'mpbfCalculation', 'turnoverAnalysis', 'keyRatios', 'breakevenAnalysis'].includes(section.id) && foundationalData[section.id + '_footer'] && (
                               <div className="text-sm text-slate-700 editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData[section.id + '_footer'] }} />
                            )}

                            {!['projectCost', 'meansOfFinance', 'cashFlowStatement', 'amortizationSchedule', 'roadmap', 'productServices', 'coverDetails', 'workingCapitalRequirement', 'financialProjections', 'dscrMatrix', 'mpbfCalculation', 'swotAnalysis', 'turnoverAnalysis', 'keyRatios', 'breakevenAnalysis'].includes(section.id) && (
                              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <div className="text-sm text-slate-700 editor-content-preview" dangerouslySetInnerHTML={{ __html: foundationalData[section.id] || "Metadata protocol active. Awaiting strategic input matrix." }} />
                              </div>
                            )}
                         </div>
                       </div>
                     )
                   ))}
                </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isMachineryBreakupOpen} onOpenChange={setIsMachineryBreakupOpen}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl"><TableIcon className="h-8 w-8" /></div>
              <div>
                <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Machinery Breakup Matrix</DialogTitle>
                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Industrial asset allocation and procurement ledger.</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMachineryBreakupOpen(false)} className="rounded-full"><X className="h-6 w-6" /></Button>
          </div>
          
          <ScrollArea className="flex-1 p-8">
            <UITable>
               <UITableHeader className="bg-slate-50">
                  <UITableRow className="hover:bg-transparent border-slate-100">
                     <UITableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-4">Asset Identity</UITableHead>
                     <UITableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-24">Qty</UITableHead>
                     <UITableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Rate (₹)</UITableHead>
                     <UITableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Total (₹)</UITableHead>
                     <UITableHead className="w-10"></UITableHead>
                  </UITableRow>
               </UITableHeader>
               <UITableBody>
                  {machineryItems.map((item, idx) => (
                    <UITableRow key={item.id} className="h-16 border-slate-50">
                       <UITableCell className="px-4">
                          <Input value={item.name} onChange={(e)=>handleUpdateDimension(idx,'name',e.target.value)} className="h-9 bg-slate-50 border-none font-bold text-xs uppercase" />
                       </UITableCell>
                       <UITableCell>
                          <Input type="number" value={item.qty} onChange={(e)=>handleUpdateDimension(idx,'qty',Number(e.target.value))} className="h-9 bg-slate-50 border-none font-bold text-xs text-center" />
                       </UITableCell>
                       <UITableCell>
                          <Input type="number" value={item.rate} onChange={(e)=>handleUpdateDimension(idx,'rate',Number(e.target.value))} className="h-9 bg-slate-50 border-none font-bold text-xs text-right" />
                       </UITableCell>
                       <UITableCell className="text-right font-display font-bold text-primary">₹ {item.total.toLocaleString()}</UITableCell>
                       <UITableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={()=>setMachineryItems(machineryItems.filter((_,i)=>i!==idx))}><Trash2 className="h-4 w-4" /></Button>
                       </UITableCell>
                    </UITableRow>
                  ))}
               </UITableBody>
            </UITable>
            <Button variant="ghost" className="w-full mt-6 h-12 rounded-xl text-primary font-bold uppercase text-[9px] tracking-widest gap-2 border-2 border-dashed border-primary/20" onClick={()=>setMachineryItems([...machineryItems, {id:Date.now().toString(), name:'', qty:1, rate:0, total:0}])}>
               <Plus className="h-4 w-4" /> Append Asset Node
            </Button>
          </ScrollArea>
          
          <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
             <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Asset Valuation</span>
                <p className="text-2xl font-display font-bold text-[#001F3D]">₹ {financials.investMachinery.toLocaleString()}</p>
             </div>
             <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl" onClick={() => setIsMachineryBreakupOpen(false)}>Commit Matrix</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] bg-slate-900 border-none p-0 overflow-hidden flex flex-col rounded-[2rem]">
           <div className="p-6 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-primary/20 rounded-lg text-primary shadow-lg shadow-primary/10"><Maximize2 className="h-5 w-5" /></div>
                 <div>
                   <DialogTitle className="text-lg font-display font-bold text-white uppercase tracking-tight">High-Fidelity Matrix Fit</DialogTitle>
                 </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsZoomDialogOpen(false)} className="h-12 w-12 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <X className="h-7 w-7" />
              </Button>
           </div>
           <ScrollArea className="flex-1 bg-slate-950">
              <div className="p-20 flex justify-center">
                 {pendingDrawingFile && <img src={pendingDrawingFile} alt="Fullscreen Drawing" className="max-w-full shadow-2xl rounded-3xl" />}
              </div>
           </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSectionInPreview} onOpenChange={(open) => !open && setEditingSectionInPreview(null)}>
        <DialogContent className="max-w-4xl h-[80vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#001F3D] rounded-2xl text-white"><Edit3 className="h-7 w-7" /></div>
              <div>
                <DialogTitle className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Edit Matrix Node: {REPORT_SEQUENCE.find(s => s.id === editingSectionInPreview)?.label}</DialogTitle>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditingSectionInPreview(null)}><X className="h-6 w-6" /></Button>
          </div>
          <ScrollArea className="flex-1 p-10">
            {editingSectionInPreview && renderActiveEditor(editingSectionInPreview)}
          </ScrollArea>
          <div className="p-8 border-t bg-slate-50/50 flex justify-end">
            <Button className="h-12 bg-[#001F3D] hover:bg-black text-white px-10 rounded-xl font-bold uppercase text-[10px] shadow-xl" onClick={() => { handleSaveStrategy(); setEditingSectionInPreview(null); }}>Commit Node Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

