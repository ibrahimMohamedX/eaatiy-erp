"use client"

// ============================================================================
// Admin Manage — shared UI primitives for the full-CRUD panels
// ============================================================================
// Small building blocks shared by the Staff / Shifts / Salaries / Expenses /
// Payment Policy / Supervisors panels so they all speak the same Archai
// visual language without duplicating markup.
// ============================================================================

import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"

// ---------------------------------------------------------------------------
// Panel header — eyebrow title + subtitle + the screen's single Arc button
// ---------------------------------------------------------------------------

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal — centered card overlay for create/edit forms
// ---------------------------------------------------------------------------

export function PanelModal({
  title,
  open,
  onClose,
  children,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  const { t } = useT()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t.admin.manage.close}
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.admin.manage.close}
            className="flex size-8 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Form field primitives
// ---------------------------------------------------------------------------

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase text-mist">
      {children}
    </label>
  )
}

const INPUT_CLASS =
  "w-full rounded-lg border border-line bg-steel/30 px-3 py-2 text-sm text-foreground placeholder:text-mist outline-none transition-colors duration-200 focus:border-arc dark:bg-ink/40"

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={INPUT_CLASS} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={INPUT_CLASS} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={INPUT_CLASS} rows={2} />
}

// ---------------------------------------------------------------------------
// Buttons — the panel's primary action is the ONE Arc button on the screen
// ---------------------------------------------------------------------------

export function ArcButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-lg bg-arc px-4 py-2 text-sm font-semibold text-carbon transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  )
}

export function DangerButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-err transition-colors duration-200 hover:bg-err/10 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Status pill — same tinted-pill language as the appointments table
// ---------------------------------------------------------------------------

export function StatusPill({ tone, children }: { tone: "ok" | "warn" | "err" | "arc" | "muted"; children: ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-ok/10 text-ok"
      : tone === "warn"
        ? "bg-warn/10 text-warn"
        : tone === "err"
          ? "bg-err/10 text-err"
          : tone === "arc"
            ? "bg-arc/10 text-arc"
            : "bg-steel text-silver"
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Toast — inline success/error feedback line under the header
// ---------------------------------------------------------------------------

export function FeedbackLine({ message, tone }: { message: string; tone: "ok" | "err" }) {
  if (!message) return null
  return (
    <div className="px-5 pt-3">
      <div
        className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium ${
          tone === "ok" ? "bg-ok/10 text-ok" : "bg-err/10 text-err"
        }`}
      >
        <span className={`size-2 shrink-0 rounded-full ${tone === "ok" ? "bg-ok" : "bg-err"}`} />
        {message}
      </div>
    </div>
  )
}
