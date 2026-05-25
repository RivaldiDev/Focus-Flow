'use client'

import { StatsCards } from './stats-cards'
import { WeeklyChart } from './weekly-chart'
import { TaskBreakdown } from './task-breakdown'

export function StatsSection() {
  return (
    <div className="space-y-4">
      <StatsCards />
      <WeeklyChart />
      <TaskBreakdown />
    </div>
  )
}
