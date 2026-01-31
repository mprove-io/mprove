import pIteration from 'p-iteration';
import { StatusResult, simpleGit } from 'simple-git';

const { forEachSeries } = pIteration;

import { FileStatusEnum } from '#common/enums/file-status.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isUndefined } from '#common/functions/is-undefined';
import { DiskFileChange } from '#common/interfaces/disk/disk-file-change';
import { FileWithStatusType } from '#common/interfaces/disk/git-file-status-type';
import { readFileCheckSize } from './read-file-check-size';

export async function getChangesToCommit(item: {
  repoDir: string;
  addContent?: boolean;
}) {
  let { repoDir, addContent } = item;

  let git = simpleGit({ baseDir: repoDir });

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
    ...statusResult.renamed.map(r => ({
      path: r.to,
      type: 'renamed' as const
    })),
    ...statusResult.conflicted.map(path => ({
      path,
      type: 'conflicted' as const
    }))
  ];

  let uniquePaths = new Set<string>();
  let files: FileWithStatusType[] = [];
  for (let file of allFiles) {
    if (!uniquePaths.has(file.path)) {
      uniquePaths.add(file.path);
      files.push(file);
    }
  }

  await forEachSeries(files, async (file: FileWithStatusType) => {
    let path = file.path;
    let pathArray = path.split('/');

    let fileId = encodeFilePath({ filePath: path });

    let fileName = pathArray.slice(-1)[0];

    let parentPath =
      pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

    let status: FileStatusEnum =
      file.type === 'not_added' || file.type === 'created'
        ? FileStatusEnum.New
        : file.type === 'deleted'
          ? FileStatusEnum.Deleted
          : file.type === 'modified'
            ? FileStatusEnum.Modified
            : file.type === 'conflicted'
              ? FileStatusEnum.Conflicted
              : file.type === 'renamed'
                ? FileStatusEnum.Renamed
                : undefined;

    let content;
    if (addContent === true && status !== FileStatusEnum.Deleted) {
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
