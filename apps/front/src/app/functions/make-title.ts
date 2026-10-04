import type { SessionApi } from '#common/types/backend/parts/session/session-api';

export function makeTitle(session: SessionApi): string {
  if (
    session.title &&
    !/^(New session - |Child session - )\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
      session.title
    )
  ) {
    return session.title;
  }
  if (session.status === 'New' || session.status === 'Active') {
    return 'Untitled';
  }
  return 'No title';
}
