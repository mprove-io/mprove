import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskIsBranchExistResponseInfo,
  zToDiskIsBranchExistResponseInfo
} from './is-branch-exist-response-info';
import {
  type ToDiskIsBranchExistResponsePayload,
  zToDiskIsBranchExistResponsePayload
} from './is-branch-exist-response-payload';

export type ToDiskIsBranchExistResponse = Extend<
  MyResponse,
  {
    info: ToDiskIsBranchExistResponseInfo;
    payload: ToDiskIsBranchExistResponsePayload;
  }
>;

export let zToDiskIsBranchExistResponse = zMyResponse
  .extend({
    info: zToDiskIsBranchExistResponseInfo,
    payload: zToDiskIsBranchExistResponsePayload
  })
  .meta({ id: 'ToDiskIsBranchExistResponse' });

assertTypesEqual<
  ToDiskIsBranchExistResponse,
  z.infer<typeof zToDiskIsBranchExistResponse>
>({ value: true });
