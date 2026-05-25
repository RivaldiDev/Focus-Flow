import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TimerProvider } from "@/lib/timer-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Focus Flow - Pomodoro Timer",
  description: "A minimal Pomodoro timer with task management and productivity analytics.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TimerProvider>{children}</TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
