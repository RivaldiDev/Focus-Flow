<div align="center">

# Focus Flow

**A minimal Pomodoro timer with task management, session tracking, and productivity analytics.**

[![Tech Stack](https://skillicons.dev/icons?i=nextjs,tailwind,typescript&theme=dark&perline=4)](https://skillicons.dev)

![Timer](https://img.shields.io/badge/Timer-Pomodoro-EF4444?style=for-the-badge)
![Tasks](https://img.shields.io/badge/Tasks-Manager-3B82F6?style=for-the-badge)
![Stats](https://img.shields.io/badge/Stats-Analytics-10B981?style=for-the-badge)
![Focus](https://img.shields.io/badge/Focus-Sessions-F59E0B?style=for-the-badge)

[Overview](#overview) · [Features](#features) · [Setup](#setup) · [Tech Stack](#tech-stack)

</div>

---

## Overview

Focus Flow is a web-based Pomodoro timer that helps you stay focused and track your productivity. It combines a clean timer interface with task management, session history, and visual analytics to help you understand your work patterns.

Built with Next.js 14, shadcn/ui, Aceternity UI, and Recharts. All data persists in localStorage — no backend required.

## Features

| Area | What it does |
| --- | --- |
| **Pomodoro Timer** | 25min work / 5min break / 15min long break, auto-cycle, visual progress ring |
| **Task Management** | Add, complete, delete tasks. Link tasks to pomodoro sessions. |
| **Session Tracking** | Log every pomodoro with timestamp, duration, and linked task |
| **Statistics Dashboard** | Daily/weekly/monthly charts, total focus time, streak tracking |
| **Sound Notifications** | Audio alerts when timer ends, customizable volume |
| **Customizable Settings** | Adjust work/break durations, auto-start, notification preferences |
| **Keyboard Shortcuts** | Space to start/pause, S to skip, R to reset |
| **Dark Mode** | Full dark/light theme support |
| **Responsive Design** | Works on desktop and mobile |
| **Local Storage** | All data persists in browser, no account needed |

## Timer Modes

| Mode | Duration | Purpose |
| --- | --- | --- |
| Focus | 25 minutes | Deep work session |
| Short Break | 5 minutes | Quick rest between pomodoros |
| Long Break | 15 minutes | Extended rest after 4 pomodoros |

## Statistics

| Metric | Description |
| --- | --- |
| Total Focus Time | Hours and minutes spent in focus mode |
| Pomodoros Completed | Count of finished focus sessions |
| Current Streak | Consecutive days with at least 1 pomodoro |
| Best Streak | Longest consecutive day streak |
| Daily Average | Average pomodoros per active day |
| Focus Distribution | Chart showing focus time by hour of day |
| Weekly Trend | Bar chart of pomodoros per day over the week |
| Task Breakdown | Pie chart of time spent per task |

## Setup

```bash
git clone https://github.com/RivaldiDev/Focus-Flow.git
cd Focus-Flow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Framework | Next.js 14 | App router, server components |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Cards, buttons, inputs, tabs, progress |
| Animations | Aceternity UI | Number ticker, spotlight, animated beams |
| Charts | Recharts | Session analytics visualizations |
| State | React Context + localStorage | Persistent timer and task state |
| Icons | Lucide React | Clean icon set |
| Language | TypeScript | Type safety |

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / Pause timer |
| `S` | Skip to next session |
| `R` | Reset current timer |
| `T` | Add new task |

## Repository Layout

| Path | Purpose |
| --- | --- |
| `app/` | Next.js app router pages and layouts |
| `components/` | Reusable UI components |
| `components/timer/` | Timer ring, controls, mode selector |
| `components/tasks/` | Task list, task item, add task form |
| `components/stats/` | Charts and analytics components |
| `components/ui/` | shadcn/ui base components |
| `lib/` | Utility functions and hooks |
| `lib/timer-context.tsx` | Timer state management |
| `lib/storage.ts` | localStorage helpers |
| `lib/sounds.ts` | Audio notification utilities |
| `types/` | TypeScript type definitions |

## Project Status

Active. Core timer, task management, and statistics dashboard complete.

## Update History

- **2026-05-25** — Initial project setup with Next.js 14, shadcn/ui, Aceternity UI, and Recharts.
