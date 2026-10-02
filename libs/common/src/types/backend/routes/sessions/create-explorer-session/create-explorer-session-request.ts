import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateExplorerSessionRequest = {
  operation: 'createExplorerSession';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    providerId: string;
    modelId: string;
    variant: string;
    branchId: string;
    envId: string;
    firstMessage?: string;
    messageId: string;
    partId: string;
  };
};

export let zToBackendCreateExplorerSessionRequest = z
  .strictObject({
    operation: z.literal('createExplorerSession'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        providerId: z.string(),
        modelId: z.string(),
        variant: z.string(),
        branchId: z.string(),
        envId: z.string(),
        firstMessage: z.string().nullish(),
        messageId: z.string(),
        partId: z.string()
      })
      .meta({ id: 'ToBackendCreateExplorerSessionInput' })
  })
  .meta({ id: 'ToBackendCreateExplorerSessionRequest' });

assertTypesEqual<
  ToBackendCreateExplorerSessionRequest,
  z.infer<typeof zToBackendCreateExplorerSessionRequest>
>({ value: true });
