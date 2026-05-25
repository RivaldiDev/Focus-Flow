'use client'

import { useTimer } from '@/lib/timer-context'
import { TimerMode } from '@/types/timer'
import { Button } from '@/components/ui/button'

export function ModeSelector() {
  const { mode, setMode } = useTimer()

  const modes: { value: TimerMode; label: string; color: string }[] = [
    { value: 'focus', label: 'Focus', color: 'bg-red-500 hover:bg-red-600' },
    { value: 'shortBreak', label: 'Short Break', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'longBreak', label: 'Long Break', color: 'bg-blue-500 hover:bg-blue-600' },
  ]

  return (
    <div className="flex gap-2">
      {modes.map((m) => (
        <Button
          key={m.value}
          variant={mode === m.value ? 'default' : 'outline'}
          onClick={() => setMode(m.value)}
          className={mode === m.value ? m.color : ''}
        >
          {m.label}
        </Button>
      ))}
    </div>
  )
}
