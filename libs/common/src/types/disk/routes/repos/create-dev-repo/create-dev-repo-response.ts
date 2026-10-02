import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskCreateDevRepoError,
  zToDiskCreateDevRepoError
} from './create-dev-repo-error';
import {
  type ToDiskCreateDevRepoOutput,
  zToDiskCreateDevRepoOutput
} from './create-dev-repo-output';

export type ToDiskCreateDevRepoResponse = ToDiskResponseBase<
  'createDevRepo',
  ToDiskCreateDevRepoOutput,
  ToDiskCreateDevRepoError
>;

export let zToDiskCreateDevRepoResponse = makeToDiskResponseSchema({
  operation: 'createDevRepo',
  output: zToDiskCreateDevRepoOutput,
  error: zToDiskCreateDevRepoError
});

assertTypesEqual<
  ToDiskCreateDevRepoResponse,
  z.infer<typeof zToDiskCreateDevRepoResponse>
>({ value: true });
