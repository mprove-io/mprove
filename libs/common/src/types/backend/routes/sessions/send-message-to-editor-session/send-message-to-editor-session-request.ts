import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { InteractionType } from '#common/types/backend/parts/session/interaction-type';
import { zInteractionType } from '#common/types/backend/parts/session/interaction-type';

export type ToBackendSendMessageToEditorSessionRequest = {
  operation: 'sendMessageToEditorSession';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
    messageId?: string;
    partId?: string;
    interactionType: InteractionType;
    message?: string;
    providerId?: string;
    modelId?: string;
    variant?: string;
    agent?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
  };
};

export let zToBackendSendMessageToEditorSessionRequest = z
  .strictObject({
    operation: z.literal('sendMessageToEditorSession'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string(),
        messageId: z.string().nullish(),
        partId: z.string().nullish(),
        interactionType: zInteractionType,
        message: z.string().nullish(),
        providerId: z.string().nullish(),
        modelId: z.string().nullish(),
        variant: z.string().nullish(),
        agent: z.string().nullish(),
        permissionId: z.string().nullish(),
        reply: z.string().nullish(),
        questionId: z.string().nullish(),
        answers: z.array(z.array(z.string())).nullish()
      })
      .meta({ id: 'ToBackendSendMessageToEditorSessionInput' })
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionRequest' });

assertTypesEqual<
  ToBackendSendMessageToEditorSessionRequest,
  z.infer<typeof zToBackendSendMessageToEditorSessionRequest>
>({ value: true });
