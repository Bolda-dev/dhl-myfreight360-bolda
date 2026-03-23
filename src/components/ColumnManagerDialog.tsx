import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, ArrowRight, ArrowLeft } from "lucide-react";

interface ColumnInfo {
  id: string;
  label: string;
}

interface ColumnManagerDialogProps {
  open: boolean;
  onClose: () => void;
  allColumns: ColumnInfo[];
  visibleColumnIds: string[];
  onSave: (visibleIds: string[]) => void;
}

const ColumnManagerDialog = ({ open, onClose, allColumns, visibleColumnIds, onSave }: ColumnManagerDialogProps) => {
  const [visible, setVisible] = useState<string[]>(visibleColumnIds);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const hidden = allColumns.filter((c) => !visible.includes(c.id));
  const visibleCols = visible.map((id) => allColumns.find((c) => c.id === id)!).filter(Boolean);

  const moveToVisible = (id: string) => setVisible((prev) => [...prev, id]);
  const moveToHidden = (id: string) => setVisible((prev) => prev.filter((v) => v !== id));

  const handleDragStart = (id: string) => setDraggedItem(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverItem(id); };
  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;
    setVisible((prev) => {
      const fromIdx = prev.indexOf(draggedItem);
      const toIdx = prev.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDraggedItem(null);
    setDragOverItem(null);
  };
  const handleDragEnd = () => { setDraggedItem(null); setDragOverItem(null); };

  const handleSave = () => { onSave(visible); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Hidden columns */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Available</h4>
            <div className="border rounded-md p-1.5 min-h-[200px] max-h-[300px] overflow-auto space-y-0.5">
              {hidden.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center">All columns visible</p>}
              {hidden.map((col) => (
                <div key={col.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-accent text-xs group">
                  <span>{col.label}</span>
                  <button onClick={() => moveToVisible(col.id)} className="opacity-0 group-hover:opacity-100 text-primary hover:text-primary/80">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Visible columns */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Displayed</h4>
            <div className="border rounded-md p-1.5 min-h-[200px] max-h-[300px] overflow-auto space-y-0.5">
              {visibleCols.map((col) => (
                <div
                  key={col.id}
                  draggable
                  onDragStart={() => handleDragStart(col.id)}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDrop={() => handleDrop(col.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs group cursor-grab active:cursor-grabbing ${
                    dragOverItem === col.id ? "bg-accent" : "hover:bg-accent"
                  } ${draggedItem === col.id ? "opacity-40" : ""}`}
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="flex-1">{col.label}</span>
                  <button onClick={() => moveToHidden(col.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded border text-muted-foreground hover:bg-accent">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90">Apply</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnManagerDialog;
