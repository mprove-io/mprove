import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditRoleGivenInput = {
  projectId: string;
  roleId: string;
  givenId: string;
  values: string[];
};

export type ToBackendEditRoleGivenRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditRoleGivenInput;
};

export let zToBackendEditRoleGivenInput = z
  .object({
    projectId: z.string(),
    roleId: z.string(),
    givenId: z.string(),
    values: z.array(z.string())
  })
  .meta({ id: 'ToBackendEditRoleGivenInput' });

export let zToBackendEditRoleGivenRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditRoleGivenInput
  })
  .meta({ id: 'ToBackendEditRoleGivenRequest' });

assertTypesEqual<
  ToBackendEditRoleGivenInput,
  z.infer<typeof zToBackendEditRoleGivenInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditRoleGivenRequest,
  z.infer<typeof zToBackendEditRoleGivenRequest>
>({ value: true });
