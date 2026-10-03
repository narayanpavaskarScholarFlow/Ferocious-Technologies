"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  ShoppingCart, 
  Lock,
  Truck, 
  Building2, 
  Briefcase, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus,
  Landmark,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Receipt,
  FileBox,
  Wallet,
  Settings
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  orders: Order[];
  users: SystemUser[];
  permissions?: Record<string, PermissionLevel>;
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  uiSettings: UISettings;
}

const THEME_TEAL = '#00A389';

export function BillingManagement({ customers, vendors, records, orders, users, permissions, uiSettings }: BillingManagementProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'analytics' | 'quick-links'>('quick-links');

  const quickLinks = [
    { label: 'Sale Invoice', icon: FileText },
    { label: 'Purchase Invoice', icon: ShoppingCart },
    { label: 'Quotation', icon: FileBox },
    { label: 'Delivery Challan', icon: Truck },
    { label: 'Proforma', icon: FileCheck },
    { label: 'Purchase Order', icon: ShoppingCart },
    { label: 'Sale Order', icon: FileText },
    { label: 'Job Work', icon: Briefcase },
    { label: 'Credit Note', icon: ArrowDownLeft },
    { label: 'Debit Note', icon: ArrowUpRight },
    { label: 'Service Request', icon: Settings },
    { label: 'Inward Payment', icon: Landmark },
    { label: 'Outward Payment', icon: Wallet },
  ];

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'customer', label: 'Customer / Vendor' },
    { id: 'products', label: 'Products / Services' },
    { id: 'sale', label: 'Sale Invoice' },
    { id: 'purchase', label: 'Purchase Invoice' },
    { id: 'payment', label: 'Payment' },
    { id: 'expense', label: 'Expense Income' },
    { id: 'other', label: 'Other Documents' },
    { id: 'report', label: 'Report' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 animate-in fade-in duration-700 font-body">
      {/* Top Professional Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4">
        <div className="max-w-[1600px] mx-auto overflow-x-auto hide-scrollbar">
          <div className="flex h-14 items-center">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 h-full text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id 
                    ? "border-red-500 text-red-500 bg-red-50/10" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                {tab.label}
                {['expense', 'other', 'report'].includes(tab.id) && <Lock className="h-3 w-3 text-slate-300" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10">
        {/* Profile Completion Section */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl">
           <h3 className="text-sm font-bold text-slate-800 mb-6">Complete your profile</h3>
           <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                 <div>
                    <p className="text-xs font-bold text-slate-700">Add Your Business Logo</p>
                    <p className="text-[10px] text-slate-400 mt-1">Print your business logo on your invoice to impress your customer with a beautiful invoice.</p>
                 </div>
                 <Button variant="outline" className="h-9 px-6 rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-widest">Add Logo</Button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <p className="text-xs font-bold text-slate-700">Add Your Bank & UPI Details</p>
                    <p className="text-[10px] text-slate-400 mt-1">Get a faster payment with a UPI QR code. These UPI & Bank details will be printed on your invoice.</p>
                 </div>
                 <Button variant="outline" className="h-9 px-6 rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-widest">Add Bank</Button>
              </div>
           </div>
        </Card>

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-200/50 p-1 rounded-full flex border border-slate-200">
            <button 
              onClick={() => setViewMode('analytics')}
              className={cn(
                "px-8 h-9 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === 'analytics' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
              )}
            >
              Analytics
            </button>
            <button 
              onClick={() => setViewMode('quick-links')}
              className={cn(
                "px-8 h-9 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === 'quick-links' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400"
              )}
            >
              Quick Links
            </button>
          </div>
        </div>

        {/* Quick Links Grid */}
        {viewMode === 'quick-links' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {quickLinks.map((link) => (
              <Card 
                key={link.label} 
                className="bg-white border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all rounded-xl overflow-hidden group cursor-pointer h-40 flex flex-col items-center justify-center gap-4"
              >
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                  <link.icon className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{link.label}</span>
              </Card>
            ))}
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
             {[
               { label: 'Total Receivables', val: '₹ 12,45,000', icon: TrendingUp, color: 'text-blue-500' },
               { label: 'Pending Payables', val: '₹ 4,20,000', icon: ArrowDownLeft, color: 'text-red-500' },
               { label: 'Bank Liquidity', val: '₹ 8,15,000', icon: Landmark, color: 'text-emerald-500' },
             ].map((stat, i) => (
               <Card key={i} className="p-8 bg-white border-slate-200 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{stat.label}</p>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-[#001F3D]">{stat.val}</h3>
               </Card>
             ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-10 right-10 z-[100] print:hidden">
        <Button className="h-16 w-16 rounded-full bg-[#001F3D] text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center">
          <Plus className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
