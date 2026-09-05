import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCreateFolderRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder;
  }
>;

export let zToDiskCreateFolderRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateFolder)
  })
  .meta({ id: 'ToDiskCreateFolderRequestInfo' });

assertTypesEqual<
  ToDiskCreateFolderRequestInfo,
  z.infer<typeof zToDiskCreateFolderRequestInfo>
>({ value: true });
