# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies (Node `^20.19.0 || >=22.12.0`)
- `npm run dev` — Vite dev server with HMR (Vue DevTools plugin enabled)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build

There is no test suite, linter, or formatter configured. `App.vue` uses `<script lang="ts">`, but `typescript`/`vue-tsc` are not installed: Vite only strips the types and never checks them, so type errors won't break the build. Verify changes by running the app.

## What this is

A browser-based party game ("Wellenlänge", UI text in German) played on one shared screen: a hidden target spot on a half-circle dial, a two-sided word pair, and players guessing where the target is. Keep all user-facing text in German.

## Architecture

Nearly everything lives in `src/App.vue` (script, SVG template, scoped styles). `src/main.js` only mounts it.

**Game state machine** — `currentState` moves through:
`start` → `randomizing` → `revealed-hint` → `selecting` → `revealed-solution` → (next round) `randomizing` …
- `randomizePoints()` picks the target (`randomPointCenter`, an integer in `pointsMin..pointsMax` = 1..25), calls `initNextRound()` (moves to the next word pair, resets the selection), then `startRandomizeAnimation()`.
- `startRandomizeAnimation()` spins the arrow with `requestAnimationFrame` and ease-out-cubic for `randomizeDuration` ms, plays `public/assets/sounds/wheel.mp3` through `@vueuse/sound`, and lands on the target angle before switching to `revealed-hint`.
- `clickDial()` handles a click on the dial depending on state: skip the animation → hide the hint and start guessing → lock or unlock the guess.
- Score = `max(0, 4 - |target - guess|)`, computed inline in the template.

**Dial geometry** — the SVG viewBox has its pivot at (500, 500), and the dial is the upper half-circle, so angles run **180°–360°** (180 = far left, 360 = far right). Numbers 1..25 map linearly onto that range (`randomPointCenterDegree`). The mouse angle is stored as a fraction `angle/360` (0.5–1.0) in `hoverValue`/`selectedValue` and converted back to 1..25 in `selectedNumber`/`hoverNumber`. `hintSlices` draws 5 colored wedges (center ±2 slices) with `arcPath()`, which clamps to the semicircle.

**Word pairs** — the `waves` array (`{category, left, right}`) is played in order. A seeded `shuffle()` exists, but it is commented out in `randomWaves`. The game ends with an `alert` when the list runs out.

## Conventions

- Tailwind CSS v4 through `@tailwindcss/vite`. `src/assets/main.css` does `@import "tailwindcss"`. Scoped SFC styles must start with `@reference "./assets/main.css";` before using `@apply`.
- `@/` aliases to `src/` (set in both `vite.config.js` and `jsconfig.json`).
- `.editorconfig`: 4-space indent, LF, max line length 120, no final newline.
- Static assets in `public/` are referenced by absolute paths (e.g. `/assets/sounds/wheel.mp3`).
