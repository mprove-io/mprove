import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCloneTestRepoOutput,
  zToBackendCloneTestRepoOutput
} from '#common/zod/backend/routes/test-routes/clone-test-repo/clone-test-repo-output';
import {
  type ToBackendCloneTestRepoError,
  zToBackendCloneTestRepoError
} from './clone-test-repo-error';

export type ToBackendCloneTestRepoResponse = ToBackendResponseBase<
  'cloneTestRepo',
  ToBackendCloneTestRepoOutput,
  ToBackendCloneTestRepoError
>;

export let zToBackendCloneTestRepoResponse = makeToBackendResponseSchema({
  operation: 'cloneTestRepo',
  output: zToBackendCloneTestRepoOutput,
  error: zToBackendCloneTestRepoError
}).meta({ id: 'ToBackendCloneTestRepoResponse' });

assertTypesEqual<
  ToBackendCloneTestRepoResponse,
  z.infer<typeof zToBackendCloneTestRepoResponse>
>({ value: true });
