
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
  Download,
  Send,
  ExternalLink,
  ListTree,
  Coins
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
  const [isCostBreakupOpen, setIsCostBreakupOpen] = useState(false);
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
    executiveSummary: '<p>This feasibility study outlines the establishment of a precision manufacturing node focused on high-accuracy industrial outputs for the electrical, construction, and aerospace sectors.</p><ul><li>Strategic alignment with <b>Make in India</b> initiative.</li><li>Implementation of high-fidelity VMC Machining protocols.</li><li>Integrated real-time yield monitoring via MES matrix.</li></ul>',
    aboutCompany: '<p>Ferocious Tech is an emerging industrial leader in precision engineering, focused on technical excellence and automated manufacturing protocols. Located in the industrial heart of Pune, the firm leverages state-of-the-art tooling to serve Tier 1 automotive and aerospace supply chains.</p>',
    visionMission: '<p><b>VISION:</b> To establish Ferocious Tech as the global benchmark for precision machining and specialized tool-room engineering.</p><p><b>MISSION:</b> Providing exceptional technical value through specialized engineering, optimized cycle times, and rigorous quality certification protocols.</p>',
    promoterProfile: '<p><b>Jayant Patil</b> - B.E. Mechanical / MBA Operations. 15+ Years in Tool Room & VMC Operations. Highly technical leadership with a proven track record in precision engineering and multi-axis machining workflows.</p>',
    projectDetails: '<p>The proposed project involves the setup of a high-fidelity VMC Machining Center and Tool Room in Pune. The facility will utilize multi-axis centers to produce complex geometries with tolerances within ±0.005mm.</p>',
    productServices: 'Combined Proprietary Products and Industrial Services matrix.',
    marketAnalysis: "<p>India's electrical sector is witnessing an unprecedented surge with a 15% CAGR. The Indian Tooling Industry is valued at approximately ₹18,500 Crores. Ferocious Tech identifies a high-yield gap in localized precision conduit connectors and high-complexity VMC job work.</p>",
    swotAnalysis: "Strategic analysis of operational nodes.",
    swot_strengths: "<ul><li>15+ Years Promoter Experience</li><li>High-Precision 4-Axis Capabilities</li><li>Real-time MES Integration</li></ul>",
    swot_weaknesses: "<ul><li>New Operational Node (Initial Market Entry)</li><li>High initial CAPEX requirement</li></ul>",
    swot_opportunities: "<ul><li>Import substitution for specialized connectors</li><li>Expansion into aerospace Tier 2 clusters</li></ul>",
    swot_threats: "<ul><li>Fluctuating Raw Material costs (Al/Steel)</li><li>Competitive entry from low-cost clusters</li></ul>",
    businessModel: "<p>Revenue-driven B2B model focusing on high-precision job work and proprietary industrial connectors. The model targets 70% capacity utilization in Year 1 with incremental growth nodes.</p>",
    operationsPlan: "<p>Multi-shift precision machining utilizing 3-axis and 4-axis VMC centers with integrated QC cycles. Raw material sourcing through verified local hubs with 60-day inventory buffers.</p>",
    layout: "<p>The layout of the manufacturing facility is designed for streamlined material movement and high-fidelity VMC operations, following 5S Lean manufacturing protocols.</p>",
    locationAnalysis: "<p>Strategically located in Pune's industrial belt, providing seamless access to Tier 1 supply chains, skilled multi-axis operators, and consistent power infrastructure.</p>",
    orgStructure: "<p>Lean organizational matrix consisting of a Promoter (Command Lead), Shift Supervisors, VMC Operators, and Quality Lead with real-time reporting protocols.</p>",
    marketingStrategy: "<p>Direct industrial liaison, digital cataloging, and exhibition presence at IMTEX. Leverages a technical sales node for Tier 1 client onboarding.</p>",
    techIntegration: "<p>System uses <b>Firebase Real-time Database</b> and Next.js for a custom Manufacturing Execution System (MES), inventory synchronization, and quality report archival.</p>",
    riskMitigation: "<p>Comprehensive insurance coverage, multi-vendor raw material sourcing, and dynamic debt-service reserves. Hedging protocols for high-value raw materials.</p>",
    govtSchemes: "<p>The project identifies the <b>CGTMSE</b> (Credit Guarantee Fund Trust for Micro and Small Enterprises) as the primary credit risk mitigation matrix, facilitating institutional support without third-party collateral.</p>",
    licensesRegistrations: "<p>Udyam Registration, GST Compliance, ISO 9001:2015 Certification, and Local Municipal NOCs verified.</p>",
    roadmap: '<p><b>Year 1:</b> Installation & Commissioning.</p><p><b>Year 2:</b> Capacity ramp-up to 85%.</p><p><b>Year 3:</b> Integration of 5-axis capabilities.</p><p><b>Year 5:</b> Expansion into global aerospace supply chains.</p>',
    conclusion: "<p>Based on the Techno-Economic analysis, the project demonstrates high viability with strong debt-service coverage (Avg DSCR 2.4+) and significant technical stability.</p>"
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
    { id: 'M1', name: 'VMC 3-Axis Center (Haas/BFW)', qty: 1, rate: 4500000, total: 4500000 },
  ]);

  const [financials, setFinancials] = useState({
    loanROI: 10.75,
    loanTenure: 84, 
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
    if (!silent) toast({ title: "Strategy Matrix Committed", description: "All strategic nodes synchronized with master ledger." });
  }, [foundationalData, proprietaryProducts, industrialServices, machineryItems, financials, checklist, strategyRef, toast]);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.focus();
      window.print();
    }
  }, []);

  const calculations = useMemo(() => {
    // 1. PROJECT COST (CAPEX)
    const fixedAssetsAtCost = (financials.investMachinery || 0) + 
                            (financials.investCivil || 0) + 
                            (financials.investElectrical || 0) + 
                            (financials.investFurniture || 0) + 
                            (financials.investPreOp || 0) +
                            (financials.investShedAdvance || 0) +
                            (financials.investSoftware || 0) +
                            (financials.investSystem || 0);
    
    // 2. WORKING CAPITAL (OPERATIONAL BURN)
    const monthlyOpExBase = (financials.expenseRent || 0) + 
                           (financials.expensePower || 0) + 
                           (financials.expenseMaintenance || 0) + 
                           (financials.expenseConsumables || 0);
    
    const workingCapitalRequirement = monthlyOpExBase * 3;
    const totalProjectCost = fixedAssetsAtCost + workingCapitalRequirement;
    const requiredWCMargin = workingCapitalRequirement * (financials.wcMarginPercent / 100);

    // 3. REVENUE MATRIX (CAPACITY)
    const annualProductRevenue = proprietaryProducts.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (parseInt(p.annualTargetQty.toString().replace(/,/g, '')) || 0), 0);
    const annualServiceRevenue = industrialServices.reduce((acc, s) => acc + (parseFloat(s.price) || 0) * (parseInt(s.annualTargetQty.toString().replace(/,/g, '')) || 0), 0);
    const totalCapacityAnnualRevenue = annualProductRevenue + annualServiceRevenue;
    
    // 4. FUNDING NODES
    const totalOwnFunds = (financials.ownCapital || 0) + (financials.loanFriendsFamily || 0);
    const mpbfTurnoverMethod = (totalCapacityAnnualRevenue * 0.25 * 0.75); // Standard 25% of turnover limit
    const suggestedWCLimit = financials.workingCapitalLimit || mpbfTurnoverMethod;

    const termLoanAmt = totalProjectCost - totalOwnFunds - suggestedWCLimit;
    const totalFinanceSources = totalOwnFunds + termLoanAmt + suggestedWCLimit;

    // 5. AMORTIZATION ENGINE (7 YEARS / 84 MONTHS)
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

    // 6. 5-YEAR PERFORMANCE LOOP
    const projections: any[] = [];
    const cashFlow: any[] = [];
    const ratioMatrix: any[] = [];
    const mpbfMatrix: any[] = [];
    const dscrMatrix: any[] = [];
    const breakevenMatrix: any[] = [];
    const balanceSheet: any[] = [];

    let currentEquity = totalOwnFunds;
    let accumulatedDepreciation = 0;
    const depreciationRate = 0.15; // WDV 15%
    let openingCash = workingCapitalRequirement * 0.15; // Start with small buffer

    for (let y = 1; y <= 5; y++) {
      const growth = financials.yearlyGrowthTargets?.[y-1] ?? 0;
      
      // Revenue sequential yield
      const yearRevenue = y === 1 
        ? (totalCapacityAnnualRevenue * 0.7) * (1 + growth/100) 
        : projections[y-2].revenue * (1 + growth/100);
      
      const yearOpExBase = monthlyOpExBase * 12 * (1 + (y * 0.05)); // 5% Inflation
      const yearDepreciation = Math.max(0, (fixedAssetsAtCost - accumulatedDepreciation) * depreciationRate);
      accumulatedDepreciation += yearDepreciation;
      
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearPrincipal = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.principal, 0);
      
      const yearEBITDA = yearRevenue - yearOpExBase;
      const yearPBT = yearEBITDA - yearDepreciation - yearInterest;
      const yearPAT = yearPBT > 0 ? yearPBT * 0.75 : 0; // 25% Tax assumption
      
      // Update Equity (PAT - 20% Drawings)
      const drawings = yearPAT * 0.2;
      currentEquity += (yearPAT - drawings);
      
      const yearTermLoanClosing = schedule[Math.min(y * 12, schedule.length) - 1]?.balance || 0;
      
      // Activity Parameters
      const receivables = yearRevenue * (45 / 365);
      const variableCosts = yearRevenue * (financials.variableCostPercent / 100);
      const inventory = variableCosts * (60 / 365);
      const currentLiabsOtherThanBank = (yearOpExBase / 12 * (30 / 365)); // 30 days opex creditors

      // DSCR logic
      const dscrNumerator = yearPAT + yearDepreciation + yearInterest;
      const dscrDenominator = yearInterest + yearPrincipal;
      const dscrVal = dscrNumerator / (dscrDenominator || 1);

      // BEP logic
      const grossProfitContribution = yearRevenue - variableCosts;
      const fixedOpExCost = yearOpExBase - variableCosts;
      const totalFixedCostNode = fixedOpExCost + yearDepreciation + yearInterest;
      const bepSales = (yearRevenue * totalFixedCostNode) / (grossProfitContribution || 1);

      projections.push({
        year: `FY ${25+y}-${26+y}`,
        revenue: Math.round(yearRevenue),
        ebitda: Math.round(yearEBITDA),
        pat: Math.round(yearPAT),
        margin: parseFloat((yearPAT / yearRevenue * 100).toFixed(1)),
        dscr: dscrVal.toFixed(2)
      });

      breakevenMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        revenue: yearRevenue,
        variableCosts,
        grossProfit: grossProfitContribution,
        otherFixedCosts: fixedOpExCost,
        depreciation: yearDepreciation,
        interest: yearInterest,
        totalFixedCost: totalFixedCostNode,
        bepSales
      });

      dscrMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        numerator: dscrNumerator,
        interestPayment: yearInterest,
        termLoanPrincipal: yearPrincipal,
        wcPrincipal: 0,
        totalRepayment: dscrDenominator,
        dscr: dscrVal.toFixed(2)
      });

      // CASH FLOW SEQUENCING
      const cf_OpProfitBeforeWC = yearPAT + yearInterest + yearDepreciation;
      const cf_Financing = y === 1 
        ? (totalOwnFunds + termLoanAmt + suggestedWCLimit) - yearInterest - yearPrincipal
        : -yearInterest - yearPrincipal;
      const cf_Investing = y === 1 ? -fixedAssetsAtCost : 0;
      const totalFlow = cf_OpProfitBeforeWC + cf_Financing + cf_Investing;
      const closingCash = openingCash + totalFlow;

      cashFlow.push({
        year: `FY ${25+y}-${26+y}`,
        pat: yearPAT,
        interest: yearInterest,
        depreciation: yearDepreciation,
        opProfitBeforeWC: cf_OpProfitBeforeWC,
        netOpCash: cf_OpProfitBeforeWC,
        financing: {
          interest: -yearInterest,
          termLoan: y === 1 ? termLoanAmt : -yearPrincipal,
          wcLoan: y === 1 ? suggestedWCLimit : 0,
          ownFunds: y === 1 ? totalOwnFunds : 0,
          total: cf_Financing
        },
        investing: cf_Investing,
        totalInflow: totalFlow,
        openingCash,
        closingCash
      });

      // BALANCE SHEET RECONCILIATION
      const totalSources = currentEquity + yearTermLoanClosing + suggestedWCLimit + currentLiabsOtherThanBank;
      const netBlock = fixedAssetsAtCost - accumulatedDepreciation;
      
      balanceSheet.push({
        year: `FY ${25+y}-${26+y}`,
        sources: {
          ownFunds: { total: currentEquity, opening: y === 1 ? totalOwnFunds : currentEquity - (yearPAT-drawings), profit: yearPAT, drawings },
          longTermLiabs: { bankLoan: yearTermLoanClosing, friendsFamily: financials.loanFriendsFamily },
          currentLiabs: { wcLoan: suggestedWCLimit, creditors: currentLiabsOtherThanBank, total: suggestedWCLimit + currentLiabsOtherThanBank },
          total: totalSources
        },
        application: {
          nonCurrentAssets: { netBlock },
          currentAssets: { cashBank: closingCash, receivables, inventory, total: closingCash + receivables + inventory },
          total: netBlock + (closingCash + receivables + inventory)
        }
      });

      ratioMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        debtEquity: ((yearTermLoanClosing + suggestedWCLimit) / (currentEquity || 1)).toFixed(2),
        interestCoverage: (yearEBITDA / (yearInterest || 1)).toFixed(2),
        dscr: dscrVal.toFixed(2),
        currentRatio: ((closingCash + receivables + inventory) / (suggestedWCLimit + currentLiabsOtherThanBank || 1)).toFixed(2),
        npMargin: ((yearPAT / (yearRevenue || 1)) * 100).toFixed(2),
        roa: ((yearPAT / (totalSources || 1)) * 100).toFixed(2)
      });

      // MPBF ASSESSMENT
      const currentAssetsNode = closingCash + receivables + inventory;
      const wcGap = currentAssetsNode - currentLiabsOtherThanBank;
      mpbfMatrix.push({
        year: `FY ${25+y}-${26+y}`,
        currentAssets: currentAssetsNode,
        currentLiabs: currentLiabsOtherThanBank,
        wcGap,
        method1: { minNetWC: wcGap * 0.25, mpbf: wcGap * 0.75 },
        method2: { minNetWC: currentAssetsNode * 0.25, mpbf: wcGap - (currentAssetsNode * 0.25) },
        salesMethod: { revenue: yearRevenue, mpbf: yearRevenue * 0.25 }
      });

      openingCash = closingCash;
    }

    return {
      monthlyOpEx: monthlyOpExBase,
      workingCapitalValue: workingCapitalRequirement,
      totalProjectCost,
      loanAmt: termLoanAmt,
      totalOwnFunds,
      shareOwn: (financials.ownCapital / totalFinanceSources) * 100,
      shareFF: (financials.loanFriendsFamily / totalFinanceSources) * 100,
      shareTerm: (termLoanAmt / totalFinanceSources) * 100,
      shareWC: (suggestedWCLimit / totalFinanceSources) * 100,
      emi,
      projections,
      cashFlow,
      ratioMatrix,
      mpbfMatrix,
      dscrMatrix,
      breakevenMatrix,
      balanceSheet,
      monthlySchedule: schedule,
      avgDSCR: (projections.reduce((acc, p) => acc + parseFloat(p.dscr), 0) / 5).toFixed(2),
      fixedCapital: fixedAssetsAtCost,
      requiredWCMargin,
      totalCapacityAnnualRevenue,
      mpbfSuggested: mpbfTurnoverMethod
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
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToWord = useCallback(() => {
    const reportElement = document.getElementById('institutional-report-matrix');
    if (!reportElement) return;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>`;
    const footer = "</body></html>";
    const reportHtml = reportElement.innerHTML;
    const blob = new Blob(['\ufeff', header + reportHtml + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ferocious_Tech_Project_Report.doc`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "MS Word Export Protocol", description: "Strategic matrix converted to institutional document." });
  }, [toast]);

  const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden">
      <div className="relative w-[60%] aspect-square">
         {brandLogo && <img src={brandLogo} alt="Identity Watermark" className="w-full h-full object-contain" />}
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
                <ChartTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                <Bar name="Sales / Revenue" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="EBITDA" dataKey="ebitda" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Net Profit (PAT)" dataKey="pat" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
             <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Report Main Title</Label>
                  <Input value={foundationalData.reportMainTitle} onChange={(e)=>setFormData({...foundationalData, reportMainTitle: e.target.value})} className="h-14 bg-slate-50 border-none rounded-2xl text-xl font-display font-bold uppercase" />
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
          </div>
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
                           <th className="p-3 border-r border-slate-300">Source of Finance</th>
                           <th className="p-3 text-center border-r border-slate-300 w-24">Share</th>
                           <th className="p-3 text-right border-r border-slate-300">Amount (₹)</th>
                           <th className="p-3 text-center w-32">Interest Rate</th>
                        </tr>
                     </thead>
                     <tbody className="text-xs">
                        <tr className="border-b border-slate-200">
                           <td className="p-3 border-r border-slate-200">Own Capital Contribution</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareOwn.toFixed(1)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {financials.ownCapital.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center text-slate-400">---</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                           <td className="p-3 border-r border-slate-200">Friends & Family Borrowings</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareFF.toFixed(1)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {financials.loanFriendsFamily.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center text-slate-400">---</td>
                        </tr>
                        <tr className="border-b border-slate-200 font-bold bg-slate-50/50">
                           <td className="p-3 border-r border-slate-200">Total Own Funds Pool</td>
                           <td className="p-3 text-center border-r border-slate-200">{(calculations.shareOwn + calculations.shareFF).toFixed(1)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {calculations.totalOwnFunds.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center">---</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                           <td className="p-3 border-r border-slate-200">Institutional Term Loan</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareTerm.toFixed(1)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {calculations.loanAmt.toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center font-bold text-primary">{financials.loanROI}%</td>
                        </tr>
                        <tr className="border-b-2 border-slate-400">
                           <td className="p-3 border-r border-slate-200">Working Capital Limit (Requested)</td>
                           <td className="p-3 text-center border-r border-slate-200">{calculations.shareWC.toFixed(1)}%</td>
                           <td className="p-3 text-right border-r border-slate-200">₹ {(financials.workingCapitalLimit || calculations.mpbfSuggested).toLocaleString('en-IN')}</td>
                           <td className="p-3 text-center font-bold text-primary">{financials.wcInterestRate}%</td>
                        </tr>
                        <tr className="bg-slate-100 font-black border-t border-slate-900">
                           <td className="p-3 border-r border-slate-200 text-right uppercase">Total Capital Matrix</td>
                           <td className="p-3 text-center border-r border-slate-200">100%</td>
                           <td className="p-3 text-right text-base text-[#001F3D]">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</td>
                           <td className="p-3"></td>
                        </tr>
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
               <h3 className="text-sm font-bold uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Institutional DSCR Analysis Matrix</h3>
               <div className="border-2 border-slate-900 rounded-sm bg-white shadow-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-slate-50 border-b-2 border-slate-900">
                      <tr className="text-[10px] font-bold uppercase">
                        <th className="p-4 border-r border-slate-300 w-[30%]">DSCR Particulars</th>
                        {calculations.dscrMatrix.map((m: any) => <th key={m.year} className="p-4 text-right border-r border-slate-300 last:border-0">{m.year}</th>)}
                      </tr>
                    </thead>
                    <tbody className="text-[10px]">
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200 font-bold">PAT + Depreciation + Interest (A)</td>
                        {calculations.dscrMatrix.map((m: any, i: number) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.numerator.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Annual Interest Commitment</td>
                        {calculations.dscrMatrix.map((m: any, i: number) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.interestPayment.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-3 px-4 border-r border-slate-200">Principal Repayment (Term Loan)</td>
                        {calculations.dscrMatrix.map((m: any, i: number) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.termLoanPrincipal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="border-b-2 border-slate-300 bg-slate-50 font-bold">
                        <td className="p-3 px-4 border-r border-slate-200 uppercase">Total Debt Service (B)</td>
                        {calculations.dscrMatrix.map((m: any, i: number) => <td key={i} className="p-3 text-right border-r border-slate-200 last:border-0">₹ {m.totalRepayment.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>)}
                      </tr>
                      <tr className="bg-[#001F3D] text-white font-black">
                        <td className="p-4 px-6 text-base border-r border-white/10 uppercase">Annual DSCR (A/B)</td>
                        {calculations.dscrMatrix.map((m: any, i: number) => <td key={i} className="p-4 text-right text-lg border-r border-white/10 last:border-0 text-emerald-400">{m.dscr}</td>)}
                      </tr>
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
            <RichTextEditor value={foundationalData[sectionId] || ""} onChange={(val)=>setFormData({...foundationalData, [sectionId]: val})} />
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
           <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
              <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-6">
                 <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Sales Growth Matrix (5 Years)</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Manual Year-on-Year growth targets.</p>
                 </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                 {financials.yearlyGrowthTargets.map((g, i) => (
                   <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 shadow-inner">
                     <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{i === 0 ? 'Year 1 Capacity (%)' : `Year ${i+1} Growth (%)`}</Label>
                     <Input type="number" className="h-10 bg-white" value={g} onChange={(e) => {
                       const newTargets = [...financials.yearlyGrowthTargets];
                       newTargets[i] = Number(e.target.value);
                       setFinancials({...financials, yearlyGrowthTargets: newTargets});
                     }} />
                   </div>
                 ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-10 animate-in slide-in-from-bottom-2 duration-500">
           <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
              <div className="flex items-center justify-between border-l-4 border-purple-500 pl-6">
                 <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">Executive Summary Snapshot</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Project vitals and funding nodes.</p>
                 </div>
                 <Button 
                    variant="outline" 
                    className="h-10 px-6 rounded-xl border-primary/20 text-primary font-bold uppercase text-[10px] tracking-widest gap-2 shadow-sm hover:bg-primary/5"
                    onClick={() => setIsCostBreakupOpen(true)}
                 >
                    <ListTree className="h-4 w-4" /> View Cost Breakup
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
           </Card>
           <Card className="p-10 border-slate-200 bg-white shadow-xl rounded-[2.5rem]">
              <KeyDataAtGlance />
           </Card>
        </TabsContent>

        <TabsContent value="display" className="m-0 flex flex-col items-center">
           <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 no-print px-4">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A4 Preview Protocol Active</span>
              </div>
              <Button onClick={handlePrint} className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3 shadow-emerald-600/20">
                <Printer className="h-4 w-4" /> Print PDF Matrix
              </Button>
           </div>

           <div className="w-full overflow-x-auto pb-20 px-4 scrollbar-hide">
              <div 
                id="institutional-report-matrix"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm' }} 
                className="mx-auto bg-white shadow-2xl print:shadow-none print-matrix"
              >
                <div className="p-10 md:p-20 min-h-[297mm] space-y-16 print:p-12 relative bg-white">
                   <div className="min-h-[297mm] flex flex-col items-center justify-center text-center border-b-2 border-slate-900 pb-20 page-break relative z-10">
                      <Watermark />
                      <div 
                        className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border flex items-center justify-center p-4 transition-all"
                        style={{ width: `${foundationalData.coverLogoSize || 192}px`, height: `${foundationalData.coverLogoSize || 192}px`, marginTop: `${foundationalData.coverLogoMarginTop || 0}px` }}
                      >
                         {brandLogo && <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-4" />}
                      </div>
                      <div className="space-y-4" style={{ marginTop: `${foundationalData.coverTitleMarginTop || 32}px` }}>
                         <h1 className="font-display font-bold tracking-tighter uppercase leading-none" style={{ fontSize: `${foundationalData.coverTitleFontSize || 60}px`, color: foundationalData.coverTitleColor || '#001F3D' }}>{foundationalData.reportMainTitle}</h1>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">{foundationalData.reportSubTitle}</p>
                      </div>
                      <div className="pt-20 grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-2xl text-left border-t border-slate-100" style={{ marginTop: `${foundationalData.coverProjectEntityMarginTop || 80}px` }}>
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
                           <button type="button" className="no-print text-[#8B5CF6] hover:bg-[#8B5CF6]/10 font-bold text-[10px] uppercase tracking-widest gap-2 h-8 rounded-lg flex items-center p-2" onClick={() => setEditingSectionInPreview(section.id)}>
                              <Edit3 className="h-3.5 w-3.5" /> Edit Matrix Node
                           </button>
                         </div>
                         <div className="space-y-6">
                            {renderActiveEditor(section.id)}
                         </div>
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

      {/* Project Cost Breakup Dialog */}
      <Dialog open={isCostBreakupOpen} onOpenChange={setIsCostBreakupOpen}>
        <DialogContent className="max-w-3xl h-[80vh] bg-white border-none shadow-2xl rounded-[3rem] p-0 overflow-hidden flex flex-col">
          <div className="p-8 bg-[#001F3D] text-white flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20"><Calculator className="h-8 w-8" /></div>
                <div>
                   <DialogTitle className="text-2xl font-display font-bold uppercase tracking-tight">Total Project Cost Breakup</DialogTitle>
                   <DialogDescription className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Institutional Valuation Ledger v2.4</DialogDescription>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Total Valuation</p>
                <h3 className="text-3xl font-display font-bold text-white">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</h3>
             </div>
          </div>

          <ScrollArea className="flex-1 p-10">
             <div className="space-y-12 pb-10">
                {/* Fixed Capital (CAPEX) Section */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-3">
                        <Box className="h-5 w-5 text-primary" />
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Fixed Capital Matrix (CAPEX)</h4>
                      </div>
                      <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold">Total: ₹ {calculations.fixedCapital.toLocaleString('en-IN')}</Badge>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-primary/20 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#001F3D] uppercase">Machinery & Equipment</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{machineryItems.length} Identified Units</span>
                         </div>
                         <span className="text-sm font-bold text-slate-700">₹ {financials.investMachinery.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-primary/20 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#001F3D] uppercase">Civil & Interior Works</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Flooring & Partitions</span>
                         </div>
                         <span className="text-sm font-bold text-slate-700">₹ {financials.investCivil.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-primary/20 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#001F3D] uppercase">Electrical Installations</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Cabling & Lighting</span>
                         </div>
                         <span className="text-sm font-bold text-slate-700">₹ {financials.investElectrical.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-primary/20 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#001F3D] uppercase">Software & ERP Nodes</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">System Licenses</span>
                         </div>
                         <span className="text-sm font-bold text-slate-700">₹ {financials.investSoftware.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-primary/20 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#001F3D] uppercase">Pre-operative Expenses</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Admin & Initial Setup</span>
                         </div>
                         <span className="text-sm font-bold text-slate-700">₹ {financials.investPreOp.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-primary/20 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#001F3D] uppercase">Rental / Shed Deposits</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Lease Commitments</span>
                         </div>
                         <span className="text-sm font-bold text-slate-700">₹ {financials.investShedAdvance.toLocaleString('en-IN')}</span>
                      </div>
                   </div>
                </div>

                {/* Working Capital Liquidity Section */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-4">
                      <div className="flex items-center gap-3">
                        <Coins className="h-5 w-5 text-emerald-500" />
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Operational Liquidity (OPEX Buffer)</h4>
                   </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-none text-[9px] font-bold">Term: 3 Months</Badge>
                   </div>
                   
                   <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                      <div className="space-y-1">
                         <span className="text-[11px] font-bold text-emerald-800 uppercase">Working Capital Requirement</span>
                         <p className="text-[9px] text-emerald-600/70 font-medium">3-Month buffer for Rent, Power, Consumables & Maintenance.</p>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-display font-bold text-emerald-700">₹ {calculations.workingCapitalValue.toLocaleString('en-IN')}</p>
                         <p className="text-[8px] font-bold text-emerald-500 uppercase mt-1">₹ {calculations.monthlyOpEx.toLocaleString('en-IN')} / Month</p>
                      </div>
                   </div>
                </div>

                {/* Final Reconciliation Node */}
                <div className="pt-10 border-t-2 border-slate-900 flex justify-between items-end">
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Final Project Valuation</h4>
                      <p className="text-xs text-slate-500 font-medium italic">* Sum of all Fixed Capital and Operational Liquidity buffers.</p>
                   </div>
                   <div className="text-right">
                      <span className="text-5xl font-display font-bold text-[#001F3D] tracking-tighter">₹ {calculations.totalProjectCost.toLocaleString('en-IN')}</span>
                   </div>
                </div>
             </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Audit Reconciliation Active</span>
             </div>
             <Button className="h-12 bg-[#001F3D] hover:bg-black text-white px-10 rounded-xl font-bold uppercase text-[10px] shadow-xl" onClick={() => setIsCostBreakupOpen(false)}>Close Ledger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
