"use client"

// ============================================================================
// Super Admin: System State card — platform-wide operational/maintenance/lock
// ============================================================================
// One control for the whole company system. Switching to maintenance/locked
// denies every clinic action and login automatically within seconds
// (enforced in getTenantContext() with a 15s cache).
// ============================================================================

import { useEffect, useState } from "react"
import { Power, Wrench, Lock } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getSystemStateAction,
  setSystemStateAction,
} from "@/lib/actions/super-admin/set-system-state"

const STATE_TONE: Record<string, string> = {
  operational: "bg-ok/10 text-ok",
  maintenance: "bg-warn/10 text-warn",
  locked: "bg-err/10 text-err",
}

const STATE_DOT: Record<string, string> = {
  operational: "bg-ok",
  maintenance: "bg-warn",
  locked: "bg-err",
}

export function SystemStateCard({ onMutated }: { onMutated: () => void }) {
  const { t } = useT()
  const sa = t["super-admin"]

  const [state, setState] = useState<string>("operational")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getSystemStateAction().then((res) => {
      if (cancelled) return
      setLoading(false)
      if (res.success) {
        setState(res.data.state)
        setUpdatedAt(res.data.updatedAt)
      } else {
        setError(res.error)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSet(next: string) {
    if (next === "maintenance" && !window.confirm(sa.confirmMaintenance)) return
    if (next === "locked" && !window.confirm(sa.confirmLock)) return
    setBusy(true)
    setError(null)
    const res = await setSystemStateAction(next)
    setBusy(false)
    if (res.success) {
      setState(res.data.state)
      setUpdatedAt(res.data.updatedAt)
      onMutated()
    } else {
      setError(res.error)
    }
  }

  const buttons: Array<{ key: string; label: string; icon: typeof Power }> = [
    { key: "operational", label: sa.stateOperational, icon: Power },
    { key: "maintenance", label: sa.stateMaintenance, icon: Wrench },
    { key: "locked", label: sa.stateLocked, icon: Lock },
  ]

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="archai-eyebrow">{sa.systemStateTitle}</p>
          <p className="mt-1.5 max-w-lg text-xs text-muted-foreground">
            {sa.systemStateDesc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              STATE_TONE[state] ?? STATE_TONE.operational
            }`}
          >
            <span
              className={`size-2 rounded-full ${STATE_DOT[state] ?? STATE_DOT.operational} ${
                state !== "operational" ? "animate-pulse" : ""
              }`}
            />
            {loading
              ? "…"
              : state === "operational"
                ? sa.stateOperational
                : state === "maintenance"
                  ? sa.stateMaintenance
                  : state === "locked"
                    ? sa.stateLocked
                    : state}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {buttons.map(({ key, label, icon: Icon }) => {
          const active = state === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => void handleSet(key)}
              disabled={busy || loading || active}
              className={
                active
                  ? "inline-flex items-center gap-1.5 rounded-lg border border-arc bg-arc/10 px-3 py-1.5 text-xs font-semibold text-arc"
                  : "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground disabled:opacity-50"
              }
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
              {label}
            </button>
          )
        })}
        {updatedAt && (
          <span className="ms-1 font-mono text-[11px] text-mist ltr-in-rtl">
            {updatedAt.slice(0, 16).replace("T", " ")}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-err/10 px-3 py-2 text-xs font-medium text-err">
          {error}
        </div>
      )}
    </div>
  )
}
