'use client'

import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

export function TimerControls() {
  const { isRunning, startTimer, pauseTimer, resetTimer, skipTimer } = useTimer()

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={resetTimer} title="Reset (R)">
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button size="lg" onClick={isRunning ? pauseTimer : startTimer} className="w-32">
        {isRunning ? (
          <><Pause className="mr-2 h-4 w-4" />Pause</>
        ) : (
          <><Play className="mr-2 h-4 w-4" />Start</>
        )}
      </Button>

      <Button variant="outline" size="icon" onClick={skipTimer} title="Skip (S)">
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  )
}
