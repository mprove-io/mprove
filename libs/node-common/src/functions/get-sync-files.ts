import * as nodegit from '@figma/nodegit';
import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { common } from '~node-common/barrels/common';
import { gitLsFiles } from './git-ls-files';
import { readFileCheckSize } from './read-file-check-size';

export async function getSyncFiles(item: {
  statusFiles: nodegit.StatusFile[];
  repoDir: string;
  lastSyncTime: number;
}) {
  let { statusFiles, repoDir, lastSyncTime } = item;

  let changedFiles: common.DiskSyncFile[] = [];
  let deletedFiles: common.DiskSyncFile[] = [];

  await forEachSeries(statusFiles, async (x: nodegit.StatusFile) => {
    let path = x.path();

    let status =
      // doesn't return booleans
      x.isNew()
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

    let content: string;
    let stat: fse.Stats;

    if (status !== common.FileStatusEnum.Deleted) {
      let fullPath = `${repoDir}/${path}`;

      let { content: cont, stat: st } = await readFileCheckSize({
        filePath: fullPath,
        getStat: true
      });

      content = cont;
      stat = st;
    }

    let file: common.DiskSyncFile = {
      path: path,
      status: status,
      content: content,
      modifiedTime: stat?.mtimeMs
    };

    if (file.status === common.FileStatusEnum.Deleted) {
      deletedFiles.push(file);
    } else {
      changedFiles.push(file);
    }
  });

  if (lastSyncTime > 0) {
    let paths = (await gitLsFiles(repoDir)) as string[];

    let extraPaths = paths.filter(
      x => [...changedFiles, ...deletedFiles].map(f => f.path).indexOf(x) < 0
    );

    await forEachSeries(extraPaths, async (path: string) => {
      let fullPath = `${repoDir}/${path}`;

      let isFileExist = await fse.pathExists(fullPath);
      if (isFileExist === true) {
        let stat = <fse.Stats>await fse.stat(fullPath);

        if (stat.mtimeMs > lastSyncTime) {
          let { content } = await readFileCheckSize({
            filePath: fullPath,
            getStat: false
          });

          let file: common.DiskSyncFile = {
            path: path,
            status: undefined,
            content: content,
            modifiedTime: stat.mtimeMs
          };

          changedFiles.push(file);
        }
      }
    });
  }

  return {
    changedFiles: changedFiles,
    deletedFiles: deletedFiles
  };
}
