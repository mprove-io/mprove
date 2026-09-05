import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskRenameCatalogNodeRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode;
  }
>;

export let zToDiskRenameCatalogNodeRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode)
  })
  .meta({ id: 'ToDiskRenameCatalogNodeRequestInfo' });

assertTypesEqual<
  ToDiskRenameCatalogNodeRequestInfo,
  z.infer<typeof zToDiskRenameCatalogNodeRequestInfo>
>({ value: true });
