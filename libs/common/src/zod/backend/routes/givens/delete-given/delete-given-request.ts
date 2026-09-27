import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteGivenInput = {
  projectId: string;
  givenId: string;
};

export type ToBackendDeleteGivenRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteGivenInput;
};

export let zToBackendDeleteGivenInput = z
  .object({
    projectId: z.string(),
    givenId: z.string()
  })
  .meta({ id: 'ToBackendDeleteGivenInput' });

export let zToBackendDeleteGivenRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteGivenInput
  })
  .meta({ id: 'ToBackendDeleteGivenRequest' });

assertTypesEqual<
  ToBackendDeleteGivenInput,
  z.infer<typeof zToBackendDeleteGivenInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteGivenRequest,
  z.infer<typeof zToBackendDeleteGivenRequest>
>({ value: true });
