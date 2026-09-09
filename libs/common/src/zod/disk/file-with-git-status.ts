import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type GitFileStatus,
  zGitFileStatus
} from '#common/zod/disk/git-file-status';

export type FileWithGitStatus = {
  path: string;
  gitFileStatus: GitFileStatus;
};

export let zFileWithGitStatus = z
  .object({
    path: z.string(),
    gitFileStatus: zGitFileStatus
  })
  .meta({ id: 'FileWithGitStatus' });

assertTypesEqual<FileWithGitStatus, z.infer<typeof zFileWithGitStatus>>({
  value: true
});
