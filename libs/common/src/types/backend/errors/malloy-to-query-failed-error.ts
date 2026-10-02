import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MalloyToQueryFailedError = {
  code: 'MALLOY_TO_QUERY_FAILED';
};

export let zMalloyToQueryFailedError = z.object({
  code: z.literal('MALLOY_TO_QUERY_FAILED')
});

assertTypesEqual<
  MalloyToQueryFailedError,
  z.infer<typeof zMalloyToQueryFailedError>
>({ value: true });
