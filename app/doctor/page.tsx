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
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-err/30 bg-card p-8 text-center">
          <p className="font-display text-lg font-bold text-foreground">
            Unable to load queue
          </p>
          <div className="mt-3 flex items-center justify-center gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err">
            <span className="size-2 shrink-0 rounded-full bg-err" aria-hidden />
            <span>{result.error}</span>
          </div>
        </div>
      </div>
    )
  }

  return <DoctorPageShell initialData={result.data} />
}