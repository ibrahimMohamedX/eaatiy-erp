"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { searchPatients } from "@/lib/mock-data"
import { deriveAge } from "@/lib/types"

/**
 * Patient search card panel — inline search with dropdown results.
 * Shares the same searchPatients helper as the top bar.
 */
export function PatientSearchCard() {
  const [query, setQuery] = useState("")

  const results = query.length >= 2 ? searchPatients(query) : []

  return (
    <div className="flex flex-col rounded-[12px] border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-sm font-semibold text-[#111827]">Patient Search</h2>

      {/* Search input */}
      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6B7280]"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone number…"
          className="h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
        />
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-[8px] border border-[#E5E7EB]">
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
                className="flex w-full items-center gap-3 border-b border-[#E5E7EB] px-3 py-2.5 text-left last:border-b-0 transition-colors hover:bg-[#F9FAFB]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280]">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#111827]">
                    {idx >= 0 ? (
                      <>
                        {patient.full_name.slice(0, idx)}
                        <span className="font-semibold text-[#0F766E]">
                          {patient.full_name.slice(idx, idx + query.length)}
                        </span>
                        {patient.full_name.slice(idx + query.length)}
                      </>
                    ) : (
                      patient.full_name
                    )}
                  </p>
                  <p className="text-xs text-[#6B7280]">
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
        <p className="mt-3 text-xs text-[#6B7280]">
          Type at least 2 characters to search the patient roster.
        </p>
      )}

      {/* No results */}
      {query.length >= 2 && results.length === 0 && (
        <p className="mt-3 text-xs text-[#6B7280]">
          No patients match &ldquo;{query}&rdquo;. Try a different name or phone number.
        </p>
      )}
    </div>
  )
}