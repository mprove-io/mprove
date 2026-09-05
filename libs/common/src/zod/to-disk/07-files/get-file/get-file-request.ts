import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskGetFileRequestInfo,
  zToDiskGetFileRequestInfo
} from './get-file-request-info';
import {
  type ToDiskGetFileRequestPayload,
  zToDiskGetFileRequestPayload
} from './get-file-request-payload';

export type ToDiskGetFileRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskGetFileRequestInfo;
    payload: ToDiskGetFileRequestPayload;
  }
>;

export let zToDiskGetFileRequest = zToDiskRequest
  .extend({
    info: zToDiskGetFileRequestInfo,
    payload: zToDiskGetFileRequestPayload
  })
  .meta({ id: 'ToDiskGetFileRequest' });

assertTypesEqual<ToDiskGetFileRequest, z.infer<typeof zToDiskGetFileRequest>>({
  value: true
});
