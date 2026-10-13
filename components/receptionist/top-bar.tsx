"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, CalendarPlus, Search, UserPlus, X } from "lucide-react"
import { deriveAge } from "@/lib/types"
import type { Patient, Appointment } from "@/lib/types"
import { formatTime } from "@/lib/format-time"
import { useT } from "@/lib/i18n/use-t"
import { searchPatients } from "@/lib/actions/receptionist/search-patients"

export interface RecentCall {
  appointment: Appointment
  patient: Patient | undefined
}

type Props = {
  onNewAppointment?: () => void
  onRegisterPatient?: () => void
  /** Recent called patients to show in notification dropdown */
  recentCalls?: RecentCall[]
  /** Number of new notifications since last dismissal */
  notificationCount?: number
}

/**
 * Top bar with global fuzzy patient search, notification bell,
 * New Appointment button, and Register New Patient button.
 */
export function TopBar({
  onNewAppointment,
  onRegisterPatient,
  recentCalls,
  notificationCount,
}: Props) {
  const { t } = useT()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<Patient[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  const showDropdown = focused && query.length >= 2

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    searchPatients(query).then((res) => {
      if (res.success) setResults(res.data)
    })
  }, [query])

  // Close notification bell on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-card/60 px-6 backdrop-blur-sm">
      {/* Global patient search */}
      <div ref={ref} className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-mist"
          strokeWidth={1.75}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={t.common.search}
          aria-label={t.common.search}
          className="h-10 w-full rounded-lg border border-line bg-background ps-10 pe-8 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute end-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-mist transition-colors hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        )}

        {/* Results dropdown */}
        {showDropdown && (
          <div className="absolute start-0 top-full z-30 mt-1.5 w-full animate-archai-fade-in overflow-hidden rounded-lg border border-line bg-popover shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t.common.noResults}</div>
            ) : (
              results.map((patient) => (
                <SearchResult key={patient.id} patient={patient} query={query} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-4">
        {/* Live status dot + date/time */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inset-0 animate-archai-pulse rounded-full bg-ok/40" />
            <span className="relative size-2 rounded-full bg-ok" />
          </span>
          <span className="font-mono text-xs text-mist">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            ·{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Notification bell with dropdown */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((p) => !p)}
            className="relative flex size-9 items-center justify-center rounded-lg border border-line text-mist transition-colors duration-200 hover:border-mist hover:text-foreground"
            aria-label={t.common.notifications}
          >
            <Bell className="size-[18px]" strokeWidth={1.75} />
            {(notificationCount ?? 0) > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-err px-1 font-mono text-[10px] font-bold text-[#12181D]">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute end-0 top-full z-30 mt-2 w-72 animate-archai-fade-up overflow-hidden rounded-xl border border-line bg-popover shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
              <div className="border-b border-line px-4 py-2.5">
                <p className="archai-eyebrow !text-mist">{t.common.notifications}</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {!recentCalls || recentCalls.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-mist">
                    No recent notifications
                  </p>
                ) : (
                  recentCalls.map(({ appointment, patient }) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-3 border-b border-line px-4 py-3 text-start last:border-b-0"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-arc/60 font-mono text-xs font-bold text-arc">
                        {appointment.queue_number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {patient?.full_name ?? appointment.patient_id}
                        </p>
                        <p className="font-mono text-xs text-mist">
                          Called · {formatTime(appointment.last_called_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Secondary + the single Arc action of this screen */}
        <button
          type="button"
          onClick={onNewAppointment}
          className="flex h-9 items-center gap-2 rounded-lg border border-line px-3.5 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
        >
          <CalendarPlus className="size-[18px] text-mist" strokeWidth={1.75} />
          {t.receptionist.newAppointment}
        </button>
        <button
          type="button"
          onClick={onRegisterPatient}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/85 active:translate-y-px"
        >
          <UserPlus className="size-[18px]" strokeWidth={1.75} />
          {t.receptionist.registerNewPatient}
        </button>
      </div>
    </header>
  )
}

/** Single fuzzy search result row */
function SearchResult({ patient, query }: { patient: Patient; query: string }) {
  const age = deriveAge(patient.date_of_birth)
  const name = patient.full_name
  const q = query.toLowerCase()
  const idx = name.toLowerCase().indexOf(q)

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-start transition-colors duration-200 last:border-b-0 hover:bg-accent"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-steel text-[11px] font-semibold text-silver">
        {name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">
          {idx >= 0 ? (
            <>
              {name.slice(0, idx)}
              <span className="font-semibold text-arc">
                {name.slice(idx, idx + query.length)}
              </span>
              {name.slice(idx + query.length)}
            </>
          ) : (
            name
          )}
        </p>
        <p className="font-mono text-xs text-mist ltr-in-rtl">
          {patient.phone} · {age} yrs · {patient.gender}
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-mist">
        {patient.blood_group ?? "—"}
      </span>
    </button>
  )
}
