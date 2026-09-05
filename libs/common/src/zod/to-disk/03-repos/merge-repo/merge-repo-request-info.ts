import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskMergeRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskMergeRepo;
  }
>;

export let zToDiskMergeRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskMergeRepo)
  })
  .meta({ id: 'ToDiskMergeRepoRequestInfo' });

assertTypesEqual<
  ToDiskMergeRepoRequestInfo,
  z.infer<typeof zToDiskMergeRepoRequestInfo>
>({ value: true });
