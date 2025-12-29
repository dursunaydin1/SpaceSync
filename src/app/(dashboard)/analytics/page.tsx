"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  LayoutGrid,
} from "lucide-react";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { getWorkspaceAnalytics } from "@/actions/analytics";

export default function AnalyticsPage() {
  const { workspaceId } = useWorkspace();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!workspaceId) return;
      setLoading(true);
      const result = await getWorkspaceAnalytics(workspaceId);
      setData(result);
      setLoading(false);
    }
    fetchAnalytics();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Calculating mission intelligence...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500" />
          Mission Intelligence
        </h1>
        <p className="text-neutral-500 font-medium tracking-wide">
          REAL-TIME ANALYTICS AND PERFORMANCE METRICS
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Objectives"
          value={data.totalTasks}
          icon={<LayoutGrid className="w-5 h-5 text-indigo-400" />}
          label="ACTIVE IN WORKSPACE"
        />
        <KPICard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          label="MISSION EFFICIENCY"
        />
        <KPICard
          title="High Priority"
          value={
            data.priorityDistribution.find((p: any) => p.name === "Urgent")
              ?.value +
            data.priorityDistribution.find((p: any) => p.name === "High")?.value
          }
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          label="CRITICAL TARGETS"
        />
        <KPICard
          title="Performance Index"
          value="A+"
          icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
          label="WORKSPACE VELOCITY"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Status Distribution (Pie) */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-8">
            <PieChartIcon className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              Status Distribution
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.statusDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {data.statusDistribution.map((entry: any) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[10px] font-bold text-neutral-500 uppercase">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown (Bar) */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              Priority Matrix
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priorityDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#666", fontSize: 10, fontWeight: "bold" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#666", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.priorityDistribution.map(
                    (entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Task Load (Horizontal Bar) */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <LayoutGrid className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              Project Mission Load
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projectDistribution} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fill: "#fff", fontSize: 11, fontWeight: "600" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="tasks"
                  fill="#6366f1"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, label }: any) {
  return (
    <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-neutral-950 rounded-xl border border-white/5 group-hover:border-indigo-500/30 transition-colors">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-neutral-600 uppercase tracking-[0.2em]">
          {title}
        </p>
        <h4 className="text-3xl font-bold text-white tabular-nums">{value}</h4>
        <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  );
}
