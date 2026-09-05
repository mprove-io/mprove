import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyRequest, zMyRequest } from '#common/zod/to/my-request';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskRequest = Extend<
  MyRequest,
  {
    info: ToDiskRequestInfo;
  }
>;

export let zToDiskRequest = zMyRequest
  .extend({
    info: zToDiskRequestInfo
  })
  .meta({ id: 'ToDiskRequest' });

assertTypesEqual<ToDiskRequest, z.infer<typeof zToDiskRequest>>({
  value: true
});
