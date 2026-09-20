import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskRestoreProjectGitCloneRepoBranchError,
  zDiskRestoreProjectGitCloneRepoBranchError
} from '#common/zod/disk/function-errors/disk-restore-project-git-clone-repo-branch-error';

export type DiskCheckRestoreOrgProjectRepoBranchError =
  DiskRestoreProjectGitCloneRepoBranchError;

export let zDiskCheckRestoreOrgProjectRepoBranchError =
  zDiskRestoreProjectGitCloneRepoBranchError;

assertTypesEqual<
  DiskCheckRestoreOrgProjectRepoBranchError,
  z.infer<typeof zDiskCheckRestoreOrgProjectRepoBranchError>
>({ value: true });
