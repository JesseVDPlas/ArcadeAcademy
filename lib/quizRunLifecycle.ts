export function shouldLogQuizAbandon(params: { runStarted: boolean; runFinished: boolean }): boolean {
  return params.runStarted && !params.runFinished;
}
