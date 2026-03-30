"use client";

import { useState } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ViewType } from '@/lib/types';
import { ShopFloorOverview } from '@/components/shop-floor-overview';
import { ShopFloorOrders } from '@/components/shop-floor-orders';
import { ShopFloorSQCDP } from '@/components/shop-floor-sqcdp';
import { Toaster } from '@/components/ui/toaster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VisualShopFloor() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* High Density Sidebar */}
      <SidebarNav currentView={currentView} onViewChange={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Header */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="font-headline font-bold text-slate-800 uppercase tracking-tight text-lg">
              visual shop floor <span className="text-primary">2.0</span>
            </h1>
            <div className="h-4 w-[1px] bg-slate-200 mx-2" />
            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Location: EU-NORTH-1 / Section B
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input placeholder="Global search..." className="h-8 pl-8 text-xs bg-slate-50 border-none focus-visible:ring-1" />
            </div>
            <div className="flex items-center gap-4 border-l pl-4">
              <button className="text-slate-400 hover:text-primary transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-none">Miloš Kovařík</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">Plant Manager</p>
                </div>
                <Avatar className="h-8 w-8 border border-slate-200">
                  <AvatarImage src="https://picsum.photos/seed/user-shop/100/100" />
                  <AvatarFallback>MK</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {currentView === 'overview' && <ShopFloorOverview />}
          {currentView === 'orders' && <ShopFloorOrders />}
          {currentView === 'sqcdp' && <ShopFloorSQCDP />}
          {currentView === 'tasks' && (
            <div className="flex items-center justify-center h-full text-slate-400 font-headline uppercase tracking-widest text-sm italic">
              -- Tasks View Under Construction --
            </div>
          )}
        </main>
      </div>

      <Toaster />
    </div>
  );
}