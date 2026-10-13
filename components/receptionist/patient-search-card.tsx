"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { deriveAge } from "@/lib/types"
import type { Patient } from "@/lib/types"
import { useT } from "@/lib/i18n/use-t"
import { searchPatients } from "@/lib/actions/receptionist/search-patients"

/**
 * Patient search card panel — inline search with dropdown results.
 * Calls the server action which queries the tenant database via header context.
 */
export function PatientSearchCard() {
  const { t } = useT()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const res = await searchPatients(q)
    if (res.success) {
      setResults(res.data)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{t.receptionist.patientSearch}</h2>

      {/* Search input */}
      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-mist"
          strokeWidth={1.75}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t.common.searchPatientPlaceholder}
          className="h-10 w-full rounded-lg border border-line bg-background ps-10 pe-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none"
        />
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="mt-2 animate-archai-fade-in overflow-hidden rounded-lg border border-line bg-popover">
          {results.map((patient) => {
            const age = deriveAge(patient.date_of_birth)
            const initials = patient.full_name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .toUpperCase()
            const idx = patient.full_name.toLowerCase().indexOf(query.toLowerCase())

            return (
              <button
                key={patient.id}
                type="button"
                className="flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-start transition-colors duration-200 last:border-b-0 hover:bg-accent"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-steel text-[11px] font-semibold text-silver">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {idx >= 0 ? (
                      <>
                        {patient.full_name.slice(0, idx)}
                        <span className="font-semibold text-arc">
                          {patient.full_name.slice(idx, idx + query.length)}
                        </span>
                        {patient.full_name.slice(idx + query.length)}
                      </>
                    ) : (
                      patient.full_name
                    )}
                  </p>
                  <p className="font-mono text-xs text-mist ltr-in-rtl">
                    {patient.phone} · {age} yrs
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty state when no query */}
      {query.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t.common.searchHint}
        </p>
      )}

      {/* No results */}
      {query.length >= 2 && results.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t.common.noMatch.replace("{query}", query)}
        </p>
      )}
    </div>
  )
}
