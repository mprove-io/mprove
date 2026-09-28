import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteGivenRequest = {
  operation: 'deleteGiven';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    givenId: string;
  };
};

export let zToBackendDeleteGivenRequest = z
  .strictObject({
    operation: z.literal('deleteGiven'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        givenId: z.string()
      })
      .meta({ id: 'ToBackendDeleteGivenInput' })
  })
  .meta({ id: 'ToBackendDeleteGivenRequest' });

assertTypesEqual<
  ToBackendDeleteGivenRequest,
  z.infer<typeof zToBackendDeleteGivenRequest>
>({ value: true });
