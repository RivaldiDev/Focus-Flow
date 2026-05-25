'use client'

import { useEffect } from 'react'
import { useTimer } from './timer-context'

export function useKeyboardShortcuts() {
  const { startTimer, pauseTimer, isRunning, resetTimer, skipTimer } = useTimer()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          isRunning ? pauseTimer() : startTimer()
          break
        case 'r':
        case 'R':
          resetTimer()
          break
        case 's':
        case 'S':
          skipTimer()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, startTimer, pauseTimer, resetTimer, skipTimer])
}
