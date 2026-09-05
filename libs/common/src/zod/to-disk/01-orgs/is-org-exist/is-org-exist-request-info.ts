import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskIsOrgExistRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskIsOrgExist;
  }
>;

export let zToDiskIsOrgExistRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskIsOrgExist)
  })
  .meta({ id: 'ToDiskIsOrgExistRequestInfo' });

assertTypesEqual<
  ToDiskIsOrgExistRequestInfo,
  z.infer<typeof zToDiskIsOrgExistRequestInfo>
>({ value: true });
