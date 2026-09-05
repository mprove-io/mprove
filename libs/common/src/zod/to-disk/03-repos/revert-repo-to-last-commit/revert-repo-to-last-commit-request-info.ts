import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequestInfo,
  zToDiskRequestInfo
} from '#common/zod/to-disk/to-disk-request-info';

export type ToDiskRevertRepoToLastCommitRequestInfo = Extend<
  ToDiskRequestInfo,
  {
    name: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit;
  }
>;

export let zToDiskRevertRepoToLastCommitRequestInfo = zToDiskRequestInfo
  .extend({
    name: z.literal(ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit)
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitRequestInfo' });

assertTypesEqual<
  ToDiskRevertRepoToLastCommitRequestInfo,
  z.infer<typeof zToDiskRevertRepoToLastCommitRequestInfo>
>({ value: true });
