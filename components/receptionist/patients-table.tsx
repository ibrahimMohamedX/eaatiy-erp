"use client"

import { useT } from "@/lib/i18n/use-t"
import { deriveAge } from "@/lib/types"
import type { Patient } from "@/lib/types"

type Props = {
  patients: Patient[]
}

/**
 * Patients Table — full clinic roster (listPatients via the page shell data).
 * Archai table recipe: mono headers, line-divided rows, tinted pills.
 */
export function PatientsTable({ patients }: Props) {
  const { t } = useT()
  const r = t.receptionist ?? {}

  return (
    <div className="rounded-2xl border border-line bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-foreground">
          {r.allPatients ?? "All Patients"}
        </h2>
        <span className="rounded-full bg-steel/60 px-2.5 py-0.5 font-mono text-xs text-silver ltr-in-rtl">
          {patients.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-[15px]">
          <thead>
            <tr className="border-b border-line text-start">
              <th className="px-5 py-2.5 text-start font-mono text-[11px] uppercase text-mist">{r.fullName ?? "Full Name"}</th>
              <th className="px-5 py-2.5 text-start font-mono text-[11px] uppercase text-mist">{r.age ?? "Age"}</th>
              <th className="px-5 py-2.5 text-start font-mono text-[11px] uppercase text-mist">{r.gender ?? "Gender"}</th>
              <th className="px-5 py-2.5 text-start font-mono text-[11px] uppercase text-mist">{r.phone ?? "Phone"}</th>
              <th className="px-5 py-2.5 text-start font-mono text-[11px] uppercase text-mist">{r.bloodGroup ?? "Blood Group"}</th>
              <th className="px-5 py-2.5 text-start font-mono text-[11px] uppercase text-mist">{r.allergies ?? "Allergies"}</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  {t.common.noResults ?? "No results"}
                </td>
              </tr>
            ) : (
              patients.map((p) => {
                const initials = p.full_name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <tr key={p.id} className="border-b border-line transition-colors duration-200 last:border-b-0 hover:bg-accent">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-steel text-[11px] font-semibold text-silver">
                          {initials}
                        </span>
                        <span className="font-medium text-foreground">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-silver ltr-in-rtl">
                      {deriveAge(p.date_of_birth)}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{p.gender}</td>
                    <td className="px-5 py-3 font-mono text-xs text-mist ltr-in-rtl">{p.phone}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-mist ltr-in-rtl">
                        {p.blood_group ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {p.allergies || "—"}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
