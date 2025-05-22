import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Leidos Upskilling Hub",
  description: "Manage your account settings and preferences",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
