import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskMergeRepoError,
  zToDiskMergeRepoError
} from './merge-repo-error';
import {
  type ToDiskMergeRepoOutput,
  zToDiskMergeRepoOutput
} from './merge-repo-output';

export type ToDiskMergeRepoResponse = ToDiskResponseBase<
  'mergeRepo',
  ToDiskMergeRepoOutput,
  ToDiskMergeRepoError
>;

export let zToDiskMergeRepoResponse = makeToDiskResponseSchema({
  operation: 'mergeRepo',
  output: zToDiskMergeRepoOutput,
  error: zToDiskMergeRepoError
});

assertTypesEqual<
  ToDiskMergeRepoResponse,
  z.infer<typeof zToDiskMergeRepoResponse>
>({ value: true });
