import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskRevertRepoToRemoteRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteRequestPayload' });

export let zToDiskRevertRepoToRemoteRequest = zToDiskRequest
  .extend({
    payload: zToDiskRevertRepoToRemoteRequestPayload
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteRequest' });

export let zToDiskRevertRepoToRemoteResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteResponsePayload' });

export let zToDiskRevertRepoToRemoteResponse = zMyResponse
  .extend({
    payload: zToDiskRevertRepoToRemoteResponsePayload
  })
  .meta({ id: 'ToDiskRevertRepoToRemoteResponse' });

export type ToDiskRevertRepoToRemoteRequestPayload = z.infer<
  typeof zToDiskRevertRepoToRemoteRequestPayload
>;
export type ToDiskRevertRepoToRemoteRequest = z.infer<
  typeof zToDiskRevertRepoToRemoteRequest
>;
export type ToDiskRevertRepoToRemoteResponsePayload = z.infer<
  typeof zToDiskRevertRepoToRemoteResponsePayload
>;
export type ToDiskRevertRepoToRemoteResponse = z.infer<
  typeof zToDiskRevertRepoToRemoteResponse
>;
