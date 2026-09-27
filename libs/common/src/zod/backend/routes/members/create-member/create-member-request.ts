import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateMemberInput = {
  projectId: string;
  email: string;
};

export type ToBackendCreateMemberRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateMemberInput;
};

export let zToBackendCreateMemberInput = z
  .object({
    projectId: z.string(),
    email: z.string()
  })
  .meta({ id: 'ToBackendCreateMemberInput' });

export let zToBackendCreateMemberRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateMemberInput
  })
  .meta({ id: 'ToBackendCreateMemberRequest' });

assertTypesEqual<
  ToBackendCreateMemberInput,
  z.infer<typeof zToBackendCreateMemberInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateMemberRequest,
  z.infer<typeof zToBackendCreateMemberRequest>
>({ value: true });
