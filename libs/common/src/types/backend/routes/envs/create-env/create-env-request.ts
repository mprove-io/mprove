import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEnvRequest = {
  operation: 'createEnv';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
  };
};

export let zToBackendCreateEnvRequest = z
  .strictObject({
    operation: z.literal('createEnv'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendCreateEnvInput' })
  })
  .meta({ id: 'ToBackendCreateEnvRequest' });

assertTypesEqual<
  ToBackendCreateEnvRequest,
  z.infer<typeof zToBackendCreateEnvRequest>
>({ value: true });
