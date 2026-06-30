export function toGradeBand(level: string | undefined, grade: string | undefined): string {
  const levelNorm = String(level || '').trim().toLowerCase();
  const gradeNum = String(grade || '').trim().replace(/\D/g, '');

  if (levelNorm.includes('vwo') && gradeNum) return `vwo_${gradeNum}`;
  if (levelNorm.includes('havo') && gradeNum) return `havo_${gradeNum}`;
  if (levelNorm.includes('mavo') && gradeNum) return `mavo_${gradeNum}`;

  // Backward-compatible default for current MVP packs
  return 'vwo_1';
}
