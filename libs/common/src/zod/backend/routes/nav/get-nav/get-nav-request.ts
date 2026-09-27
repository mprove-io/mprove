import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetNavInput = {
  orgId?: string;
  projectId?: string;
  getRepo: boolean;
};

export type ToBackendGetNavRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetNavInput;
};

export let zToBackendGetNavInput = z
  .object({
    orgId: z.string().nullish(),
    projectId: z.string().nullish(),
    getRepo: z.boolean()
  })
  .meta({ id: 'ToBackendGetNavInput' });

export let zToBackendGetNavRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetNavInput
  })
  .meta({ id: 'ToBackendGetNavRequest' });

assertTypesEqual<ToBackendGetNavInput, z.infer<typeof zToBackendGetNavInput>>({
  value: true
});

assertTypesEqual<
  ToBackendGetNavRequest,
  z.infer<typeof zToBackendGetNavRequest>
>({ value: true });
