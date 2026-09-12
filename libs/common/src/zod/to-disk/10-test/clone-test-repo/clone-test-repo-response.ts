import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskCloneTestRepoError,
  zToDiskCloneTestRepoError
} from './clone-test-repo-error';

export type ToDiskCloneTestRepoOutput = Record<string, never>;

export type ToDiskCloneTestRepoResponse = ToDiskResponse<
  'cloneTestRepo',
  ToDiskCloneTestRepoOutput,
  ToDiskCloneTestRepoError
>;

export let zToDiskCloneTestRepoResponse = makeToDiskResponseSchema({
  operation: 'cloneTestRepo',
  success: z.object({}).meta({ id: 'ToDiskCloneTestRepoOutput' }),
  error: zToDiskCloneTestRepoError
});

assertTypesEqual<
  ToDiskCloneTestRepoResponse,
  z.infer<typeof zToDiskCloneTestRepoResponse>
>({ value: true });
