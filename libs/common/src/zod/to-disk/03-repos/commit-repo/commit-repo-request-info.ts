import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCommitRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo;
  }
>;

export let zToDiskCommitRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCommitRepo)
  })
  .meta({ id: 'ToDiskCommitRepoRequestInfo' });

assertTypesEqual<
  ToDiskCommitRepoRequestInfo,
  z.infer<typeof zToDiskCommitRepoRequestInfo>
>({ value: true });
