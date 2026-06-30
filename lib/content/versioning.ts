import type { ContentManifest } from '@/types/content';

const SUPPORTED_SCHEMA_MAJOR = 1;

export function isSchemaCompatible(schemaVersion: string): boolean {
  const major = Number(schemaVersion.split('.')[0]);
  return Number.isFinite(major) && major === SUPPORTED_SCHEMA_MAJOR;
}

export function assertManifestCompatible(manifest: ContentManifest): void {
  if (!isSchemaCompatible(manifest.schema_version)) {
    throw new Error(
      `Incompatible content manifest schema: ${manifest.schema_version}. Supported major: ${SUPPORTED_SCHEMA_MAJOR}`
    );
  }
}
