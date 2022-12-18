import * as nodegit from 'nodegit';
import { common } from '~node-common/barrels/common';

export async function getChangesToCommit(item: { repoDir: string }) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

  let changesToCommit: common.DiskFileChange[] = statusFiles.map(
    (x: nodegit.StatusFile) => {
      let path = x.path();
      let pathArray = path.split('/');

      let fileId = pathArray.join(common.TRIPLE_UNDERSCORE);

      let fileName = pathArray.slice(-1)[0];

      let parentPath =
        pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

      return {
        fileName: fileName,
        fileId: fileId,
        parentPath: parentPath,
        // doesn't return booleans
        status: x.isNew()
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
          : undefined
      };
    }
  );

  return changesToCommit;
}
