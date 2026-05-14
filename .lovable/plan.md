## Problem

The pie chart in `/dashboard-lite` is collapsing to ~0 height — only the center "70" label and the legend below it are visible, but the actual donut ring isn't rendered.

Root causes (two bugs stacking):

1. **Left column doesn't stretch to the grid row height.** In `src/pages/DashboardLite.tsx`, the parent flex chain doesn't propagate height correctly to the left column, so the column sizes to its content instead of the full main area.
2. **The donut's `ResponsiveContainer` resolves to 0px tall.** In `src/components/DashboardWidgets.tsx` (minimal variant of `DocumentsByConsignee`), the chart sits inside a chain of `h-full` / `flex-1 min-h-0` wrappers. When any ancestor lacks a resolved height, Recharts' `ResponsiveContainer` renders nothing and only the absolutely-positioned center label + legend remain visible — exactly what the screenshot shows.

## Fix

### `src/pages/DashboardLite.tsx`
- Replace the grid wrapper with one that guarantees a single full-height row: use `lg:grid-rows-[minmax(0,1fr)]` (Tailwind's `grid-rows-1` is unreliable here when one child has its own scroll).
- Add `h-full` explicitly on the left-column inner `<div className="lg:col-span-2 flex flex-col …">` so it inherits the row height.

### `src/components/DashboardWidgets.tsx` (minimal variant)
- Remove the extra centering wrappers around the donut.
- Render the `ResponsiveContainer` directly inside a sized box: `<div className="flex-1 min-h-[220px] w-full relative">` containing the `ResponsiveContainer width="100%" height="100%"` plus the absolutely-positioned center "Total / 70" overlay.
- Keep the legend (`Air / Ocean / Road`) below as a `shrink-0` row.
- This guarantees the donut has a concrete minimum height even if a parent flex chain misbehaves, while still expanding to fill available space.

## Result

The donut ring will render at full size, vertically centered in its card, with the "Total 70" overlay and the 3-color legend underneath. The card's bottom edge will align with the bottom of the table on the right.

## Files touched

- `src/pages/DashboardLite.tsx`
- `src/components/DashboardWidgets.tsx`
