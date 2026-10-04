import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ValidateFilesRepoConflict,
  zValidateFilesRepoConflict
} from '#common/types/backend/parts/state/validate-files-repo-conflict';
import {
  type DiskCatalogNode,
  zDiskCatalogNode
} from '#common/types/disk/parts/catalog/disk-catalog-node';
import {
  type RepoError,
  zRepoError
} from '#common/types/disk/parts/repo/repo-error';
import {
  type RepoStatus,
  zRepoStatus
} from '#common/types/disk/parts/repo/repo-status';

export type StateRepo = {
  orgId: string;
  projectId: string;
  repoId: string;
  currentBranchId: string;
  repoStatus: RepoStatus;
  repoError?: RepoError;
  conflicts: ValidateFilesRepoConflict[];
  nodes: DiskCatalogNode[];
};

export let zStateRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: zRepoStatus,
    repoError: zRepoError.nullish(),
    conflicts: z.array(zValidateFilesRepoConflict),
    nodes: z.array(zDiskCatalogNode)
  })
  .meta({ id: 'StateRepo' });

assertTypesEqual<StateRepo, z.infer<typeof zStateRepo>>({ value: true });
