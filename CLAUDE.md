# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LensRef is a React single-page application for eye care professionals to reference contact lens parameters, ocular medications, and private label (store-brand) equivalence cross-references.

## Build & Development

Vite + React 18. No test infrastructure.

```bash
npm install        # install dependencies
npm run dev        # start dev server (vite)
npm run build      # production build (vite build) → dist/
npm run preview    # preview production build (vite preview)
```

## Architecture

### Project structure

```
index.html          # App shell, loads JetBrains Mono font, mounts #root
src/main.jsx        # Entry point — renders <LensRef /> into #root with StrictMode
src/LensRef.jsx     # Entire application in one component file
lensref.jsx         # Original standalone copy (pre-Vite, kept at root)
```

### Single-file layout (`src/LensRef.jsx`)

**Data layer** — Static arrays defined at module scope:
- `LENSES` — ~40 contact lens products with properties: material, dk (oxygen permeability), bc (base curve), dia (diameter), water content, power range, modality, type (Sphere/Toric/Multifocal), replacement schedule, private label mapping, discontinued flag
- `MEDS` — ~17 ocular medications with generic/brand names, drug class, dosing, indications, contraindications
- `PRIVATE_LABEL_MAP` — Store-brand to name-brand equivalence mappings with verification status

**Utility** — `printTable()` opens a new window with styled HTML and triggers browser print dialog.

**Inline sub-components** — `SortIcon`, `FilterPill`, `Badge`, `PrintButton` defined inside the file.

**Main `LensRef` component** — Manages three tabs ("lenses", "crossref", "meds"), each with its own search/filter/sort state via `useState`. Filtered datasets are computed with `useMemo`; sort and print handlers use `useCallback`.

### Styling

All CSS is inline (style objects in JSX). Theme palette: forest green `#1a5c3a`, purple `#5a3a8a`, gold `#8a5a1a`. Font: JetBrains Mono with monospace fallbacks. Print styles use landscape orientation.

### Key conventions

- Lens data properties use short keys: `dk` (oxygen permeability), `bc` (base curve), `dia` (diameter)
- Filters are string-based with `""` meaning "show all"
- Discontinued items are toggled via `showDiscontinued` boolean, rendered with muted styling
- Search is case-insensitive across multiple fields per tab
- Sorting toggles direction on repeated clicks of the same column
