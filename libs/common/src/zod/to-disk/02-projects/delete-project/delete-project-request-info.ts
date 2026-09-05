import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskDeleteProjectRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskDeleteProject;
  }
>;

export let zToDiskDeleteProjectRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskDeleteProject)
  })
  .meta({ id: 'ToDiskDeleteProjectRequestInfo' });

assertTypesEqual<
  ToDiskDeleteProjectRequestInfo,
  z.infer<typeof zToDiskDeleteProjectRequestInfo>
>({ value: true });
