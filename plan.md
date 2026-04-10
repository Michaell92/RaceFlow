# Plan: Horse Racing Simulation Game

## TL;DR

We are building an interactive horse racing simulation with 20 horses, 6 rounds of varying distances, animated race track, and full program/results display. Two DDD modules (Horse + Race) on Vue 3 + Pinia + Quasar + TypeScript. Responsive, polished UI with unit + e2e tests. Document with readme, claude and plan files.

## Decisions

- **No Game module** — Horse + Race modules are sufficient. Race module owns game orchestration.
- **Manual start per round** — User clicks Start for each round (no auto-advance).
- **Single main route** — Game lives on `/`. Add `/not-found` placeholder to prepare router for scaling.
- **Pinia over Vuex** — Use Pinia (already installed).
- **requestAnimationFrame** for animation — smooth 60fps, GPU-friendly with CSS transforms.
- **Quasar components** for all UI — QTable, QBtn, QBadge, QToolbar, QLayout, etc. No fully custom UI.

## Game State Machine

```
IDLE → [Generate Program] → READY → [Start] → RACING → [round ends] → ROUND_FINISHED → [Start] → RACING → ... → FINISHED
                                                  ↕ [Pause/Resume]
                                                PAUSED
```

---

## Phase 1: Domain Types & Core Logic (no UI)

### Step 1 — Horse types & generation utility

- Create `src/modules/Horse/types/horse.types.ts`
  - `Horse` interface: `{ id: number; name: string; color: string; condition: number }`
- Create `src/modules/Horse/utils/horseGenerator.ts`
  - `generateHorses(): Horse[]` — 20 horses, predefined unique names, 20 unique CSS colors, random condition (1-100),
    we will accomplish this by reusing a vue component with a content that takes props for visual customization of a horse.
  - Curated list of 20 horse names and 20 distinct colors (good visual contrast)
  - Frames for horse animation. Located inside assets/spritesheet folder. We will reuse a single vue component that will import these frames for animation and pass props to it for different horse colors. One full animation = one color.

### Step 2 — Race types & utilities (_parallel with step 1_)

- Create `src/modules/Race/types/race.types.ts`
  - `RoundConfig` — `{ roundNumber: number; distance: number }`
  - `RaceEntry` — `{ horse: Horse; lane: number }`
  - `RoundSchedule` — `{ config: RoundConfig; entries: RaceEntry[] }`
  - `RaceResult` — `{ position: number; horse: Horse; finishTimeMs: number }`
  - `RoundResult` — `{ roundNumber: number; results: RaceResult[] }`
  - `GameStatus` enum — `IDLE | READY | RACING | PAUSED | ROUND_FINISHED | FINISHED`
- Create `src/modules/Race/utils/raceConfig.ts`
  - `ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]`
  - `HORSES_PER_ROUND = 10`, `TOTAL_ROUNDS = 6`
- Create `src/modules/Race/services/RaceEngine.ts` — **service class** encapsulating race orchestration logic
  - `selectRandomHorses(horses: Horse[], count: number): Horse[]` — picks N unique random horses
  - `generateSchedule(horses: Horse[]): RoundSchedule[]` — creates 6 rounds with 10 random horses each
  - Lives in `services/` (not `utils/`) because it encapsulates domain logic with potential side effects, not pure stateless helpers

### Step 3 — Unit tests for steps 1 & 2 (_after steps 1-2_)

- Create `src/modules/Horse/tests/horseGenerator.spec.ts`
  - Generates exactly 20 horses
  - All names unique, all colors unique
  - Conditions between 1-100
- Create `src/modules/Race/tests/RaceEngine.spec.ts`
  - selectRandomHorses returns correct count, no duplicates
  - generateSchedule creates 6 rounds with correct distances and in order, and 10 horses each

---

## Phase 2: State Management (Pinia Stores)

### Step 4 — Horse store (_depends on step 1_)

- Create `src/modules/Horse/stores/horseStore.ts`
  - State: `horses: Horse[]`
  - Action: `generateHorses()` — calls generator, populates state
  - Getter: `getHorseById(id)`

### Step 5 — Race store (_depends on steps 2, 4_)

- Create `src/modules/Race/stores/raceStore.ts`
  - State: `schedule: RoundSchedule[]`, `results: RoundResult[]`, `currentRoundIndex: number`, `status: GameStatus`
  - Actions: `generateProgram()`, `startRace()`, `pauseRace()`, `resumeRace()`, `completeRound(results)`, `reset()`
  - Getters: `currentRound`, `currentRoundConfig`, `isLastRound`,

### Step 6 — Store unit tests (_after steps 4-5_)

- Create `src/modules/Horse/tests/horseStore.spec.ts`
- Create `src/modules/Race/tests/raceStore.spec.ts`
  - Test state transitions match the state machine
  - Test generateProgram creates 6 valid rounds
  - Test completeRound stores results correctly

---

## Phase 3: Animation Composable

### Step 7 — Race animation composable (_depends on step 2_) ✅

- Created `src/modules/Race/composables/useRaceAnimation.ts`
  - Input: `entries: Ref<RaceEntry[]>`, `distance: Ref<number>`, `onRaceComplete` callback
  - Output: `horsePositions: Ref<Map<number, number>>` (horseId → progress 0-100%), `frameCursor: Ref<number>` (0-15 for sprite frame), `isRunning`, `start()`, `pause()`, `resume()`
  - Uses `requestAnimationFrame` loop for position updates
  - **Spritesheet approach**: 16 Vue SVG components in `Horse/components/spritesheet/frame_01..16.vue`, each accepts a `color` prop. All `fill` attributes are bound to `:fill="color"` for single-color horse rendering. The consuming component cycles through frames using `frameCursor` (updated every 60ms).
  - Speed per horse = `(condition / 100) × randomFactor(0.85–1.15)` — recalculated every 500ms for natural variation
  - Calls `onRaceComplete(results)` when all horses cross finish → returns ordered `RaceResult[]`
  - Scales base race duration (15s for 1200m) proportionally with distance
  - Cleans up `requestAnimationFrame` on component unmount

### Step 8 — Animation unit tests (_after step 7_)

- Create `src/modules/Race/tests/useRaceAnimation.spec.ts`
  - Test that positions advance over time
  - Test pause/resume behavior
  - Test that results are generated when race completes

---

## Phase 4: UI Components (Presentational)

### Step 9 — Horse list component

- Create `src/modules/Horse/components/HorseListTable.vue`
  - Props: `horses: Horse[]`
  - Renders QTable with columns: #, Name, Condition (number), Color (QBadge with horse color)
  - Shows "Horse List (1-20)" header
  - Scrollable if needed

### Step 10 — Race track component (_parallel with step 9_)

- Create `src/modules/Race/components/RaceTrack.vue`
  - Props: `entries: RaceEntry[]`, `horsePositions: Map<number, number>`, `roundLabel: string`, `distance: number`
  - 10 horizontal lanes with lane numbers
  - Each lane shows horse sprite/icon at its current position (translateX)
  - Shows round label (e.g. "1st Lap 1200m") and "FINISH" marker
  - Track has visual grid/markers for distance reference
- Create `src/modules/Race/components/RaceHorse.vue`
  - Props: `color: string`, `position: number` (0-100%)
  - Horse icon/emoji/SVG with the horse's color, positioned via CSS transform
  - Smooth movement via transition or direct positioning from rAF

### Step 11 — Program & Results tables (_parallel with steps 9-10_)

- Create `src/modules/Race/components/RaceProgram.vue`
  - Props: `schedule: RoundSchedule[]`, `currentRoundIndex: number`
  - QTable per round (or tabbed/accordion) showing Position + Name
  - Highlights current round, color-codes round distance headers (matching reference image colors)
- Create `src/modules/Race/components/RaceResults.vue`
  - Props: `results: RoundResult[]`
  - QTable per completed round showing Position + Name
  - Results appear sequentially as rounds finish

### Step 12 — Toolbar / header component (_parallel with steps 9-11_)

- Create `src/shared/components/AppToolbar.vue`
  - Props: `gameStatus: GameStatus`
  - Emits: `generate`, `toggleRace`
  - QToolbar with app title "Horse Racing", Generate Program button, Start/Pause button
  - Button states: Generate disabled during racing; Start disabled before program generated; shows "Pause" during racing

---

## Phase 5: Layout & Container View

### Step 13 — Main game view (_depends on steps 9-12_)

- Create `src/modules/Race/views/RaceView.vue` — **Container component**
  - Injects horseStore and raceStore
  - On mount: auto-generates 20 horses
  - Wires AppToolbar events → store actions
  - Passes data down to HorseListTable, RaceTrack, RaceProgram, RaceResults
  - Connects `useRaceAnimation` composable — feeds positions to RaceTrack.
    **Ownership split**: the _store_ holds all persistent game state (schedule, results, status, currentRoundIndex). The _composable_ only holds transient animation state (per-frame horse positions, rAF loop running/paused). When animation completes, the composable fires a callback → RaceView writes final results into the store. Store = source of truth, composable = visual layer.
  - Handles round completion: stores results, updates status
  - Layout: CSS Flexbox with responsive breakpoints (simpler than Quasar grid for this 3-panel layout):
    - Desktop (>1024px): `flex-direction: row` — horse list ~20% | track ~45% | program+results ~35%
    - Tablet (600–1024px): `flex-wrap: wrap` — track 100% top row, horse list + tables split bottom row
    - Mobile (<600px): `flex-direction: column` — single column vertical stack

### Step 14 — App shell & routing (_depends on step 13_)

- Update `src/App.vue` — Use QLayout with AppToolbar in header slot, router-view in main
- Update `src/router/index.ts` — Add routes:
  - `/` → lazy load RaceView
  - `/:pathMatch(.*)*` → lazy load NotFoundView (placeholder)
- Create `src/shared/views/NotFoundView.vue` — Simple 404 page (demonstrates routing)

---

## Phase 6: Polish & Responsiveness

### Step 15 — Visual polish (_depends on steps 13-14_)

- Ensure all Quasar components are styled consistently
- Add color legend or color dots next to horse names in all tables
- Smooth fade-in for results as rounds complete
- Track should have alternating lane colors (like the reference image — green/white stripes)
- Round headers color-coded by distance (red for short, graduating to darker for longer — matching reference)
- Typography: clear hierarchy with Quasar text utilities
- CSS - use SASS structure for custom css, use scoped styles in components
- Loading states for any async operations

### Step 16 — Responsive layout verification (_parallel with step 15_)

- Test mobile layout (< 600px): all sections stack vertically, tables responsive
- Test tablet (600-1024px): 2-column layout
- Test desktop (> 1024px): full 3-column layout
- Quasar breakpoint utilities (`$q.screen`) for conditional layouts

---

## Phase 7: Testing & Documentation

### Step 17 — E2E tests with Cypress (_depends on step 14_)

- Create `cypress/e2e/horseRacing.cy.ts`
  - Visits app, sees 20 horses in the list
  - Clicks Generate Program → 6 rounds appear in Program table
  - Clicks Start → horses animate on track
  - After round completes → results appear
  - Can start next round and turns auto-play on → runs through all 6 rounds
  - Generate Program resets and creates new schedule

---

## Relevant Files ( main setup, can be extended )

### Horse Module

| File                                              | Purpose                                            |
| ------------------------------------------------- | -------------------------------------------------- |
| `src/modules/Horse/types/horse.types.ts`          | Horse interface                                    |
| `src/modules/Horse/utils/horseGenerator.ts`       | 20-horse generation with names, colors, conditions |
| `src/modules/Horse/stores/horseStore.ts`          | Pinia store for horse state                        |
| `src/modules/Horse/components/HorseListTable.vue` | Presentational table (QTable)                      |
| `src/modules/Horse/tests/`                        | Unit tests for generator and store                 |
| `src/modules/Horse/assets/spritesheet`            | Frames for animation                               |

### Race Module

| File                                               | Purpose                                          |
| -------------------------------------------------- | ------------------------------------------------ |
| `src/modules/Race/types/race.types.ts`             | All race/round/result/status types               |
| `src/modules/Race/utils/raceConfig.ts`             | Constants (distances, counts)                    |
| `src/modules/Race/services/RaceEngine.ts`          | Race orchestration service (schedule, selection) |
| `src/modules/Race/stores/raceStore.ts`             | Pinia store for game state + schedule + results  |
| `src/modules/Race/composables/useRaceAnimation.ts` | requestAnimationFrame-based animation            |
| `src/modules/Race/components/RaceTrack.vue`        | Track visualization with lanes                   |
| `src/modules/Race/components/RaceHorse.vue`        | Individual animated horse sprite                 |
| `src/modules/Race/components/RaceProgram.vue`      | Schedule display (6 rounds)                      |
| `src/modules/Race/components/RaceResults.vue`      | Results display per round                        |
| `src/modules/Race/views/RaceView.vue`              | Container view (main game page)                  |
| `src/modules/Race/tests/`                          | Unit tests for RaceEngine, store, composable     |

### Shared & Root

| File                                   | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| `src/shared/components/AppToolbar.vue` | Header with Generate + Start/Pause buttons |
| `src/shared/views/NotFoundView.vue`    | 404 placeholder                            |
| `src/App.vue`                          | QLayout shell with router-view             |
| `src/router/index.ts`                  | Routes (/ and 404)                         |
| `CLAUDE.md`                            | AI development trace                       |
| `README.md`                            | Project documentation                      |

---

## Verification

### Automated

1. `npm run test:unit` — All Vitest tests pass (horse generation, RaceEngine, stores, composable)
2. `npm run test:e2e` — Cypress full game flow passes
3. `npm run lint` — Zero lint errors (Oxlint + ESLint)
4. `npm run type-check` — Zero TypeScript errors
5. `npm run build` — Production build succeeds

### Manual

1. Open app → 20 horses visible with names, conditions (1-100), unique colors
2. Click "Generate Program" → Program table shows 6 rounds, 10 horses each, correct distances
3. Click "Start" → Horses animate smoothly on track, no jank
4. Round finishes → Results appear with correct positions
5. Click "Start" again → Next round begins with new set of 10 horses
6. After 6 rounds → Game shows finished state
7. Click "Generate Program" again → Resets for new game
8. Resize browser → Layout responds correctly at all breakpoints
9. Verify Pause/Resume works during a race
10. Verify button states are correct at each game phase

---

## Further Considerations

1. **Horse sprites**: SVG silhouette with dynamic color fill for best visual quality while keeping it simple.
2. **Race result calculation**: Horse condition heavily influences speed but a random factor prevents deterministic outcomes. The random factor should be re-rolled periodically during the race (not just once) to create natural-looking speed variations.
3. **Round distance visual**: The track can show a distance label and a proportional finish line position, but the actual visual track width stays the same — longer distances just mean longer animation duration.
