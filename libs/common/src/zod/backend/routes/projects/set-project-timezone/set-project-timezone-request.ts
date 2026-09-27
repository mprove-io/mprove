import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendSetProjectTimezoneInput = {
  projectId: string;
  timezone: string;
};

export type ToBackendSetProjectTimezoneRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetProjectTimezoneInput;
};

export let zToBackendSetProjectTimezoneInput = z
  .object({
    projectId: z.string(),
    timezone: zTimezone
  })
  .meta({ id: 'ToBackendSetProjectTimezoneInput' });

export let zToBackendSetProjectTimezoneRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetProjectTimezoneInput
  })
  .meta({ id: 'ToBackendSetProjectTimezoneRequest' });

assertTypesEqual<
  ToBackendSetProjectTimezoneInput,
  z.infer<typeof zToBackendSetProjectTimezoneInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectTimezoneRequest,
  z.infer<typeof zToBackendSetProjectTimezoneRequest>
>({ value: true });
