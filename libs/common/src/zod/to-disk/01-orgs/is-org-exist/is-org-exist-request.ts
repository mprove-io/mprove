import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskIsOrgExistRequestInfo,
  zToDiskIsOrgExistRequestInfo
} from './is-org-exist-request-info';
import {
  type ToDiskIsOrgExistRequestPayload,
  zToDiskIsOrgExistRequestPayload
} from './is-org-exist-request-payload';

export type ToDiskIsOrgExistRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskIsOrgExistRequestInfo;
    payload: ToDiskIsOrgExistRequestPayload;
  }
>;

export let zToDiskIsOrgExistRequest = zToDiskRequest
  .extend({
    info: zToDiskIsOrgExistRequestInfo,
    payload: zToDiskIsOrgExistRequestPayload
  })
  .meta({ id: 'ToDiskIsOrgExistRequest' });

assertTypesEqual<
  ToDiskIsOrgExistRequest,
  z.infer<typeof zToDiskIsOrgExistRequest>
>({ value: true });
