import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendBigqueryCancelQueryJobFailError = {
  code: 'BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL';
};

export let zBackendBigqueryCancelQueryJobFailError = z.object({
  code: z.literal('BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL')
});

assertTypesEqual<
  BackendBigqueryCancelQueryJobFailError,
  z.infer<typeof zBackendBigqueryCancelQueryJobFailError>
>({ value: true });
