import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskCloneTestRepoError,
  zToDiskCloneTestRepoError
} from './clone-test-repo-error';

export type ToDiskCloneTestRepoResponse = ToDiskResponseBase<
  'cloneTestRepo',
  ToDiskCloneTestRepoOutput,
  ToDiskCloneTestRepoError
>;

export type ToDiskCloneTestRepoOutput = Record<string, never>;

export let zToDiskCloneTestRepoOutput = z
  .object({})
  .meta({ id: 'ToDiskCloneTestRepoOutput' });

export let zToDiskCloneTestRepoResponse = makeToDiskResponseSchema({
  operation: 'cloneTestRepo',
  output: zToDiskCloneTestRepoOutput,
  error: zToDiskCloneTestRepoError
});

assertTypesEqual<
  ToDiskCloneTestRepoOutput,
  z.infer<typeof zToDiskCloneTestRepoOutput>
>({ value: true });

assertTypesEqual<
  ToDiskCloneTestRepoResponse,
  z.infer<typeof zToDiskCloneTestRepoResponse>
>({ value: true });
