import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { InteractionType } from '#common/types/backend/parts/session/interaction-type';
import { zInteractionType } from '#common/types/backend/parts/session/interaction-type';

export type ToBackendSendMessageToExplorerSessionRequest = {
  operation: 'sendMessageToExplorerSession';
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
  };
};

export let zToBackendSendMessageToExplorerSessionRequest = z
  .strictObject({
    operation: z.literal('sendMessageToExplorerSession'),
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
        variant: z.string().nullish()
      })
      .meta({ id: 'ToBackendSendMessageToExplorerSessionInput' })
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionRequest' });

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionRequest,
  z.infer<typeof zToBackendSendMessageToExplorerSessionRequest>
>({ value: true });
