import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskPullRepoError,
  zToDiskPullRepoError
} from './pull-repo-error';
import {
  type ToDiskPullRepoOutput,
  zToDiskPullRepoOutput
} from './pull-repo-output';

export type ToDiskPullRepoResponse = ToDiskResponseBase<
  'pullRepo',
  ToDiskPullRepoOutput,
  ToDiskPullRepoError
>;

export let zToDiskPullRepoResponse = makeToDiskResponseSchema({
  operation: 'pullRepo',
  output: zToDiskPullRepoOutput,
  error: zToDiskPullRepoError
});

assertTypesEqual<
  ToDiskPullRepoResponse,
  z.infer<typeof zToDiskPullRepoResponse>
>({ value: true });
