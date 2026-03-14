"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-3 text-sm text-slate-400">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white"
            onClick={onConfirm}
            type="button"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

