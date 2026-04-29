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
    className={`group relative bg-card border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden ${className}`}
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
const ChartTooltip = ({
  active,
  payload,
  unit = "docs",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { name: string; value: number } }>;
  unit?: string;
}) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { name?: string; value?: number; v?: number; i?: number };
  const name = p.name ?? (typeof p.i === "number" ? `Week ${p.i + 1}` : "");
  const value = p.value ?? p.v ?? 0;
  return (
    <div className="rounded-md border bg-popover px-2 py-1 shadow-md text-[11px]">
      {name && <div className="font-medium text-popover-foreground">{name}</div>}
      <div className="text-muted-foreground tabular-nums">
        {Math.round(value as number)} {unit}
      </div>
    </div>
  );
};

// =============================================================
//  Widget 1 — Documents by Consignee (donut + ranked legend)
// =============================================================

const DocumentsByConsignee = ({ variant = "full" }: { variant?: "full" | "minimal" }) => {
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

  // Inline donut shared between variants
  const Donut = ({ size }: { size: number }) => (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
            ))}
          </Pie>
          <ReTooltip
            content={<ChartTooltip />}
            wrapperStyle={{ zIndex: 60, outline: "none" }}
            allowEscapeViewBox={{ x: true, y: true }}
            cursor={false}
          />
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
  );

  if (variant === "minimal") {
    return (
      <WidgetCard
        title="Documents by Consignee"
        subtitle={`Top: ${top?.name ?? "—"}`}
      >
        <div className="h-full flex items-center justify-center py-2">
          <Donut size={220} />
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Documents by Consignee"
      subtitle={`Top consignee: ${top?.name ?? "—"}`}
      className="lg:col-span-2"
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-4 h-full">
        {/* Donut */}
        <div className="shrink-0 w-full lg:w-[210px] flex items-center justify-center">
          <Donut size={210} />
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
                fill={gaugeColor}
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
              className="relative rounded-lg border bg-muted/30 p-3 hover:border-foreground/20 transition-colors"
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
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={meta.color}
                        strokeWidth={1.5}
                        fill={meta.color}
                        fillOpacity={0.18}
                        isAnimationActive={false}
                      />
                      <ReTooltip
                        content={<ChartTooltip unit={meta.label.toLowerCase()} />}
                        wrapperStyle={{ zIndex: 60, outline: "none" }}
                        allowEscapeViewBox={{ x: true, y: true }}
                        cursor={{ stroke: meta.color, strokeOpacity: 0.3, strokeWidth: 1 }}
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

// =============================================================
//  KPI per Transport Mode (full + compact variants)
// =============================================================

type KPIVariant = "full" | "compact";

const ModeKPI = ({
  mode,
  trendPct = 12.3,
  trendUp = true,
  variant = "full",
}: {
  mode: keyof typeof modeMeta;
  trendPct?: number;
  trendUp?: boolean;
  variant?: KPIVariant;
}) => {
  const meta = modeMeta[mode];
  const Icon = meta.icon;

  const { value, total, pct } = useMemo(() => {
    const value = mockShipments.filter((s) => s.transportMode === mode).length;
    const total = mockShipments.length;
    const pct = total > 0 ? (value / total) * 100 : 0;
    return { value, total, pct };
  }, [mode]);

  const trend = useMemo(() => buildTrend(value, mode.length + 3), [value, mode]);

  const title =
    mode === "Air"
      ? "Air Shipments"
      : mode === "Ocean"
        ? "Ocean Shipments"
        : "Road Shipments";

  if (variant === "compact") {
    return (
      <WidgetCard title={title}>
        <div className="h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${meta.color}1A` }}
            >
              <Icon className="w-4 h-4" style={{ color: meta.color }} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              {meta.label}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-4xl font-bold text-foreground tabular-nums leading-none">
              {value.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <TrendPill value={trendPct} positive={trendUp} />
              <span className="text-[10.5px] text-muted-foreground tabular-nums">
                {pct.toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={title}
      subtitle={`Active ${meta.label.toLowerCase()} freight movements`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${meta.color}1A` }}
              >
                <Icon className="w-4 h-4" style={{ color: meta.color }} />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                {meta.label}
              </span>
            </div>
            <div className="mt-3 text-5xl font-bold text-foreground tabular-nums leading-none">
              {value.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <TrendPill value={trendPct} positive={trendUp} />
              <span className="text-[10.5px] text-muted-foreground">vs last 30d</span>
            </div>
          </div>
        </div>

        <div className="mt-3 h-20 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={meta.color}
                strokeWidth={2}
                fill={meta.color}
                fillOpacity={0.15}
                isAnimationActive={false}
              />
              <ReTooltip
                content={<ChartTooltip unit={`${meta.label.toLowerCase()} shipments`} />}
                wrapperStyle={{ zIndex: 60, outline: "none" }}
                allowEscapeViewBox={{ x: true, y: true }}
                cursor={{ stroke: meta.color, strokeOpacity: 0.4, strokeWidth: 1 }}
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
//  Widget — Top 10 Consignees (table)
// =============================================================

const Top10Consignees = () => {
  const rows = useMemo(() => {
    type Row = {
      name: string;
      docs: number;
      air: number;
      ocean: number;
      rail: number;
    };
    const map: Record<string, Row> = {};
    mockShipments.forEach((s) => {
      const r =
        map[s.consignee] ||
        (map[s.consignee] = {
          name: s.consignee,
          docs: 0,
          air: 0,
          ocean: 0,
          rail: 0,
        });
      r.docs += 1;
      if (s.transportMode === "Air") r.air += 1;
      else if (s.transportMode === "Ocean") r.ocean += 1;
      else r.rail += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.docs - a.docs)
      .slice(0, 10);
  }, []);

  const max = rows[0]?.docs ?? 1;

  return (
    <WidgetCard
      title="Top 10 Consignees"
      subtitle="Ranked by total documents"
      className="lg:col-span-2"
    >
      <div className="overflow-auto -mx-1">
        <table className="w-full text-[12px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left">
              <th className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase w-8">#</th>
              <th className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Consignee</th>
              <th className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase text-right"><Plane className="inline w-3 h-3" /></th>
              <th className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase text-right"><Ship className="inline w-3 h-3" /></th>
              <th className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase text-right"><Truck className="inline w-3 h-3" /></th>
              <th className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase text-right">Docs</th>
              <th className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase w-[110px]">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const pct = (r.docs / max) * 100;
              return (
                <tr key={r.name} className="hover:bg-muted/50 transition-colors">
                  <td className="px-2 py-1.5 border-t text-[11px] font-semibold text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="px-2 py-1.5 border-t">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-1.5 h-5 rounded-full shrink-0"
                        style={{ background: PIE_PALETTE[i % PIE_PALETTE.length] }}
                      />
                      <span className="truncate font-medium text-foreground" title={r.name}>{r.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-t text-right tabular-nums text-muted-foreground">{r.air || "—"}</td>
                  <td className="px-2 py-1.5 border-t text-right tabular-nums text-muted-foreground">{r.ocean || "—"}</td>
                  <td className="px-2 py-1.5 border-t text-right tabular-nums text-muted-foreground">{r.rail || "—"}</td>
                  <td className="px-2 py-1.5 border-t text-right tabular-nums font-semibold text-foreground">{r.docs}</td>
                  <td className="px-2 py-1.5 border-t">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: PIE_PALETTE[i % PIE_PALETTE.length] }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
      {/* Row 1 — full donut (with legend), gauge, hero KPI */}
      <DocumentsByConsignee variant="full" />
      <LoadGauge />
      <ModeKPI mode="Air" trendPct={12.3} trendUp />

      {/* Row 2 — Top 10 table, minimal donut, transport modes */}
      <Top10Consignees />
      <DocumentsByConsignee variant="minimal" />
      <TransportModes />

      {/* Row 3 — compact KPI variants */}
      <ModeKPI mode="Air" trendPct={12.3} trendUp variant="compact" />
      <ModeKPI mode="Ocean" trendPct={2.1} trendUp={false} variant="compact" />
      <ModeKPI mode="Rail" trendPct={5.7} trendUp variant="compact" />
    </div>
  );
};

export default DashboardWidgets;
