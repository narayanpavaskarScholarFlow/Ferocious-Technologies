"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Cleared sample data for fresh installation
const usageData: any[] = [];

const statusData = [
  { name: "Nominal", value: 100, color: "hsl(var(--primary))" },
];

export function SystemCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Activity Chart */}
      <div className="glass-effect p-4 rounded-xl border border-white/5">
        <h4 className="text-xs font-code text-muted-foreground uppercase tracking-widest mb-6">Asset Utilization</h4>
        <div className="h-[180px] w-full flex items-center justify-center">
          {usageData.length > 0 ? (
            <ChartContainer config={{ value: { label: "Utilization", color: "hsl(var(--primary))" } }}>
              <BarChart data={usageData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/10">No data signals detected</p>
          )}
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="glass-effect p-4 rounded-xl border border-white/5">
        <h4 className="text-xs font-code text-muted-foreground uppercase tracking-widest mb-6">Status Distribution</h4>
        <div className="h-[180px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}