import pIteration from 'p-iteration';
import type { StatusResult } from 'simple-git';

const { forEachSeries } = pIteration;

import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { FileStatus } from '#common/zod/disk/file-status';
import type { FileWithGitFileStatus } from '#common/zod/disk/file-with-git-file-status';
import { readFileCheckSize } from './read-file-check-size';

export async function getSyncFiles(item: {
  statusResult: StatusResult;
  repoDir: string;
}) {
  let { statusResult, repoDir } = item;

  return await getWorkingTreePayload({
    statusResult: statusResult,
    repoDir: repoDir
  });
}

export async function getWorkingTreePayload(item: {
  statusResult: StatusResult;
  repoDir: string;
}) {
  let { statusResult, repoDir } = item;

  let changedFiles: DiskSyncFile[] = [];
  let deletedFiles: DiskSyncFile[] = [];

  let allFiles: FileWithGitFileStatus[] = [
    ...statusResult.not_added.map(path => ({
      path: path,
      gitFileStatus: 'not_added' as const
    })),
    ...statusResult.created.map(path => ({
      path: path,
      gitFileStatus: 'created' as const
    })),
    ...statusResult.deleted.map(path => ({
      path: path,
      gitFileStatus: 'deleted' as const
    })),
    ...statusResult.modified.map(path => ({
      path: path,
      gitFileStatus: 'modified' as const
    })),
    ...statusResult.renamed.flatMap(r => [
      { path: r.from, gitFileStatus: 'deleted' as const },
      { path: r.to, gitFileStatus: 'created' as const }
    ]),
    ...statusResult.conflicted.map(path => ({
      path: path,
      gitFileStatus: 'conflicted' as const
    }))
  ];

  let uniquePaths = new Set<string>();
  let files: FileWithGitFileStatus[] = [];
  allFiles.forEach(file => {
    if (!uniquePaths.has(file.path)) {
      uniquePaths.add(file.path);
      files.push(file);
    }
  });
  files.sort((a, b) => a.path.localeCompare(b.path));

  await forEachSeries(files, async (x: FileWithGitFileStatus) => {
    let path = x.path;

    let status: FileStatus =
      x.gitFileStatus === 'not_added' || x.gitFileStatus === 'created'
        ? 'New'
        : x.gitFileStatus === 'deleted'
          ? 'Deleted'
          : x.gitFileStatus === 'modified'
            ? 'Modified'
            : x.gitFileStatus === 'conflicted'
              ? 'Conflicted'
              : undefined;

    let content: string;
    if (status !== 'Deleted') {
      let fullPath = `${repoDir}/${path}`;

      let { content: cont } = await readFileCheckSize({
        filePath: fullPath,
        getStat: false
      });

      content = cont;
    }

    let file: DiskSyncFile = {
      path: path,
      status: status,
      content: content
    };

    if (file.status === 'Deleted') {
      deletedFiles.push(file);
    } else {
      changedFiles.push(file);
    }
  });

  return {
    changedFiles: changedFiles,
    deletedFiles: deletedFiles
  };
}
