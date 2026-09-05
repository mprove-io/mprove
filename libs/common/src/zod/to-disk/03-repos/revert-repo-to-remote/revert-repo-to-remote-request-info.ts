import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskRevertRepoToRemoteRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote;
  }
>;

export let zToDiskRevertRepoToRemoteRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote)
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteRequestInfo' });

assertTypesEqual<
  ToDiskRevertRepoToRemoteRequestInfo,
  z.infer<typeof zToDiskRevertRepoToRemoteRequestInfo>
>({ value: true });
