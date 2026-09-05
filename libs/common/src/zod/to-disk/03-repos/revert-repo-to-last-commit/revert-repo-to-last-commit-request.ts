import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskRevertRepoToLastCommitRequestInfo,
  zToDiskRevertRepoToLastCommitRequestInfo
} from './revert-repo-to-last-commit-request-info';
import {
  type ToDiskRevertRepoToLastCommitRequestPayload,
  zToDiskRevertRepoToLastCommitRequestPayload
} from './revert-repo-to-last-commit-request-payload';

export type ToDiskRevertRepoToLastCommitRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskRevertRepoToLastCommitRequestInfo;
    payload: ToDiskRevertRepoToLastCommitRequestPayload;
  }
>;

export let zToDiskRevertRepoToLastCommitRequest = zToDiskRequest
  .extend({
    info: zToDiskRevertRepoToLastCommitRequestInfo,
    payload: zToDiskRevertRepoToLastCommitRequestPayload
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitRequest' });

assertTypesEqual<
  ToDiskRevertRepoToLastCommitRequest,
  z.infer<typeof zToDiskRevertRepoToLastCommitRequest>
>({ value: true });
