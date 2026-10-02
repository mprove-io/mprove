import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskRevertRepoToRemoteError,
  zToDiskRevertRepoToRemoteError
} from './revert-repo-to-remote-error';
import {
  type ToDiskRevertRepoToRemoteOutput,
  zToDiskRevertRepoToRemoteOutput
} from './revert-repo-to-remote-output';

export type ToDiskRevertRepoToRemoteResponse = ToDiskResponseBase<
  'revertRepoToRemote',
  ToDiskRevertRepoToRemoteOutput,
  ToDiskRevertRepoToRemoteError
>;

export let zToDiskRevertRepoToRemoteResponse = makeToDiskResponseSchema({
  operation: 'revertRepoToRemote',
  output: zToDiskRevertRepoToRemoteOutput,
  error: zToDiskRevertRepoToRemoteError
});

assertTypesEqual<
  ToDiskRevertRepoToRemoteResponse,
  z.infer<typeof zToDiskRevertRepoToRemoteResponse>
>({ value: true });
