import type { Metadata } from "next"
import { ReceptionistPageShell } from "./receptionist-page-shell"

export const metadata: Metadata = {
  title: "Receptionist Dashboard — Clinic Management",
  description: "Front-desk operations console for clinic reception staff",
}

/**
 * Receptionist route — thin server component that delegates to a client shell
 * so modal state (patient registration, new appointment) can be managed interactively.
 */
export default function ReceptionistPage() {
  return <ReceptionistPageShell />
}