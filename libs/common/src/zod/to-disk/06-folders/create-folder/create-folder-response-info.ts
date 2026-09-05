import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskCreateFolderResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskCreateFolder;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskCreateFolderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateFolder),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskCreateFolderResponseInfo' });

assertTypesEqual<
  ToDiskCreateFolderResponseInfo,
  z.infer<typeof zToDiskCreateFolderResponseInfo>
>({ value: true });
