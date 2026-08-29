// Calibrated Liquid Glass: metadata and the app icon reinforce a single, legible refractive brand system.
import './globals.css'

export const metadata = {
  title: 'MORT — Teen-safe local hustles',
  description: 'MORT connects teens with safe local jobs, guardian tools, adult posting, moderation, and admin review.',
  icons: { icon: '/manus-storage/mort-prism-mark_5e06d745.png' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
