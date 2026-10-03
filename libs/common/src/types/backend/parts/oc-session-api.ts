import type {
  PermissionRequest,
  QuestionRequest,
  SessionStatus,
  Todo
} from '@opencode-ai/sdk/v2';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OcSessionApi = {
  sessionId: string;
  todos?: Todo[];
  questions?: QuestionRequest[];
  permissions?: PermissionRequest[];
  ocSessionStatus?: SessionStatus;
  lastSessionError?: Record<string, unknown>;
  isLastErrorRecovered?: boolean;
};

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

assertTypesEqual<OcSessionApi, z.infer<typeof zOcSessionApi>>({ value: true });
