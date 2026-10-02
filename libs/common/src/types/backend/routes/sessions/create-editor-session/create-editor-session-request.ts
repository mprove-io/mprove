import { z } from 'zod';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEditorSessionRequest = {
  operation: 'createEditorSession';
  traceId: string;
  idempotencyKey: string;
  input: {
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
};

export let zToBackendCreateEditorSessionRequest = z
  .strictObject({
    operation: z.literal('createEditorSession'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendCreateEditorSessionInput' })
  })
  .meta({ id: 'ToBackendCreateEditorSessionRequest' });

assertTypesEqual<
  ToBackendCreateEditorSessionRequest,
  z.infer<typeof zToBackendCreateEditorSessionRequest>
>({ value: true });
