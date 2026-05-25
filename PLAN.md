# Focus Flow Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a Pomodoro timer with task management, session tracking, and productivity analytics.

**Architecture:** Next.js 14 app router with React Context for timer state, localStorage for persistence, shadcn/ui + Aceternity UI for components, Recharts for analytics.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Aceternity UI, Recharts, Lucide React

---

## Phase 1: Project Setup

### Task 1: Initialize Next.js Project

**Objective:** Create Next.js 14 app with TypeScript and Tailwind CSS

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`

**Step 1: Create project structure**

```bash
cd /home/rival/Ngoding/Pomodoro
npx create-next-app@latest . --typescript --tailwind --app --no-eslint --no-src-dir --import-alias "@/*" --use-npm
```

**Step 2: Install dependencies**

```bash
npm install recharts framer-motion lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-progress @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-switch @radix-ui/react-slider next-themes tailwindcss-animate
```

**Step 3: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project"
```

---

### Task 2: Configure shadcn/ui and Theme

**Objective:** Set up shadcn/ui components and dark mode

**Files:**
- Create: `components.json`, `lib/utils.ts`
- Create: `components/ui/` (card, button, input, tabs, progress, badge, dialog, switch, slider)
- Create: `components/theme-provider.tsx`, `components/mode-toggle.tsx`
- Modify: `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`

**Step 1: Initialize shadcn**

```bash
npx shadcn@latest init
```

**Step 2: Add components**

```bash
npx shadcn@latest add card button input tabs progress badge dialog switch slider dropdown-menu
```

**Step 3: Set up theme provider**

Create `components/theme-provider.tsx` with next-themes ThemeProvider.

**Step 4: Update layout**

Wrap app with ThemeProvider in `app/layout.tsx`.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui and theme support"
```

---

## Phase 2: Types and State Management

### Task 3: Define TypeScript Types

**Objective:** Create type definitions for timer, tasks, and sessions

**Files:**
- Create: `types/timer.ts`

**Step 1: Create types**

```typescript
// types/timer.ts
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export interface TimerSettings {
  focusDuration: number      // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number  // minutes
  autoStartBreak: boolean
  autoStartFocus: boolean
  longBreakInterval: number  // pomodoros before long break
  soundEnabled: boolean
  soundVolume: number        // 0-1
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
  duration: number      // seconds
  taskId?: string
  startedAt: string
  completedAt: string
}

export interface DailyStats {
  date: string
  pomodoros: number
  focusMinutes: number
  tasks: number
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
```

**Step 2: Commit**

```bash
git add types/timer.ts
git commit -m "feat: add TypeScript types for timer, tasks, and sessions"
```

---

### Task 4: Create Storage Utilities

**Objective:** localStorage helpers for persisting state

**Files:**
- Create: `lib/storage.ts`

**Step 1: Create storage module**

```typescript
// lib/storage.ts
const STORAGE_KEYS = {
  SETTINGS: 'focus-flow-settings',
  TASKS: 'focus-flow-tasks',
  SESSIONS: 'focus-flow-sessions',
  STATS: 'focus-flow-stats',
} as const

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export { STORAGE_KEYS }
```

**Step 2: Commit**

```bash
git add lib/storage.ts
git commit -m "feat: add localStorage utilities"
```

---

### Task 5: Create Sound Utilities

**Objective:** Audio notification helpers

**Files:**
- Create: `lib/sounds.ts`
- Create: `public/sounds/` (add notification sound files)

**Step 1: Create sounds module**

```typescript
// lib/sounds.ts
const SOUNDS = {
  focusEnd: '/sounds/focus-end.mp3',
  breakEnd: '/sounds/break-end.mp3',
  click: '/sounds/click.mp3',
} as const

export function playSound(sound: keyof typeof SOUNDS, volume: number = 0.5): void {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(SOUNDS[sound])
    audio.volume = volume
    audio.play().catch(console.error)
  } catch (error) {
    console.error('Failed to play sound:', error)
  }
}

export { SOUNDS }
```

**Step 2: Add sound files**

Download or create simple notification sounds and place in `public/sounds/`.

**Step 3: Commit**

```bash
git add lib/sounds.ts public/sounds/
git commit -m "feat: add sound notification utilities"
```

---

### Task 6: Create Timer Context

**Objective:** React Context for timer state management

**Files:**
- Create: `lib/timer-context.tsx`

**Step 1: Create timer context**

```typescript
// lib/timer-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { TimerMode, TimerSettings, Task, PomodoroSession, DEFAULT_SETTINGS } from '@/types/timer'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage'
import { playSound } from './sounds'

interface TimerContextType {
  // Timer state
  mode: TimerMode
  timeLeft: number      // seconds
  isRunning: boolean
  pomodorosCompleted: number
  
  // Settings
  settings: TimerSettings
  
  // Tasks
  tasks: Task[]
  activeTaskId: string | null
  
  // Sessions
  sessions: PomodoroSession[]
  
  // Actions
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

  // Load state from localStorage
  useEffect(() => {
    setSettings(getStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS))
    setTasks(getStorageItem(STORAGE_KEYS.TASKS, []))
    setSessions(getStorageItem(STORAGE_KEYS.SESSIONS, []))
  }, [])

  // Save state to localStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SETTINGS, settings)
  }, [settings])

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.TASKS, tasks)
  }, [tasks])

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SESSIONS, sessions)
  }, [sessions])

  // Timer logic
  const startTimer = useCallback(() => {
    setIsRunning(true)
    startTimeRef.current = new Date()
  }, [])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    const duration = mode === 'focus' 
      ? settings.focusDuration * 60
      : mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60
    setTimeLeft(duration)
  }, [mode, settings])

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

      playSound('focusEnd', settings.soundVolume)

      if (newCount % settings.longBreakInterval === 0) {
        setMode('longBreak')
        setTimeLeft(settings.longBreakDuration * 60)
        if (settings.autoStartBreak) {
          setIsRunning(true)
          startTimeRef.current = new Date()
        }
      } else {
        setMode('shortBreak')
        setTimeLeft(settings.shortBreakDuration * 60)
        if (settings.autoStartBreak) {
          setIsRunning(true)
          startTimeRef.current = new Date()
        }
      }
    } else {
      playSound('breakEnd', settings.soundVolume)
      setMode('focus')
      setTimeLeft(settings.focusDuration * 60)
      if (settings.autoStartFocus) {
        setIsRunning(true)
        startTimeRef.current = new Date()
      }
    }
  }, [mode, settings, pomodorosCompleted, activeTaskId])

  const skipTimer = useCallback(() => {
    completeSession()
  }, [completeSession])

  // Timer countdown
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, completeSession])

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Task management
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
    if (activeTaskId === id) {
      setActiveTaskId(null)
    }
  }, [activeTaskId])

  const setActiveTask = useCallback((id: string | null) => {
    setActiveTaskId(id)
  }, [])

  return (
    <TimerContext.Provider value={{
      mode,
      timeLeft,
      isRunning,
      pomodorosCompleted,
      settings,
      tasks,
      activeTaskId,
      sessions,
      startTimer,
      pauseTimer,
      resetTimer,
      skipTimer,
      setMode,
      updateSettings,
      addTask,
      toggleTask,
      deleteTask,
      setActiveTask,
    }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
```

**Step 2: Commit**

```bash
git add lib/timer-context.tsx
git commit -m "feat: add timer context with state management"
```

---

## Phase 3: Timer Components

### Task 7: Create Timer Ring Component

**Objective:** Circular progress ring for timer visualization

**Files:**
- Create: `components/timer/timer-ring.tsx`

**Step 1: Create component**

```typescript
// components/timer/timer-ring.tsx
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
  
  const modeColors = {
    focus: 'text-red-500',
    shortBreak: 'text-green-500',
    longBreak: 'text-blue-500',
  }

  const modeLabels = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
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
```

**Step 2: Commit**

```bash
git add components/timer/timer-ring.tsx
git commit -m "feat: add timer ring component"
```

---

### Task 8: Create Timer Controls Component

**Objective:** Start/pause, reset, skip buttons

**Files:**
- Create: `components/timer/timer-controls.tsx`

**Step 1: Create component**

```typescript
// components/timer/timer-controls.tsx
'use client'

import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

export function TimerControls() {
  const { isRunning, startTimer, pauseTimer, resetTimer, skipTimer } = useTimer()

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={resetTimer}
        title="Reset (R)"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      
      <Button
        size="lg"
        onClick={isRunning ? pauseTimer : startTimer}
        className="w-32"
      >
        {isRunning ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={skipTimer}
        title="Skip (S)"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/timer/timer-controls.tsx
git commit -m "feat: add timer controls component"
```

---

### Task 9: Create Mode Selector Component

**Objective:** Switch between focus, short break, long break

**Files:**
- Create: `components/timer/mode-selector.tsx`

**Step 1: Create component**

```typescript
// components/timer/mode-selector.tsx
'use client'

import { useTimer } from '@/lib/timer-context'
import { TimerMode } from '@/types/timer'
import { Button } from '@/components/ui/button'

export function ModeSelector() {
  const { mode, setMode, resetTimer } = useTimer()

  const modes: { value: TimerMode; label: string; color: string }[] = [
    { value: 'focus', label: 'Focus', color: 'bg-red-500' },
    { value: 'shortBreak', label: 'Short Break', color: 'bg-green-500' },
    { value: 'longBreak', label: 'Long Break', color: 'bg-blue-500' },
  ]

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    resetTimer()
  }

  return (
    <div className="flex gap-2">
      {modes.map((m) => (
        <Button
          key={m.value}
          variant={mode === m.value ? 'default' : 'outline'}
          onClick={() => handleModeChange(m.value)}
          className={mode === m.value ? m.color : ''}
        >
          {m.label}
        </Button>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/timer/mode-selector.tsx
git commit -m "feat: add mode selector component"
```

---

### Task 10: Create Timer Section

**Objective:** Combine all timer components

**Files:**
- Create: `components/timer/timer-section.tsx`

**Step 1: Create component**

```typescript
// components/timer/timer-section.tsx
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
```

**Step 2: Commit**

```bash
git add components/timer/timer-section.tsx
git commit -m "feat: add timer section combining all timer components"
```

---

## Phase 4: Task Components

### Task 11: Create Add Task Form

**Objective:** Input form to add new tasks

**Files:**
- Create: `components/tasks/add-task-form.tsx`

**Step 1: Create component**

```typescript
// components/tasks/add-task-form.tsx
'use client'

import { useState } from 'react'
import { useTimer } from '@/lib/timer-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AddTaskForm() {
  const [title, setTitle] = useState('')
  const { addTask } = useTimer()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      addTask(title.trim())
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Add a task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Button type="submit" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}
```

**Step 2: Commit**

```bash
git add components/tasks/add-task-form.tsx
git commit -m "feat: add task form component"
```

---

### Task 12: Create Task Item Component

**Objective:** Individual task display with actions

**Files:**
- Create: `components/tasks/task-item.tsx`

**Step 1: Create component**

```typescript
// components/tasks/task-item.tsx
'use client'

import { Task } from '@/types/timer'
import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, activeTaskId, setActiveTask } = useTimer()
  const isActive = activeTaskId === task.id

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : ''}`}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => toggleTask(task.id)}
      />
      
      <div className="flex-1">
        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {task.pomodoros} pomodoros
        </p>
      </div>
      
      <Button
        variant={isActive ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTask(isActive ? null : task.id)}
      >
        {isActive ? 'Active' : 'Focus'}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteTask(task.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/tasks/task-item.tsx
git commit -m "feat: add task item component"
```

---

### Task 13: Create Task List Component

**Objective:** Display all tasks

**Files:**
- Create: `components/tasks/task-list.tsx`

**Step 1: Create component**

```typescript
// components/tasks/task-list.tsx
'use client'

import { useTimer } from '@/lib/timer-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddTaskForm } from './add-task-form'
import { TaskItem } from './task-item'

export function TaskList() {
  const { tasks } = useTimer()
  
  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddTaskForm />
        
        {activeTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            {activeTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            {completedTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
        
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one above.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add components/tasks/task-list.tsx
git commit -m "feat: add task list component"
```

---

## Phase 5: Statistics Components

### Task 14: Create Stats Cards

**Objective:** Display key metrics

**Files:**
- Create: `components/stats/stats-cards.tsx`

**Step 1: Create component**

```typescript
// components/stats/stats-cards.tsx
'use client'

import { useTimer } from '@/lib/timer-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer, CheckCircle2, Flame, TrendingUp } from 'lucide-react'

export function StatsCards() {
  const { sessions, pomodorosCompleted } = useTimer()
  
  const focusSessions = sessions.filter(s => s.mode === 'focus')
  const totalMinutes = focusSessions.reduce((sum, s) => sum + s.duration / 60, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  
  // Calculate streak
  const today = new Date().toDateString()
  const sessionDates = [...new Set(focusSessions.map(s => new Date(s.completedAt).toDateString()))]
  const hasToday = sessionDates.includes(today)
  
  let streak = hasToday ? 1 : 0
  if (hasToday) {
    const sortedDates = sessionDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i])
      const previous = new Date(sortedDates[i - 1])
      const diffDays = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }
  }

  const stats = [
    {
      title: 'Focus Time',
      value: `${hours}h ${minutes}m`,
      icon: Timer,
      color: 'text-red-500',
    },
    {
      title: 'Pomodoros',
      value: focusSessions.length,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Current Streak',
      value: `${streak} days`,
      icon: Flame,
      color: 'text-orange-500',
    },
    {
      title: 'Today',
      value: pomodorosCompleted,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/stats/stats-cards.tsx
git commit -m "feat: add stats cards component"
```

---

### Task 15: Create Weekly Chart

**Objective:** Bar chart showing pomodoros per day

**Files:**
- Create: `components/stats/weekly-chart.tsx`

**Step 1: Create component**

```typescript
// components/stats/weekly-chart.tsx
'use client'

import { useTimer } from '@/lib/timer-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function WeeklyChart() {
  const { sessions } = useTimer()
  
  const focusSessions = sessions.filter(s => s.mode === 'focus')
  
  // Get last 7 days
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toISOString().split('T')[0])
  }
  
  const data = days.map(day => {
    const daySessions = focusSessions.filter(s => 
      s.completedAt.startsWith(day)
    )
    return {
      date: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      pomodoros: daySessions.length,
    }
  })

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
```

**Step 2: Commit**

```bash
git add components/stats/weekly-chart.tsx
git commit -m "feat: add weekly chart component"
```

---

### Task 16: Create Task Breakdown Chart

**Objective:** Pie chart showing time per task

**Files:**
- Create: `components/stats/task-breakdown.tsx`

**Step 1: Create component**

```typescript
// components/stats/task-breakdown.tsx
'use client'

import { useTimer } from '@/lib/timer-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export function TaskBreakdown() {
  const { sessions, tasks } = useTimer()
  
  const focusSessions = sessions.filter(s => s.mode === 'focus')
  
  // Group by task
  const taskCounts: Record<string, number> = {}
  focusSessions.forEach(s => {
    const taskId = s.taskId || 'untitled'
    taskCounts[taskId] = (taskCounts[taskId] || 0) + 1
  })
  
  const data = Object.entries(taskCounts)
    .map(([taskId, count]) => ({
      name: taskId === 'untitled' 
        ? 'No task' 
        : tasks.find(t => t.id === taskId)?.title || 'Deleted task',
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data yet. Complete some pomodoros.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="flex-1 truncate">{item.name}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add components/stats/task-breakdown.tsx
git commit -m "feat: add task breakdown chart"
```

---

### Task 17: Create Stats Section

**Objective:** Combine all stats components

**Files:**
- Create: `components/stats/stats-section.tsx`

**Step 1: Create component**

```typescript
// components/stats/stats-section.tsx
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
```

**Step 2: Commit**

```bash
git add components/stats/stats-section.tsx
git commit -m "feat: add stats section"
```

---

## Phase 6: Settings and Main Page

### Task 18: Create Settings Dialog

**Objective:** Customize timer durations and preferences

**Files:**
- Create: `components/settings/settings-dialog.tsx`

**Step 1: Create component**

```typescript
// components/settings/settings-dialog.tsx
'use client'

import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings } from 'lucide-react'

export function SettingsDialog() {
  const { settings, updateSettings } = useTimer()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Focus Duration (minutes)</Label>
            <Input
              type="number"
              value={settings.focusDuration}
              onChange={(e) => updateSettings({ focusDuration: parseInt(e.target.value) || 25 })}
              min={1}
              max={60}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Short Break (minutes)</Label>
            <Input
              type="number"
              value={settings.shortBreakDuration}
              onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
              min={1}
              max={30}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Long Break (minutes)</Label>
            <Input
              type="number"
              value={settings.longBreakDuration}
              onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
              min={1}
              max={60}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Long Break Interval (pomodoros)</Label>
            <Input
              type="number"
              value={settings.longBreakInterval}
              onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) || 4 })}
              min={1}
              max={10}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Auto-start breaks</Label>
            <Switch
              checked={settings.autoStartBreak}
              onCheckedChange={(checked) => updateSettings({ autoStartBreak: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Auto-start focus</Label>
            <Switch
              checked={settings.autoStartFocus}
              onCheckedChange={(checked) => updateSettings({ autoStartFocus: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Sound notifications</Label>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>
          
          {settings.soundEnabled && (
            <div className="space-y-2">
              <Label>Volume: {Math.round(settings.soundVolume * 100)}%</Label>
              <Slider
                value={[settings.soundVolume]}
                onValueChange={([value]) => updateSettings({ soundVolume: value })}
                max={1}
                step={0.1}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add components/settings/settings-dialog.tsx
git commit -m "feat: add settings dialog"
```

---

### Task 19: Create Main Page

**Objective:** Wire up all components on the main page

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Step 1: Update layout with TimerProvider**

```typescript
// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TimerProvider } from "@/lib/timer-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Focus Flow - Pomodoro Timer",
  description: "A minimal Pomodoro timer with task management and productivity analytics.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TimerProvider>
            {children}
          </TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 2: Create main page**

```typescript
// app/page.tsx
'use client'

import { TimerSection } from '@/components/timer/timer-section'
import { TaskList } from '@/components/tasks/task-list'
import { StatsSection } from '@/components/stats/stats-section'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { ModeToggle } from '@/components/mode-toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Timer, ListTodo, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold">Focus Flow</h1>
          </div>
          <div className="flex items-center gap-2">
            <SettingsDialog />
            <ModeToggle />
          </div>
        </div>
        
        <Tabs defaultValue="timer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="timer">
            <TimerSection />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TaskList />
          </TabsContent>
          
          <TabsContent value="stats">
            <StatsSection />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
```

**Step 3: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: create main page with all components"
```

---

## Phase 7: Polish and Deploy

### Task 20: Add Keyboard Shortcuts

**Objective:** Global keyboard shortcuts for timer control

**Files:**
- Create: `lib/use-keyboard-shortcuts.ts`

**Step 1: Create hook**

```typescript
// lib/use-keyboard-shortcuts.ts
'use client'

import { useEffect } from 'react'
import { useTimer } from './timer-context'

export function useKeyboardShortcuts() {
  const { startTimer, pauseTimer, isRunning, resetTimer, skipTimer } = useTimer()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

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
```

**Step 2: Add to main page**

```typescript
// Add to app/page.tsx
import { useKeyboardShortcuts } from '@/lib/use-keyboard-shortcuts'

export default function Home() {
  useKeyboardShortcuts()
  // ... rest of component
}
```

**Step 3: Commit**

```bash
git add lib/use-keyboard-shortcuts.ts app/page.tsx
git commit -m "feat: add keyboard shortcuts"
```

---

### Task 21: Final Testing and Cleanup

**Objective:** Comprehensive testing and code cleanup

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Test all features**

- Timer starts, pauses, resets, skips
- Mode switching works
- Tasks can be added, completed, deleted
- Active task links to pomodoros
- Statistics update correctly
- Settings persist in localStorage
- Dark mode toggle works
- Keyboard shortcuts work

**Step 3: Final commit**

```bash
git add .
git commit -m "chore: final testing and cleanup"
```

---

### Task 22: Deploy to Vercel

**Objective:** Deploy the application

**Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/RivaldiDev/Focus-Flow.git
git push -u origin main
```

**Step 2: Deploy to Vercel**

1. Go to vercel.com/new
2. Import RivaldiDev/Focus-Flow
3. Click deploy

**Step 3: Update README with live URL**

```markdown
## Live Demo

[View Live Demo](https://focus-flow.vercel.app)
```

**Step 4: Final commit**

```bash
git add README.md
git commit -m "docs: add live demo URL"
git push
```

---

## Summary

| Phase | Tasks | Time Estimate |
| --- | --- | --- |
| Phase 1: Project Setup | 2 tasks | 20 min |
| Phase 2: Types and State | 4 tasks | 45 min |
| Phase 3: Timer Components | 4 tasks | 45 min |
| Phase 4: Task Components | 3 tasks | 30 min |
| Phase 5: Stats Components | 4 tasks | 45 min |
| Phase 6: Settings and Main Page | 2 tasks | 30 min |
| Phase 7: Polish and Deploy | 3 tasks | 30 min |
| **Total** | **22 tasks** | **~4 hours** |
