"use client";

import { Card } from '@/components/ui/card';
import { 
  Monitor, 
  ShoppingCart, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Cell,
  Line,
  LineChart
} from "recharts";

const kpiData = [
  { label: 'Total Machines', total: 71, sub1: 'Operating', sub1Val: 25, sub2: 'Idle', sub2Val: 30, color: 'bg-blue-600', icon: Monitor },
  { label: 'Total Orders', total: 50, sub1: 'In Progress', sub1Val: 29, sub2: 'In 3 Days', sub2Val: 1, color: 'bg-purple-600', icon: ShoppingCart },
  { label: 'Total Employees', total: 37, sub1: 'Absent', sub1Val: 3, sub2: 'Dept 1', sub2Val: 14, color: 'bg-amber-500', icon: Users },
];

const chartData = [
  { name: 'Dept 1', ok: 400, warn: 240, error: 100 },
  { name: 'Dept 2', ok: 300, warn: 139, error: 200 },
  { name: 'Dept 3', ok: 200, warn: 980, error: 300 },
  { name: 'Dept 4', ok: 278, warn: 390, error: 150 },
  { name: 'Dept 5', ok: 189, warn: 480, error: 180 },
];

const trendData = [
  { date: '1. Feb', actual: 400, plan: 450 },
  { date: '2. Feb', actual: 420, plan: 450 },
  { date: '3. Feb', actual: 380, plan: 450 },
  { date: '4. Feb', actual: 480, plan: 460 },
  { date: '5. Feb', actual: 520, plan: 460 },
];

export function ShopFloorOverview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={`${kpi.color} text-white p-4 flex flex-col justify-between border-none shadow-md overflow-hidden relative group`}>
              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">{kpi.label}</p>
                  <h3 className="text-3xl font-bold mt-1">{kpi.total}</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex gap-4 mt-6 z-10 border-t border-white/20 pt-4">
                <div>
                  <p className="text-[10px] opacity-70 uppercase leading-none mb-1">{kpi.sub1}</p>
                  <p className="text-lg font-bold">{kpi.sub1Val}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase leading-none mb-1">{kpi.sub2}</p>
                  <p className="text-lg font-bold">{kpi.sub2Val}</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Icon className="h-32 w-32" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* OEE Gauge Section */}
        <div className="lg:col-span-3 glass-card p-4 flex flex-col items-center justify-center gap-4">
          <h4 className="text-xs font-bold uppercase text-slate-500 text-center">Total OEE</h4>
          <div className="relative w-48 h-32 flex flex-col items-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="502.4" strokeDashoffset="165" className="text-primary" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-4xl font-bold text-slate-800">67.4</span>
                <span className="text-xs font-bold text-slate-400">OEE %</span>
             </div>
          </div>
          <div className="flex items-center gap-2 text-green-500 font-bold">
            <ArrowUpRight className="h-4 w-4" />
            <span>+2.4% vs L. Week</span>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="lg:col-span-5 glass-card p-4">
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-6">Production Status per Department</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis hide />
                <ChartTooltip />
                <Bar dataKey="ok" stackId="a" fill="#005a9c" radius={[0, 0, 0, 0]} />
                <Bar dataKey="warn" stackId="a" fill="#f59e0b" />
                <Bar dataKey="error" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Section */}
        <div className="lg:col-span-4 glass-card p-4">
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-6">Order Trends</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <ChartTooltip />
                <Line type="monotone" dataKey="actual" stroke="#005a9c" strokeWidth={3} dot={{r: 4, fill: '#005a9c'}} />
                <Line type="monotone" dataKey="plan" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="glass-card p-4">
        <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">Current System Alerts</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-bold">CRITICAL:</span>
              <span>Machine ML-04 Down (Drive Error)</span>
            </div>
            <span className="font-code opacity-60">12:44:02</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-800 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-bold">INFO:</span>
              <span>Maintenance cycle for TR-12 completed by M. Weber</span>
            </div>
            <span className="font-code opacity-60">11:15:30</span>
          </div>
        </div>
      </div>
    </div>
  );
}
