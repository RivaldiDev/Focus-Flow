'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { TimerMode, TimerSettings, Task, PomodoroSession, DEFAULT_SETTINGS } from '@/types/timer'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage'
import { playSound } from './sounds'

interface TimerContextType {
  mode: TimerMode
  timeLeft: number
  isRunning: boolean
  pomodorosCompleted: number
  settings: TimerSettings
  tasks: Task[]
  activeTaskId: string | null
  sessions: PomodoroSession[]
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipTimer: () => void
  setMode: (mode: TimerMode) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  setActiveTask: (id: string | null) => void
}

const TimerContext = createContext<TimerContextType | null>(null)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSettings(getStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS))
    setTasks(getStorageItem(STORAGE_KEYS.TASKS, []))
    setSessions(getStorageItem(STORAGE_KEYS.SESSIONS, []))
  }, [])

  useEffect(() => {
    if (mounted) setStorageItem(STORAGE_KEYS.SETTINGS, settings)
  }, [settings, mounted])

  useEffect(() => {
    if (mounted) setStorageItem(STORAGE_KEYS.TASKS, tasks)
  }, [tasks, mounted])

  useEffect(() => {
    if (mounted) setStorageItem(STORAGE_KEYS.SESSIONS, sessions)
  }, [sessions, mounted])

  const completeSession = useCallback(() => {
    if (startTimeRef.current) {
      const session: PomodoroSession = {
        id: Date.now().toString(),
        mode,
        duration: mode === 'focus'
          ? settings.focusDuration * 60
          : mode === 'shortBreak'
          ? settings.shortBreakDuration * 60
          : settings.longBreakDuration * 60,
        taskId: activeTaskId || undefined,
        startedAt: startTimeRef.current.toISOString(),
        completedAt: new Date().toISOString(),
      }
      setSessions(prev => [...prev, session])
    }

    if (mode === 'focus') {
      const newCount = pomodorosCompleted + 1
      setPomodorosCompleted(newCount)

      if (activeTaskId) {
        setTasks(prev => prev.map(t =>
          t.id === activeTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t
        ))
      }

      if (settings.soundEnabled) playSound('focusEnd', settings.soundVolume)

      if (newCount % settings.longBreakInterval === 0) {
        setMode('longBreak')
        setTimeLeft(settings.longBreakDuration * 60)
      } else {
        setMode('shortBreak')
        setTimeLeft(settings.shortBreakDuration * 60)
      }

      if (settings.autoStartBreak) {
        startTimeRef.current = new Date()
        setIsRunning(true)
      } else {
        setIsRunning(false)
      }
    } else {
      if (settings.soundEnabled) playSound('breakEnd', settings.soundVolume)
      setMode('focus')
      setTimeLeft(settings.focusDuration * 60)

      if (settings.autoStartFocus) {
        startTimeRef.current = new Date()
        setIsRunning(true)
      } else {
        setIsRunning(false)
      }
    }
  }, [mode, settings, pomodorosCompleted, activeTaskId])

  const startTimer = useCallback(() => {
    startTimeRef.current = new Date()
    setIsRunning(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    const duration = mode === 'focus'
      ? settings.focusDuration * 60
      : mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60
    setTimeLeft(duration)
  }, [mode, settings])

  const skipTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    completeSession()
  }, [completeSession])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, completeSession])

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const addTask = useCallback((title: string) => {
    const task: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      pomodoros: 0,
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [...prev, task])
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
        : t
    ))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (activeTaskId === id) setActiveTaskId(null)
  }, [activeTaskId])

  const setActiveTask = useCallback((id: string | null) => {
    setActiveTaskId(id)
  }, [])

  return (
    <TimerContext.Provider value={{
      mode, timeLeft, isRunning, pomodorosCompleted,
      settings, tasks, activeTaskId, sessions,
      startTimer, pauseTimer, resetTimer, skipTimer,
      setMode, updateSettings, addTask, toggleTask, deleteTask, setActiveTask,
    }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) throw new Error('useTimer must be used within a TimerProvider')
  return context
}
