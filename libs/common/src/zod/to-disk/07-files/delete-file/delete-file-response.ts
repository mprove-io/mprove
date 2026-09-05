import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskDeleteFileResponseInfo,
  zToDiskDeleteFileResponseInfo
} from './delete-file-response-info';
import {
  type ToDiskDeleteFileResponsePayload,
  zToDiskDeleteFileResponsePayload
} from './delete-file-response-payload';

export type ToDiskDeleteFileResponse = Extend<
  MyResponse,
  {
    info: ToDiskDeleteFileResponseInfo;
    payload: ToDiskDeleteFileResponsePayload;
  }
>;

export let zToDiskDeleteFileResponse = zMyResponse
  .extend({
    info: zToDiskDeleteFileResponseInfo,
    payload: zToDiskDeleteFileResponsePayload
  })
  .meta({ id: 'ToDiskDeleteFileResponse' });

assertTypesEqual<
  ToDiskDeleteFileResponse,
  z.infer<typeof zToDiskDeleteFileResponse>
>({ value: true });
