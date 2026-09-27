import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetOrgUsersInput = {
  orgId: string;
  pageNum: number;
  perPage: number;
};

export type ToBackendGetOrgUsersRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetOrgUsersInput;
};

export let zToBackendGetOrgUsersInput = z
  .object({
    orgId: z.string(),
    pageNum: z.number(),
    perPage: z.number()
  })
  .meta({ id: 'ToBackendGetOrgUsersInput' });

export let zToBackendGetOrgUsersRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetOrgUsersInput
  })
  .meta({ id: 'ToBackendGetOrgUsersRequest' });

assertTypesEqual<
  ToBackendGetOrgUsersInput,
  z.infer<typeof zToBackendGetOrgUsersInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetOrgUsersRequest,
  z.infer<typeof zToBackendGetOrgUsersRequest>
>({ value: true });
