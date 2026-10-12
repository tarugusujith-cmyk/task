import { useState, type ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { X } from "lucide-react"

import { useTheme } from "../../context/ThemeContext"

/* =========================================================
   DATA
========================================================= */

const monthlyData = [
  { label: "Jan", sales: 4200, profit: 1800 },
  { label: "Feb", sales: 5100, profit: 2300 },
  { label: "Mar", sales: 4700, profit: 2100 },
  { label: "Apr", sales: 6300, profit: 3200 },
  { label: "May", sales: 7200, profit: 3900 },
  { label: "Jun", sales: 6800, profit: 3400 },
  { label: "Jul", sales: 8100, profit: 4600 },
  { label: "Aug", sales: 7600, profit: 4100 },
  { label: "Sep", sales: 8900, profit: 5200 },
  { label: "Oct", sales: 9800, profit: 5900 },
]

const categoryData = [
  { name: "Electronics", value: 42, color: "#4880FF" },
  { name: "Fashion", value: 26, color: "#FF8A65" },
  { name: "Mobile", value: 19, color: "#00B69B" },
  { name: "Digital", value: 13, color: "#B879D7" },
]

const orderStatusData = [
  { name: "Delivered", value: 5420, color: "#00B69B" },
  { name: "Shipped", value: 2310, color: "#4880FF" },
  { name: "Pending", value: 1240, color: "#FFBF3F" },
  { name: "Cancelled", value: 480, color: "#F93C65" },
]

/** Pull the month label out of a Recharts bar click payload. */
const barLabel = (data: unknown) =>
  String((data as { payload?: { label?: string } }).payload?.label ?? "")

const money = (n: number) => `$${n.toLocaleString("en-US")}`

/* =========================================================
   SHARED PIECES
========================================================= */

function useChartColors() {
  const { theme } = useTheme()
  const dark = theme === "dark"
  return {
    dark,
    tick: dark ? "#CBD5E1" : "#606060",
    grid: dark ? "#344153" : "#E4E8EF",
    cursor: dark ? "rgba(72,128,255,0.12)" : "rgba(72,128,255,0.08)",
    sliceStroke: dark ? "#273142" : "#FFFFFF",
  }
}

interface TooltipRow {
  name?: string | number
  value?: string | number
  color?: string
  payload?: { color?: string }
}

interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: TooltipRow[]
  format?: (value: number) => string
  total?: number
}

/** Tooltip card that follows light/dark theme. Shows value (+ share when a total is given). */
function ChartTooltip({
  active,
  label,
  payload,
  format = (v) => String(v),
  total,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="min-w-[150px] rounded-xl border border-[#E4E8EF] bg-white px-3.5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:border-[#3A475B] dark:bg-[#1F2937]">
      {label !== undefined && label !== "" && (
        <p className="mb-2 text-[12px] font-bold text-[#202224] dark:text-white">
          {label}
        </p>
      )}

      <div className="space-y-1.5">
        {payload.map((row, index) => {
          const value = Number(row.value ?? 0)
          const color = row.color ?? row.payload?.color ?? "#4880FF"

          return (
            <div
              key={`${row.name}-${index}`}
              className="flex items-center justify-between gap-4 text-[12px]"
            >
              <span className="flex items-center gap-2 text-[#606060] dark:text-[#CBD5E1]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {row.name}
              </span>

              <span className="font-bold text-[#202224] dark:text-white">
                {format(value)}
                {total ? (
                  <span className="ml-1.5 font-semibold text-[#8C939F]">
                    {((value / total) * 100).toFixed(1)}%
                  </span>
                ) : null}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string
  subtitle: string
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={[
        "rounded-[14px] border border-[#B9B9B9]/20 bg-white p-5 text-[#202224]",
        "shadow-[6px_6px_54px_rgba(0,0,0,0.05)] transition-shadow duration-200",
        "hover:shadow-[6px_10px_60px_rgba(0,0,0,0.08)]",
        "dark:border-[#313D4F] dark:bg-[#273142] dark:text-white dark:shadow-none",
        "sm:p-6",
        className,
      ].join(" ")}
    >
      <div className="mb-4">
        <h2 className="text-[20px] font-extrabold sm:text-[22px]">{title}</h2>
        <p className="mt-1 text-[12px] text-[#8C939F]">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

interface DetailItem {
  label: string
  value: string
  color?: string
}

/** Shown under a chart after a click: the selected item's values. */
function DetailPanel({
  title,
  items,
  hint,
  onClear,
}: {
  title?: string
  items?: DetailItem[]
  hint: string
  onClear: () => void
}) {
  if (!title || !items) {
    return (
      <p className="mt-4 rounded-xl bg-[#F1F4F9] px-4 py-3 text-center text-[12px] font-semibold text-[#8C939F] dark:bg-[#323D4E]">
        {hint}
      </p>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-[#4880FF]/30 bg-[#4880FF]/[0.06] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="truncate text-[14px] font-extrabold">{title}</p>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#606060] transition hover:bg-[#4880FF]/15 hover:text-[#4880FF] dark:text-[#CBD5E1]"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8C939F]">
              {item.color && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="truncate">{item.label}</span>
            </p>
            <p className="mt-0.5 truncate text-[16px] font-extrabold">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Legend({
  items,
  activeName,
  onPick,
}: {
  items: { name: string; color: string; value: string }[]
  activeName: string | null
  onPick: (name: string) => void
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {items.map((item) => {
        const active = activeName === item.name
        const dimmed = activeName !== null && !active

        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onPick(item.name)}
            className={[
              "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[12px] transition",
              active
                ? "border-[#4880FF] bg-[#4880FF]/10"
                : "border-transparent bg-[#F1F4F9] hover:border-[#4880FF]/40 dark:bg-[#323D4E]",
              dimmed ? "opacity-50" : "",
            ].join(" ")}
          >
            <span className="flex min-w-0 items-center gap-2 font-semibold">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-extrabold">{item.value}</span>
          </button>
        )
      })}
    </div>
  )
}

/* =========================================================
   BAR CHART
========================================================= */

function MonthlyBarChart() {
  const c = useChartColors()
  const [selected, setSelected] = useState<string | null>(null)

  const row = monthlyData.find((item) => item.label === selected)
  const toggle = (label: string) =>
    setSelected((current) => (current === label ? null : label))

  return (
    <ChartCard
      title="Monthly Sales vs Profit"
      subtitle="Click a bar to see the exact figures"
      className="lg:col-span-2"
    >
      <div className="h-[280px] w-full sm:h-[320px] [&_.recharts-bar-rectangle]:cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
            barCategoryGap="22%"
            barGap={4}
          >
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis
              dataKey="label"
              tick={{ fill: c.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: c.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={46}
              tickFormatter={(v) => `${Number(v) / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: c.cursor }}
              content={<ChartTooltip format={money} />}
            />

            <Bar
              dataKey="sales"
              name="Sales"
              fill="#4880FF"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              onClick={(data) => toggle(barLabel(data))}
            >
              {monthlyData.map((item) => (
                <Cell
                  key={item.label}
                  fillOpacity={selected && selected !== item.label ? 0.3 : 1}
                />
              ))}
            </Bar>

            <Bar
              dataKey="profit"
              name="Profit"
              fill="#00B69B"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              onClick={(data) => toggle(barLabel(data))}
            >
              {monthlyData.map((item) => (
                <Cell
                  key={item.label}
                  fillOpacity={selected && selected !== item.label ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-6 text-[12px] font-semibold">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#4880FF]" />
          Sales
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#00B69B]" />
          Profit
        </span>
      </div>

      <DetailPanel
        hint="Tap any bar to pin its values here"
        onClear={() => setSelected(null)}
        title={row ? `${row.label} 2026` : undefined}
        items={
          row
            ? [
                { label: "Sales", value: money(row.sales), color: "#4880FF" },
                { label: "Profit", value: money(row.profit), color: "#00B69B" },
                {
                  label: "Margin",
                  value: `${((row.profit / row.sales) * 100).toFixed(1)}%`,
                },
              ]
            : undefined
        }
      />
    </ChartCard>
  )
}

/* =========================================================
   PIE + DONUT (shared)
========================================================= */

interface Slice {
  name: string
  value: number
  color: string
}

function SliceChart({
  data,
  donut,
  centerLabel,
  formatValue,
  detailTitle,
  title,
  subtitle,
}: {
  data: Slice[]
  donut: boolean
  centerLabel?: string
  formatValue: (v: number) => string
  detailTitle: string
  title: string
  subtitle: string
}) {
  const c = useChartColors()
  const [selected, setSelected] = useState<string | null>(null)

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const active = data.find((item) => item.name === selected)
  const toggle = (name: string) =>
    setSelected((current) => (current === name ? null : name))

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="relative mx-auto h-[230px] w-full max-w-[320px] [&_.recharts-pie-sector]:cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<ChartTooltip format={formatValue} total={total} />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={donut ? "58%" : 0}
              outerRadius="92%"
              paddingAngle={donut ? 3 : 1}
              cornerRadius={donut ? 6 : 0}
              stroke={c.sliceStroke}
              strokeWidth={donut ? 0 : 2}
              startAngle={90}
              endAngle={-270}
              onClick={(slice) => toggle(String(slice.name))}
            >
              {data.map((item) => (
                <Cell
                  key={item.name}
                  fill={item.color}
                  fillOpacity={selected && selected !== item.name ? 0.3 : 1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {donut && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-[#8C939F]">
              {active ? active.name : centerLabel}
            </span>
            <span className="text-[22px] font-extrabold leading-tight">
              {formatValue(active ? active.value : total)}
            </span>
            {active && (
              <span className="text-[11px] font-bold text-[#4880FF]">
                {((active.value / total) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      <Legend
        items={data.map((item) => ({
          name: item.name,
          color: item.color,
          value: formatValue(item.value),
        }))}
        activeName={selected}
        onPick={toggle}
      />

      <DetailPanel
        hint="Tap a slice or legend item for details"
        onClear={() => setSelected(null)}
        title={active ? `${active.name} ${detailTitle}` : undefined}
        items={
          active
            ? [
                {
                  label: "Value",
                  value: formatValue(active.value),
                  color: active.color,
                },
                {
                  label: "Share",
                  value: `${((active.value / total) * 100).toFixed(1)}%`,
                },
                { label: "Total", value: formatValue(total) },
              ]
            : undefined
        }
      />
    </ChartCard>
  )
}

/* =========================================================
   EXPORT
========================================================= */

export default function InteractiveCharts() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <MonthlyBarChart />

      <SliceChart
        data={categoryData}
        donut={false}
        title="Sales by Category"
        subtitle="Pie chart · share of total revenue"
        detailTitle="category"
        formatValue={(v) => `${v}%`}
      />

      <SliceChart
        data={orderStatusData}
        donut
        centerLabel="Total orders"
        title="Order Status"
        subtitle="Donut chart · orders by current status"
        detailTitle="orders"
        formatValue={(v) => v.toLocaleString("en-US")}
      />
    </div>
  )
}
