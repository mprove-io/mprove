import { z } from 'zod';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSendMessageToExplorerSessionInput = {
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

export type ToBackendSendMessageToExplorerSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSendMessageToExplorerSessionInput;
};

export let zToBackendSendMessageToExplorerSessionInput = z
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
  .meta({ id: 'ToBackendSendMessageToExplorerSessionInput' });

export let zToBackendSendMessageToExplorerSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSendMessageToExplorerSessionInput
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionRequest' });

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionInput,
  z.infer<typeof zToBackendSendMessageToExplorerSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionRequest,
  z.infer<typeof zToBackendSendMessageToExplorerSessionRequest>
>({ value: true });
