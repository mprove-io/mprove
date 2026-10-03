import type { GitFileStatus } from '#common/types/disk/parts/git-file-status';

export type FileWithGitFileStatus = {
  path: string;
  gitFileStatus: GitFileStatus;
};
