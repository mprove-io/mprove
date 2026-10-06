import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogNode,
  zDiskCatalogNode
} from '#common/types/disk/parts/catalog/disk-catalog-node';
import {
  type DiskFileLine,
  zDiskFileLine
} from '#common/types/disk/parts/file/disk-file-line';
import {
  type RepoError,
  zRepoError
} from '#common/types/disk/parts/repo/repo-error';
import {
  type RepoStatus,
  zRepoStatus
} from '#common/types/disk/parts/repo/repo-status';

export type SyncRepo = {
  orgId: string;
  projectId: string;
  repoId: string;
  currentBranchId: string;
  repoStatus: RepoStatus;
  repoError?: RepoError;
  conflicts: DiskFileLine[];
  nodes?: DiskCatalogNode[];
};

export let zSyncRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: zRepoStatus,
    repoError: zRepoError.nullish(),
    conflicts: z.array(zDiskFileLine),
    nodes: z.array(zDiskCatalogNode).nullish()
  })
  .meta({ id: 'SyncRepo' });

assertTypesEqual<SyncRepo, z.infer<typeof zSyncRepo>>({ value: true });
