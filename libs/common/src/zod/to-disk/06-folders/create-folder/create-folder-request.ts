import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCreateFolderRequestInfo,
  zToDiskCreateFolderRequestInfo
} from './create-folder-request-info';
import {
  type ToDiskCreateFolderRequestPayload,
  zToDiskCreateFolderRequestPayload
} from './create-folder-request-payload';

export type ToDiskCreateFolderRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCreateFolderRequestInfo;
    payload: ToDiskCreateFolderRequestPayload;
  }
>;

export let zToDiskCreateFolderRequest = zToDiskRequest
  .extend({
    info: zToDiskCreateFolderRequestInfo,
    payload: zToDiskCreateFolderRequestPayload
  })
  .meta({ id: 'ToDiskCreateFolderRequest' });

assertTypesEqual<
  ToDiskCreateFolderRequest,
  z.infer<typeof zToDiskCreateFolderRequest>
>({ value: true });
