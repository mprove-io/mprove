import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetProjectsListRequest = {
  operation: 'getProjectsList';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
  };
};

export let zToBackendGetProjectsListRequest = z
  .strictObject({
    operation: z.literal('getProjectsList'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string()
      })
      .meta({ id: 'ToBackendGetProjectsListInput' })
  })
  .meta({ id: 'ToBackendGetProjectsListRequest' });

assertTypesEqual<
  ToBackendGetProjectsListRequest,
  z.infer<typeof zToBackendGetProjectsListRequest>
>({ value: true });
