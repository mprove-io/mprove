import fse from 'fs-extra';
import pIteration from 'p-iteration';
import { StatusResult } from 'simple-git';

const { forEachSeries } = pIteration;

import { FileStatusEnum } from '#common/enums/file-status.enum';
import { DiskSyncFile } from '#common/interfaces/disk/disk-sync-file';
import { FileWithStatusType } from '#common/interfaces/disk/git-file-status-type';
import { gitLsFiles } from './git-ls-files';
import { readFileCheckSize } from './read-file-check-size';

export async function getSyncFiles(item: {
  statusResult: StatusResult;
  repoDir: string;
  lastSyncTime: number;
}) {
  let { statusResult, repoDir, lastSyncTime } = item;

  let changedFiles: DiskSyncFile[] = [];
  let deletedFiles: DiskSyncFile[] = [];

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

  await forEachSeries(files, async (x: FileWithStatusType) => {
    let path = x.path;

    let status: FileStatusEnum =
      x.type === 'not_added' || x.type === 'created'
        ? FileStatusEnum.New
        : x.type === 'deleted'
          ? FileStatusEnum.Deleted
          : x.type === 'modified'
            ? FileStatusEnum.Modified
            : x.type === 'conflicted'
              ? FileStatusEnum.Conflicted
              : x.type === 'renamed'
                ? FileStatusEnum.Renamed
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
    let paths = await gitLsFiles(repoDir);

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
