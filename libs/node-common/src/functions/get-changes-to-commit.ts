import { Result } from '@praha/byethrow';
import pIteration from 'p-iteration';
import type { StatusResult } from 'simple-git';

const { forEachSeries } = pIteration;

import { encodeFilePath } from '#common/functions/encode-file-path';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { FileStatus } from '#common/zod/disk/file-status';
import type { FileWithGitFileStatus } from '#common/zod/disk/file-with-git-file-status';
import { readFileCheckSize } from '../functions-result/read-file-check-size';
import { createSimpleGit } from './create-simple-git';

export async function getChangesToCommit(item: {
  repoDir: string;
  addContent?: boolean;
  expandRenamed?: boolean;
}) {
  let { repoDir, addContent, expandRenamed } = item;

  let git = createSimpleGit({ baseDir: repoDir });

  let statusResult: StatusResult = await git.status();

  let changesToCommit: DiskFileChange[] = [];

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
    ...(expandRenamed === true
      ? statusResult.renamed.flatMap(r => [
          { path: r.from, gitFileStatus: 'deleted' as const },
          { path: r.to, gitFileStatus: 'created' as const }
        ])
      : statusResult.renamed.map(r => ({
          path: r.to,
          gitFileStatus: 'renamed' as const
        }))),
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

  await forEachSeries(files, async (file: FileWithGitFileStatus) => {
    let path = file.path;
    let pathArray = path.split('/');

    let fileId = encodeFilePath({ filePath: path });

    let fileName = pathArray.slice(-1)[0];

    let parentPath =
      pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

    let status: FileStatus =
      file.gitFileStatus === 'not_added' || file.gitFileStatus === 'created'
        ? 'New'
        : file.gitFileStatus === 'deleted'
          ? 'Deleted'
          : file.gitFileStatus === 'modified'
            ? 'Modified'
            : file.gitFileStatus === 'conflicted'
              ? 'Conflicted'
              : file.gitFileStatus === 'renamed'
                ? 'Renamed'
                : undefined;

    let content;
    if (addContent === true && status !== 'Deleted') {
      let fullPath = `${repoDir}/${path}`;

      let { content: cont } = await Result.unwrap(
        Result.pipe(
          readFileCheckSize({
            filePath: fullPath,
            getStat: true
          }),
          Result.mapError(error => new ServerError({ message: error.code }))
        )
      );

      content = cont;
    }

    let change = {
      fileName: fileName,
      fileId: fileId,
      parentPath: parentPath,
      status: status,
      content: content
    };

    if (isUndefined(change.content)) {
      delete change.content;
    }

    changesToCommit.push(change);
  });

  return changesToCommit;
}
