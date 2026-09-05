import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCreateFileRequestInfo,
  zToDiskCreateFileRequestInfo
} from './create-file-request-info';
import {
  type ToDiskCreateFileRequestPayload,
  zToDiskCreateFileRequestPayload
} from './create-file-request-payload';

export type ToDiskCreateFileRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCreateFileRequestInfo;
    payload: ToDiskCreateFileRequestPayload;
  }
>;

export let zToDiskCreateFileRequest = zToDiskRequest
  .extend({
    info: zToDiskCreateFileRequestInfo,
    payload: zToDiskCreateFileRequestPayload
  })
  .meta({ id: 'ToDiskCreateFileRequest' });

assertTypesEqual<
  ToDiskCreateFileRequest,
  z.infer<typeof zToDiskCreateFileRequest>
>({ value: true });
