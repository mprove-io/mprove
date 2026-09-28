import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BlockmlUnexpectedUrlReadError = {
  code: 'BLOCKML_UNEXPECTED_URL_READ';
};

export let zBlockmlUnexpectedUrlReadError = z.object({
  code: z.literal('BLOCKML_UNEXPECTED_URL_READ')
});

assertTypesEqual<
  BlockmlUnexpectedUrlReadError,
  z.infer<typeof zBlockmlUnexpectedUrlReadError>
>({ value: true });
