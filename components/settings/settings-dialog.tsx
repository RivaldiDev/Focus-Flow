'use client'

import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings } from 'lucide-react'

export function SettingsDialog() {
  const { settings, updateSettings } = useTimer()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Focus Duration (minutes)</Label>
            <Input type="number" value={settings.focusDuration} onChange={(e) => updateSettings({ focusDuration: parseInt(e.target.value) || 25 })} min={1} max={60} />
          </div>
          <div className="space-y-2">
            <Label>Short Break (minutes)</Label>
            <Input type="number" value={settings.shortBreakDuration} onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })} min={1} max={30} />
          </div>
          <div className="space-y-2">
            <Label>Long Break (minutes)</Label>
            <Input type="number" value={settings.longBreakDuration} onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })} min={1} max={60} />
          </div>
          <div className="space-y-2">
            <Label>Long Break Interval (pomodoros)</Label>
            <Input type="number" value={settings.longBreakInterval} onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) || 4 })} min={1} max={10} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-start breaks</Label>
            <Switch checked={settings.autoStartBreak} onCheckedChange={(checked) => updateSettings({ autoStartBreak: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-start focus</Label>
            <Switch checked={settings.autoStartFocus} onCheckedChange={(checked) => updateSettings({ autoStartFocus: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sound notifications</Label>
            <Switch checked={settings.soundEnabled} onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })} />
          </div>
          {settings.soundEnabled && (
            <div className="space-y-2">
              <Label>Volume: {Math.round(settings.soundVolume * 100)}%</Label>
              <Slider value={[settings.soundVolume]} onValueChange={([value]) => updateSettings({ soundVolume: value })} max={1} step={0.1} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
