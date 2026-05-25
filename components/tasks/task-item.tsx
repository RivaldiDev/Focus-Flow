'use client'

import { Task } from '@/types/timer'
import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, activeTaskId, setActiveTask } = useTimer()
  const isActive = activeTaskId === task.id

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : ''}`}>
      <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />

      <div className="flex-1">
        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">{task.pomodoros} pomodoros</p>
      </div>

      <Button variant={isActive ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTask(isActive ? null : task.id)}>
        {isActive ? 'Active' : 'Focus'}
      </Button>

      <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
