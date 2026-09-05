import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskRevertRepoToLastCommitResponseInfo,
  zToDiskRevertRepoToLastCommitResponseInfo
} from './revert-repo-to-last-commit-response-info';
import {
  type ToDiskRevertRepoToLastCommitResponsePayload,
  zToDiskRevertRepoToLastCommitResponsePayload
} from './revert-repo-to-last-commit-response-payload';

export type ToDiskRevertRepoToLastCommitResponse = Extend<
  MyResponse,
  {
    info: ToDiskRevertRepoToLastCommitResponseInfo;
    payload: ToDiskRevertRepoToLastCommitResponsePayload;
  }
>;

export let zToDiskRevertRepoToLastCommitResponse = zMyResponse
  .extend({
    info: zToDiskRevertRepoToLastCommitResponseInfo,
    payload: zToDiskRevertRepoToLastCommitResponsePayload
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitResponse' });

assertTypesEqual<
  ToDiskRevertRepoToLastCommitResponse,
  z.infer<typeof zToDiskRevertRepoToLastCommitResponse>
>({ value: true });
