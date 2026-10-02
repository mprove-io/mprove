import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteDevRepoError,
  zToDiskDeleteDevRepoError
} from './delete-dev-repo-error';
import {
  type ToDiskDeleteDevRepoOutput,
  zToDiskDeleteDevRepoOutput
} from './delete-dev-repo-output';

export type ToDiskDeleteDevRepoResponse = ToDiskResponseBase<
  'deleteDevRepo',
  ToDiskDeleteDevRepoOutput,
  ToDiskDeleteDevRepoError
>;

export let zToDiskDeleteDevRepoResponse = makeToDiskResponseSchema({
  operation: 'deleteDevRepo',
  output: zToDiskDeleteDevRepoOutput,
  error: zToDiskDeleteDevRepoError
});

assertTypesEqual<
  ToDiskDeleteDevRepoResponse,
  z.infer<typeof zToDiskDeleteDevRepoResponse>
>({ value: true });
