import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, ArrowRight, ArrowLeft, AlertTriangle, Container, FileText, Tag, MessageSquare } from "lucide-react";
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
  mergeOriginDest: boolean;
  onMergeOriginDestChange: (v: boolean) => void;
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

const ColumnManagerDialog = ({
  open, onClose, allColumns, visibleColumnIds, onSave,
  actionVisibility, onActionVisibilityChange,
  mergeOriginDest, onMergeOriginDestChange,
}: ColumnManagerDialogProps) => {
  const [visible, setVisible] = useState<string[]>(visibleColumnIds);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [actVis, setActVis] = useState<ActionVisibility>(actionVisibility);
  const [merged, setMerged] = useState(mergeOriginDest);
  const listRef = useRef<HTMLDivElement>(null);

  const hidden = allColumns.filter((c) => !visible.includes(c.id));
  const visibleCols = visible.map((id) => allColumns.find((c) => c.id === id)!).filter(Boolean);

  const moveToVisible = (id: string) => setVisible((prev) => [...prev, id]);
  const moveToHidden = (id: string) => setVisible((prev) => prev.filter((v) => v !== id));

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
    moveToHidden(draggedItem);
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
    onMergeOriginDestChange(merged);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Hidden (Available) columns */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Available</h4>
            <div
              className="border rounded-md p-1.5 min-h-[200px] max-h-[300px] overflow-auto space-y-0.5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnHidden}
            >
              {hidden.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center">All columns visible</p>}
              {hidden.map((col) => (
                <div
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-accent text-xs group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-1.5">
                    <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span>{col.label}</span>
                  </div>
                  <button onClick={() => moveToVisible(col.id)} className="opacity-0 group-hover:opacity-100 text-primary hover:text-primary/80">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Visible (Displayed) columns */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Displayed</h4>
            <div
              ref={listRef}
              className="border rounded-md p-1.5 min-h-[200px] max-h-[300px] overflow-auto"
              onDragOver={handleDragOverList}
              onDrop={handleDropOnVisible}
            >
              {visibleCols.map((col, i) => (
                <div key={col.id} data-col-id={col.id}>
                  {/* Drop indicator line */}
                  {dropIndex === i && draggedItem && (
                    <div className="h-0.5 bg-primary rounded-full mx-1 my-0.5" />
                  )}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, col.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs group cursor-grab active:cursor-grabbing ${
                      draggedItem === col.id ? "opacity-30 bg-accent" : "hover:bg-accent"
                    }`}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="flex-1">{col.label}</span>
                    <button onClick={() => moveToHidden(col.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80">
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {/* Drop indicator at the end */}
              {dropIndex === visibleCols.length && draggedItem && (
                <div className="h-0.5 bg-primary rounded-full mx-1 my-0.5" />
              )}
            </div>
          </div>
        </div>

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

        {/* Origin/Dest merge checkbox */}
        <div className="mt-3 border-t pt-3">
          <label className="flex items-start gap-2 text-xs cursor-pointer select-none">
            <Checkbox
              checked={merged}
              onCheckedChange={(checked) => setMerged(!!checked)}
              className="w-3.5 h-3.5 mt-0.5"
            />
            <div>
              <span className="font-medium">Merge Origin & Destination</span>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-accent text-[10px]">
                  <span className="font-semibold">TLV</span> → <span className="font-semibold">LAX</span>
                </span>
                <span className="text-[10px]">vs</span>
                <span className="inline-flex flex-col gap-0 px-1.5 py-0.5 rounded border bg-accent text-[10px] leading-tight">
                  <span><span className="font-semibold">Origin:</span> TLV</span>
                  <span><span className="font-semibold">Dest:</span> LAX</span>
                </span>
              </div>
            </div>
          </label>
        </div>

        <div className="flex justify-between mt-3">
          <button
            onClick={() => {
              const defaults = allColumns.map(c => c.id);
              setVisible(defaults);
              setActVis({ exceptions: true, containers: true, invoices: true, tags: true, remarks: true });
              setMerged(false);
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
