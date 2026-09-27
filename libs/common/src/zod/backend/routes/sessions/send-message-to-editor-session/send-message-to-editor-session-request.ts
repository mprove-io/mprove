import { z } from 'zod';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSendMessageToEditorSessionInput = {
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
  agent?: string;
  permissionId?: string;
  reply?: string;
  questionId?: string;
  answers?: string[][];
};

export type ToBackendSendMessageToEditorSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSendMessageToEditorSessionInput;
};

export let zToBackendSendMessageToEditorSessionInput = z
  .object({
    sessionId: z.string(),
    messageId: z.string().nullish(),
    partId: z.string().nullish(),
    interactionType: z.enum(InteractionTypeEnum),
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
  .meta({ id: 'ToBackendSendMessageToEditorSessionInput' });

export let zToBackendSendMessageToEditorSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSendMessageToEditorSessionInput
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionRequest' });

assertTypesEqual<
  ToBackendSendMessageToEditorSessionInput,
  z.infer<typeof zToBackendSendMessageToEditorSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendSendMessageToEditorSessionRequest,
  z.infer<typeof zToBackendSendMessageToEditorSessionRequest>
>({ value: true });
