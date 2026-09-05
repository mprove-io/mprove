import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskGetCatalogNodesRequestInfo = Extend<
  ToDiskRequestInfo,
  { name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes }
>;

export let zToDiskGetCatalogNodesRequestInfo = zToDiskRequestInfo
  .extend({ name: z.literal(ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes) })
  .meta({ id: 'ToDiskGetCatalogNodesRequestInfo' });

assertTypesEqual<
  ToDiskGetCatalogNodesRequestInfo,
  z.infer<typeof zToDiskGetCatalogNodesRequestInfo>
>({ value: true });
