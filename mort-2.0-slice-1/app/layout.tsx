// MORT — a calm night with light in it. The voyage atmosphere sits behind every
// route (restrained inside /app); everything else inherits the design-system tokens.
import './globals.css'
import './mort-2-theme.css'
import { MortAtmosphere } from '@/components/mort-atmosphere'
import { PetCompanion } from '@/components/pet-companion'

const themeScript = "try{var t=localStorage.getItem('mort-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}"

export const metadata = {
  title: 'MORT — Earn nearby. Move smart.',
  description: 'MORT is teen-safe local opportunity infrastructure: teens 13–17 find real nearby work, adults and businesses post legitimate local jobs, and guardians, moderation and admins keep it safe.',
  icons: { icon: '/mort-mark.svg' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <MortAtmosphere />
        {children}
        <PetCompanion />
      </body>
    </html>
  )
}
