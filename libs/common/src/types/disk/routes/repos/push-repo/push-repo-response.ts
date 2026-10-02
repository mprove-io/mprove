import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskPushRepoError,
  zToDiskPushRepoError
} from './push-repo-error';
import {
  type ToDiskPushRepoOutput,
  zToDiskPushRepoOutput
} from './push-repo-output';

export type ToDiskPushRepoResponse = ToDiskResponseBase<
  'pushRepo',
  ToDiskPushRepoOutput,
  ToDiskPushRepoError
>;

export let zToDiskPushRepoResponse = makeToDiskResponseSchema({
  operation: 'pushRepo',
  output: zToDiskPushRepoOutput,
  error: zToDiskPushRepoError
});

assertTypesEqual<
  ToDiskPushRepoResponse,
  z.infer<typeof zToDiskPushRepoResponse>
>({ value: true });
