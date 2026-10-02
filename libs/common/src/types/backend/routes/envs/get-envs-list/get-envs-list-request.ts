import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetEnvsListRequest = {
  operation: 'getEnvsList';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    isFilter: boolean;
  };
};

export let zToBackendGetEnvsListRequest = z
  .strictObject({
    operation: z.literal('getEnvsList'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        isFilter: z.boolean()
      })
      .meta({ id: 'ToBackendGetEnvsListInput' })
  })
  .meta({ id: 'ToBackendGetEnvsListRequest' });

assertTypesEqual<
  ToBackendGetEnvsListRequest,
  z.infer<typeof zToBackendGetEnvsListRequest>
>({ value: true });
