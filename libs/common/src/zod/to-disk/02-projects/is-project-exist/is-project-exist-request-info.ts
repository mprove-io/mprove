import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskIsProjectExistRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskIsProjectExist;
  }
>;

export let zToDiskIsProjectExistRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskIsProjectExist)
  })
  .meta({ id: 'ToDiskIsProjectExistRequestInfo' });

assertTypesEqual<
  ToDiskIsProjectExistRequestInfo,
  z.infer<typeof zToDiskIsProjectExistRequestInfo>
>({ value: true });
