"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { AnalyticsBody } from "@/components/admin/analytics-body"

export function AdminPageShell() {
  const [dateRange, setDateRange] = useState("30 Days")

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar activeRange={dateRange} onRangeChange={setDateRange} />
        <main className="flex-1 overflow-y-auto">
          <AnalyticsBody />
        </main>
      </div>
    </div>
  )
}