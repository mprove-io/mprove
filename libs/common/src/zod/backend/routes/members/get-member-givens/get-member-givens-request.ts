import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetMemberGivensInput = {
  projectId: string;
  memberId: string;
};

export type ToBackendGetMemberGivensRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetMemberGivensInput;
};

export let zToBackendGetMemberGivensInput = z
  .object({
    projectId: z.string(),
    memberId: z.string()
  })
  .meta({ id: 'ToBackendGetMemberGivensInput' });

export let zToBackendGetMemberGivensRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetMemberGivensInput
  })
  .meta({ id: 'ToBackendGetMemberGivensRequest' });

assertTypesEqual<
  ToBackendGetMemberGivensInput,
  z.infer<typeof zToBackendGetMemberGivensInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetMemberGivensRequest,
  z.infer<typeof zToBackendGetMemberGivensRequest>
>({ value: true });
