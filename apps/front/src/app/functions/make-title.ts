import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';

export function makeTitle(session: AgentSessionApi): string {
  if (
    session.title &&
    !/^(New session - |Child session - )\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
      session.title
    )
  ) {
    return session.title;
  }
  if (
    session.status === SessionStatusEnum.New ||
    session.status === SessionStatusEnum.Active
  ) {
    return 'Untitled Session';
  }
  return 'No title';
}
