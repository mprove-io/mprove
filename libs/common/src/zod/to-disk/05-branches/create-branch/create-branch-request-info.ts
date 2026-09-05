import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCreateBranchRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCreateBranch;
  }
>;

export let zToDiskCreateBranchRequestInfo = zToDiskRequestInfo
  .extend({ name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateBranch) })
  .meta({ id: 'ToDiskCreateBranchRequestInfo' });

assertTypesEqual<
  ToDiskCreateBranchRequestInfo,
  z.infer<typeof zToDiskCreateBranchRequestInfo>
>({ value: true });
