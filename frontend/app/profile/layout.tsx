import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Leidos Upskilling Hub",
  description: "Manage your profile settings and information",
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
