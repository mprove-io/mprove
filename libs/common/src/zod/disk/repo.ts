import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCatalogNode,
  zDiskCatalogNode
} from '#common/zod/disk/disk-catalog-node';
import {
  type DiskFileChange,
  zDiskFileChange
} from '#common/zod/disk/disk-file-change';
import {
  type DiskFileLine,
  zDiskFileLine
} from '#common/zod/disk/disk-file-line';
import {
  type RepoErrorEtype,
  zRepoErrorEtype
} from '#common/zod/disk/repo-error.etype';
import {
  type RepoStatusEtype,
  zRepoStatusEtype
} from '#common/zod/disk/repo-status.etype';

export type Repo = {
  orgId: string;
  projectId: string;
  repoId: string;
  currentBranchId: string;
  repoStatus: RepoStatusEtype;
  repoError?: RepoErrorEtype;
  conflicts: DiskFileLine[];
  nodes: DiskCatalogNode[];
  changesToCommit: DiskFileChange[];
  changesToPush: DiskFileChange[];
};

export let zRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: zRepoStatusEtype,
    repoError: zRepoErrorEtype.nullish(),
    conflicts: z.array(zDiskFileLine),
    nodes: z.array(zDiskCatalogNode),
    changesToCommit: z.array(zDiskFileChange),
    changesToPush: z.array(zDiskFileChange)
  })
  .meta({ id: 'Repo' });

assertTypesEqual<Repo, z.infer<typeof zRepo>>({ value: true });
