'use client'

import { useTimer } from '@/lib/timer-context'

export function TimerRing() {
  const { mode, timeLeft, settings } = useTimer()

  const totalSeconds = mode === 'focus'
    ? settings.focusDuration * 60
    : mode === 'shortBreak'
    ? settings.shortBreakDuration * 60
    : settings.longBreakDuration * 60

  const progress = (totalSeconds - timeLeft) / totalSeconds
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const modeColors: Record<string, string> = {
    focus: 'text-red-500',
    shortBreak: 'text-green-500',
    longBreak: 'text-blue-500',
  }

  const modeLabels: Record<string, string> = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
        <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
        <circle
          cx="128" cy="128" r="120"
          stroke="currentColor" strokeWidth="8" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={modeColors[mode]}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-bold tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className={`text-sm font-medium ${modeColors[mode]}`}>
          {modeLabels[mode]}
        </span>
      </div>
    </div>
  )
}
