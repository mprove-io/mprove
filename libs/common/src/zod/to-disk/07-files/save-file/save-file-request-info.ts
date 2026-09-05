import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskSaveFileRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskSaveFile;
  }
>;

export let zToDiskSaveFileRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskSaveFile)
  })
  .meta({ id: 'ToDiskSaveFileRequestInfo' });

assertTypesEqual<
  ToDiskSaveFileRequestInfo,
  z.infer<typeof zToDiskSaveFileRequestInfo>
>({ value: true });
