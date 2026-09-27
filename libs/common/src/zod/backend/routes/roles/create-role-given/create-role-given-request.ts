import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateRoleGivenInput = {
  projectId: string;
  roleId: string;
  givenId: string;
  values: string[];
};

export type ToBackendCreateRoleGivenRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateRoleGivenInput;
};

export let zToBackendCreateRoleGivenInput = z
  .object({
    projectId: z.string(),
    roleId: z.string(),
    givenId: z.string(),
    values: z.array(z.string())
  })
  .meta({ id: 'ToBackendCreateRoleGivenInput' });

export let zToBackendCreateRoleGivenRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateRoleGivenInput
  })
  .meta({ id: 'ToBackendCreateRoleGivenRequest' });

assertTypesEqual<
  ToBackendCreateRoleGivenInput,
  z.infer<typeof zToBackendCreateRoleGivenInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateRoleGivenRequest,
  z.infer<typeof zToBackendCreateRoleGivenRequest>
>({ value: true });
