import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskPushRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskPushRepo;
  }
>;

export let zToDiskPushRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskPushRepo)
  })
  .meta({ id: 'ToDiskPushRepoRequestInfo' });

assertTypesEqual<
  ToDiskPushRepoRequestInfo,
  z.infer<typeof zToDiskPushRepoRequestInfo>
>({ value: true });
