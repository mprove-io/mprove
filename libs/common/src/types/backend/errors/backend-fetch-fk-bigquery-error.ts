import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchFkBigqueryError = {
  code: 'BACKEND_FETCH_FK_BIGQUERY_ERROR';
};

export let zBackendFetchFkBigqueryError = z.object({
  code: z.literal('BACKEND_FETCH_FK_BIGQUERY_ERROR')
});

assertTypesEqual<
  BackendFetchFkBigqueryError,
  z.infer<typeof zBackendFetchFkBigqueryError>
>({ value: true });
