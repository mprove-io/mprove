import type {
  PermissionRequest,
  QuestionRequest,
  SessionStatus,
  Todo
} from '@opencode-ai/sdk/v2';
import { IsString } from 'class-validator';

export class OcSessionApi {
  @IsString()
  sessionId: string;

  todos?: Todo[];
  questions?: QuestionRequest[];
  permissions?: PermissionRequest[];
  ocSessionStatus?: SessionStatus;
  lastSessionError?: Record<string, unknown>;
  isLastErrorRecovered?: boolean;
}
