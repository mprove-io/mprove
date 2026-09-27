import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsOrgExistInput = {
  name: string;
};

export type ToBackendIsOrgExistRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendIsOrgExistInput;
};

export let zToBackendIsOrgExistInput = z
  .object({
    name: z.string()
  })
  .meta({ id: 'ToBackendIsOrgExistInput' });

export let zToBackendIsOrgExistRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendIsOrgExistInput
  })
  .meta({ id: 'ToBackendIsOrgExistRequest' });

assertTypesEqual<
  ToBackendIsOrgExistInput,
  z.infer<typeof zToBackendIsOrgExistInput>
>({ value: true });

assertTypesEqual<
  ToBackendIsOrgExistRequest,
  z.infer<typeof zToBackendIsOrgExistRequest>
>({ value: true });
