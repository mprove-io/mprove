import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetOrgsListRequest = {
  operation: 'getOrgsList';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendGetOrgsListRequest = z
  .strictObject({
    operation: z.literal('getOrgsList'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendGetOrgsListInput' })
  })
  .meta({ id: 'ToBackendGetOrgsListRequest' });

assertTypesEqual<
  ToBackendGetOrgsListRequest,
  z.infer<typeof zToBackendGetOrgsListRequest>
>({ value: true });
