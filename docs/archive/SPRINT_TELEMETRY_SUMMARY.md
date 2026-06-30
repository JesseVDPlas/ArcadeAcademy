# Core Loop Telemetry & A/B Testing - Sprint Summary

## 🎯 Goal

Add minimal event logging for core loop KPIs and implement A/B testing infrastructure to compare Old Home vs Core Loop MVP layouts.

---

## 📋 What Changed

### 1. Analytics Utility (`lib/analytics.ts`)

**Enhanced with new functions:**

```typescript
// New primary function
log(event: string, props?: Record<string, any>): void

// User properties management
setUser(props: Record<string, any>): void

// Legacy function (backward compatible)
logEvent(name: string, params?: Record<string, any>): void
```

**Behavior:**
- **Dev mode**: `console.info('[Analytics]', event, props)`
- **Prod mode**: No-op (ready for analytics service integration)
- **User properties**: Cached and merged with all events

**Example:**
```typescript
log('app_open', { source: 'cold' });
setUser({ userId: '123', cohort: 'beta' });
// Future events will include user properties
```

---

### 2. KPI Tracker (`lib/kpis.ts`)

**Functions:**
- `trackTimeToPlay(startTs: number)` - Start tracking time from home mount
- `completeTimeToPlay(): number | null` - Complete tracking, log KPI, return ms
- `trackResultClimax(startTs: number)` - Start tracking result screen climax
- `completeResultClimax(): number | null` - Complete tracking, log KPI, return ms
- `logKPIsIfReady()` - Periodically log KPIs (every 30s if available)

**KPI Events:**
- `core_loop_kpis` - Logged with `timeToPlayMs` and/or `resultClimaxMs`

**Usage Flow:**
```typescript
// Home screen mount
trackTimeToPlay(Date.now());

// Quiz screen start
const timeToPlayMs = completeTimeToPlay(); // Logs automatically

// Result screen mount
trackResultClimax(Date.now());

// Buttons enabled (2.5s later)
const resultClimaxMs = completeResultClimax(); // Logs automatically
```

---

### 3. A/B Testing Hook (`lib/experiments.ts`)

**Functions:**
- `getVariant(experimentName: string, variants: string[]): Promise<string>`
- `useExperiment(experimentName: string, variants: string[]): string` - React hook

**Features:**
- Consistent variant assignment (hash-based on user ID)
- Persistent storage (AsyncStorage)
- Automatic logging: `experiment_assign` event
- Cache for performance

**Example:**
```typescript
const variant = useExperiment('home_layout', ['old', 'core_mvp']);
// Returns: 'old' or 'core_mvp'
// Logs: { exp: 'home_layout', variant: 'old' }
```

**Storage:**
- Key: `arcade_experiments`
- Format: `{ "home_layout": "core_mvp" }`
- Persists across app restarts

---

### 4. Event Logging Integration

#### Home Screen (`app/(tabs)/home/index.tsx`)

**Events:**
1. `app_open` - On mount
   ```typescript
   {
     source: 'cold' | 'warm'
   }
   ```

2. `home_play_tap` - On PLAY button press
   ```typescript
   {
     nextMode: 'daily' | 'story' | 'practice',
     subjectId: string
   }
   ```

**KPI Tracking:**
- Calls `trackTimeToPlay()` on mount
- Time-to-play completed when quiz starts

**A/B Testing:**
- Uses `useExperiment('home_layout', ['old', 'core_mvp'])`
- If variant is 'old', shows original layout (even if `mvp_core_loop` flag is true)
- If variant is 'core_mvp', shows MVP layout (if `mvp_core_loop` flag is true)

---

#### Quiz Screen (`app/quiz-screen.tsx`)

**Events:**
1. `quiz_start` - When quiz begins
   ```typescript
   {
     mode: 'daily' | 'practice',
     subjectId: string,
     qCount: number,
     timeToPlayMs?: number  // From KPI tracker
   }
   ```

2. `quiz_answer` - On each answer
   ```typescript
   {
     correct: boolean,
     qIndex: number,
     timeMs: number  // Time from question start to answer
   }
   ```

3. `quiz_finish` - When quiz completes
   ```typescript
   {
     score: number,
     correct: number,
     total: number,
     durationMs: number  // Total quiz duration
   }
   ```

**KPI Tracking:**
- Calls `completeTimeToPlay()` when quiz starts
- Tracks question start times for answer timing

---

#### Result Screen (`app/result-screen.tsx`)

**Events:**
1. `result_next_round_tap` - On "Next Round?" button
   ```typescript
   {
     suggestedMode: 'daily' | 'story' | 'practice',
     subjectId: string
   }
   ```

**KPI Tracking:**
- Calls `trackResultClimax()` on mount
- Calls `completeResultClimax()` when buttons enabled (2.5s later)

---

## 📊 Event Schema

### Core Loop Events

| Event | When | Properties |
|-------|------|------------|
| `app_open` | Home screen mount | `source: 'cold'\|'warm'` |
| `home_play_tap` | PLAY button pressed | `nextMode, subjectId` |
| `quiz_start` | Quiz begins | `mode, subjectId, qCount, timeToPlayMs?` |
| `quiz_answer` | Each answer | `correct, qIndex, timeMs` |
| `quiz_finish` | Quiz completes | `score, correct, total, durationMs` |
| `result_next_round_tap` | Next Round button | `suggestedMode, subjectId` |

### KPI Events

| Event | When | Properties |
|-------|------|------------|
| `core_loop_kpis` | Periodically or on completion | `timeToPlayMs?, resultClimaxMs?, timestamp` |

### Experiment Events

| Event | When | Properties |
|-------|------|------------|
| `experiment_assign` | Variant assigned | `exp: string, variant: string` |

---

## 🧪 How to Verify

### 1. Check Dev Console

**Open React Native debugger or Metro console:**

```bash
# Start Metro
npm start

# In console, you should see:
[Analytics] app_open { source: 'cold' }
[Analytics] experiment_assign { exp: 'home_layout', variant: 'core_mvp' }
[Analytics] home_play_tap { nextMode: 'daily', subjectId: 'hist' }
[Analytics] quiz_start { mode: 'daily', subjectId: 'hist', qCount: 10, timeToPlayMs: 2341 }
[Analytics] quiz_answer { correct: true, qIndex: 0, timeMs: 5432 }
[Analytics] quiz_answer { correct: false, qIndex: 1, timeMs: 3210 }
...
[Analytics] quiz_finish { score: 8, correct: 8, total: 10, durationMs: 125000 }
[Analytics] core_loop_kpis { resultClimaxMs: 2500, timestamp: 1234567890 }
[Analytics] result_next_round_tap { suggestedMode: 'daily', subjectId: 'nl' }
```

### 2. Verify Time-to-Play KPI

**Expected flow:**
1. Home screen mounts → `trackTimeToPlay()` called
2. User taps PLAY → `home_play_tap` logged
3. Quiz starts → `completeTimeToPlay()` called → `core_loop_kpis` logged with `timeToPlayMs`

**Check:**
- `timeToPlayMs` should be > 0
- Should appear in `quiz_start` event as well
- Should be logged once per loop

### 3. Verify Result Climax KPI

**Expected flow:**
1. Result screen mounts → `trackResultClimax()` called
2. 2.5s later → buttons enabled → `completeResultClimax()` called → `core_loop_kpis` logged with `resultClimaxMs`

**Check:**
- `resultClimaxMs` should be ~2500ms
- Should be logged once per result screen

### 4. Verify A/B Testing

**Test variant assignment:**

```typescript
// In home screen, check console for:
[Analytics] experiment_assign { exp: 'home_layout', variant: 'old' }
// OR
[Analytics] experiment_assign { exp: 'home_layout', variant: 'core_mvp' }
```

**Test layout switching:**
1. Clear app data or AsyncStorage
2. Restart app
3. Check which variant is assigned
4. Verify home layout matches variant:
   - `'old'` → Original layout (Quick Actions, Daily Map, etc.)
   - `'core_mvp'` → MVP layout (single PLAY button)

**Persistence:**
- Variant should persist across app restarts
- Same user should get same variant

---

## 🔍 Event Payload Examples

### Complete Core Loop Flow

```javascript
// 1. App opens
[Analytics] app_open { source: 'cold' }

// 2. Experiment assigned
[Analytics] experiment_assign { exp: 'home_layout', variant: 'core_mvp' }

// 3. User taps PLAY
[Analytics] home_play_tap { nextMode: 'daily', subjectId: 'hist' }

// 4. Quiz starts (includes time-to-play)
[Analytics] quiz_start { 
  mode: 'daily', 
  subjectId: 'hist', 
  qCount: 10, 
  timeToPlayMs: 2341 
}

// 5. KPI logged
[Analytics] core_loop_kpis { timeToPlayMs: 2341, timestamp: 1234567890 }

// 6. User answers questions
[Analytics] quiz_answer { correct: true, qIndex: 0, timeMs: 5432 }
[Analytics] quiz_answer { correct: false, qIndex: 1, timeMs: 3210 }
[Analytics] quiz_answer { correct: true, qIndex: 2, timeMs: 4123 }
// ... more answers

// 7. Quiz finishes
[Analytics] quiz_finish { 
  score: 8, 
  correct: 8, 
  total: 10, 
  durationMs: 125000 
}

// 8. Result climax completes
[Analytics] core_loop_kpis { 
  resultClimaxMs: 2500, 
  timestamp: 1234567890 
}

// 9. User taps Next Round
[Analytics] result_next_round_tap { 
  suggestedMode: 'daily', 
  subjectId: 'nl' 
}
```

---

## 🎯 A/B Testing Details

### Experiment: `home_layout`

**Variants:**
- `'old'` - Original home layout (Quick Actions, Daily Map, Weekly Challenges, etc.)
- `'core_mvp'` - Core Loop MVP layout (single PLAY button, BitByte, subtitle)

**Assignment Logic:**
- Hash-based on `experimentName + userId`
- Consistent: same user always gets same variant
- Stored in AsyncStorage for persistence

**Integration:**
```typescript
// In home screen
const homeVariant = useExperiment('home_layout', ['old', 'core_mvp']);
const shouldShowMVP = flags.mvp_core_loop && homeVariant === 'core_mvp';
```

**Behavior:**
- If `homeVariant === 'old'` → Always show original layout
- If `homeVariant === 'core_mvp'` → Show MVP layout (if flag enabled)
- Experiment assignment logged automatically

---

## 📝 Files Modified

1. `lib/analytics.ts` - Enhanced with `log()` and `setUser()`
2. `lib/kpis.ts` - **NEW** - KPI tracking utilities
3. `lib/experiments.ts` - **NEW** - A/B testing hook
4. `app/(tabs)/home/index.tsx` - Added event logging, KPI tracking, A/B testing
5. `app/quiz-screen.tsx` - Added event logging, KPI completion
6. `app/result-screen.tsx` - Added event logging, KPI tracking

---

## ✅ Acceptance Criteria

- [x] Events appear in dev console with correct payloads
- [x] TTP (time-to-play) logged once per loop
- [x] Result climax logged once per result screen
- [x] Switching variant changes home layout under the hood
- [x] No new red logs (all errors handled gracefully)
- [x] Lint passes (0 errors)

---

## 🚀 Production Readiness

### Current State
- **Dev mode**: All events logged to console
- **Prod mode**: No-op (ready for integration)

### Integration Steps (Future)
1. Replace `log()` implementation with analytics service (Firebase, Mixpanel, etc.)
2. Replace `setUser()` with analytics service user properties
3. Replace `getVariant()` with proper experiment service (if needed)
4. Add event batching/throttling if needed
5. Add error tracking for failed events

### Example Integration
```typescript
// lib/analytics.ts (production)
import { Analytics } from '@react-native-firebase/analytics';

export function log(event: string, props?: Record<string, any>): void {
  Analytics().logEvent(event, { ...userProperties, ...props });
}

export function setUser(props: Record<string, any>): void {
  userProperties = { ...userProperties, ...props };
  Analytics().setUserProperties(userProperties);
}
```

---

## 🎉 Summary

The Core Loop telemetry system successfully instruments all key interactions with minimal, focused event logging. The A/B testing infrastructure allows for easy comparison between Old Home and Core Loop MVP layouts, with automatic variant assignment and persistence.

**Key Achievements:**
- ✅ Complete event coverage for core loop
- ✅ KPI tracking (time-to-play, result climax)
- ✅ A/B testing infrastructure
- ✅ Zero breaking changes (backward compatible)
- ✅ Production-ready (no-op in prod, easy to integrate)

**Next Steps:**
- Integrate with analytics service in production
- Monitor KPI trends over time
- Analyze A/B test results
- Add more experiments as needed

