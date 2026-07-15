"use client"

import { useState } from "react"
import { DoctorSidebar } from "@/components/doctor/sidebar"
import type { DoctorView } from "@/components/doctor/sidebar"
import { QueueRail } from "@/components/doctor/queue-rail"
import { Workspace } from "@/components/doctor/workspace"
import { Users, CalendarDays } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"

export function DoctorPageShell() {
  const { t } = useT()
  const [activeView, setActiveView] = useState<DoctorView>("sidebar.doctor.myQueue")

  function renderContent() {
    switch (activeView) {
      case "sidebar.doctor.myQueue":
        return (
          <>
            {/* Left rail — 28%, independently scrollable */}
            <section className="h-full w-[28%] shrink-0 overflow-hidden bg-white dark:bg-[#1F2937]">
              <QueueRail />
            </section>

            {/* Thin vertical divider */}
            <div className="h-full w-px shrink-0 bg-[#E5E7EB] dark:bg-[#374151]" aria-hidden="true" />

            {/* Right workspace — 72% */}
            <section className="h-full min-w-0 flex-1">
              <Workspace />
            </section>
          </>
        )

      case "sidebar.doctor.overviewItem":
        return (
          <section className="flex h-full w-full flex-1 items-center justify-center">
            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F766E]/[0.08] mx-auto">
                {/*
                // @ts-ignore */}
                <Users className="h-7 w-7 text-[#0F766E]" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.overviewPlaceholder}
              </p>
              <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.overviewDesc}
              </p>
            </div>
          </section>
        )

      case "sidebar.doctor.patients":
        return (
          <section className="flex h-full w-full flex-1 items-center justify-center">
            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F766E]/[0.08] mx-auto">
                <Users className="h-7 w-7 text-[#0F766E]" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.patientsPlaceholder}
              </p>
              <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.patientsDesc}
              </p>
            </div>
          </section>
        )

      case "sidebar.doctor.schedule":
        return (
          <section className="flex h-full w-full flex-1 items-center justify-center">
            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F766E]/[0.08] mx-auto">
                <CalendarDays className="h-7 w-7 text-[#0F766E]" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.schedulePlaceholder}
              </p>
              <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.scheduleDesc}
              </p>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB] dark:bg-[#111827]">
      <DoctorSidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Split-screen: left rail + right workspace */}
      <main className="flex flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  )
}