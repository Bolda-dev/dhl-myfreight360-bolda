import { useMemo } from "react";
import {
  Settings,
  RefreshCw,
  Plane,
  Ship,
  Truck,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  AreaChart,
  Area,
} from "recharts";
import { mockShipments } from "@/data/mockShipments";

// =============================================================
//  Palette — neutral, modern, no DHL yellow/red
// =============================================================
const TEAL = "hsl(190, 75%, 45%)";
const BLUE = "hsl(217, 75%, 55%)";
const ORANGE = "hsl(25, 90%, 58%)";
const GREEN = "hsl(152, 60%, 45%)";
const PURPLE = "hsl(265, 60%, 60%)";
const PINK = "hsl(335, 70%, 60%)";
const SLATE = "hsl(220, 15%, 55%)";
const GOLD = "hsl(42, 90%, 55%)";
const ROSE = "hsl(355, 75%, 62%)";

const PIE_PALETTE = [TEAL, ORANGE, BLUE, GREEN, PURPLE, PINK, GOLD, ROSE, SLATE];

// =============================================================
//  Shared widget shell
// =============================================================

const WidgetCard = ({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`group relative bg-card border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${className}`}
  >
    <div className="flex items-start justify-between px-4 pt-3.5 pb-2">
      <div className="min-w-0">
        <h3 className="text-[11px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10.5px] text-muted-foreground/70 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <RefreshCw className="w-3 h-3" />
        </button>
        <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Settings className="w-3 h-3" />
        </button>
        <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
    </div>
    <div className="flex-1 min-h-0 px-4 pb-4">{children}</div>
  </div>
);

const TrendPill = ({ value, positive = true }: { value: number; positive?: boolean }) => {
  const color = positive
    ? "bg-success/10 text-success"
    : "bg-destructive/10 text-destructive";
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums ${color}`}>
      <Icon className="w-2.5 h-2.5" />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
};

// Tiny custom recharts tooltip
const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { name: string; value: number } }> }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { name: string; value: number };
  return (
    <div className="rounded-md border bg-popover px-2 py-1 shadow-md text-[11px]">
      <div className="font-medium text-popover-foreground">{p.name}</div>
      <div className="text-muted-foreground tabular-nums">{p.value} docs</div>
    </div>
  );
};

// =============================================================
//  Widget 1 — Documents by Consignee (donut + ranked legend)
// =============================================================

const DocumentsByConsignee = () => {
  const { data, total, top } = useMemo(() => {
    const counts: Record<string, number> = {};
    mockShipments.forEach((s) => {
      counts[s.consignee] = (counts[s.consignee] || 0) + 1;
    });
    const arr = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const top9 = arr.slice(0, 9);
    const rest = arr.slice(9).reduce((s, x) => s + x.value, 0);
    const data = rest > 0 ? [...top9, { name: "Other", value: rest }] : top9;
    const total = arr.reduce((s, x) => s + x.value, 0);
    return { data, total, top: arr[0] };
  }, []);

  const topPct = top ? ((top.value / total) * 100).toFixed(1) : "0";

  return (
    <WidgetCard
      title="Documents by Consignee"
      subtitle={`Top consignee: ${top?.name ?? "—"}`}
      className="lg:col-span-2"
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-4 h-full">
        {/* Donut */}
        <div className="relative shrink-0 w-full lg:w-[210px] h-[210px] mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {PIE_PALETTE.map((c, i) => (
                  <linearGradient key={i} id={`donut-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="96%"
                paddingAngle={1.5}
                stroke="hsl(var(--card))"
                strokeWidth={2}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`url(#donut-${i % PIE_PALETTE.length})`}
                  />
                ))}
              </Pie>
              <ReTooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] font-medium text-muted-foreground tracking-[0.12em] uppercase">
              Total
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums leading-tight">
              {total.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {data.length} consignees
            </div>
          </div>
        </div>

        {/* Ranked legend */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 overflow-auto max-h-[230px] pr-1">
          {data.map((d, i) => {
            const pct = (d.value / total) * 100;
            return (
              <div
                key={d.name}
                className="group/row flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-muted/60 transition-colors"
              >
                <span
                  className="w-1.5 h-7 rounded-full shrink-0"
                  style={{ background: PIE_PALETTE[i % PIE_PALETTE.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[11.5px] text-foreground truncate font-medium"
                      title={d.name}
                    >
                      {d.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                      {d.value}
                    </span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: PIE_PALETTE[i % PIE_PALETTE.length],
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground tabular-nums w-10 text-right">
                  {pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {topPct}%
          </span>{" "}
          concentrated in top consignee
        </span>
        <button className="inline-flex items-center gap-1 text-primary hover:underline font-medium">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </WidgetCard>
  );
};

// =============================================================
//  Widget 2 — Load Gauge (avg documents per shipment)
// =============================================================

const LoadGauge = () => {
  const { avg, max, pct, count } = useMemo(() => {
    const total = mockShipments.length;
    const docs = mockShipments.map((s) => s.invoiceCount || 0);
    const sum = docs.reduce((a, b) => a + b, 0);
    const avg = total > 0 ? sum / total : 0;
    const max = Math.max(14, ...docs);
    const pct = max > 0 ? (avg / max) * 100 : 0;
    return { avg, max, pct, count: total };
  }, []);

  const data = [{ name: "load", value: pct }];

  // Color the gauge by load level
  const gaugeColor = pct < 25 ? ROSE : pct < 60 ? ORANGE : GREEN;

  return (
    <WidgetCard title="Load Gauge" subtitle="Avg documents per shipment">
      <div className="h-full flex flex-col">
        <div className="relative flex-1 min-h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              startAngle={210}
              endAngle={-30}
              data={data}
            >
              <defs>
                <linearGradient id="gauge-fill" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={gaugeColor} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={gaugeColor} stopOpacity={1} />
                </linearGradient>
              </defs>
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "hsl(var(--muted))" }}
                dataKey="value"
                cornerRadius={10}
                fill="url(#gauge-fill)"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-4xl font-bold text-foreground tabular-nums leading-none">
              {avg.toFixed(1)}
            </div>
            <div className="text-[10px] font-medium text-muted-foreground mt-1 tracking-wider uppercase">
              docs / shipment
            </div>
            <div className="mt-2">
              <TrendPill value={3.2} positive />
            </div>
          </div>
        </div>

        <div className="mt-2 pt-3 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Min
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">0</div>
          </div>
          <div className="border-x">
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Max
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {max}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Records
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {count.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

// =============================================================
//  Widget 3 — Transport Mode Breakdown
// =============================================================

const modeMeta = {
  Air: { label: "Air", icon: Plane, color: BLUE, soft: "bg-[hsl(217,75%,55%)]/10" },
  Ocean: { label: "Sea", icon: Ship, color: TEAL, soft: "bg-[hsl(190,75%,45%)]/10" },
  Rail: { label: "Road", icon: Truck, color: ORANGE, soft: "bg-[hsl(25,90%,58%)]/10" },
} as const;

// Build a small synthetic 12-week trend per mode for sparklines
const buildTrend = (target: number, seed: number) => {
  const points = 12;
  const out: { i: number; v: number }[] = [];
  let v = target * 0.65;
  for (let i = 0; i < points; i++) {
    const noise = Math.sin(seed + i * 0.7) * (target * 0.12) + (Math.random() - 0.5) * (target * 0.08);
    v = Math.max(0, v + (target - v) * 0.12 + noise * 0.4);
    out.push({ i, v });
  }
  out[out.length - 1].v = target; // anchor last
  return out;
};

const TransportModes = () => {
  const counts = useMemo(() => {
    const c: Record<string, number> = { Air: 0, Ocean: 0, Rail: 0 };
    mockShipments.forEach((s) => {
      c[s.transportMode] = (c[s.transportMode] || 0) + 1;
    });
    return c;
  }, []);

  const total = counts.Air + counts.Ocean + counts.Rail;

  const rows: Array<{ key: keyof typeof modeMeta; value: number; trend: number; up: boolean }> = [
    { key: "Air", value: counts.Air, trend: 8.4, up: true },
    { key: "Ocean", value: counts.Ocean, trend: 2.1, up: false },
    { key: "Rail", value: counts.Rail, trend: 5.7, up: true },
  ];

  return (
    <WidgetCard title="Transport Mode" subtitle="Breakdown across all shipments">
      <div className="h-full flex flex-col gap-2.5">
        {rows.map(({ key, value, trend, up }, idx) => {
          const meta = modeMeta[key];
          const Icon = meta.icon;
          const pct = total > 0 ? (value / total) * 100 : 0;
          const trendData = buildTrend(value, idx + 1);

          return (
            <div
              key={key}
              className="relative rounded-lg border bg-gradient-to-br from-muted/30 to-transparent p-3 hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.soft}`}
                >
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-medium text-foreground">
                      {meta.label}
                    </div>
                    <TrendPill value={trend} positive={up} />
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold text-foreground tabular-nums leading-none">
                      {value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-20 h-10 shrink-0 hidden sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`spark-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={meta.color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={meta.color}
                        strokeWidth={1.5}
                        fill={`url(#spark-${key})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* progress bar */}
              <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};

// =============================================================
//  Widget 4 — Air Shipments (KPI hero w/ trend)
// =============================================================

const AirShipmentsKPI = () => {
  const { value, total, pct } = useMemo(() => {
    const value = mockShipments.filter((s) => s.transportMode === "Air").length;
    const total = mockShipments.length;
    const pct = total > 0 ? (value / total) * 100 : 0;
    return { value, total, pct };
  }, []);

  const trend = useMemo(() => buildTrend(value, 7), [value]);

  return (
    <WidgetCard
      title="Air Shipments"
      subtitle="Active air freight movements"
      className="bg-gradient-to-br from-card to-[hsl(217,75%,55%)]/[0.04]"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[hsl(217,75%,55%)]/10 flex items-center justify-center">
                <Plane className="w-4 h-4" style={{ color: BLUE }} />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                Air
              </span>
            </div>
            <div className="mt-3 text-5xl font-bold text-foreground tabular-nums leading-none">
              {value.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <TrendPill value={12.3} positive />
              <span className="text-[10.5px] text-muted-foreground">vs last 30d</span>
            </div>
          </div>
        </div>

        {/* Big sparkline */}
        <div className="mt-3 h-20 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="air-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={BLUE}
                strokeWidth={2}
                fill="url(#air-spark)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-3 border-t grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Share of total
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {pct.toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Total fleet
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

// =============================================================
//  Layout
// =============================================================

const DashboardWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-2 animate-fade-in">
      {/* row 1 */}
      <DocumentsByConsignee />
      <LoadGauge />
      <AirShipmentsKPI />

      {/* row 2 */}
      <TransportModes />
    </div>
  );
};

export default DashboardWidgets;
