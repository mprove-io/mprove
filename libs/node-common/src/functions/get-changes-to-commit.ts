import pIteration from 'p-iteration';
import type { StatusResult } from 'simple-git';

const { forEachSeries } = pIteration;

import { encodeFilePath } from '#common/functions/encode-file-path';
import { isUndefined } from '#common/functions/is-undefined';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { FileStatusEtype } from '#common/zod/disk/file-status.etype';
import type { FileWithStatusType } from '#common/zod/disk/file-with-status-type';
import { createSimpleGit } from './create-simple-git';
import { readFileCheckSize } from './read-file-check-size';

export async function getChangesToCommit(item: {
  repoDir: string;
  addContent?: boolean;
  expandRenamed?: boolean;
}) {
  let { repoDir, addContent, expandRenamed } = item;

  let git = createSimpleGit({ baseDir: repoDir });

  let statusResult: StatusResult = await git.status();

  let changesToCommit: DiskFileChange[] = [];

  let allFiles: FileWithStatusType[] = [
    ...statusResult.not_added.map(path => ({
      path,
      type: 'not_added' as const
    })),
    ...statusResult.created.map(path => ({ path, type: 'created' as const })),
    ...statusResult.deleted.map(path => ({ path, type: 'deleted' as const })),
    ...statusResult.modified.map(path => ({ path, type: 'modified' as const })),
    ...(expandRenamed === true
      ? statusResult.renamed.flatMap(r => [
          { path: r.from, type: 'deleted' as const },
          { path: r.to, type: 'created' as const }
        ])
      : statusResult.renamed.map(r => ({
          path: r.to,
          type: 'renamed' as const
        }))),
    ...statusResult.conflicted.map(path => ({
      path,
      type: 'conflicted' as const
    }))
  ];

  let uniquePaths = new Set<string>();
  let files: FileWithStatusType[] = [];
  allFiles.forEach(file => {
    if (!uniquePaths.has(file.path)) {
      uniquePaths.add(file.path);
      files.push(file);
    }
  });
  files.sort((a, b) => a.path.localeCompare(b.path));

  await forEachSeries(files, async (file: FileWithStatusType) => {
    let path = file.path;
    let pathArray = path.split('/');

    let fileId = encodeFilePath({ filePath: path });

    let fileName = pathArray.slice(-1)[0];

    let parentPath =
      pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

    let status: FileStatusEtype =
      file.type === 'not_added' || file.type === 'created'
        ? 'New'
        : file.type === 'deleted'
          ? 'Deleted'
          : file.type === 'modified'
            ? 'Modified'
            : file.type === 'conflicted'
              ? 'Conflicted'
              : file.type === 'renamed'
                ? 'Renamed'
                : undefined;

    let content;
    if (addContent === true && status !== 'Deleted') {
      let fullPath = `${repoDir}/${path}`;

      let { content: cont, stat: st } = await readFileCheckSize({
        filePath: fullPath,
        getStat: true
      });

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
