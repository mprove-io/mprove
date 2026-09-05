import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskDeleteFolderResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskDeleteFolder;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskDeleteFolderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteFolder),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskDeleteFolderResponseInfo' });

assertTypesEqual<
  ToDiskDeleteFolderResponseInfo,
  z.infer<typeof zToDiskDeleteFolderResponseInfo>
>({ value: true });
