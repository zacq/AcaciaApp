# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build → dist/
npm run lint       # TypeScript type-check (tsc --noEmit)
npm run preview    # Preview production build locally
```

There are no automated tests. Type-checking (`npm run lint`) is the primary code correctness gate.

## Architecture

**AcaciaVeld RanchOS** — a livestock management SPA for sheep/goat farm operations. Built with React 19 + Vite + TypeScript, Supabase as the backend (auth, PostgreSQL, storage), deployed to Netlify.

### Routing & Auth

`src/App.tsx` defines all routes under a `BrowserRouter`. All `/app/*` routes are wrapped in `ProtectedRoute`, which reads from `useAuth()` and redirects to `/login` if unauthenticated.

`src/contexts/AuthContext.tsx` manages the single auth context: Supabase session + profile row from `public.profiles`. The `profile` object is fetched from Supabase on sign-in and provides `role` (`super_admin` / `admin` / `manager` / `staff` / `vet`). Access it everywhere with `useAuth()`.

### Data Layer

**All DB calls are made directly in component `useEffect` hooks** — there is no service layer or query abstraction. Use `supabase` from `src/supabase.ts` directly in pages.

Common patterns:
```ts
// Read
const { data, error } = await supabase.from('animals').select('*').eq('id', id);

// Insert
const { data, error } = await supabase.from('treatments').insert({ animal_id, ... }).select().single();

// Count only
const { count } = await supabase.from('animals').select('id', { count: 'exact', head: true });
```

Supabase Storage bucket for animal photos is `animal-images` (public). Images have slots: `front`, `side`, `rear` — enforced by DB unique constraint on `(animal_id, slot)`.

### Key Files

| File | Purpose |
|------|---------|
| `src/types.ts` | All TypeScript interfaces — `Animal`, `Profile`, `Treatment`, `AnimalImage`, `AnimalWeight`, `AnimalGroup`, `Note` |
| `src/supabase.ts` | Single exported `supabase` client |
| `src/contexts/AuthContext.tsx` | `useAuth()` hook — `{ session, user, profile, loading, isAuthReady, signOut }` |
| `src/components/Layout.tsx` | App shell: sidebar nav + top bar. Uses `useAuth()` for user display and `signOut` |
| `src/pages/Flock.tsx` | Animal listing, group filtering, AddAnimalPage (7-section form), 3-slot image upload |
| `src/pages/AnimalProfile.tsx` | 9-tab animal detail view — fetches animal, images, treatments, weights, sire/dam lazily |
| `supabase/migrations/001_initial_schema.sql` | Full DB schema: 19 tables, RLS policies, storage buckets, breed seeds |

### Page Layout Pattern

Every page uses `Layout` (via the router) which provides the sidebar and top nav. Pages render into the `<Outlet />`. The standard page structure:

```tsx
export default function PageName() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="..." subtitle="..." />
      {/* content */}
    </div>
  );
}
```

### Design System

Tailwind with custom tokens defined in `src/index.css` via `@theme`:

- `primary` — `#1a4d2e` (forest green) — main brand colour
- `primary-light` — `#4f6f52` (sage)
- `accent` — `#e8dfca` (warm cream) — secondary surfaces
- `background` — `#f5f5f0` (off-white)

Reusable component classes (defined in `src/index.css`):
- `.card` — white surface with border, shadow, hover lift
- `.btn-primary` — green filled button
- `.btn-secondary` — cream/outline button
- `.input-field` — rounded input with focus ring

Fonts: **Inter** (sans-serif UI), **Cormorant Garamond** (serif headings/accents).

### Environment Variables

```
VITE_SUPABASE_URL=https://ubvsyfocaiyzzvtfemlx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Both are required at build time. The client in `src/supabase.ts` logs a warning and returns a non-functional client if they are missing (used for Netlify guard during CI).

### Database

Project ref: `ubvsyfocaiyzzvtfemlx`. Schema lives in `supabase/migrations/001_initial_schema.sql`. RLS is enabled on all tables — all policies allow any authenticated user to read/write (tightened per-org in future migrations).

`public.profiles` is auto-created on sign-up via a trigger on `auth.users`. `animals.updated_at` is kept current via trigger.

FK relationships that **cannot be set via CSV import** (must be linked in-app): `sire_id`, `dam_id`, `current_group_id`.

### Data Import

`supabase/imports/` contains 13 CSV templates and an `IMPORT_GUIDE.md`. Import order matters (standalone tables first, then relational). Relational CSVs use `animal_tag` / `dam_tag` / `sire_tag` text references and must be imported via the SQL Editor using a join pattern — see `IMPORT_GUIDE.md`.

**Date format in all CSVs must be `YYYY-MM-DD`.** Opening CSVs in Excel will corrupt dates and convert 15-digit EIDs to scientific notation — edit in VS Code or a plain text editor.

### Vendor Chunks

Vite splits output into three vendor chunks: `vendor-react`, `vendor-supabase`, `vendor-ui` (Motion, Lucide, Recharts). Keep new heavy dependencies within these groups or add a new `manualChunks` entry.

### Firebase

`src/firebase.ts` still exists but is deprecated — it stubs gracefully when env vars are absent. Do not add new code that imports from it.

---

## Coding Principles (Karpathy Skills)

> Behavioral guidelines to reduce common LLM coding mistakes.
> **Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
