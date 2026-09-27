import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetMembersListInput = {
  projectId: string;
};

export type ToBackendGetMembersListRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetMembersListInput;
};

export let zToBackendGetMembersListInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetMembersListInput' });

export let zToBackendGetMembersListRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetMembersListInput
  })
  .meta({ id: 'ToBackendGetMembersListRequest' });

assertTypesEqual<
  ToBackendGetMembersListInput,
  z.infer<typeof zToBackendGetMembersListInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetMembersListRequest,
  z.infer<typeof zToBackendGetMembersListRequest>
>({ value: true });
