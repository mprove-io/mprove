import type { ConnectionConfigEntry } from '@malloydata/malloy';

export interface MalloyConfigPart {
  malloyConnectionConfigEntry: ConnectionConfigEntry;
  envs: Record<string, string>;
  files: { path: string; data: string }[];
}
