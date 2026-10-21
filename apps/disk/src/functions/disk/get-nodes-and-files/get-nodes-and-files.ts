import { Result } from '@praha/byethrow';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import type { DiskGetNodesAndFilesError } from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { DiskCatalogNode } from '#common/types/disk/parts/catalog/disk-catalog-node';
import type { DiskItemCatalog } from '#common/types/disk/parts/catalog/disk-item-catalog';
import { getMproveDir } from '#node-common/functions/get-mprove-dir/get-mprove-dir';
import { getNodesAndFilesPayloadRecursive } from './get-nodes-and-files-payload-recursive/get-nodes-and-files-payload-recursive';

export async function getNodesAndFiles(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  readFiles: boolean;
  isRootMproveDir: boolean;
}): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> {
  return Result.pipe(
    Result.succeed({
      ...item,
      repoDir: `${item.projectDir}/${item.repoId}`,
      configPath: `${item.projectDir}/${item.repoId}/${MPROVE_CONFIG_FILENAME}`,
      repoDirPathLength: `${item.projectDir}/${item.repoId}`.length
    }),
    Result.bind('topNode', v => {
      let topNode: DiskCatalogNode = {
        id: v.projectId,
        name: v.projectId,
        isFolder: true,
        children: []
      };

      return Result.succeed(topNode);
    }),
    Result.bind('mproveDir', async v =>
      v.isRootMproveDir === true
        ? Result.succeed(v.repoDir)
        : getMproveDir({
            dir: v.repoDir,
            configPath: v.configPath
          })
    ),
    Result.bind('nodesAndFilesPayload', v =>
      getNodesAndFilesPayloadRecursive({
        dir: v.repoDir,
        projectId: v.projectId,
        repoId: v.repoId,
        repoDirPathLength: v.repoDirPathLength,
        readFiles: v.readFiles,
        mproveDir: v.mproveDir,
        repoDir: v.repoDir
      })
    ),
    Result.map((v): DiskItemCatalog => {
      v.topNode.children = v.nodesAndFilesPayload.nodes;

      let nodes: DiskCatalogNode[] = [v.topNode];

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
