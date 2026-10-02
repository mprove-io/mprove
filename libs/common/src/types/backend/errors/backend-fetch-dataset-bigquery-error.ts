import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchDatasetBigqueryError = {
  code: 'BACKEND_FETCH_DATASET_BIGQUERY_ERROR';
};

export let zBackendFetchDatasetBigqueryError = z.object({
  code: z.literal('BACKEND_FETCH_DATASET_BIGQUERY_ERROR')
});

assertTypesEqual<
  BackendFetchDatasetBigqueryError,
  z.infer<typeof zBackendFetchDatasetBigqueryError>
>({ value: true });
