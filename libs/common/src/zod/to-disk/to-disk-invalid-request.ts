import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskInvalidRequest = {
  type: 'InvalidRequest';
  issues: { path: string; message: string; code: string }[];
};

export let zToDiskInvalidRequest = z.object({
  type: z.literal('InvalidRequest'),
  issues: z.array(
    z.object({
      path: z.string(),
      message: z.string(),
      code: z.string()
    })
  )
});

assertTypesEqual<ToDiskInvalidRequest, z.infer<typeof zToDiskInvalidRequest>>({
  value: true
});
