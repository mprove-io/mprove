import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskSyncRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskSyncRepo;
  }
>;

export let zToDiskSyncRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskSyncRepo)
  })
  .meta({ id: 'ToDiskSyncRepoRequestInfo' });

assertTypesEqual<
  ToDiskSyncRepoRequestInfo,
  z.infer<typeof zToDiskSyncRepoRequestInfo>
>({ value: true });
