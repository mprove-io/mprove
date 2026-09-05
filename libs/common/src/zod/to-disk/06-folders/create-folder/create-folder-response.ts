import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCreateFolderResponseInfo,
  zToDiskCreateFolderResponseInfo
} from './create-folder-response-info';
import {
  type ToDiskCreateFolderResponsePayload,
  zToDiskCreateFolderResponsePayload
} from './create-folder-response-payload';

export type ToDiskCreateFolderResponse = Extend<
  MyResponse,
  {
    info: ToDiskCreateFolderResponseInfo;
    payload: ToDiskCreateFolderResponsePayload;
  }
>;

export let zToDiskCreateFolderResponse = zMyResponse
  .extend({
    info: zToDiskCreateFolderResponseInfo,
    payload: zToDiskCreateFolderResponsePayload
  })
  .meta({ id: 'ToDiskCreateFolderResponse' });

assertTypesEqual<
  ToDiskCreateFolderResponse,
  z.infer<typeof zToDiskCreateFolderResponse>
>({ value: true });
