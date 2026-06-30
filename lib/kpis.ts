import { log } from './analytics';

// KPI tracking state
let timeToPlayStart: number | null = null;
let resultClimaxStart: number | null = null;
let lastKpiLogTime: number = 0;
const KPI_LOG_INTERVAL = 30000; // Log KPIs every 30 seconds if available

/**
 * Start tracking time-to-play (from home mount to quiz start)
 */
export function trackTimeToPlay(startTs: number): void {
  timeToPlayStart = startTs;
}

/**
 * Complete time-to-play tracking and log KPI
 * Called when quiz starts
 */
export function completeTimeToPlay(): number | null {
  if (timeToPlayStart === null) return null;
  
  const timeToPlayMs = Date.now() - timeToPlayStart;
  timeToPlayStart = null;
  
  // Log immediately
  log('core_loop_kpis', {
    timeToPlayMs,
    timestamp: Date.now(),
  });
  
  return timeToPlayMs;
}

/**
 * Start tracking result climax (from result mount to buttons enabled)
 */
export function trackResultClimax(startTs: number): void {
  resultClimaxStart = startTs;
}

/**
 * Complete result climax tracking and log KPI
 * Called when buttons become enabled
 */
export function completeResultClimax(): number | null {
  if (resultClimaxStart === null) return null;
  
  const resultClimaxMs = Date.now() - resultClimaxStart;
  resultClimaxStart = null;
  
  // Log immediately
  log('core_loop_kpis', {
    resultClimaxMs,
    timestamp: Date.now(),
  });
  
  return resultClimaxMs;
}

/**
 * Periodically log KPIs if available
 * Call this from app lifecycle or periodically
 */
export function logKPIsIfReady(): void {
  const now = Date.now();
  if (now - lastKpiLogTime < KPI_LOG_INTERVAL) return;
  
  const kpis: Record<string, any> = {
    timestamp: now,
  };
  
  if (timeToPlayStart !== null) {
    kpis.timeToPlayMs = Date.now() - timeToPlayStart;
  }
  
  if (resultClimaxStart !== null) {
    kpis.resultClimaxMs = Date.now() - resultClimaxStart;
  }
  
  if (Object.keys(kpis).length > 1) {
    log('core_loop_kpis', kpis);
    lastKpiLogTime = now;
  }
}

