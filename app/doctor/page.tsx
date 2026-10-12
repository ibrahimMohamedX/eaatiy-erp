import type { Metadata } from "next"
import { DoctorPageShell } from "./doctor-page-shell"
import { getMyQueue } from "@/lib/actions/doctor/get-my-queue"

export const metadata: Metadata = {
  title: "Doctor Workspace — Clinic Management",
  description: "Clinical EHR workspace for managing patient consultations, prescriptions, and medical records",
}

export default async function DoctorWorkspacePage() {
  const result = await getMyQueue()

  if (!result.success) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FAFB] dark:bg-[#111827]">
        <div className="text-center">
          <p className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            Unable to load queue
          </p>
          <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{result.error}</p>
        </div>
      </div>
    )
  }

  return <DoctorPageShell initialData={result.data} />
}