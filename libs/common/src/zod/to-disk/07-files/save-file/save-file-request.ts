import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskSaveFileRequestInfo,
  zToDiskSaveFileRequestInfo
} from './save-file-request-info';
import {
  type ToDiskSaveFileRequestPayload,
  zToDiskSaveFileRequestPayload
} from './save-file-request-payload';

export type ToDiskSaveFileRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskSaveFileRequestInfo;
    payload: ToDiskSaveFileRequestPayload;
  }
>;

export let zToDiskSaveFileRequest = zToDiskRequest
  .extend({
    info: zToDiskSaveFileRequestInfo,
    payload: zToDiskSaveFileRequestPayload
  })
  .meta({ id: 'ToDiskSaveFileRequest' });

assertTypesEqual<ToDiskSaveFileRequest, z.infer<typeof zToDiskSaveFileRequest>>(
  { value: true }
);
