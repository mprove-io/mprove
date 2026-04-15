import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskRevertRepoToLastCommitRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitRequestPayload' });

export let zToDiskRevertRepoToLastCommitRequest = zToDiskRequest
  .extend({
    payload: zToDiskRevertRepoToLastCommitRequestPayload
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitRequest' });

export let zToDiskRevertRepoToLastCommitResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitResponsePayload' });

export let zToDiskRevertRepoToLastCommitResponse = zMyResponse
  .extend({
    payload: zToDiskRevertRepoToLastCommitResponsePayload
  })
  .meta({ id: 'ToDiskRevertRepoToLastCommitResponse' });

export type ToDiskRevertRepoToLastCommitRequestPayload = z.infer<
  typeof zToDiskRevertRepoToLastCommitRequestPayload
>;
export type ToDiskRevertRepoToLastCommitRequest = z.infer<
  typeof zToDiskRevertRepoToLastCommitRequest
>;
export type ToDiskRevertRepoToLastCommitResponsePayload = z.infer<
  typeof zToDiskRevertRepoToLastCommitResponsePayload
>;
export type ToDiskRevertRepoToLastCommitResponse = z.infer<
  typeof zToDiskRevertRepoToLastCommitResponse
>;
