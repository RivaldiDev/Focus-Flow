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
            {activeTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            {completedTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </div>
        )}

        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add one above.</p>
        )}
      </CardContent>
    </Card>
  )
}
