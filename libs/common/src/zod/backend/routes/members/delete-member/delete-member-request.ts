import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteMemberInput = {
  projectId: string;
  memberId: string;
};

export type ToBackendDeleteMemberRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteMemberInput;
};

export let zToBackendDeleteMemberInput = z
  .object({
    projectId: z.string(),
    memberId: z.string()
  })
  .meta({ id: 'ToBackendDeleteMemberInput' });

export let zToBackendDeleteMemberRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteMemberInput
  })
  .meta({ id: 'ToBackendDeleteMemberRequest' });

assertTypesEqual<
  ToBackendDeleteMemberInput,
  z.infer<typeof zToBackendDeleteMemberInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteMemberRequest,
  z.infer<typeof zToBackendDeleteMemberRequest>
>({ value: true });
