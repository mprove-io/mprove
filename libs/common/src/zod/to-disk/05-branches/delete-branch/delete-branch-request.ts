import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskDeleteBranchRequestInfo,
  zToDiskDeleteBranchRequestInfo
} from './delete-branch-request-info';
import {
  type ToDiskDeleteBranchRequestPayload,
  zToDiskDeleteBranchRequestPayload
} from './delete-branch-request-payload';

export type ToDiskDeleteBranchRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskDeleteBranchRequestInfo;
    payload: ToDiskDeleteBranchRequestPayload;
  }
>;

export let zToDiskDeleteBranchRequest = zToDiskRequest
  .extend({
    info: zToDiskDeleteBranchRequestInfo,
    payload: zToDiskDeleteBranchRequestPayload
  })
  .meta({ id: 'ToDiskDeleteBranchRequest' });

assertTypesEqual<
  ToDiskDeleteBranchRequest,
  z.infer<typeof zToDiskDeleteBranchRequest>
>({ value: true });
