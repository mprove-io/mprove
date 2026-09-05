import { z } from 'zod';
import { METHOD_RPC } from '#common/constants/top';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToDiskRenameCatalogNodeResponseInfo = Extend<
  ResponseInfo,
  {
    path: ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode;
    method: typeof METHOD_RPC;
  }
>;

export let zToDiskRenameCatalogNodeResponseInfo = zResponseInfo
  .extend({
    path: z.literal(ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode),
    method: z.literal(METHOD_RPC)
  })
  .meta({ id: 'ToDiskRenameCatalogNodeResponseInfo' });

assertTypesEqual<
  ToDiskRenameCatalogNodeResponseInfo,
  z.infer<typeof zToDiskRenameCatalogNodeResponseInfo>
>({ value: true });
