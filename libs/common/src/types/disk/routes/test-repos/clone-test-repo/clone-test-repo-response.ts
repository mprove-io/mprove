import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskCloneTestRepoError,
  zToDiskCloneTestRepoError
} from './clone-test-repo-error';
import {
  type ToDiskCloneTestRepoOutput,
  zToDiskCloneTestRepoOutput
} from './clone-test-repo-output';

export type ToDiskCloneTestRepoResponse = ToDiskResponseBase<
  'cloneTestRepo',
  ToDiskCloneTestRepoOutput,
  ToDiskCloneTestRepoError
>;

export let zToDiskCloneTestRepoResponse = makeToDiskResponseSchema({
  operation: 'cloneTestRepo',
  output: zToDiskCloneTestRepoOutput,
  error: zToDiskCloneTestRepoError
});

assertTypesEqual<
  ToDiskCloneTestRepoResponse,
  z.infer<typeof zToDiskCloneTestRepoResponse>
>({ value: true });
