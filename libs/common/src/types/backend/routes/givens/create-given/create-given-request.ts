import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import { zGivenType } from '#common/types/backend/parts/given/given-type';

export type ToBackendCreateGivenRequest = {
  operation: 'createGiven';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    givenId: string;
    type: GivenType;
    isMultiple: boolean;
    values: string[];
  };
};

export let zToBackendCreateGivenRequest = z
  .strictObject({
    operation: z.literal('createGiven'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        givenId: z.string().regex(MyRegex.GIVEN_ID(), {
          message:
            'givenId must start with an uppercase letter or underscore and contain only uppercase letters, digits and underscores'
        }),
        type: zGivenType,
        isMultiple: z.boolean(),
        values: z.array(z.string())
      })
      .meta({ id: 'ToBackendCreateGivenInput' })
  })
  .meta({ id: 'ToBackendCreateGivenRequest' });

assertTypesEqual<
  ToBackendCreateGivenRequest,
  z.infer<typeof zToBackendCreateGivenRequest>
>({ value: true });
