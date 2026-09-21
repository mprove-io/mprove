import { Result } from '@praha/byethrow';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { DiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetNodesAndFilesPayloadRecursiveError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-payload-recursive-error';
import type { GetMproveDirError } from '#common/zod/node-common/function-errors/get-mprove-dir-error';
import { getMproveDir } from '#node-common/functions-result/get-mprove-dir';
import {
  getNodesAndFilesPayloadRecursive,
  type NodesAndFilesPayload
} from './get-nodes-and-files-payload-recursive/get-nodes-and-files-payload-recursive';

export function getNodesAndFiles(item: {
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
    Result.bind(
      'topNode',
      (v): Result.Result<DiskCatalogNode, never> =>
        Result.succeed({
          id: v.projectId,
          name: v.projectId,
          isFolder: true,
          children: []
        })
    ),
    Result.bind(
      'mproveDir',
      async (v): Result.ResultAsync<string, GetMproveDirError> =>
        v.isRootMproveDir === true
          ? Result.succeed(v.repoDir)
          : getMproveDir({
              dir: v.repoDir,
              configPath: v.configPath
            })
    ),
    Result.bind(
      'nodesAndFilesPayload',
      (
        v
      ): Result.ResultAsync<
        NodesAndFilesPayload,
        DiskGetNodesAndFilesPayloadRecursiveError
      > =>
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
