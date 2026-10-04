import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { Extend } from '#common/types/extend';

export type SessionApiX = Extend<
  SessionApi,
  { displayTitle: string; providerLabel: string }
>;
