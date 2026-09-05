import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskIsBranchExistRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskIsBranchExist;
  }
>;

export let zToDiskIsBranchExistRequestInfo = zToDiskRequestInfo
  .extend({ name: z.literal(ToDiskRequestInfoNameEnum.ToDiskIsBranchExist) })
  .meta({ id: 'ToDiskIsBranchExistRequestInfo' });

assertTypesEqual<
  ToDiskIsBranchExistRequestInfo,
  z.infer<typeof zToDiskIsBranchExistRequestInfo>
>({ value: true });
