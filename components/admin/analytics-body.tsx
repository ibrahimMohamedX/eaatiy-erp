"use client"

import { useState } from "react"
import { OverviewTab } from "./overview-tab"
import { RevenueTab } from "./revenue-tab"
import { AppointmentsTab } from "./appointments-tab"
import { DoctorsTab } from "./doctors-tab"
import { AuditLog } from "./audit-log"

type TabKey = "overview" | "revenue" | "appointments" | "doctors" | "audit"

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "revenue", label: "Revenue" },
  { key: "appointments", label: "Appointments" },
  { key: "doctors", label: "Doctors Performance" },
  { key: "audit", label: "Audit Log" },
]

export function AnalyticsBody() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview")

  return (
    <div className="flex flex-col">
      {/* Underline-style tab row */}
      <div className="shrink-0 border-b border-[#E5E7EB] bg-white px-6">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const active = tab.key === activeTab
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 text-sm transition-colors ${
                  active
                    ? "font-medium text-[#111827]"
                    : "font-normal text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-[#0F766E]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active tab body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "doctors" && <DoctorsTab />}
        {activeTab === "audit" && <AuditLog />}
      </div>
    </div>
  )
}