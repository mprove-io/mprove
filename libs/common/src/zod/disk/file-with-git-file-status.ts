import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type GitFileStatus,
  zGitFileStatus
} from '#common/zod/disk/git-file-status';

export type FileWithGitFileStatus = {
  path: string;
  gitFileStatus: GitFileStatus;
};

export let zFileWithGitFileStatus = z
  .object({
    path: z.string(),
    gitFileStatus: zGitFileStatus
  })
  .meta({ id: 'FileWithGitFileStatus' });

assertTypesEqual<FileWithGitFileStatus, z.infer<typeof zFileWithGitFileStatus>>(
  {
    value: true
  }
);
