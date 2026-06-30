/**
 * Circles types for community groups
 */

export type CircleId = string;

export interface CircleMeta {
  id: CircleId;
  name: string;
  createdAt: string; // ISO timestamp
}

export interface CircleState {
  /** Currently active circle ID (null = no circle) */
  myCircleId: CircleId | null;
  /** Map of circle metadata by ID */
  circles: Record<CircleId, CircleMeta>;
}
