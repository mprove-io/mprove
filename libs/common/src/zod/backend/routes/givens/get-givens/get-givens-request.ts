import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetGivensInput = {
  projectId: string;
};

export type ToBackendGetGivensRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetGivensInput;
};

export let zToBackendGetGivensInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetGivensInput' });

export let zToBackendGetGivensRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetGivensInput
  })
  .meta({ id: 'ToBackendGetGivensRequest' });

assertTypesEqual<
  ToBackendGetGivensInput,
  z.infer<typeof zToBackendGetGivensInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetGivensRequest,
  z.infer<typeof zToBackendGetGivensRequest>
>({ value: true });
