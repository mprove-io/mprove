import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
import { FileStatusEnum } from '#common/enums/file-status.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isUndefined } from '#common/functions/is-undefined';
import { DiskFileChange } from '#common/interfaces/disk/disk-file-change';
import { readFileCheckSize } from './read-file-check-size';

export async function getChangesToCommit(item: {
  repoDir: string;
  addContent?: boolean;
}) {
  let { repoDir, addContent } = item;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

  let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

  let changesToCommit: DiskFileChange[] = [];

  await forEachSeries(statusFiles, async (x: nodegit.StatusFile) => {
    let path = x.path();
    let pathArray = path.split('/');

    let fileId = encodeFilePath({ filePath: path });

    let fileName = pathArray.slice(-1)[0];

    let parentPath =
      pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

    // doesn't return booleans
    let status = x.isNew()
      ? FileStatusEnum.New
      : x.isDeleted()
        ? FileStatusEnum.Deleted
        : x.isModified()
          ? FileStatusEnum.Modified
          : x.isConflicted()
            ? FileStatusEnum.Conflicted
            : x.isTypechange()
              ? FileStatusEnum.TypeChange
              : x.isRenamed()
                ? FileStatusEnum.Renamed
                : x.isIgnored()
                  ? FileStatusEnum.Ignored
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
