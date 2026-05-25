'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TimerRing } from './timer-ring'
import { TimerControls } from './timer-controls'
import { ModeSelector } from './mode-selector'
import { useTimer } from '@/lib/timer-context'

export function TimerSection() {
  const { pomodorosCompleted, settings } = useTimer()

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-8">
        <ModeSelector />
        <TimerRing />
        <TimerControls />
        <div className="text-sm text-muted-foreground">
          {pomodorosCompleted} / {settings.longBreakInterval} pomodoros
        </div>
      </CardContent>
    </Card>
  )
}
