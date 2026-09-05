import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskDeleteFolderRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskDeleteFolder;
  }
>;

export let zToDiskDeleteFolderRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteFolder)
  })
  .meta({ id: 'ToDiskDeleteFolderRequestInfo' });

assertTypesEqual<
  ToDiskDeleteFolderRequestInfo,
  z.infer<typeof zToDiskDeleteFolderRequestInfo>
>({ value: true });
