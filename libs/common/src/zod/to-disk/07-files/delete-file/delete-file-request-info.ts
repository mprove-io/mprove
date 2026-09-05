import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskDeleteFileRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskDeleteFile;
  }
>;

export let zToDiskDeleteFileRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteFile)
  })
  .meta({ id: 'ToDiskDeleteFileRequestInfo' });

assertTypesEqual<
  ToDiskDeleteFileRequestInfo,
  z.infer<typeof zToDiskDeleteFileRequestInfo>
>({ value: true });
