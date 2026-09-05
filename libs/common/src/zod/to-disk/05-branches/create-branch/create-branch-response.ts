import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCreateBranchResponseInfo,
  zToDiskCreateBranchResponseInfo
} from './create-branch-response-info';
import {
  type ToDiskCreateBranchResponsePayload,
  zToDiskCreateBranchResponsePayload
} from './create-branch-response-payload';

export type ToDiskCreateBranchResponse = Extend<
  MyResponse,
  {
    info: ToDiskCreateBranchResponseInfo;
    payload: ToDiskCreateBranchResponsePayload;
  }
>;

export let zToDiskCreateBranchResponse = zMyResponse
  .extend({
    info: zToDiskCreateBranchResponseInfo,
    payload: zToDiskCreateBranchResponsePayload
  })
  .meta({ id: 'ToDiskCreateBranchResponse' });

assertTypesEqual<
  ToDiskCreateBranchResponse,
  z.infer<typeof zToDiskCreateBranchResponse>
>({ value: true });
