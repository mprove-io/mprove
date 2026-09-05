import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCreateDevRepoRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo;
  }
>;

export let zToDiskCreateDevRepoRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo)
  })
  .meta({ id: 'ToDiskCreateDevRepoRequestInfo' });

assertTypesEqual<
  ToDiskCreateDevRepoRequestInfo,
  z.infer<typeof zToDiskCreateDevRepoRequestInfo>
>({ value: true });
