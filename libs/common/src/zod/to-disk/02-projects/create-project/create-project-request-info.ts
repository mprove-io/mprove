import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskCreateProjectRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskCreateProject;
  }
>;

export let zToDiskCreateProjectRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskCreateProject)
  })
  .meta({ id: 'ToDiskCreateProjectRequestInfo' });

assertTypesEqual<
  ToDiskCreateProjectRequestInfo,
  z.infer<typeof zToDiskCreateProjectRequestInfo>
>({ value: true });
