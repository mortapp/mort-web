import './globals.css'
import './mort-2-theme.css'

const themeScript = "try{var t=localStorage.getItem('mort-theme');document.documentElement.dataset.theme=(t==='dark'?'dark':'light')}catch(e){document.documentElement.dataset.theme='light'}"

export const metadata = {
  title: 'MORT — Earn nearby. Move smart.',
  description: 'A teen-safe local work marketplace. Discover nearby work, manage jobs, and stay connected through privacy-first safety tools.',
  icons: { icon: '/mort-mark.svg' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  )
}
