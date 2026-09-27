import { z } from 'zod';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEditorSessionInput = {
  projectId: string;
  sandboxType: SandboxTypeEnum.E2B;
  providerId: string;
  modelId: string;
  agent: string;
  variant: string;
  envId: string;
  initialBranch: string;
  firstMessage?: string;
  messageId: string;
  partId: string;
};

export type ToBackendCreateEditorSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateEditorSessionInput;
};

export let zToBackendCreateEditorSessionInput = z
  .object({
    projectId: z.string(),
    sandboxType: z.enum(SandboxTypeEnum),
    providerId: z.string(),
    modelId: z.string(),
    agent: z.string(),
    variant: z.string(),
    envId: z.string(),
    initialBranch: z.string(),
    firstMessage: z.string().nullish(),
    messageId: z.string(),
    partId: z.string()
  })
  .meta({ id: 'ToBackendCreateEditorSessionInput' });

export let zToBackendCreateEditorSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateEditorSessionInput
  })
  .meta({ id: 'ToBackendCreateEditorSessionRequest' });

assertTypesEqual<
  ToBackendCreateEditorSessionInput,
  z.infer<typeof zToBackendCreateEditorSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEditorSessionRequest,
  z.infer<typeof zToBackendCreateEditorSessionRequest>
>({ value: true });
