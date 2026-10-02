import type {
  PermissionRequest,
  QuestionRequest,
  SessionStatus,
  Todo
} from '@opencode-ai/sdk/v2';
import { z } from 'zod';

export let zOcSessionApi = z
  .object({
    sessionId: z.string(),
    todos: z.array(z.custom<Todo>()).nullish(),
    questions: z.array(z.custom<QuestionRequest>()).nullish(),
    permissions: z.array(z.custom<PermissionRequest>()).nullish(),
    ocSessionStatus: z.custom<SessionStatus>().nullish(),
    lastSessionError: z.record(z.string(), z.unknown()).nullish(),
    isLastErrorRecovered: z.boolean().nullish()
  })
  .meta({ id: 'OcSessionApi' });

export type OcSessionApi = z.infer<typeof zOcSessionApi>;
