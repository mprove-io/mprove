import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetMembersInput = {
  projectId: string;
  pageNum: number;
  perPage: number;
};

export type ToBackendGetMembersRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetMembersInput;
};

export let zToBackendGetMembersInput = z
  .object({
    projectId: z.string(),
    pageNum: z.number(),
    perPage: z.number()
  })
  .meta({ id: 'ToBackendGetMembersInput' });

export let zToBackendGetMembersRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetMembersInput
  })
  .meta({ id: 'ToBackendGetMembersRequest' });

assertTypesEqual<
  ToBackendGetMembersInput,
  z.infer<typeof zToBackendGetMembersInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetMembersRequest,
  z.infer<typeof zToBackendGetMembersRequest>
>({ value: true });
