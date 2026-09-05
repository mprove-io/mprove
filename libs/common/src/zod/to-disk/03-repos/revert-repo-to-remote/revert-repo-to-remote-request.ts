import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskRevertRepoToRemoteRequestInfo,
  zToDiskRevertRepoToRemoteRequestInfo
} from './revert-repo-to-remote-request-info';
import {
  type ToDiskRevertRepoToRemoteRequestPayload,
  zToDiskRevertRepoToRemoteRequestPayload
} from './revert-repo-to-remote-request-payload';

export type ToDiskRevertRepoToRemoteRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskRevertRepoToRemoteRequestInfo;
    payload: ToDiskRevertRepoToRemoteRequestPayload;
  }
>;

export let zToDiskRevertRepoToRemoteRequest = zToDiskRequest
  .extend({
    info: zToDiskRevertRepoToRemoteRequestInfo,
    payload: zToDiskRevertRepoToRemoteRequestPayload
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteRequest' });

assertTypesEqual<
  ToDiskRevertRepoToRemoteRequest,
  z.infer<typeof zToDiskRevertRepoToRemoteRequest>
>({ value: true });
