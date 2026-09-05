import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskGetFileResponseInfo,
  zToDiskGetFileResponseInfo
} from './get-file-response-info';
import {
  type ToDiskGetFileResponsePayload,
  zToDiskGetFileResponsePayload
} from './get-file-response-payload';

export type ToDiskGetFileResponse = Extend<
  MyResponse,
  {
    info: ToDiskGetFileResponseInfo;
    payload: ToDiskGetFileResponsePayload;
  }
>;

export let zToDiskGetFileResponse = zMyResponse
  .extend({
    info: zToDiskGetFileResponseInfo,
    payload: zToDiskGetFileResponsePayload
  })
  .meta({ id: 'ToDiskGetFileResponse' });

assertTypesEqual<ToDiskGetFileResponse, z.infer<typeof zToDiskGetFileResponse>>(
  { value: true }
);
