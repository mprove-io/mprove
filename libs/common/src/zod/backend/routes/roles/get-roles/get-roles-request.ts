import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetRolesInput = {
  projectId: string;
};

export type ToBackendGetRolesRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetRolesInput;
};

export let zToBackendGetRolesInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetRolesInput' });

export let zToBackendGetRolesRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetRolesInput
  })
  .meta({ id: 'ToBackendGetRolesRequest' });

assertTypesEqual<
  ToBackendGetRolesInput,
  z.infer<typeof zToBackendGetRolesInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetRolesRequest,
  z.infer<typeof zToBackendGetRolesRequest>
>({ value: true });
