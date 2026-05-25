'use client'

import { useTimer } from '@/lib/timer-context'
import { Card, CardContent } from '@/components/ui/card'
import { Timer, CheckCircle2, Flame, TrendingUp } from 'lucide-react'

export function StatsCards() {
  const { sessions, pomodorosCompleted } = useTimer()

  const focusSessions = sessions.filter(s => s.mode === 'focus')
  const totalMinutes = focusSessions.reduce((sum, s) => sum + s.duration / 60, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  const today = new Date().toDateString()
  const sessionDates = Array.from(new Set(focusSessions.map(s => new Date(s.completedAt).toDateString())))
  const hasToday = sessionDates.includes(today)

  let streak = hasToday ? 1 : 0
  if (hasToday) {
    const sortedDates = sessionDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    for (let i = 1; i < sortedDates.length; i++) {
      const diffDays = (new Date(sortedDates[i - 1]).getTime() - new Date(sortedDates[i]).getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays === 1) streak++
      else break
    }
  }

  const stats = [
    { title: 'Focus Time', value: `${hours}h ${minutes}m`, icon: Timer, color: 'text-red-500' },
    { title: 'Pomodoros', value: focusSessions.length, icon: CheckCircle2, color: 'text-green-500' },
    { title: 'Streak', value: `${streak} days`, icon: Flame, color: 'text-orange-500' },
    { title: 'Today', value: pomodorosCompleted, icon: TrendingUp, color: 'text-blue-500' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
