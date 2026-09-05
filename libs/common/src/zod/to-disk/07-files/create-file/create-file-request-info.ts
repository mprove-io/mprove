import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCreateFileRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCreateFile;
  }
>;

export let zToDiskCreateFileRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateFile)
  })
  .meta({ id: 'ToDiskCreateFileRequestInfo' });

assertTypesEqual<
  ToDiskCreateFileRequestInfo,
  z.infer<typeof zToDiskCreateFileRequestInfo>
>({ value: true });
