'use client'

import { TimerSection } from '@/components/timer/timer-section'
import { TaskList } from '@/components/tasks/task-list'
import { StatsSection } from '@/components/stats/stats-section'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { ModeToggle } from '@/components/mode-toggle'
import { useKeyboardShortcuts } from '@/lib/use-keyboard-shortcuts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Timer, ListTodo, BarChart3 } from 'lucide-react'

export default function Home() {
  useKeyboardShortcuts()

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
              <Timer className="h-4 w-4" />Timer
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />Tasks
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer"><TimerSection /></TabsContent>
          <TabsContent value="tasks"><TaskList /></TabsContent>
          <TabsContent value="stats"><StatsSection /></TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
