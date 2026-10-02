import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditGivenRequest = {
  operation: 'editGiven';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    givenId: string;
    values: string[];
  };
};

export let zToBackendEditGivenRequest = z
  .strictObject({
    operation: z.literal('editGiven'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        givenId: z.string().regex(MyRegex.GIVEN_ID(), {
          message:
            'givenId must start with an uppercase letter or underscore and contain only uppercase letters, digits and underscores'
        }),
        values: z.array(z.string())
      })
      .meta({ id: 'ToBackendEditGivenInput' })
  })
  .meta({ id: 'ToBackendEditGivenRequest' });

assertTypesEqual<
  ToBackendEditGivenRequest,
  z.infer<typeof zToBackendEditGivenRequest>
>({ value: true });
