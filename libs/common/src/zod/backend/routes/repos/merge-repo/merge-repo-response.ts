import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendMergeRepoOutput,
  zToBackendMergeRepoOutput
} from '#common/zod/backend/routes/repos/merge-repo/merge-repo-output';
import {
  type ToBackendMergeRepoError,
  zToBackendMergeRepoError
} from './merge-repo-error';

export type ToBackendMergeRepoResponse = ToBackendResponseBase<
  'mergeRepo',
  ToBackendMergeRepoOutput,
  ToBackendMergeRepoError
>;

export let zToBackendMergeRepoResponse = makeToBackendResponseSchema({
  operation: 'mergeRepo',
  output: zToBackendMergeRepoOutput,
  error: zToBackendMergeRepoError
}).meta({ id: 'ToBackendMergeRepoResponse' });

assertTypesEqual<
  ToBackendMergeRepoResponse,
  z.infer<typeof zToBackendMergeRepoResponse>
>({ value: true });
