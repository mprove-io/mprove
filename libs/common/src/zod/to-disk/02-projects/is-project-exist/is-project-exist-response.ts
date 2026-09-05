import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskIsProjectExistResponseInfo,
  zToDiskIsProjectExistResponseInfo
} from './is-project-exist-response-info';
import {
  type ToDiskIsProjectExistResponsePayload,
  zToDiskIsProjectExistResponsePayload
} from './is-project-exist-response-payload';

export type ToDiskIsProjectExistResponse = Extend<
  MyResponse,
  {
    info: ToDiskIsProjectExistResponseInfo;
    payload: ToDiskIsProjectExistResponsePayload;
  }
>;

export let zToDiskIsProjectExistResponse = zMyResponse
  .extend({
    info: zToDiskIsProjectExistResponseInfo,
    payload: zToDiskIsProjectExistResponsePayload
  })
  .meta({ id: 'ToDiskIsProjectExistResponse' });

assertTypesEqual<
  ToDiskIsProjectExistResponse,
  z.infer<typeof zToDiskIsProjectExistResponse>
>({ value: true });
