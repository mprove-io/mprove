import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskDeleteFolderRequestInfo,
  zToDiskDeleteFolderRequestInfo
} from './delete-folder-request-info';
import {
  type ToDiskDeleteFolderRequestPayload,
  zToDiskDeleteFolderRequestPayload
} from './delete-folder-request-payload';

export type ToDiskDeleteFolderRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskDeleteFolderRequestInfo;
    payload: ToDiskDeleteFolderRequestPayload;
  }
>;

export let zToDiskDeleteFolderRequest = zToDiskRequest
  .extend({
    info: zToDiskDeleteFolderRequestInfo,
    payload: zToDiskDeleteFolderRequestPayload
  })
  .meta({ id: 'ToDiskDeleteFolderRequest' });

assertTypesEqual<
  ToDiskDeleteFolderRequest,
  z.infer<typeof zToDiskDeleteFolderRequest>
>({ value: true });
