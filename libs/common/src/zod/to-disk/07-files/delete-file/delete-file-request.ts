import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskDeleteFileRequestInfo,
  zToDiskDeleteFileRequestInfo
} from './delete-file-request-info';
import {
  type ToDiskDeleteFileRequestPayload,
  zToDiskDeleteFileRequestPayload
} from './delete-file-request-payload';

export type ToDiskDeleteFileRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskDeleteFileRequestInfo;
    payload: ToDiskDeleteFileRequestPayload;
  }
>;

export let zToDiskDeleteFileRequest = zToDiskRequest
  .extend({
    info: zToDiskDeleteFileRequestInfo,
    payload: zToDiskDeleteFileRequestPayload
  })
  .meta({ id: 'ToDiskDeleteFileRequest' });

assertTypesEqual<
  ToDiskDeleteFileRequest,
  z.infer<typeof zToDiskDeleteFileRequest>
>({ value: true });
