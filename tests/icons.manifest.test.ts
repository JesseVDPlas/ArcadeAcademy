import manifest from '@/app/assets/icons/pixel/icons.manifest';

describe('icons manifest', () => {
  it('has a valid png object shape for each icon entry', () => {
    for (const entry of Object.values(manifest)) {
      expect(typeof entry.png).toBe('object');
      const png = entry.png as Partial<Record<'1x' | '2x' | '3x', number>>;
      for (const scale of ['1x', '2x', '3x'] as const) {
        if (png[scale] !== undefined) {
          expect(typeof png[scale]).toBe('number');
        }
      }
    }
  });
});
