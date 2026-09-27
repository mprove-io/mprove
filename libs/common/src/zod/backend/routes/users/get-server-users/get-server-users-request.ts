import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetServerUsersInput = {
  pageNum: number;
  perPage: number;
};

export type ToBackendGetServerUsersRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetServerUsersInput;
};

export let zToBackendGetServerUsersInput = z
  .object({
    pageNum: z.number(),
    perPage: z.number()
  })
  .meta({ id: 'ToBackendGetServerUsersInput' });

export let zToBackendGetServerUsersRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetServerUsersInput
  })
  .meta({ id: 'ToBackendGetServerUsersRequest' });

assertTypesEqual<
  ToBackendGetServerUsersInput,
  z.infer<typeof zToBackendGetServerUsersInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetServerUsersRequest,
  z.infer<typeof zToBackendGetServerUsersRequest>
>({ value: true });
