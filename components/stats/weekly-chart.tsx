'use client'

import { useTimer } from '@/lib/timer-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function WeeklyChart() {
  const { sessions } = useTimer()

  const focusSessions = sessions.filter(s => s.mode === 'focus')

  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toISOString().split('T')[0])
  }

  const data = days.map(day => ({
    date: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
    pomodoros: focusSessions.filter(s => s.completedAt.startsWith(day)).length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="pomodoros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
