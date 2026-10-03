import type { ConnectionConfigEntry } from '@malloydata/malloy';

export type MalloyConfigPart = {
  malloyConnectionConfigEntry: ConnectionConfigEntry;
  envs: Record<string, string>;
  files: { path: string; data: string }[];
};
