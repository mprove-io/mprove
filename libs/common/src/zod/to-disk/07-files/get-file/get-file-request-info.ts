import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskGetFileRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskGetFile;
  }
>;

export let zToDiskGetFileRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskGetFile)
  })
  .meta({ id: 'ToDiskGetFileRequestInfo' });

assertTypesEqual<
  ToDiskGetFileRequestInfo,
  z.infer<typeof zToDiskGetFileRequestInfo>
>({ value: true });
