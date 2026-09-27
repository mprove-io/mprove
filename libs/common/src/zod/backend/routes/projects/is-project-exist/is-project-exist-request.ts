import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsProjectExistInput = {
  orgId: string;
  name: string;
};

export type ToBackendIsProjectExistRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendIsProjectExistInput;
};

export let zToBackendIsProjectExistInput = z
  .object({
    orgId: z.string(),
    name: z.string()
  })
  .meta({ id: 'ToBackendIsProjectExistInput' });

export let zToBackendIsProjectExistRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendIsProjectExistInput
  })
  .meta({ id: 'ToBackendIsProjectExistRequest' });

assertTypesEqual<
  ToBackendIsProjectExistInput,
  z.infer<typeof zToBackendIsProjectExistInput>
>({ value: true });

assertTypesEqual<
  ToBackendIsProjectExistRequest,
  z.infer<typeof zToBackendIsProjectExistRequest>
>({ value: true });
