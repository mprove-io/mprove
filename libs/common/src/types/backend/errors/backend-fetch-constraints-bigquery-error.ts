import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchConstraintsBigqueryError = {
  code: 'BACKEND_FETCH_CONSTRAINTS_BIGQUERY_ERROR';
};

export let zBackendFetchConstraintsBigqueryError = z.object({
  code: z.literal('BACKEND_FETCH_CONSTRAINTS_BIGQUERY_ERROR')
});

assertTypesEqual<
  BackendFetchConstraintsBigqueryError,
  z.infer<typeof zBackendFetchConstraintsBigqueryError>
>({ value: true });
