import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectInfoInput = {
  projectId: string;
  name?: string;
};

export type ToBackendSetProjectInfoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetProjectInfoInput;
};

export let zToBackendSetProjectInfoInput = z
  .object({
    projectId: z.string(),
    name: z.string().nullish()
  })
  .meta({ id: 'ToBackendSetProjectInfoInput' });

export let zToBackendSetProjectInfoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetProjectInfoInput
  })
  .meta({ id: 'ToBackendSetProjectInfoRequest' });

assertTypesEqual<
  ToBackendSetProjectInfoInput,
  z.infer<typeof zToBackendSetProjectInfoInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectInfoRequest,
  z.infer<typeof zToBackendSetProjectInfoRequest>
>({ value: true });
