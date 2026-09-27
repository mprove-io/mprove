import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetUserGivensInput = {
  projectId: string;
};

export type ToBackendGetUserGivensRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetUserGivensInput;
};

export let zToBackendGetUserGivensInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetUserGivensInput' });

export let zToBackendGetUserGivensRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetUserGivensInput
  })
  .meta({ id: 'ToBackendGetUserGivensRequest' });

assertTypesEqual<
  ToBackendGetUserGivensInput,
  z.infer<typeof zToBackendGetUserGivensInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetUserGivensRequest,
  z.infer<typeof zToBackendGetUserGivensRequest>
>({ value: true });
