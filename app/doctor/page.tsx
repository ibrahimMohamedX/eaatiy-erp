import type { Metadata } from "next"
import { DoctorSidebar } from "@/components/doctor/sidebar"
import { QueueRail } from "@/components/doctor/queue-rail"
import { Workspace } from "@/components/doctor/workspace"

export const metadata: Metadata = {
  title: "Doctor Workspace — Clinic Management",
  description: "Clinical EHR workspace for managing patient consultations, prescriptions, and medical records",
}

export default function DoctorWorkspacePage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB]">
      <DoctorSidebar />

      {/* Split-screen: left queue rail + right workspace */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left rail — 28%, independently scrollable */}
        <section className="h-full w-[28%] shrink-0 overflow-hidden bg-white">
          <QueueRail />
        </section>

        {/* Thin vertical divider */}
        <div className="h-full w-px shrink-0 bg-[#E5E7EB]" aria-hidden="true" />

        {/* Right workspace — 72% */}
        <section className="h-full min-w-0 flex-1">
          <Workspace />
        </section>
      </main>
    </div>
  )
}
