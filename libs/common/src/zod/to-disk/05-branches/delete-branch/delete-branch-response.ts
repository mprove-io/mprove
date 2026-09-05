import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskDeleteBranchResponseInfo,
  zToDiskDeleteBranchResponseInfo
} from './delete-branch-response-info';
import {
  type ToDiskDeleteBranchResponsePayload,
  zToDiskDeleteBranchResponsePayload
} from './delete-branch-response-payload';

export type ToDiskDeleteBranchResponse = Extend<
  MyResponse,
  {
    info: ToDiskDeleteBranchResponseInfo;
    payload: ToDiskDeleteBranchResponsePayload;
  }
>;

export let zToDiskDeleteBranchResponse = zMyResponse
  .extend({
    info: zToDiskDeleteBranchResponseInfo,
    payload: zToDiskDeleteBranchResponsePayload
  })
  .meta({ id: 'ToDiskDeleteBranchResponse' });

assertTypesEqual<
  ToDiskDeleteBranchResponse,
  z.infer<typeof zToDiskDeleteBranchResponse>
>({ value: true });
