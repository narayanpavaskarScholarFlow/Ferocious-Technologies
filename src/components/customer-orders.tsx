"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Contact
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
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const initialOrders: CustomerOrder[] = [];
const initialCustomers: Customer[] = [];

export function CustomerOrders() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active');
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
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

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Customer name and email are required fields."
      });
      return;
    }

    const customer: Customer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCustomer.name || '',
      type: newCustomer.type as any,
      contactPerson: newCustomer.contactPerson || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      location: newCustomer.location || '',
      totalOrders: 0
    };

    setCustomers(prev => [...prev, customer]);
    setIsAddCustomerOpen(false);
    setNewCustomer({ type: 'Corporate' });
    
    toast({
      title: "Registration Successful",
      description: `${customer.name} has been added to the master directory.`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-slate-900">CRM & Pipeline</h2>
          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">Customer Lifecycle Management Ledger</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search records..." 
              className="pl-10 h-11 bg-white border-slate-200 rounded-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-full h-11 px-6 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            <UserPlus className="mr-2 h-4 w-4" /> New Customer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200">
          <TabsTrigger value="pipeline" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Active Pipeline
          </TabsTrigger>
          <TabsTrigger value="directory" className="rounded-full px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Customer Directory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="m-0 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter by:</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-9 bg-white text-[10px] font-bold border-slate-200 rounded-full">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[10px] uppercase font-bold">All Accounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 h-8 px-4 border-blue-100 font-bold text-[10px] uppercase tracking-widest">
              Live Pipeline Value: $0.00
            </Badge>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-20">Si.</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Order/Account</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">POs</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Valuation</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Qty</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Location</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 ml-auto hover:text-primary transition-colors outline-none">
                        {activeFilter} <ChevronDown className="h-3 w-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => setActiveFilter('Active')} className="text-[10px] font-bold uppercase cursor-pointer">Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveFilter('Closed')} className="text-[10px] font-bold uppercase cursor-pointer">Closed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 border-slate-50 h-20 transition-colors">
                    <TableCell className="font-bold text-sm text-slate-300 px-8">{order.siNo.toString().padStart(2, '0')}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{order.customer}</span>
                        <span className="text-[10px] text-slate-400 font-code">#{order.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-code text-xs font-bold text-primary">{order.numberOfPOs}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">{order.customerType}</TableCell>
                    <TableCell className="text-right font-code text-sm font-bold text-slate-900">{order.value}</TableCell>
                    <TableCell className="text-center font-code text-xs text-slate-500">{order.quantity}</TableCell>
                    <TableCell className="text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> {order.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Badge 
                        className={cn(
                          "text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-full",
                          order.status === 'Production' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          order.status === 'Pending' ? 'bg-slate-50 text-slate-400 border border-slate-200' :
                          order.status === 'Shipping' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-green-50 text-green-600 border border-green-100'
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20">
                        <Package className="h-16 w-16 text-slate-400 mb-6" />
                        <p className="text-slate-500 font-code text-xs italic uppercase tracking-widest">Pipeline_Ledger_Empty</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="directory" className="m-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Client Name</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Type</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Contact / Email</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Location</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center text-slate-400">Order Count</TableHead>
                  <TableHead className="text-right px-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50/50 border-slate-50 h-24 transition-colors group">
                    <TableCell className="px-8">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900">{customer.name}</span>
                        <span className="text-[10px] text-slate-400 font-code uppercase">{customer.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white border-slate-200 text-[9px] font-bold uppercase px-3 py-1">
                        {customer.type === 'Corporate' ? <Building2 className="h-3 w-3 mr-1.5" /> : <User className="h-3 w-3 mr-1.5" />}
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Contact className="h-3 w-3 text-primary" /> {customer.contactPerson}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> {customer.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-primary">{customer.totalOrders}</span>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/5 hover:text-primary">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20">
                        <Building2 className="h-16 w-16 text-slate-400 mb-6" />
                        <p className="text-slate-500 font-code text-xs italic uppercase tracking-widest">No Registered Customers Found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-xl bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-8 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-display font-bold text-white uppercase tracking-tight">Onboard New Account</DialogTitle>
              <DialogDescription className="text-white/70 text-sm font-medium">Initialize master data for a new customer account.</DialogDescription>
            </div>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Account Name</Label>
                <Input 
                  placeholder="Company or Individual Name" 
                  className="h-12 bg-slate-50 border-none rounded-xl"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Account Type</Label>
                <Select 
                  value={newCustomer.type} 
                  onValueChange={(val) => setNewCustomer({...newCustomer, type: val as any})}
                >
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Corporate" className="text-xs font-bold uppercase">Corporate</SelectItem>
                    <SelectItem value="Individual" className="text-xs font-bold uppercase">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Contact Person</Label>
                <Input 
                  placeholder="Primary Point of Contact" 
                  className="h-12 bg-slate-50 border-none rounded-xl"
                  value={newCustomer.contactPerson}
                  onChange={(e) => setNewCustomer({...newCustomer, contactPerson: e.target.value})}
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Location / City</Label>
                <Input 
                  placeholder="e.g. Detroit, MI" 
                  className="h-12 bg-slate-50 border-none rounded-xl"
                  value={newCustomer.location}
                  onChange={(e) => setNewCustomer({...newCustomer, location: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Email Address</Label>
                <Input 
                  type="email"
                  placeholder="contact@email.com" 
                  className="h-12 bg-slate-50 border-none rounded-xl"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Phone Number</Label>
                <Input 
                  placeholder="+1 (000) 000-0000" 
                  className="h-12 bg-slate-50 border-none rounded-xl"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="ghost" 
                className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400"
                onClick={() => setIsAddCustomerOpen(false)}
              >
                Cancel Registration
              </Button>
              <Button 
                className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                onClick={handleAddCustomer}
              >
                Register & Initialize Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
