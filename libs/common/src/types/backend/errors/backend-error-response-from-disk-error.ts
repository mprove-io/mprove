import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskBranchIsNotExistError,
  zDiskBranchIsNotExistError
} from '#common/types/disk/errors/disk-branch-is-not-exist-error';
import {
  type DiskDefaultBranchCannotBeDeletedError,
  zDiskDefaultBranchCannotBeDeletedError
} from '#common/types/disk/errors/disk-default-branch-cannot-be-deleted-error';
import {
  type DiskDevRepoCommitDoesNotMatchLocalCommitError,
  zDiskDevRepoCommitDoesNotMatchLocalCommitError
} from '#common/types/disk/errors/disk-dev-repo-commit-does-not-match-local-commit-error';
import {
  type DiskFileAlreadyExistError,
  zDiskFileAlreadyExistError
} from '#common/types/disk/errors/disk-file-already-exist-error';
import {
  type DiskFileIsNotExistError,
  zDiskFileIsNotExistError
} from '#common/types/disk/errors/disk-file-is-not-exist-error';
import {
  type DiskFolderAlreadyExistError,
  zDiskFolderAlreadyExistError
} from '#common/types/disk/errors/disk-folder-already-exist-error';
import {
  type DiskFolderIsNotExistError,
  zDiskFolderIsNotExistError
} from '#common/types/disk/errors/disk-folder-is-not-exist-error';
import {
  type DiskFromPathIsNotExistError,
  zDiskFromPathIsNotExistError
} from '#common/types/disk/errors/disk-from-path-is-not-exist-error';
import {
  type DiskInternalError,
  zDiskInternalError
} from '#common/types/disk/errors/disk-internal-error';
import {
  type DiskInvalidRequestError,
  zDiskInvalidRequestError
} from '#common/types/disk/errors/disk-invalid-request-error';
import {
  type DiskNewPathAlreadyExistError,
  zDiskNewPathAlreadyExistError
} from '#common/types/disk/errors/disk-new-path-already-exist-error';
import {
  type DiskOldPathIsNotExistError,
  zDiskOldPathIsNotExistError
} from '#common/types/disk/errors/disk-old-path-is-not-exist-error';
import {
  type DiskOrgAlreadyExistError,
  zDiskOrgAlreadyExistError
} from '#common/types/disk/errors/disk-org-already-exist-error';
import {
  type DiskParentPathIsNotExistError,
  zDiskParentPathIsNotExistError
} from '#common/types/disk/errors/disk-parent-path-is-not-exist-error';
import {
  type DiskPathTraversalError,
  zDiskPathTraversalError
} from '#common/types/disk/errors/disk-path-traversal-error';
import {
  type DiskProjectAlreadyExistError,
  zDiskProjectAlreadyExistError
} from '#common/types/disk/errors/disk-project-already-exist-error';
import {
  type DiskRemoteBranchIsNotExistError,
  zDiskRemoteBranchIsNotExistError
} from '#common/types/disk/errors/disk-remote-branch-is-not-exist-error';
import {
  type DiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoIsNotCleanForCheckoutBranchError
} from '#common/types/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import {
  type DiskRepoStatusIsNotNeedPushError,
  zDiskRepoStatusIsNotNeedPushError
} from '#common/types/disk/errors/disk-repo-status-is-not-need-push-error';
import {
  type DiskSymlinksFoundError,
  zDiskSymlinksFoundError
} from '#common/types/disk/errors/disk-symlinks-found-error';
import {
  type DiskTheirBranchIsNotExistError,
  zDiskTheirBranchIsNotExistError
} from '#common/types/disk/errors/disk-their-branch-is-not-exist-error';
import {
  type DiskToPathAlreadyExistError,
  zDiskToPathAlreadyExistError
} from '#common/types/disk/errors/disk-to-path-already-exist-error';
import {
  type FileIsSymlinkError,
  zFileIsSymlinkError
} from '#common/types/node-common/errors/file-is-symlink-error';
import {
  type FileSizeIsTooBigError,
  zFileSizeIsTooBigError
} from '#common/types/node-common/errors/file-size-is-too-big-error';

export type BackendErrorResponseFromDiskError = {
  code: 'BACKEND_ERROR_RESPONSE_FROM_DISK';
  originalError?:
    | DiskBranchIsNotExistError
    | DiskDefaultBranchCannotBeDeletedError
    | DiskDevRepoCommitDoesNotMatchLocalCommitError
    | DiskFileAlreadyExistError
    | DiskFileIsNotExistError
    | DiskFolderAlreadyExistError
    | DiskFolderIsNotExistError
    | DiskFromPathIsNotExistError
    | DiskInternalError
    | DiskInvalidRequestError
    | DiskNewPathAlreadyExistError
    | DiskOldPathIsNotExistError
    | DiskOrgAlreadyExistError
    | DiskParentPathIsNotExistError
    | DiskPathTraversalError
    | DiskProjectAlreadyExistError
    | DiskRemoteBranchIsNotExistError
    | DiskRepoIsNotCleanForCheckoutBranchError
    | DiskRepoStatusIsNotNeedPushError
    | DiskSymlinksFoundError
    | DiskTheirBranchIsNotExistError
    | DiskToPathAlreadyExistError
    | FileIsSymlinkError
    | FileSizeIsTooBigError;
};

export let zBackendErrorResponseFromDiskError = z.object({
  code: z.literal('BACKEND_ERROR_RESPONSE_FROM_DISK'),
  originalError: z
    .discriminatedUnion('code', [
      zDiskBranchIsNotExistError,
      zDiskDefaultBranchCannotBeDeletedError,
      zDiskDevRepoCommitDoesNotMatchLocalCommitError,
      zDiskFileAlreadyExistError,
      zDiskFileIsNotExistError,
      zDiskFolderAlreadyExistError,
      zDiskFolderIsNotExistError,
      zDiskFromPathIsNotExistError,
      zDiskInternalError,
      zDiskInvalidRequestError,
      zDiskNewPathAlreadyExistError,
      zDiskOldPathIsNotExistError,
      zDiskOrgAlreadyExistError,
      zDiskParentPathIsNotExistError,
      zDiskPathTraversalError,
      zDiskProjectAlreadyExistError,
      zDiskRemoteBranchIsNotExistError,
      zDiskRepoIsNotCleanForCheckoutBranchError,
      zDiskRepoStatusIsNotNeedPushError,
      zDiskSymlinksFoundError,
      zDiskTheirBranchIsNotExistError,
      zDiskToPathAlreadyExistError,
      zFileIsSymlinkError,
      zFileSizeIsTooBigError
    ])
    .nullish()
});

assertTypesEqual<
  BackendErrorResponseFromDiskError,
  z.infer<typeof zBackendErrorResponseFromDiskError>
>({ value: true });
