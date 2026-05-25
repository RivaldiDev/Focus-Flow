'use client'

import { useTimer } from '@/lib/timer-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export function TaskBreakdown() {
  const { sessions, tasks } = useTimer()

  const focusSessions = sessions.filter(s => s.mode === 'focus')

  const taskCounts: Record<string, number> = {}
  focusSessions.forEach(s => {
    const taskId = s.taskId || 'untitled'
    taskCounts[taskId] = (taskCounts[taskId] || 0) + 1
  })

  const data = Object.entries(taskCounts)
    .map(([taskId, count]) => ({
      name: taskId === 'untitled' ? 'No task' : tasks.find(t => t.id === taskId)?.title || 'Deleted',
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">No data yet.</p></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
              {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="flex-1 truncate">{item.name}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
