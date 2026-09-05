import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskDeleteBranchRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch;
  }
>;

export let zToDiskDeleteBranchRequestInfo = zToDiskRequestInfo
  .extend({ name: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteBranch) })
  .meta({ id: 'ToDiskDeleteBranchRequestInfo' });

assertTypesEqual<
  ToDiskDeleteBranchRequestInfo,
  z.infer<typeof zToDiskDeleteBranchRequestInfo>
>({ value: true });
