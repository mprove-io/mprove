import type {
  PermissionRequest,
  QuestionRequest,
  Session,
  SessionStatus,
  Todo
} from '@opencode-ai/sdk/v2';

export type OcSessionSt = {
  openSession?: Session;
  todos?: Todo[];
  questions?: QuestionRequest[];
  permissions?: PermissionRequest[];
  ocSessionStatus?: SessionStatus;
  lastSessionError?: Record<string, unknown>;
  isLastErrorRecovered?: boolean;
};
