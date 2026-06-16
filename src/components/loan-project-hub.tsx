
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

  const strategyRef = useMemoFirebase(() => doc(db, 'settings', 'loan_strategy'), [db]);
  const { data: savedStrategy } = useDoc<any>(strategyRef);

  const initialChecklist: Record<string, boolean> = {};
  REPORT_SEQUENCE.forEach(item => { initialChecklist[item.id] = true; });
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);

  const [foundationalData, setFormData] = useState<any>({
    projectName: '',
    reportMainTitle: 'Techno-Economic Feasibility Analysis',
    reportSubTitle: 'Detailed Project Report (DPR)',
    businessFirmName: '',
    businessIndustry: '',
    natureOfBusiness: '',
    legalConstitution: '',
    businessAddress: '',
    pinCode: '',
    contactPhone: '',
    typeOfLoanNeeded: '',
    promoterName: '',
    location: '',
    totalLoanRequirement: '0',
    coverLogoSize: 192,
    coverTitleFontSize: 60,
    coverTitleColor: '#001F3D',
    coverLogoMarginTop: 0,
    coverTitleMarginTop: 32,
    coverProjectEntityMarginTop: 80,
  });

  const [proprietaryProducts, setProprietaryProducts] = useState<ProprietaryProduct[]>([]);
  const [industrialServices, setIndustrialServices] = useState<IndustrialService[]>([]);
  const [machineryItems, setMachineryItems] = useState<MachineryItem[]>([]);

  const [financials, setFinancials] = useState({
    loanROI: 10.75,
    loanTenure: 84, 
    loanMoratorium: 6,
    expenseRent: 0,
    expensePower: 0,
    expenseMaintenance: 0,
    expenseConsumables: 0,
    investMachinery: 0,
    investCivil: 0,
    investElectrical: 0,
    investFurniture: 0,
    investPreOp: 0,
    investSoftware: 0,
    investSystem: 0,
    investShedAdvance: 0,
    yearlyGrowthTargets: [0, 15, 15, 15, 15],
    targetNetMargin: 20,
    ownCapital: 0,
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

    const annualProductRevenue = proprietaryProducts.reduce((acc, p) => acc + (parseFloat(p.price) || 0) * (parseInt(p.annualTargetQty.toString().replace(/,/g, '')) || 0), 0);
    const annualServiceRevenue = industrialServices.reduce((acc, s) => acc + (parseFloat(s.price) || 0) * (parseInt(s.annualTargetQty.toString().replace(/,/g, '')) || 0), 0);
    const totalCapacityAnnualRevenue = annualProductRevenue + annualServiceRevenue;
    
    const suggestedWCLimit = financials.workingCapitalLimit || (totalCapacityAnnualRevenue * 0.25 * 0.75);
    const termLoanAmt = totalProjectCost - totalOwnFunds - suggestedWCLimit;

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
    const balanceSheet: any[] = [];
    let accumulatedDepreciation = 0;
    const depreciationRate = 0.15;
    let currentEquity = totalOwnFunds;

    for (let y = 1; y <= 5; y++) {
      const growth = financials.yearlyGrowthTargets?.[y-1] ?? 0;
      const yearRevenue = y === 1 ? (totalCapacityAnnualRevenue * 0.7) : projections[y-2].revenue * (1 + growth/100);
      const yearOpEx = monthlyOpExBase * 12 * (1 + (y * 0.05));
      const yearInterest = schedule.slice((y - 1) * 12, y * 12).reduce((acc, s) => acc + s.interest, 0);
      const yearDepreciation = (fixedAssetsAtCost - accumulatedDepreciation) * depreciationRate;
      accumulatedDepreciation += yearDepreciation;

      const yearEBITDA = yearRevenue - yearOpEx;
      const yearPBT = yearEBITDA - yearInterest - yearDepreciation;
      const yearPAT = yearPBT > 0 ? yearPBT * 0.75 : 0;
      
      currentEquity += yearPAT * 0.8; // Reinvesting 80%

      projections.push({
        year: `Year ${y}`,
        revenue: yearRevenue,
        ebitda: yearEBITDA,
        pat: yearPAT,
        dscr: ((yearPAT + yearDepreciation + yearInterest) / (yearInterest + (emi * 12 - yearInterest) || 1)).toFixed(2)
      });
    }

    return {
      totalProjectCost,
      loanAmt: termLoanAmt,
      totalOwnFunds,
      projections,
      avgDSCR: (projections.reduce((acc, p) => acc + parseFloat(p.dscr), 0) / 5).toFixed(2),
      monthlySchedule: schedule
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
           {/* Catalogue matrices would go here */}
           <Card className="p-20 text-center opacity-30 uppercase font-bold text-xs">Catalogues Node Ready</Card>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-10">
           <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
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
        </TabsContent>

        <TabsContent value="display" className="m-0 flex flex-col items-center">
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
    </div>
  );
}
