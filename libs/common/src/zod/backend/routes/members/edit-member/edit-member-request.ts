import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditMemberInput = {
  projectId: string;
  memberId: string;
  isAdmin: boolean;
  isEditor: boolean;
  isExplorer: boolean;
  roles: string[];
};

export type ToBackendEditMemberRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditMemberInput;
};

export let zToBackendEditMemberInput = z
  .object({
    projectId: z.string(),
    memberId: z.string(),
    isAdmin: z.boolean(),
    isEditor: z.boolean(),
    isExplorer: z.boolean(),
    roles: z.array(z.string())
  })
  .meta({ id: 'ToBackendEditMemberInput' });

export let zToBackendEditMemberRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditMemberInput
  })
  .meta({ id: 'ToBackendEditMemberRequest' });

assertTypesEqual<
  ToBackendEditMemberInput,
  z.infer<typeof zToBackendEditMemberInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditMemberRequest,
  z.infer<typeof zToBackendEditMemberRequest>
>({ value: true });
