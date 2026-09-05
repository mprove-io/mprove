import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskGetCatalogNodesResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskGetCatalogNodesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskGetCatalogNodesResponseInfo' });

assertTypesEqual<
  ToDiskGetCatalogNodesResponseInfo,
  z.infer<typeof zToDiskGetCatalogNodesResponseInfo>
>({ value: true });
