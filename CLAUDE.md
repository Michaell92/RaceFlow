# Development plan

Whole plan is outlined inside plan.md file.
Below are coding guidelines and architectural principles.

### Global architectural approach: DDD folder structure

Each business domain (e.g., Horse, Race) is fully self-contained under `/src/modules`. A module folder holds everything related to that domain: views, components, composables, API layer (model, API class, repository) — right now we don't need this as no API is available, but it can easily be created — types, services, assets, utils, stores and tests — all colocated for easy navigation and refactoring.

This way, teams can be dedicated to specific domains and domains can be easily removed. Similar to Micro frontends but separated by folders, not packages.

The `/src/shared` folder is for code used by 2+ modules: reusable components, composables, helpers, interfaces, enums or services.

If a module needs another module's file, import it directly (e.g., `@/modules/Horse/types/horse.types`). Keep dependencies explicit.

```
/src
├─ /modules
│
│ ├─ /Horse
│ │ ├─ /views
│ │ ├─ /components
│ │ │ └─ HorseListTable.vue
│ │ ├─ /composables
│ │ ├─ /services
│ │ ├─ /stores
│ │ │ └─ horseStore.ts
│ │ ├─ /types
│ │ │ └─ horse.types.ts
│ │ ├─ /utils
│ │ │ └─ horseGenerator.ts
│ │ ├─ /assets
│ │ └─ /tests
│ │ ├─ horseGenerator.spec.ts
│ │ └─ horseStore.spec.ts
│ │
│ └─ /Race
│ ├─ /views
│ │ └─ RaceView.vue
│ ├─ /components
│ │ ├─ RaceTrack.vue
│ │ ├─ RaceHorse.vue
│ │ ├─ RaceProgram.vue
│ │ └─ RaceResults.vue
│ ├─ /composables
│ │ └─ useRaceAnimation.ts
│ ├─ /services
│ │ └─ RaceEngine.ts
│ ├─ /stores
│ │ └─ raceStore.ts
│ ├─ /types
│ │ └─ race.types.ts
│ ├─ /utils
│ │ └─ raceConfig.ts
│ ├─ /assets
│ │ └─ /tests
│ │ ├─ RaceEngine.spec.ts
│ │ └─ raceStore.spec.ts
│ │
├─ /shared
│ ├─ /components
│ │ └─ AppToolbar.vue
│ ├─ /composables
│ ├─ /services
│ ├─ /stores
│ ├─ /types
│ ├─ /utils
│ ├─ /assets
│ └─ /views
│ └─ NotFoundView.vue
│
├─ /router
│ └─ index.ts
│
└─ /assets
```

## File Naming Conventions

- Types: `{domain}.types.ts` (e.g., `horse.types.ts`, `race.types.ts`)
- Services: `PascalCase.ts` (e.g., `RaceEngine.ts`)
- Stores: `camelCase.ts` (e.g., `horseStore.ts`, `raceStore.ts`)
- Utils/Config: `camelCase.ts` (e.g., `horseGenerator.ts`, `raceConfig.ts`)
- Components: `PascalCase.vue` (e.g., `RaceTrack.vue`, `HorseListTable.vue`)
- Composables: `use{Name}.ts` (e.g., `useRaceAnimation.ts`)
- Tests: `{source}.spec.ts` (e.g., `RaceEngine.spec.ts`, `horseStore.spec.ts`)

## TypeScript

Never add interfaces or types in `.vue` files. Place them in the relevant domain's `types/` folder (e.g., `src/modules/Horse/types/`) or in `src/shared/types/` for shared types.

## CSS

Use scoped styles in components, avoid global CSS. Use BEM naming for classes and scss for nesting. Prefer Quasar components and utilities over custom CSS when possible.
DON'T USE CSS PIXELS, USE REM FOR EVERYTHING.
DON'T BUILD PROJECT AFTER DOING ANYTHING.
