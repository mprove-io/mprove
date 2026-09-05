import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskGetCatalogFilesRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles;
  }
>;

export let zToDiskGetCatalogFilesRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles)
  })
  .meta({ id: 'ToDiskGetCatalogFilesRequestInfo' });

assertTypesEqual<
  ToDiskGetCatalogFilesRequestInfo,
  z.infer<typeof zToDiskGetCatalogFilesRequestInfo>
>({ value: true });
