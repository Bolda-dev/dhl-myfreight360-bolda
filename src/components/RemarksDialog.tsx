import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Remark } from "@/data/mockShipments";
import { Send, User } from "lucide-react";

interface RemarksDialogProps {
  remarks: Remark[];
  houseBill: string;
  open: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
}

const RemarksDialog = ({ remarks, houseBill, open, onClose, onAdd }: RemarksDialogProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-base font-semibold">Remarks — {houseBill}</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-4">
          {/* Remarks log */}
          <div className="max-h-[300px] overflow-y-auto space-y-3 mb-4">
            {remarks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No remarks yet</p>
            )}
            {remarks.map((r) => (
              <div key={r.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{r.author}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{r.date}</span>
                </div>
                <p className="text-sm text-foreground pl-7">{r.text}</p>
              </div>
            ))}
          </div>

          {/* New remark input */}
          <div className="flex gap-2 border-t pt-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Add a remark..."
              className="flex-1 px-3 py-1.5 text-sm border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemarksDialog;
