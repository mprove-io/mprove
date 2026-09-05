import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskIsBranchExistRequestInfo,
  zToDiskIsBranchExistRequestInfo
} from './is-branch-exist-request-info';
import {
  type ToDiskIsBranchExistRequestPayload,
  zToDiskIsBranchExistRequestPayload
} from './is-branch-exist-request-payload';

export type ToDiskIsBranchExistRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskIsBranchExistRequestInfo;
    payload: ToDiskIsBranchExistRequestPayload;
  }
>;

export let zToDiskIsBranchExistRequest = zToDiskRequest
  .extend({
    info: zToDiskIsBranchExistRequestInfo,
    payload: zToDiskIsBranchExistRequestPayload
  })
  .meta({ id: 'ToDiskIsBranchExistRequest' });

assertTypesEqual<
  ToDiskIsBranchExistRequest,
  z.infer<typeof zToDiskIsBranchExistRequest>
>({ value: true });
