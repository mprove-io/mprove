import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskPullRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskPullRepo;
  }
>;

export let zToDiskPullRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskPullRepo)
  })
  .meta({ id: 'ToDiskPullRepoRequestInfo' });

assertTypesEqual<
  ToDiskPullRepoRequestInfo,
  z.infer<typeof zToDiskPullRepoRequestInfo>
>({ value: true });
