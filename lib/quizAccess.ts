export const NO_LIVES_MESSAGE = 'Geen levens meer. Vul eerst je levens aan in de Shop.';

export function canStartQuiz(lives: number): boolean {
  return lives > 0;
}

export function getNoLivesReason(): string {
  return NO_LIVES_MESSAGE;
}

