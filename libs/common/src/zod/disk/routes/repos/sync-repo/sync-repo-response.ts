import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskSyncRepoError,
  zToDiskSyncRepoError
} from './sync-repo-error';
import {
  type ToDiskSyncRepoOutput,
  zToDiskSyncRepoOutput
} from './sync-repo-output';

export type ToDiskSyncRepoResponse = ToDiskResponseBase<
  'syncRepo',
  ToDiskSyncRepoOutput,
  ToDiskSyncRepoError
>;

export let zToDiskSyncRepoResponse = makeToDiskResponseSchema({
  operation: 'syncRepo',
  output: zToDiskSyncRepoOutput,
  error: zToDiskSyncRepoError
});

assertTypesEqual<
  ToDiskSyncRepoResponse,
  z.infer<typeof zToDiskSyncRepoResponse>
>({ value: true });
