import type {
  PermissionRequest,
  QuestionRequest,
  Todo
} from '@opencode-ai/sdk/v2';
import { IsString } from 'class-validator';

export class OcSessionApi {
  @IsString()
  sessionId: string;

  todos?: Todo[];
  questions?: QuestionRequest[];
  permissions?: PermissionRequest[];
}
