import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsOrgExistRequest = {
  operation: 'isOrgExist';
  traceId: string;
  input: {
    orgId: string;
  };
};

export let zToDiskIsOrgExistRequest = z
  .strictObject({
    operation: z.literal('isOrgExist'),
    traceId: z.string(),
    input: z
      .object({ orgId: z.string() })
      .meta({ id: 'ToDiskIsOrgExistRequestInput' })
  })
  .meta({ id: 'ToDiskIsOrgExistRequest' });

assertTypesEqual<
  ToDiskIsOrgExistRequest,
  z.infer<typeof zToDiskIsOrgExistRequest>
>({ value: true });
