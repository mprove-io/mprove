import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCreateOrgRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCreateOrg;
  }
>;

export let zToDiskCreateOrgRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateOrg)
  })
  .meta({ id: 'ToDiskCreateOrgRequestInfo' });

assertTypesEqual<
  ToDiskCreateOrgRequestInfo,
  z.infer<typeof zToDiskCreateOrgRequestInfo>
>({ value: true });
