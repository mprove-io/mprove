import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskDeleteDevRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo;
  }
>;

export let zToDiskDeleteDevRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo)
  })
  .meta({ id: 'ToDiskDeleteDevRepoRequestInfo' });

assertTypesEqual<
  ToDiskDeleteDevRepoRequestInfo,
  z.infer<typeof zToDiskDeleteDevRepoRequestInfo>
>({ value: true });
