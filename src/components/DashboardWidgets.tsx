import { useMemo, useState } from "react";
import { Settings, RefreshCw, Plane, Ship, Truck } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { mockShipments } from "@/data/mockShipments";

// Neutral palette — no DHL yellow/red
const PALETTE = [
  "hsl(190, 75%, 45%)",   // teal/cyan
  "hsl(25, 90%, 55%)",    // orange (status accent)
  "hsl(217, 70%, 55%)",   // blue
  "hsl(142, 55%, 45%)",   // green
  "hsl(280, 50%, 60%)",   // purple
  "hsl(330, 60%, 60%)",   // pink
  "hsl(45, 85%, 55%)",    // gold
  "hsl(0, 70%, 60%)",     // red
  "hsl(200, 30%, 55%)",   // slate-blue
  "hsl(160, 40%, 50%)",   // muted teal
];

// ================== Shared widget shell ==================

const WidgetCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card border rounded-lg shadow-sm flex flex-col min-h-[280px]">
    <div className="flex items-center justify-between px-3 h-9 border-b">
      <h3 className="text-[12px] font-semibold text-foreground tracking-tight uppercase">
        {title}
      </h3>
      <div className="flex items-center gap-0.5">
        <button className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
    <div className="flex-1 min-h-0 p-3">{children}</div>
  </div>
);

const CountBadge = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-semibold tracking-wider uppercase">
    Count
  </span>
);

// ================== Widget 1: Documents by consignee ==================

const DocumentsByConsignee = () => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    mockShipments.forEach((s) => {
      counts[s.consignee] = (counts[s.consignee] || 0) + 1;
    });
    const arr = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 9);
    return arr;
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <WidgetCard title="Documents by consignee">
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="92%"
                stroke="hsl(var(--card))"
                strokeWidth={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <ReTooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 6,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {total.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-1 mt-3 pt-3 border-t max-h-[120px] overflow-auto">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 text-[11px]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="truncate text-foreground" title={d.name}>
                {d.name}
              </span>
              <span className="ml-auto text-muted-foreground tabular-nums">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
};

// ================== Widget 2: Load Gauge ==================

const LoadGauge = () => {
  const { value, min, max, count } = useMemo(() => {
    const total = mockShipments.length;
    const withDocs = mockShipments.reduce((sum, s) => sum + (s.invoiceCount || 0), 0);
    const avgPct = total > 0 ? (withDocs / (total * 14)) * 100 : 0; // arbitrary scale 0–14
    return {
      value: Math.max(0, Math.min(100, avgPct)),
      min: 0,
      max: 14,
      count: total,
    };
  }, []);

  const data = [{ name: "load", value }];

  return (
    <WidgetCard title="Load Gauge — Documents Count AVG">
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              startAngle={210}
              endAngle={-30}
              data={data}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "hsl(var(--muted))" }}
                dataKey="value"
                cornerRadius={6}
                fill="hsl(142, 55%, 45%)"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold text-foreground tabular-nums">
              {value.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-center space-y-0.5">
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {min.toFixed(1)} — {max.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
            %
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            Avg: {value.toFixed(1)} · Records: {count.toLocaleString()}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

// ================== Widget 3: Count Transport Mode — ALL ==================

const modeMeta: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  Air: { label: "Air", icon: Plane, color: "hsl(217, 70%, 55%)" },
  Ocean: { label: "Sea", icon: Ship, color: "hsl(190, 75%, 45%)" },
  Rail: { label: "Road", icon: Truck, color: "hsl(25, 90%, 55%)" },
};

const CountTransportModeAll = () => {
  const counts = useMemo(() => {
    const c = { Air: 0, Ocean: 0, Rail: 0 } as Record<string, number>;
    mockShipments.forEach((s) => {
      c[s.transportMode] = (c[s.transportMode] || 0) + 1;
    });
    return c;
  }, []);

  // Match the screenshot layout: stacked rows
  const rows = [
    { key: "Air", value: counts.Air },
    { key: "Ocean", value: counts.Ocean },
    { key: "Rail", value: counts.Rail },
  ];

  return (
    <WidgetCard title="Count Transport Mode — ALL">
      <div className="h-full flex flex-col justify-around gap-2">
        {rows.map(({ key, value }) => {
          const meta = modeMeta[key];
          const Icon = meta.icon;
          return (
            <div
              key={key}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="text-3xl font-bold text-foreground tabular-nums leading-none">
                {value}
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-[12px] text-foreground">
                <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                <span>{meta.label}</span>
              </div>
              <div className="mt-1">
                <CountBadge />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};

// ================== Widget 4: Count Air Only ==================

const CountAirOnly = () => {
  const value = useMemo(
    () => mockShipments.filter((s) => s.transportMode === "Air").length,
    []
  );

  return (
    <WidgetCard title="Count Air Only">
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-foreground tabular-nums leading-none">
          {value.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[13px] text-foreground">
          <Plane className="w-4 h-4" style={{ color: "hsl(217, 70%, 55%)" }} />
          <span>Air</span>
        </div>
        <div className="mt-2">
          <CountBadge />
        </div>
      </div>
    </WidgetCard>
  );
};

// ================== Layout ==================

const DashboardWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 py-2">
      <DocumentsByConsignee />
      <LoadGauge />
      <CountTransportModeAll />
      <CountAirOnly />
    </div>
  );
};

export default DashboardWidgets;
