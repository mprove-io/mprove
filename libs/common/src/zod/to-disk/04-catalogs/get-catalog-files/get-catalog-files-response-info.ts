import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskGetCatalogFilesResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskGetCatalogFilesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskGetCatalogFilesResponseInfo' });

assertTypesEqual<
  ToDiskGetCatalogFilesResponseInfo,
  z.infer<typeof zToDiskGetCatalogFilesResponseInfo>
>({ value: true });
