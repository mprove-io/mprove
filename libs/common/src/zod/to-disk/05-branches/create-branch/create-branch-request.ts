import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCreateBranchRequestInfo,
  zToDiskCreateBranchRequestInfo
} from './create-branch-request-info';
import {
  type ToDiskCreateBranchRequestPayload,
  zToDiskCreateBranchRequestPayload
} from './create-branch-request-payload';

export type ToDiskCreateBranchRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCreateBranchRequestInfo;
    payload: ToDiskCreateBranchRequestPayload;
  }
>;

export let zToDiskCreateBranchRequest = zToDiskRequest
  .extend({
    info: zToDiskCreateBranchRequestInfo,
    payload: zToDiskCreateBranchRequestPayload
  })
  .meta({ id: 'ToDiskCreateBranchRequest' });

assertTypesEqual<
  ToDiskCreateBranchRequest,
  z.infer<typeof zToDiskCreateBranchRequest>
>({ value: true });
