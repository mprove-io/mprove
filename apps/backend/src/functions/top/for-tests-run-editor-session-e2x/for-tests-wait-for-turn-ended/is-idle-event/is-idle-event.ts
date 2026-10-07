import type { EventSessionStatus } from '@opencode-ai/sdk/v2';
import type { SessionEventApi } from '#common/types/backend/parts/session/session-event-api';
export function isIdleEvent(sessionEvent: SessionEventApi): boolean {
  // 'session.idle' is deprecated but still emitted by opencode server.
  // 'session.status' with status.type === 'idle' is the new format.
  if (sessionEvent.eventType === 'session.idle') {
    return true;
  }
  if (sessionEvent.eventType === 'session.status') {
    let status = (sessionEvent.ocEvent as EventSessionStatus).properties
      ?.status;
    return status?.type === 'idle';
  }
  return false;
}
