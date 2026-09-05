import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskDeleteFolderResponseInfo,
  zToDiskDeleteFolderResponseInfo
} from './delete-folder-response-info';
import {
  type ToDiskDeleteFolderResponsePayload,
  zToDiskDeleteFolderResponsePayload
} from './delete-folder-response-payload';

export type ToDiskDeleteFolderResponse = Extend<
  MyResponse,
  {
    info: ToDiskDeleteFolderResponseInfo;
    payload: ToDiskDeleteFolderResponsePayload;
  }
>;

export let zToDiskDeleteFolderResponse = zMyResponse
  .extend({
    info: zToDiskDeleteFolderResponseInfo,
    payload: zToDiskDeleteFolderResponsePayload
  })
  .meta({ id: 'ToDiskDeleteFolderResponse' });

assertTypesEqual<
  ToDiskDeleteFolderResponse,
  z.infer<typeof zToDiskDeleteFolderResponse>
>({ value: true });
