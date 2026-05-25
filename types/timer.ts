export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export interface TimerSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  autoStartBreak: boolean
  autoStartFocus: boolean
  longBreakInterval: number
  soundEnabled: boolean
  soundVolume: number
}

export interface Task {
  id: string
  title: string
  completed: boolean
  pomodoros: number
  createdAt: string
  completedAt?: string
}

export interface PomodoroSession {
  id: string
  mode: TimerMode
  duration: number
  taskId?: string
  startedAt: string
  completedAt: string
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreak: false,
  autoStartFocus: false,
  longBreakInterval: 4,
  soundEnabled: true,
  soundVolume: 0.5,
}
