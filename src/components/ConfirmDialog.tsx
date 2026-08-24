"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" renders the confirm button red and shows a warning icon (deletions, restores that overwrite). */
  variant?: "default" | "destructive";
};

type PendingRequest = ConfirmOptions & { resolve: (value: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

/**
 * App-wide replacement for window.confirm(): renders one modal at the root
 * and lets any client component `await confirm({...})` for a yes/no answer,
 * instead of the browser's unstyled native dialog.
 */
export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<PendingRequest | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setRequest({ ...options, resolve });
    });
  }, []);

  function settle(result: boolean) {
    request?.resolve(result);
    setRequest(null);
  }

  const destructive = request?.variant === "destructive";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={!!request} onOpenChange={(open) => !open && settle(false)}>
        <DialogContent className="max-w-sm">
          {request && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  {destructive && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <DialogTitle>{request.title}</DialogTitle>
                    {request.description && (
                      <DialogDescription className="mt-1">{request.description}</DialogDescription>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => settle(false)} autoFocus>
                  {request.cancelLabel ?? "Cancel"}
                </Button>
                <Button variant={destructive ? "destructive" : "default"} onClick={() => settle(true)}>
                  {request.confirmLabel ?? "Confirm"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  return ctx;
}
