import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, ChevronsRight, ChevronsLeft, AlertTriangle, Container, FileText, Tag, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ColumnInfo {
  id: string;
  label: string;
}

export interface ActionVisibility {
  exceptions: boolean;
  containers: boolean;
  invoices: boolean;
  tags: boolean;
  remarks: boolean;
}

interface ColumnManagerDialogProps {
  open: boolean;
  onClose: () => void;
  allColumns: ColumnInfo[];
  visibleColumnIds: string[];
  onSave: (visibleIds: string[]) => void;
  actionVisibility: ActionVisibility;
  onActionVisibilityChange: (v: ActionVisibility) => void;
  mergeOriginDest?: boolean;
  onMergeOriginDestChange?: (v: boolean) => void;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  exceptions: <AlertTriangle className="w-3.5 h-3.5" />,
  containers: <Container className="w-3.5 h-3.5" />,
  invoices: <FileText className="w-3.5 h-3.5" />,
  tags: <Tag className="w-3.5 h-3.5" />,
  remarks: <MessageSquare className="w-3.5 h-3.5" />,
};

const ACTION_LABELS: Record<string, string> = {
  exceptions: "Exceptions",
  containers: "Containers",
  invoices: "Invoices",
  tags: "Tags",
  remarks: "Remarks",
};

// Extra dummy columns shown only in the manager to demonstrate scroll behavior
const DUMMY_AVAILABLE_COLUMNS: ColumnInfo[] = [
  { id: "dummy-incoterm", label: "Incoterm" },
  { id: "dummy-vessel", label: "Vessel Name" },
  { id: "dummy-voyage", label: "Voyage Number" },
  { id: "dummy-flight", label: "Flight Number" },
  { id: "dummy-awb", label: "AWB Number" },
  { id: "dummy-booking", label: "Booking Reference" },
  { id: "dummy-pol", label: "Port of Loading" },
  { id: "dummy-pod", label: "Port of Discharge" },
  { id: "dummy-place-receipt", label: "Place of Receipt" },
  { id: "dummy-place-delivery", label: "Place of Delivery" },
  { id: "dummy-weight", label: "Gross Weight (kg)" },
  { id: "dummy-volume", label: "Volume (CBM)" },
  { id: "dummy-pieces", label: "Pieces" },
  { id: "dummy-packages", label: "Packages" },
  { id: "dummy-container-type", label: "Container Type" },
  { id: "dummy-container-count", label: "Container Count" },
  { id: "dummy-seal", label: "Seal Number" },
  { id: "dummy-commodity", label: "Commodity" },
  { id: "dummy-hs-code", label: "HS Code" },
  { id: "dummy-customs-status", label: "Customs Status" },
  { id: "dummy-customs-broker", label: "Customs Broker" },
  { id: "dummy-insurance", label: "Insurance Value" },
  { id: "dummy-currency", label: "Currency" },
  { id: "dummy-payment-terms", label: "Payment Terms" },
  { id: "dummy-freight-cost", label: "Freight Cost" },
  { id: "dummy-duty", label: "Duty & Taxes" },
  { id: "dummy-pickup-date", label: "Pickup Date" },
  { id: "dummy-delivery-date", label: "Delivery Date" },
  { id: "dummy-cutoff", label: "Cargo Cutoff" },
  { id: "dummy-doc-cutoff", label: "Doc Cutoff" },
  { id: "dummy-temp", label: "Temperature" },
  { id: "dummy-hazmat", label: "Hazmat Class" },
  { id: "dummy-po", label: "PO Number" },
  { id: "dummy-so", label: "SO Number" },
  { id: "dummy-invoice-no", label: "Invoice Number" },
  { id: "dummy-supplier", label: "Supplier" },
  { id: "dummy-buyer", label: "Buyer" },
  { id: "dummy-notify", label: "Notify Party" },
  { id: "dummy-agent-origin", label: "Origin Agent" },
  { id: "dummy-agent-dest", label: "Destination Agent" },
  { id: "dummy-route", label: "Route" },
  { id: "dummy-transit-time", label: "Transit Time" },
  { id: "dummy-service-level", label: "Service Level" },
  { id: "dummy-priority", label: "Priority" },
  { id: "dummy-created", label: "Created Date" },
  { id: "dummy-updated", label: "Last Updated" },
  { id: "dummy-owner", label: "Account Manager" },
];

const ColumnManagerDialog = ({
  open, onClose, allColumns, visibleColumnIds, onSave,
  actionVisibility, onActionVisibilityChange,
}: ColumnManagerDialogProps) => {
  const [visible, setVisible] = useState<string[]>(visibleColumnIds);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [actVis, setActVis] = useState<ActionVisibility>(actionVisibility);
  const listRef = useRef<HTMLDivElement>(null);

  // Selection state for checkboxes (per pane)
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedDisplayed, setSelectedDisplayed] = useState<Set<string>>(new Set());
  const [lastClickedAvailable, setLastClickedAvailable] = useState<string | null>(null);
  const [lastClickedDisplayed, setLastClickedDisplayed] = useState<string | null>(null);

  // Combined catalog: real columns + dummies (so dummies can be moved/saved like any other)
  const catalog = [...allColumns, ...DUMMY_AVAILABLE_COLUMNS];
  const hidden = catalog.filter((c) => !visible.includes(c.id));
  const visibleCols = visible.map((id) => allColumns.find((c) => c.id === id)!).filter(Boolean);

  const moveToVisible = (ids: string[]) => {
    if (ids.length === 0) return;
    setVisible((prev) => [...prev, ...ids.filter((id) => !prev.includes(id))]);
    setSelectedAvailable(new Set());
  };
  const moveToHidden = (ids: string[]) => {
    if (ids.length === 0) return;
    setVisible((prev) => prev.filter((v) => !ids.includes(v)));
    setSelectedDisplayed(new Set());
  };

  // Shift-click range selection
  const handleCheckboxClick = (
    e: React.MouseEvent,
    id: string,
    list: ColumnInfo[],
    selected: Set<string>,
    setSelected: (s: Set<string>) => void,
    lastClicked: string | null,
    setLastClicked: (id: string) => void,
  ) => {
    const next = new Set(selected);
    if (e.shiftKey && lastClicked) {
      const ids = list.map((c) => c.id);
      const a = ids.indexOf(lastClicked);
      const b = ids.indexOf(id);
      if (a !== -1 && b !== -1) {
        const [from, to] = a < b ? [a, b] : [b, a];
        const shouldSelect = !selected.has(id);
        for (let i = from; i <= to; i++) {
          if (shouldSelect) next.add(ids[i]);
          else next.delete(ids[i]);
        }
        setSelected(next);
        setLastClicked(id);
        return;
      }
    }
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setLastClicked(id);
  };

  // Drag start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  // Drag over visible list — calculate drop index based on mouse Y
  const handleDragOverList = (e: React.DragEvent) => {
    e.preventDefault();
    if (!listRef.current || !draggedItem) return;
    const children = Array.from(listRef.current.children).filter(
      (el) => el.getAttribute("data-col-id")
    );
    let idx = children.length;
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        idx = i;
        break;
      }
    }
    setDropIndex(idx);
  };

  // Drop on visible list
  const handleDropOnVisible = () => {
    if (!draggedItem) return;
    setVisible((prev) => {
      const isAlreadyVisible = prev.includes(draggedItem);
      let next = isAlreadyVisible ? prev.filter((v) => v !== draggedItem) : [...prev];
      const targetIdx = dropIndex ?? next.length;
      if (!isAlreadyVisible) {
        next.splice(targetIdx, 0, draggedItem);
      } else {
        next.splice(targetIdx, 0, draggedItem);
      }
      return next;
    });
    setDraggedItem(null);
    setDropIndex(null);
  };

  // Drop on hidden list (remove from visible)
  const handleDropOnHidden = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;
    moveToHidden([draggedItem]);
    setDraggedItem(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropIndex(null);
  };

  const handleSave = () => {
    onSave(visible);
    onActionVisibilityChange(actVis);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mt-2 items-stretch">
          {/* Hidden (Available) columns */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Available <span className="text-muted-foreground/60">({hidden.length})</span>
            </h4>
            <div
              className="border rounded-md p-1.5 h-[280px] overflow-auto space-y-0.5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnHidden}
            >
              {hidden.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center">All columns visible</p>}
              {hidden.map((col) => {
                const isSelected = selectedAvailable.has(col.id);
                return (
                  <div
                    key={col.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, col.id)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => handleCheckboxClick(e, col.id, hidden, selectedAvailable, setSelectedAvailable, lastClickedAvailable, setLastClickedAvailable)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer select-none ${
                      isSelected ? "bg-primary/10" : "hover:bg-accent"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3.5 h-3.5 pointer-events-none"
                    />
                    <GripVertical className="w-3 h-3 text-muted-foreground shrink-0 cursor-grab" />
                    <span className="flex-1 truncate">{col.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bulk transfer buttons */}
          <div className="flex flex-col items-center justify-center gap-2 pt-6">
            <button
              onClick={() => moveToVisible(Array.from(selectedAvailable))}
              disabled={selectedAvailable.size === 0}
              title={`Move ${selectedAvailable.size} to Displayed`}
              className={`h-7 w-7 rounded border flex items-center justify-center transition-all ${
                selectedAvailable.size > 0
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 opacity-100"
                  : "border-border text-muted-foreground/40 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveToHidden(Array.from(selectedDisplayed))}
              disabled={selectedDisplayed.size === 0}
              title={`Move ${selectedDisplayed.size} to Available`}
              className={`h-7 w-7 rounded border flex items-center justify-center transition-all ${
                selectedDisplayed.size > 0
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 opacity-100"
                  : "border-border text-muted-foreground/40 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visible (Displayed) columns */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Displayed <span className="text-muted-foreground/60">({visibleCols.length})</span>
            </h4>
            <div
              ref={listRef}
              className="border rounded-md p-1.5 h-[280px] overflow-auto"
              onDragOver={handleDragOverList}
              onDrop={handleDropOnVisible}
            >
              {visibleCols.map((col, i) => {
                const isSelected = selectedDisplayed.has(col.id);
                return (
                  <div key={col.id} data-col-id={col.id}>
                    {dropIndex === i && draggedItem && (
                      <div className="h-0.5 bg-primary rounded-full mx-1 my-0.5" />
                    )}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, col.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleCheckboxClick(e, col.id, visibleCols, selectedDisplayed, setSelectedDisplayed, lastClickedDisplayed, setLastClickedDisplayed)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer select-none ${
                        draggedItem === col.id ? "opacity-30 bg-accent" : isSelected ? "bg-primary/10" : "hover:bg-accent"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 pointer-events-none"
                      />
                      <GripVertical className="w-3 h-3 text-muted-foreground shrink-0 cursor-grab" />
                      <span className="flex-1 truncate">{col.label}</span>
                    </div>
                  </div>
                );
              })}
              {dropIndex === visibleCols.length && draggedItem && (
                <div className="h-0.5 bg-primary rounded-full mx-1 my-0.5" />
              )}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground mt-1.5">
          Tip: Click to select. Hold <kbd className="px-1 py-0.5 rounded border bg-muted text-[10px]">Shift</kbd> to select a range.
        </p>

        {/* Action icons checkboxes */}
        <div className="mt-3 border-t pt-3">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Action Icons (right side)</h4>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ACTION_LABELS) as Array<keyof ActionVisibility>).map((key) => (
              <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <Checkbox
                  checked={actVis[key]}
                  onCheckedChange={(checked) =>
                    setActVis((prev) => ({ ...prev, [key]: !!checked }))
                  }
                  className="w-3.5 h-3.5"
                />
                <span className="text-muted-foreground">{ACTION_ICONS[key]}</span>
                <span>{ACTION_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-3">
          <button
            onClick={() => {
              const defaults = allColumns.map(c => c.id);
              setVisible(defaults);
              setActVis({ exceptions: true, containers: true, invoices: true, tags: true, remarks: true });
              setSelectedAvailable(new Set());
              setSelectedDisplayed(new Set());
            }}
            className="px-3 py-1.5 text-xs rounded border text-muted-foreground hover:bg-accent"
          >
            Reset to Default
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs rounded border text-muted-foreground hover:bg-accent">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90">Apply</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnManagerDialog;
