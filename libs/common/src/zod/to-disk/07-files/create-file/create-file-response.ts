import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCreateFileResponseInfo,
  zToDiskCreateFileResponseInfo
} from './create-file-response-info';
import {
  type ToDiskCreateFileResponsePayload,
  zToDiskCreateFileResponsePayload
} from './create-file-response-payload';

export type ToDiskCreateFileResponse = Extend<
  MyResponse,
  {
    info: ToDiskCreateFileResponseInfo;
    payload: ToDiskCreateFileResponsePayload;
  }
>;

export let zToDiskCreateFileResponse = zMyResponse
  .extend({
    info: zToDiskCreateFileResponseInfo,
    payload: zToDiskCreateFileResponsePayload
  })
  .meta({ id: 'ToDiskCreateFileResponse' });

assertTypesEqual<
  ToDiskCreateFileResponse,
  z.infer<typeof zToDiskCreateFileResponse>
>({ value: true });
