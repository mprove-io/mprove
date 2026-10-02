import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSpecialRebuildStructsRequest = {
  operation: 'specialRebuildStructs';
  traceId: string;
  idempotencyKey: string;
  input: {
    specialKey: string;
    userIds: string[];
    skipRebuild: boolean;
    overrideTimezone?: string;
  };
};

export let zToBackendSpecialRebuildStructsRequest = z
  .strictObject({
    operation: z.literal('specialRebuildStructs'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        specialKey: z.string(),
        userIds: z.array(z.string()),
        skipRebuild: z.boolean(),
        overrideTimezone: z.string().nullish()
      })
      .meta({ id: 'ToBackendSpecialRebuildStructsInput' })
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsRequest' });

assertTypesEqual<
  ToBackendSpecialRebuildStructsRequest,
  z.infer<typeof zToBackendSpecialRebuildStructsRequest>
>({ value: true });
