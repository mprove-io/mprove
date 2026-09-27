import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCloneTestRepoError,
  zToBackendCloneTestRepoError
} from './clone-test-repo-error';

export type ToBackendCloneTestRepoOutput = Record<string, never>;

export type ToBackendCloneTestRepoResponse = ToBackendResponse<
  ToBackendCloneTestRepoOutput,
  ToBackendCloneTestRepoError
>;

export let zToBackendCloneTestRepoOutput = z
  .object({})
  .meta({ id: 'ToBackendCloneTestRepoOutput' });

export let zToBackendCloneTestRepoResponse = makeToBackendResponseSchema({
  success: zToBackendCloneTestRepoOutput,
  error: zToBackendCloneTestRepoError
}).meta({ id: 'ToBackendCloneTestRepoResponse' });

assertTypesEqual<
  ToBackendCloneTestRepoOutput,
  z.infer<typeof zToBackendCloneTestRepoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCloneTestRepoResponse,
  z.infer<typeof zToBackendCloneTestRepoResponse>
>({ value: true });
