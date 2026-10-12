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

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-6 dark:border-[#374151] dark:bg-[#1F2937]">
      {/* Global patient search */}
      <div ref={ref} className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={t.common.search}
          aria-label={t.common.search}
          className="h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-8 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:placeholder:text-[#9CA3AF]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}

        {/* Results dropdown */}
        {showDropdown && (
          <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.06)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{t.common.noResults}</div>
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
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#059669]" aria-hidden />
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
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
            className="relative flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#6B7280] transition-colors hover:text-[#111827] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
            aria-label={t.common.notifications}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {(notificationCount ?? 0) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-[12px] border border-[#E5E7EB] bg-white shadow-lg dark:border-[#374151] dark:bg-[#1F2937]">
              <div className="border-b border-[#E5E7EB] px-4 py-2.5 dark:border-[#374151]">
                <p className="text-xs font-semibold text-[#111827] dark:text-[#F9FAFB]">
                  {t.common.notifications}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {!recentCalls || recentCalls.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    No recent notifications
                  </p>
                ) : (
                  recentCalls.map(({ appointment, patient }) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 text-left last:border-b-0 dark:border-[#374151]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0F766E] text-xs font-bold text-[#0F766E]">
                        {appointment.queue_number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                          {patient?.full_name ?? appointment.patient_id}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
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

        {/* Secondary + primary buttons */}
        <button
          type="button"
          onClick={onNewAppointment}
          className="flex h-9 items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-3 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
        >
          <CalendarPlus className="h-[18px] w-[18px] text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
          {t.receptionist.newAppointment}
        </button>
        <button
          type="button"
          onClick={onRegisterPatient}
          className="flex h-9 items-center gap-2 rounded-[8px] bg-[#0F766E] px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-[18px] w-[18px]" strokeWidth={1.5} />
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
      className="flex w-full items-center gap-3 border-b border-[#E5E7EB] px-3 py-2.5 text-left last:border-b-0 transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:hover:bg-[#374151]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
        {name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#111827] dark:text-[#F9FAFB]">
          {idx >= 0 ? (
            <>
              {name.slice(0, idx)}
              <span className="font-semibold text-[#0F766E]">
                {name.slice(idx, idx + query.length)}
              </span>
              {name.slice(idx + query.length)}
            </>
          ) : (
            name
          )}
        </p>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          {patient.phone} · {age} yrs · {patient.gender}
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-[#E5E7EB] px-2 py-0.5 text-[10px] text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
        {patient.blood_group ?? "—"}
      </span>
    </button>
  )
}