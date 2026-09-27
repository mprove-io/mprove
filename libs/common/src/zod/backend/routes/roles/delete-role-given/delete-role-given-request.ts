import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteRoleGivenInput = {
  projectId: string;
  roleId: string;
  givenId: string;
};

export type ToBackendDeleteRoleGivenRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteRoleGivenInput;
};

export let zToBackendDeleteRoleGivenInput = z
  .object({
    projectId: z.string(),
    roleId: z.string(),
    givenId: z.string()
  })
  .meta({ id: 'ToBackendDeleteRoleGivenInput' });

export let zToBackendDeleteRoleGivenRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteRoleGivenInput
  })
  .meta({ id: 'ToBackendDeleteRoleGivenRequest' });

assertTypesEqual<
  ToBackendDeleteRoleGivenInput,
  z.infer<typeof zToBackendDeleteRoleGivenInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteRoleGivenRequest,
  z.infer<typeof zToBackendDeleteRoleGivenRequest>
>({ value: true });
