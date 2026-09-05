import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskSeedProjectRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskSeedProject;
  }
>;

export let zToDiskSeedProjectRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskSeedProject)
  })
  .meta({ id: 'ToDiskSeedProjectRequestInfo' });

assertTypesEqual<
  ToDiskSeedProjectRequestInfo,
  z.infer<typeof zToDiskSeedProjectRequestInfo>
>({ value: true });
