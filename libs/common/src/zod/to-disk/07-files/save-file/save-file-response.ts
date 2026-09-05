import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskSaveFileResponseInfo,
  zToDiskSaveFileResponseInfo
} from './save-file-response-info';
import {
  type ToDiskSaveFileResponsePayload,
  zToDiskSaveFileResponsePayload
} from './save-file-response-payload';

export type ToDiskSaveFileResponse = Extend<
  MyResponse,
  {
    info: ToDiskSaveFileResponseInfo;
    payload: ToDiskSaveFileResponsePayload;
  }
>;

export let zToDiskSaveFileResponse = zMyResponse
  .extend({
    info: zToDiskSaveFileResponseInfo,
    payload: zToDiskSaveFileResponsePayload
  })
  .meta({ id: 'ToDiskSaveFileResponse' });

assertTypesEqual<
  ToDiskSaveFileResponse,
  z.infer<typeof zToDiskSaveFileResponse>
>({ value: true });
