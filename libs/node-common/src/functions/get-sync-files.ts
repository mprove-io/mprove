import * as fse from 'fs-extra';
import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
import { FileStatusEnum } from '~common/enums/file-status.enum';
import { DiskSyncFile } from '~common/interfaces/disk/disk-sync-file';
import { gitLsFiles } from './git-ls-files';
import { readFileCheckSize } from './read-file-check-size';

export async function getSyncFiles(item: {
  statusFiles: nodegit.StatusFile[];
  repoDir: string;
  lastSyncTime: number;
}) {
  let { statusFiles, repoDir, lastSyncTime } = item;

  let changedFiles: DiskSyncFile[] = [];
  let deletedFiles: DiskSyncFile[] = [];

  await forEachSeries(statusFiles, async (x: nodegit.StatusFile) => {
    let path = x.path();

    let status =
      // doesn't return booleans
      x.isNew()
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

    let content: string;
    let stat: fse.Stats;

    if (status !== FileStatusEnum.Deleted) {
      let fullPath = `${repoDir}/${path}`;

      let { content: cont, stat: st } = await readFileCheckSize({
        filePath: fullPath,
        getStat: true
      });

      content = cont;
      stat = st;
    }

    let file: DiskSyncFile = {
      path: path,
      status: status,
      content: content,
      modifiedTime: stat?.mtimeMs
    };

    if (file.status === FileStatusEnum.Deleted) {
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

          let file: DiskSyncFile = {
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
