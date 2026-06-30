import { SubjectId, DailyChallengeState } from '@/contexts/UserContext';
import { SUBJECT_LABELS } from '@/constants/subjects';

export type NextUpMode = 'daily' | 'story' | 'practice';

export interface NextUpResult {
  mode: NextUpMode;
  subjectId: SubjectId;
}

export interface NextUpInput {
  dailyChallenge: DailyChallengeState;
  subjectsUnlocked: boolean;
}

/**
 * Resolves what the user should play next based on priority:
 * 1. Unfinished daily challenge (first 'current' in order)
 * 2. Unfinished story (placeholder - returns practice for now)
 * 3. Random practice subject
 */
export function resolveNextUp(input: NextUpInput): NextUpResult {
  const { dailyChallenge, subjectsUnlocked } = input;

  // Priority 1: Check for unfinished daily challenge
  const { order, progress } = dailyChallenge;
  const currentDailySubject = order.find(
    (subjectId) => progress[subjectId] === 'current'
  );

  if (currentDailySubject) {
    return {
      mode: 'daily',
      subjectId: currentDailySubject,
    };
  }

  // Priority 2: Story mode (placeholder - not implemented yet)
  // For now, fall through to practice
  // TODO: Implement story mode detection when available
  // if (hasUnfinishedStory(userState)) {
  //   return { mode: 'story', subjectId: getNextStorySubject(userState) };
  // }

  // Priority 3: Random practice subject
  // Use all available subjects, or default to hist if not unlocked
  const practiceSubjects: SubjectId[] = subjectsUnlocked
    ? ['hist', 'nl', 'math', 'geo']
    : ['hist']; // hist is always unlocked

  const randomIndex = Math.floor(Math.random() * practiceSubjects.length);
  const randomSubject = practiceSubjects[randomIndex];

  return {
    mode: 'practice',
    subjectId: randomSubject,
  };
}

/**
 * Formats the next up result as a display string
 */
export function formatNextUp(result: NextUpResult): string {
  const modeLabels: Record<NextUpMode, string> = {
    daily: 'Dagelijkse Uitdaging',
    story: 'Story',
    practice: 'Practice',
  };

  const subjectLabel = SUBJECT_LABELS[result.subjectId] || result.subjectId;
  return `${modeLabels[result.mode]}: ${subjectLabel}`;
}

