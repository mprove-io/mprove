import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCloneTestRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCloneTestRepo;
  }
>;

export let zToDiskCloneTestRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCloneTestRepo)
  })
  .meta({ id: 'ToDiskCloneTestRepoRequestInfo' });

assertTypesEqual<
  ToDiskCloneTestRepoRequestInfo,
  z.infer<typeof zToDiskCloneTestRepoRequestInfo>
>({ value: true });
