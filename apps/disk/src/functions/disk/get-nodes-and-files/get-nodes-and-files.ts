import { Result } from '@praha/byethrow';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { DiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
import { getMproveDir } from '#node-common/functions-result/get-mprove-dir';
import { getNodesAndFilesPayloadRecursive } from './get-nodes-and-files-payload-recursive/get-nodes-and-files-payload-recursive';

export function getNodesAndFiles(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  readFiles: boolean;
  isRootMproveDir: boolean;
}): Result.ResultAsync<
  DiskItemCatalog,
  FileIsSymlinkError | FileSizeIsTooBigError
> {
  let topNode: DiskCatalogNode = {
    id: item.projectId,
    name: item.projectId,
    isFolder: true,
    children: []
  };

  let repoDir = `${item.projectDir}/${item.repoId}`;

  let repoDirPathLength = repoDir.length;

  let configPath = repoDir + '/' + MPROVE_CONFIG_FILENAME;

  return Result.pipe(
    Result.succeed(item),
    Result.bind('mproveDir', v =>
      v.isRootMproveDir === true
        ? Result.succeed(repoDir)
        : getMproveDir({
            dir: repoDir,
            configPath: configPath
          })
    ),
    Result.bind('nodesAndFilesPayload', v =>
      getNodesAndFilesPayloadRecursive({
        dir: repoDir,
        projectId: v.projectId,
        repoId: v.repoId,
        repoDirPathLength: repoDirPathLength,
        readFiles: v.readFiles,
        mproveDir: v.mproveDir,
        repoDir: repoDir
      })
    ),
    Result.map(v => {
      topNode.children = v.nodesAndFilesPayload.nodes;

      let nodes: DiskCatalogNode[] = [topNode];

      let files: DiskCatalogFile[] = v.nodesAndFilesPayload.files;

      let diskItemCatalog: DiskItemCatalog = {
        nodes: nodes,
        files: files,
        mproveDir: v.mproveDir
      };

      return diskItemCatalog;
    })
  );
}
