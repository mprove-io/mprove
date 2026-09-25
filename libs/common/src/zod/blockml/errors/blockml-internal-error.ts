import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BlockmlInternalError = {
  code: 'BLOCKML_INTERNAL';
};

export let zBlockmlInternalError = z.object({
  code: z.literal('BLOCKML_INTERNAL')
});

assertTypesEqual<BlockmlInternalError, z.infer<typeof zBlockmlInternalError>>({
  value: true
});
