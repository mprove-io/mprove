import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskMoveCatalogNodeResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskMoveCatalogNodeResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskMoveCatalogNodeResponseInfo' });

assertTypesEqual<
  ToDiskMoveCatalogNodeResponseInfo,
  z.infer<typeof zToDiskMoveCatalogNodeResponseInfo>
>({ value: true });
