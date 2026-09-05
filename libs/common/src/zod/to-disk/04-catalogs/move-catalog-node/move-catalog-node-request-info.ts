import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskMoveCatalogNodeRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode;
  }
>;

export let zToDiskMoveCatalogNodeRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode)
  })
  .meta({ id: 'ToDiskMoveCatalogNodeRequestInfo' });

assertTypesEqual<
  ToDiskMoveCatalogNodeRequestInfo,
  z.infer<typeof zToDiskMoveCatalogNodeRequestInfo>
>({ value: true });
