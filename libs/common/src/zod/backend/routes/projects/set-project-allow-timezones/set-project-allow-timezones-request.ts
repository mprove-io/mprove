import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectAllowTimezonesInput = {
  projectId: string;
  allowTimezones: boolean;
};

export type ToBackendSetProjectAllowTimezonesRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetProjectAllowTimezonesInput;
};

export let zToBackendSetProjectAllowTimezonesInput = z
  .object({
    projectId: z.string(),
    allowTimezones: z.boolean()
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesInput' });

export let zToBackendSetProjectAllowTimezonesRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetProjectAllowTimezonesInput
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesRequest' });

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesInput,
  z.infer<typeof zToBackendSetProjectAllowTimezonesInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesRequest,
  z.infer<typeof zToBackendSetProjectAllowTimezonesRequest>
>({ value: true });
