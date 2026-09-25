import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BlockmlInvalidRequestError = {
  code: 'BLOCKML_INVALID_REQUEST';
  displayData: { path: string; message: string; code: string }[];
};

export let zBlockmlInvalidRequestError = z.object({
  code: z.literal('BLOCKML_INVALID_REQUEST'),
  displayData: z.array(
    z.object({
      path: z.string(),
      message: z.string(),
      code: z.string()
    })
  )
});

assertTypesEqual<
  BlockmlInvalidRequestError,
  z.infer<typeof zBlockmlInvalidRequestError>
>({ value: true });
