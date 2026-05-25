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
      <Input placeholder="Add a task..." value={title} onChange={(e) => setTitle(e.target.value)} />
      <Button type="submit" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}
