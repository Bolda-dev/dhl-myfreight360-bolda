## Goal

Make the shipment detail popup the single source of truth — wider, with scrollable tabs, a consistent typographic system across every tab, and deep-linkable from each table action icon (Exceptions, Containers, Invoices, Tags, Remarks) into the matching tab with full data and editing.

---

## 1. Wider popup + scrollable tabs

`src/components/ShipmentDetailPopup.tsx`

- Bump dialog width: `max-w-[1400px] w-[97vw]` (was `max-w-[800px] w-[95vw]`), keep `h-[85vh]`.
- Wrap `TabsList` in a horizontal scroll container so tabs never clip on narrow screens:
  - Outer: `relative shrink-0 border-b`.
  - Inner scroller: `overflow-x-auto scrollbar-thin` + `whitespace-nowrap`.
  - `TabsList` becomes `inline-flex w-max` (no longer forced to 100%) so triggers keep their natural width and overflow horizontally instead of wrapping/truncating.
- Add subtle left/right fade gradients on the scroller edges as visual hint that more tabs exist.

## 2. Tab content style system (visual + spec consistency)

Introduce a small set of internal helper components inside `ShipmentDetailPopup.tsx` so every tab uses the same heading hierarchy, spacing, and weights:

- `<TabHeader title subtitle action?>` — H3 title (`text-sm font-semibold text-foreground`), 11px muted subtitle, optional right-aligned action button. Used at the top of every tab.
- `<SectionTitle>` — uppercase 10px, `font-semibold text-muted-foreground tracking-wider`, 12px bottom margin. Replaces the ad-hoc h3s currently scattered across tabs.
- `<DataField label value>` — uppercase 10px label + 13px medium foreground value, used in cards/grids.
- Standard tab padding: `p-6 space-y-6`.
- Standard card surface: `bg-muted/30 rounded-lg p-4`.

Apply across all tabs:

- General: keep current sections, swap headings/cards to the helpers.
- Flights / Voyage: TabHeader ("Trip Itinerary" / leg count subtitle), unify leg cards, use SectionTitle for "Schedule".
- Events: TabHeader ("Events Timeline"), normalize event row typography (title 13px medium, body 11px muted).
- Invoices, Tags, Remarks, Containers/Packages: same TabHeader + Section pattern.
- ContainersTab.tsx: replace its custom header bar with the shared `TabHeader` (title "Containers" / "Packages", subtitle "{n} container(s)", action = Table/Journey toggle).

## 3. Deep-link table icons → popup tab

Currently the action icons open separate dialogs (`InvoicesDialog`, `TagsDialog`, `RemarksDialog`, `EventsDialog`). Replace this with a single flow that opens `ShipmentDetailPopup` already focused on the right tab and in edit mode where applicable.

`ShipmentDetailPopup.tsx`

- Accept a new prop `initialTab?: string` and pass it as `defaultValue` (or use controlled `value`/`onValueChange`) on `<Tabs>`.
- Map: `exceptions` → `general` (popup auto-scrolls to the Exceptions banner via a ref), `containers` → `containers`, `invoices` → `invoices`, `tags` → `tags`, `remarks` → `remarks`.

`ShipmentTable.tsx`

- Remove the four standalone dialogs (`InvoicesDialog`, `TagsDialog`, `RemarksDialog`, `EventsDialog`) from the render tree and their state hooks.
- Replace with one piece of state: `popup: { shipment: Shipment; tab: string } | null`.
- Rewire helpers:
  - `openDetail(s)` → `{ shipment: s, tab: "general" }`
  - `openEvents(s)` → `{ shipment: s, tab: "general" }` (with focus on exceptions)
  - `openInvoices(s)` → `{ shipment: s, tab: "invoices" }`
  - `openTags(s)` → `{ shipment: s, tab: "tags" }`
  - `openRemarks(s)` → `{ shipment: s, tab: "remarks" }`
  - New `openContainers(s)` → `{ shipment: s, tab: "containers" }`; wire the existing `Cnt.` icon (currently a dumb span) to a button.

## 4. Editing inside the popup tabs

Move the editing logic from the legacy dialogs into the popup tabs.

- Tags tab: existing tag chips + an "Add tag" combobox seeded from `AVAILABLE_TAGS` and a remove-x on each chip. Saves through a callback (`onTagsChange`) propagated up to `ShipmentTable` so `setShipments` updates.
- Remarks tab: list of timestamped remark cards + a textarea + "Add remark" button. Calls `onRemarkAdd` upward.
- Invoices tab: read-only list (matches current dialog) — no edit needed in this iteration.
- Exceptions: read-only banner already renders in General; opening from icon scrolls to it.

Pass `onTagsChange` and `onRemarkAdd` props from `ShipmentTable` into `ShipmentDetailPopup` so the existing `handleTagsSave` / `handleRemarkAdd` reducers keep working.

## 5. Cleanup

- Delete unused state (`invoiceShipment`, `eventsShipment`, `tagsShipment`, `remarksShipment`) and dialog imports from `ShipmentTable.tsx`.
- Keep the dialog component files in the repo for now (no breakage if referenced elsewhere) but stop importing them from the table.

---

## Files touched

- `src/components/ShipmentDetailPopup.tsx` — width, scrollable tabs, helper components, `initialTab`, edit handlers, exceptions scroll target.
- `src/components/ContainersTab.tsx` — adopt shared `TabHeader` / `SectionTitle`.
- `src/components/ShipmentTable.tsx` — collapse 4 dialogs into one popup, deep-link icons, wire edit callbacks, add `openContainers`.

## Out of scope

- No data model changes.
- No changes to the table layout itself other than icon click behavior.
- Invoices editing UI (kept read-only this round).
