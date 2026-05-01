# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Expense Tracker App (`artifacts/expense-tracker`)

Local-first personal finance tracker. No backend — all data stored in `localStorage`.

**Stack:** React + Vite + Tailwind CSS v4, shadcn/ui, Recharts, Framer Motion, lucide-react

**Key files:**
- `src/hooks/useData.ts` — central data store: CRUD, filters, totals, day/month aggregates, import/export
- `src/hooks/useLocalStorage.ts` — generic persistent state hook
- `src/types.ts` — `Transaction`, `Tag`, `DEFAULT_TAGS`, `CHART_COLORS`
- `src/pages/Home.tsx` — main page with 3 tabs: Transacciones, Calendario, Categorías
- `src/components/TransactionModal.tsx` — create/edit modal with inline tag creation
- `src/components/TransactionList.tsx` — list with heatmap intensity + edit/delete
- `src/components/CalendarGrid.tsx` — month grid with per-day balance intensity colors
- `src/components/ExpenseChart.tsx` — interactive PieChart filtered by tag
- `src/components/SummaryCards.tsx` — income/expense/balance summary
- `src/components/ImportExport.tsx` — JSON export + import (replace or merge)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
