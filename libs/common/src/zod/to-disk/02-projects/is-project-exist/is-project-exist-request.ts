import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskIsProjectExistRequestInfo,
  zToDiskIsProjectExistRequestInfo
} from './is-project-exist-request-info';
import {
  type ToDiskIsProjectExistRequestPayload,
  zToDiskIsProjectExistRequestPayload
} from './is-project-exist-request-payload';

export type ToDiskIsProjectExistRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskIsProjectExistRequestInfo;
    payload: ToDiskIsProjectExistRequestPayload;
  }
>;

export let zToDiskIsProjectExistRequest = zToDiskRequest
  .extend({
    info: zToDiskIsProjectExistRequestInfo,
    payload: zToDiskIsProjectExistRequestPayload
  })
  .meta({ id: 'ToDiskIsProjectExistRequest' });

assertTypesEqual<
  ToDiskIsProjectExistRequest,
  z.infer<typeof zToDiskIsProjectExistRequest>
>({ value: true });
