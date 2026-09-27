import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSpecialRebuildStructsInput = {
  specialKey: string;
  userIds: string[];
  skipRebuild: boolean;
  overrideTimezone?: string;
};

export type ToBackendSpecialRebuildStructsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSpecialRebuildStructsInput;
};

export let zToBackendSpecialRebuildStructsInput = z
  .object({
    specialKey: z.string(),
    userIds: z.array(z.string()),
    skipRebuild: z.boolean(),
    overrideTimezone: z.string().nullish()
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsInput' });

export let zToBackendSpecialRebuildStructsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSpecialRebuildStructsInput
  })
  .meta({ id: 'ToBackendSpecialRebuildStructsRequest' });

assertTypesEqual<
  ToBackendSpecialRebuildStructsInput,
  z.infer<typeof zToBackendSpecialRebuildStructsInput>
>({ value: true });

assertTypesEqual<
  ToBackendSpecialRebuildStructsRequest,
  z.infer<typeof zToBackendSpecialRebuildStructsRequest>
>({ value: true });
