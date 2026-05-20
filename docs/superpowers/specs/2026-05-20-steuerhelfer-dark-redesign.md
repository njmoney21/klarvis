# Steuerhelfer Dark Redesign

**Date:** 2026-05-20  
**Status:** Approved

## Overview

Redesign the Runly Steuerberater app (`src/pages/SteuerhelferApp.tsx` and its four sub-components) from a plain white/gray Tailwind UI to a dark, modern aesthetic that matches the main Runly marketing site.

No functional changes — this is a pure visual redesign. All existing logic, props, and data flows remain untouched.

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#0f172a` | Page background |
| `bg-surface` | `#1e293b` | Cards, header, tabs |
| `border` | `#334155` | All borders |
| `text-primary` | `#f1f5f9` | Headings, values |
| `text-secondary` | `#94a3b8` | Body text |
| `text-muted` | `#64748b` | Labels, hints |
| `text-disabled` | `#475569` | Inactive tabs, meta |
| `accent` | `#06b6d4` | Active states, highlights, CTAs |
| `accent-dark` | `#0891b2` | Gradient end for buttons |

These map to existing Tailwind v4 color names (`slate-*`, `cyan-*`) — no new CSS variables needed.

## Components

### SteuerhelferApp (layout shell)

- Page background: `bg-slate-900` (`#0f172a`)
- **Header:** `bg-slate-800` with `border-b border-slate-700`
  - Left: cyan hex icon (`⬡` in a `bg-cyan-500` rounded square) + app title in `text-slate-100` + subtitle in `text-slate-500`
  - Right: email in `text-slate-500`, Abmelden link in `text-cyan-500`
- **Tab bar:** `bg-slate-800 border-b border-slate-700`, overflow-x scroll
  - Active tab: `text-cyan-500 border-b-2 border-cyan-500 bg-cyan-500/5`
  - Inactive tab: `text-slate-500 hover:text-slate-300`

### Belegscanner

- **Mode toggle:** active button = `bg-cyan-500 text-slate-900 border-cyan-500`; inactive = `bg-transparent text-slate-500 border-slate-700`
- **Upload area:** `border-2 border-dashed border-slate-700 rounded-xl` with `hover:border-cyan-500` transition
- **Loading state:** `text-slate-400`
- **Receipt preview card:** `bg-slate-800 border border-slate-700 rounded-xl`
  - `dt` labels: `text-slate-500`; `dd` values: `text-slate-100`
  - Notes block: `bg-slate-900 text-slate-400`
  - Confirm button: `bg-cyan-500 text-slate-900 hover:bg-cyan-400`
  - Discard button: `bg-slate-700 text-slate-300 hover:bg-slate-600`
- **Compliance card:** same surface as receipt preview
  - Compliant badge: `bg-green-500/15 text-green-400 border border-green-500/20`
  - Non-compliant badge: `bg-red-500/15 text-red-400 border border-red-500/20`
  - Check icon: `text-green-400`; cross icon: `text-red-400`
  - Missing fields block: `bg-red-500/10 text-red-400`
- **Error message:** `bg-red-500/10 text-red-400 rounded-xl`

### Ausgaben

- **Stat cards:** `bg-slate-800 border border-slate-700 rounded-xl`
  - Label: `text-slate-500 uppercase tracking-wide text-xs`
  - Ausgaben value: `text-slate-100`
  - Vorsteuer value: `text-cyan-500`
- **Export button:** `bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-900 font-bold`
- **Receipt list items:** `bg-slate-800 border border-slate-700 rounded-xl`
  - Vendor: `text-slate-100 font-semibold`
  - Meta (date · category): `text-slate-500`
  - Amount: `text-cyan-400`
  - Delete link: `text-slate-600 hover:text-red-400`
- **Empty state:** `text-slate-500`
- **Loading state:** `text-slate-500`

### TaxChat

- **Quick-question pills:** `bg-cyan-500/10 border border-cyan-500/20 text-cyan-400` with `hover:bg-cyan-500/20`
- **User bubbles:** `bg-cyan-500 text-slate-900 font-medium rounded-2xl rounded-br-sm`
- **Bot bubbles:** `bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl rounded-bl-sm`
- **Typing indicator:** same as bot bubble, `text-slate-500`
- **Empty state text:** `text-slate-500`
- **Input field:** `bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 rounded-xl`
- **Send button:** `bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 disabled:opacity-40`

### DeadlineEngine

- **Checkbox label:** `text-slate-300`; checkbox `accent-cyan-500`
- **Deadline list items:** `bg-slate-800 border border-slate-700 rounded-xl`
  - Name: `text-slate-100 font-semibold`
  - Description: `text-slate-500`
  - Due date: `text-slate-400`
- **Urgency badges** (replacing solid color backgrounds):
  - `urgent`: `bg-red-500/15 text-red-400 border border-red-500/20`
  - `soon`: `bg-amber-500/15 text-amber-400 border border-amber-500/20`
  - `ok`: `bg-green-500/15 text-green-400 border border-green-500/20`

## Scope

- Edit only: `SteuerhelferApp.tsx`, `Belegscanner.tsx`, `Ausgaben.tsx`, `TaxChat.tsx`, `DeadlineEngine.tsx`
- No changes to: routing, auth, data fetching, API calls, types, tests, or the main marketing site
- No new dependencies — Tailwind v4 utility classes only
