import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectAllowTimezonesRequest = {
  operation: 'setProjectAllowTimezones';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    allowTimezones: boolean;
  };
};

export let zToBackendSetProjectAllowTimezonesRequest = z
  .strictObject({
    operation: z.literal('setProjectAllowTimezones'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        allowTimezones: z.boolean()
      })
      .meta({ id: 'ToBackendSetProjectAllowTimezonesInput' })
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesRequest' });

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesRequest,
  z.infer<typeof zToBackendSetProjectAllowTimezonesRequest>
>({ value: true });
