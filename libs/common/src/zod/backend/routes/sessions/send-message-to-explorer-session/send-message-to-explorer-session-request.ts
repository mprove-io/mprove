import { z } from 'zod';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSendMessageToExplorerSessionRequest = {
  operation: 'sendMessageToExplorerSession';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
    messageId?: string;
    partId?: string;
    interactionType:
      | InteractionTypeEnum.Message
      | InteractionTypeEnum.Question
      | InteractionTypeEnum.Permission
      | InteractionTypeEnum.Stop;
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
        interactionType: z.enum(InteractionTypeEnum),
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
