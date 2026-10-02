import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ValidateFilesRepoConflict,
  zValidateFilesRepoConflict
} from '#common/types/backend/parts/state/validate-files-repo-conflict';
import {
  type RepoStatus,
  zRepoStatus
} from '#common/types/disk/parts/repo-status';

export type ValidateFilesRepo = {
  orgId: string;
  projectId: string;
  repoId: string;
  currentBranchId: string;
  repoStatus: RepoStatus;
  conflicts: ValidateFilesRepoConflict[];
};

export let zValidateFilesRepo = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    repoId: z.string(),
    currentBranchId: z.string(),
    repoStatus: zRepoStatus,
    conflicts: z.array(zValidateFilesRepoConflict)
  })
  .meta({ id: 'ValidateFilesRepo' });

assertTypesEqual<ValidateFilesRepo, z.infer<typeof zValidateFilesRepo>>({
  value: true
});
