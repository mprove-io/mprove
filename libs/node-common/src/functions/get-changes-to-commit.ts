import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
import { common } from '~node-common/barrels/common';
import { readFileCheckSize } from './read-file-check-size';

export async function getChangesToCommit(item: {
  repoDir: string;
  addContent?: boolean;
}) {
  let { repoDir, addContent } = item;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

  let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

  let changesToCommit: common.DiskFileChange[] = [];

  await forEachSeries(statusFiles, async (x: nodegit.StatusFile) => {
    let path = x.path();
    let pathArray = path.split('/');

    let fileId = pathArray.join(common.TRIPLE_UNDERSCORE);

    let fileName = pathArray.slice(-1)[0];

    let parentPath =
      pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

    // doesn't return booleans
    let status = x.isNew()
      ? common.FileStatusEnum.New
      : x.isDeleted()
      ? common.FileStatusEnum.Deleted
      : x.isModified()
      ? common.FileStatusEnum.Modified
      : x.isConflicted()
      ? common.FileStatusEnum.Conflicted
      : x.isTypechange()
      ? common.FileStatusEnum.TypeChange
      : x.isRenamed()
      ? common.FileStatusEnum.Renamed
      : x.isIgnored()
      ? common.FileStatusEnum.Ignored
      : undefined;

    let content;
    if (addContent === true && status !== common.FileStatusEnum.Deleted) {
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

    if (common.isUndefined(change.content)) {
      delete change.content;
    }

    changesToCommit.push(change);
  });

  return changesToCommit;
}
