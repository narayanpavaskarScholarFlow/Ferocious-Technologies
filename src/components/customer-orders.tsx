"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  ChevronDown, 
  Package, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  Plus, 
  MoreVertical,
  Contact,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { CustomerOrder, Customer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const initialOrders: CustomerOrder[] = [];

export function CustomerOrders() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  
  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    type: 'Corporate',
    location: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        variant: "destructive",
        title: "Protocol Error",
        description: "Customer Identity and Network Email are required."
      });
      return;
    }

    toast({
      title: "Ledger Updated",
      description: `${newCustomer.name} has been successfully registered in the Master Directory.`
    });
    
    setIsAddCustomerOpen(false);
    setNewCustomer({ type: 'Corporate' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-accent font-bold text-[9px] uppercase tracking-[0.3em]">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-red" />
            Commercial Operations
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            CRM & <span className="text-slate-400 font-medium">Pipeline</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Lifecycle management for industrial accounts and active contracts.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Filter Ledger Records..." 
              className="h-11 pl-10 rounded-xl bg-slate-100 border-none text-[11px] font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <UserPlus className="mr-3 h-4 w-4" /> Register New Account
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Pipeline Ledger */}
        <Card className="lg:col-span-12 overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-lg font-display font-bold text-[#001F3D] uppercase tracking-tight">Active Accounts Ledger</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Total Pipeline Valuation: $0.00</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-white text-[10px] font-bold uppercase tracking-widest border-slate-200 rounded-xl shadow-sm">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="Active" className="text-[10px] font-bold uppercase">Active Pipeline</SelectItem>
                  <SelectItem value="Closed" className="text-[10px] font-bold uppercase">Closed Contracts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10 w-20">Seq.</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account / Client Name</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Primary Point of Contact</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Location</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-right px-10">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 border-slate-50 h-20 transition-colors group">
                  <TableCell className="px-10 font-code text-[11px] text-slate-300 font-bold">
                    {order.siNo.toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D]">{order.customer}</span>
                      <span className="text-[9px] text-slate-400 font-code uppercase tracking-tighter">ID_{order.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase px-3 py-1 bg-white border-slate-200 text-slate-500">
                      {order.customerType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Contact className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{order.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-slate-300" /> {order.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <Badge className={cn(
                      "text-[9px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-full border shadow-sm",
                      order.status === 'Production' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      order.status === 'Shipping' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-green-50 text-green-700 border-green-100'
                    )}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30 py-10">
                      <div className="p-8 bg-slate-50 rounded-[2rem] mb-6">
                        <Package className="h-16 w-16 text-slate-300" />
                      </div>
                      <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Ledger Matrix Offline</p>
                      <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto font-medium">No active pipeline records detected. Register a new account to initialize commercial telemetry.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
          <DialogTitle className="sr-only">Account Onboarding Protocol</DialogTitle>
          <DialogDescription className="sr-only">Sequence for initializing new commercial identities in the ERP directory.</DialogDescription>
          
          <div className="flex h-[600px]">
            <div className="w-80 bg-slate-50/50 p-12 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-12">
                <div className="p-5 bg-[#001F3D] rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20 relative">
                  <UserPlus className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_10px_#ef4444]" />
                </div>
                <div className="space-y-10">
                  {[
                    { s: 1, label: 'Identity Matrix', desc: 'ENTITY_SETUP', active: true },
                    { s: 2, label: 'Contact Points', desc: 'LINK_PROTOCOL', active: false },
                    { s: 3, label: 'Verify & Commit', desc: 'SYNC_LEDGER', active: false },
                  ].map((item) => (
                    <div key={item.s} className="flex gap-6 group relative">
                      {item.s < 3 && <div className="absolute left-3.5 top-10 w-[1px] h-12 bg-slate-200" />}
                      <div className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10 shadow-sm",
                        item.active ? "bg-[#001F3D] border-[#001F3D] text-white scale-110 shadow-lg shadow-primary/20" : "bg-white border-slate-200 text-slate-400"
                      )}>
                        {item.s}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-xs font-bold transition-colors duration-500 leading-none",
                          item.active ? "text-[#001F3D]" : "text-slate-400"
                        )}>{item.label}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-2">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
                CRM_ONBOARD_SYS_V2.4
              </div>
            </div>

            <div className="flex-1 p-16 flex flex-col justify-between bg-white overflow-y-auto">
              <div className="space-y-12">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-10 bg-red-500 rounded-full" />
                  <div>
                    <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">Account Protocol</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Master Data Initialization Sequence</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Entity Name</Label>
                      <Input 
                        placeholder="Legal Account Identity" 
                        className="h-14 bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold focus-visible:ring-primary/20"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Account Class</Label>
                      <Select value={newCustomer.type} onValueChange={(val) => setNewCustomer({...newCustomer, type: val as any})}>
                        <SelectTrigger className="h-14 bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:ring-primary/20 shadow-sm">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                          <SelectItem value="Corporate" className="text-[10px] font-bold uppercase">Corporate Entity</SelectItem>
                          <SelectItem value="Individual" className="text-[10px] font-bold uppercase">Private Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Liaison Officer</Label>
                      <Input 
                        placeholder="Primary Point of Contact" 
                        className="h-14 bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold focus-visible:ring-primary/20"
                        value={newCustomer.contactPerson}
                        onChange={(e) => setNewCustomer({...newCustomer, contactPerson: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Node Location</Label>
                      <div className="relative">
                        <Input 
                          placeholder="e.g. Detroit Matrix" 
                          className="h-14 bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold pl-12 focus-visible:ring-primary/20"
                          value={newCustomer.location}
                          onChange={(e) => setNewCustomer({...newCustomer, location: e.target.value})}
                        />
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Network Email</Label>
                      <div className="relative">
                        <Input 
                          type="email"
                          placeholder="comms@entity.tech" 
                          className="h-14 bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold pl-12 focus-visible:ring-primary/20"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Voice Protocol</Label>
                      <div className="relative">
                        <Input 
                          placeholder="+1 (000) 000-0000" 
                          className="h-14 bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold pl-12 focus-visible:ring-primary/20"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-12 pt-10 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:text-[#001F3D] hover:bg-slate-50"
                  onClick={() => setIsAddCustomerOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button 
                  className="flex-[2] h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-red-600/30 flex gap-3 group"
                  onClick={handleAddCustomer}
                >
                  Commit to Master Ledger
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
