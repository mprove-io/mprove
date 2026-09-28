import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateRoleGivenRequest = {
  operation: 'createRoleGiven';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    roleId: string;
    givenId: string;
    values: string[];
  };
};

export let zToBackendCreateRoleGivenRequest = z
  .strictObject({
    operation: z.literal('createRoleGiven'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        roleId: z.string(),
        givenId: z.string(),
        values: z.array(z.string())
      })
      .meta({ id: 'ToBackendCreateRoleGivenInput' })
  })
  .meta({ id: 'ToBackendCreateRoleGivenRequest' });

assertTypesEqual<
  ToBackendCreateRoleGivenRequest,
  z.infer<typeof zToBackendCreateRoleGivenRequest>
>({ value: true });
