import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AVAILABLE_TAGS } from "@/data/mockShipments";
import { X, Plus } from "lucide-react";

interface TagsDialogProps {
  tags: string[];
  houseBill: string;
  open: boolean;
  onClose: () => void;
  onSave: (tags: string[]) => void;
}

const TagsDialog = ({ tags, houseBill, open, onClose, onSave }: TagsDialogProps) => {
  const [selected, setSelected] = useState<string[]>(tags);

  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const remove = (tag: string) => setSelected((prev) => prev.filter((t) => t !== tag));

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-base font-semibold">Tags — {houseBill}</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5">
          {/* Selected tags */}
          {selected.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">Selected</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                    <button onClick={() => remove(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available tags */}
          <p className="text-xs text-muted-foreground font-medium mb-2">Available Tags</p>
          <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
            {AVAILABLE_TAGS.filter((t) => !selected.includes(t)).map((tag) => (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Plus className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-4 pt-3 border-t">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagsDialog;
