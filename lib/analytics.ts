// User properties cache
let userProperties: Record<string, any> = {};
const eventBuffer: Array<{ event: string; props: Record<string, any>; ts: number }> = [];
const recentEventTs = new Map<string, number>();
const oncePerSession = new Set<string>();
const DEDUPE_WINDOW_MS = 250;

/**
 * Log an event with optional properties
 * In dev: console.info
 * In prod: noop (ready for analytics service integration)
 */
export function log(event: string, props?: Record<string, any>): void {
  const mergedProps = { ...userProperties, ...(props || {}) };
  const ts = Date.now();
  const dedupeKey = `${event}:${JSON.stringify(mergedProps)}`;
  const lastTs = recentEventTs.get(dedupeKey);
  if (typeof lastTs === 'number' && ts - lastTs < DEDUPE_WINDOW_MS) {
    return;
  }
  recentEventTs.set(dedupeKey, ts);

  eventBuffer.push({ event, props: mergedProps, ts });
  if (eventBuffer.length > 2000) {
    eventBuffer.shift();
  }

  if (__DEV__) {
    console.info('[Analytics]', event, mergedProps);
  }
  // In production, this would send to analytics service
  // Example: analytics.logEvent(event, { ...userProperties, ...props });
}

/**
 * Set user properties (persists across events)
 * In dev: console.info
 * In prod: noop (ready for analytics service integration)
 */
export function setUser(props: Record<string, any>): void {
  userProperties = { ...userProperties, ...props };
  // New session boundary resets once-per-session guard.
  if (props.session_id || props.sessionId) {
    oncePerSession.clear();
  }
  if (__DEV__) {
    console.info('[Analytics] setUser', userProperties);
  }
  // In production, this would set user properties in analytics service
  // Example: analytics.setUserProperties(userProperties);
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use log() instead
 */
export function logEvent(name: string, params?: Record<string, any>): void {
  log(name, params);
}

export function logOncePerSession(event: string, props?: Record<string, any>): boolean {
  if (oncePerSession.has(event)) {
    return false;
  }
  oncePerSession.add(event);
  log(event, props);
  return true;
}

export function getEventBuffer(): Array<{ event: string; props: Record<string, any>; ts: number }> {
  return eventBuffer.slice();
}

export function getEventBufferSnapshot(): ReadonlyArray<{ event: string; props: Record<string, any>; ts: number }> {
  return eventBuffer.slice();
}

export function clearEventBuffer(): void {
  eventBuffer.splice(0, eventBuffer.length);
  recentEventTs.clear();
  oncePerSession.clear();
}





