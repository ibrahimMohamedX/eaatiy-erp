import type { Metadata } from "next"
import { DoctorPageShell } from "./doctor-page-shell"

export const metadata: Metadata = {
  title: "Doctor Workspace — Clinic Management",
  description: "Clinical EHR workspace for managing patient consultations, prescriptions, and medical records",
}

export default function DoctorWorkspacePage() {
  return <DoctorPageShell />
}
