import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendSetProjectTimezoneRequest = {
  operation: 'setProjectTimezone';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    timezone: string;
  };
};

export let zToBackendSetProjectTimezoneRequest = z
  .strictObject({
    operation: z.literal('setProjectTimezone'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        timezone: zTimezone
      })
      .meta({ id: 'ToBackendSetProjectTimezoneInput' })
  })
  .meta({ id: 'ToBackendSetProjectTimezoneRequest' });

assertTypesEqual<
  ToBackendSetProjectTimezoneRequest,
  z.infer<typeof zToBackendSetProjectTimezoneRequest>
>({ value: true });
