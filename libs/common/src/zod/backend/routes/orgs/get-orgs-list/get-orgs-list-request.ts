import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetOrgsListInput = Record<string, never>;

export type ToBackendGetOrgsListRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetOrgsListInput;
};

export let zToBackendGetOrgsListInput = z
  .object({})
  .meta({ id: 'ToBackendGetOrgsListInput' });

export let zToBackendGetOrgsListRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetOrgsListInput
  })
  .meta({ id: 'ToBackendGetOrgsListRequest' });

assertTypesEqual<
  ToBackendGetOrgsListInput,
  z.infer<typeof zToBackendGetOrgsListInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetOrgsListRequest,
  z.infer<typeof zToBackendGetOrgsListRequest>
>({ value: true });
