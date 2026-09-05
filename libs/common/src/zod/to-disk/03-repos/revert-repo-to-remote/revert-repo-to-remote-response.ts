import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskRevertRepoToRemoteResponseInfo,
  zToDiskRevertRepoToRemoteResponseInfo
} from './revert-repo-to-remote-response-info';
import {
  type ToDiskRevertRepoToRemoteResponsePayload,
  zToDiskRevertRepoToRemoteResponsePayload
} from './revert-repo-to-remote-response-payload';

export type ToDiskRevertRepoToRemoteResponse = Extend<
  MyResponse,
  {
    info: ToDiskRevertRepoToRemoteResponseInfo;
    payload: ToDiskRevertRepoToRemoteResponsePayload;
  }
>;

export let zToDiskRevertRepoToRemoteResponse = zMyResponse
  .extend({
    info: zToDiskRevertRepoToRemoteResponseInfo,
    payload: zToDiskRevertRepoToRemoteResponsePayload
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteResponse' });

assertTypesEqual<
  ToDiskRevertRepoToRemoteResponse,
  z.infer<typeof zToDiskRevertRepoToRemoteResponse>
>({ value: true });
