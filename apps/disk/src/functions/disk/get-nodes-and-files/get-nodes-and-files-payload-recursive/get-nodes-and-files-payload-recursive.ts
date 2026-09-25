import { Result } from '@praha/byethrow';
import fse, { type Dirent } from 'fs-extra';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { DiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import type { DiskGetNodesAndFilesPayloadRecursiveError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-payload-recursive-error';
import type { FileIsSymlinkError } from '#common/zod/node-common/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/node-common/errors/file-size-is-too-big-error';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size/read-file-check-size';

export type NodesAndFilesPayload = {
  nodes: DiskCatalogNode[];
  files: DiskCatalogFile[];
};

export function getNodesAndFilesPayloadRecursive(item: {
  dir: string;
  projectId: string;
  repoId: string;
  repoDirPathLength: number;
  readFiles: boolean;
  mproveDir?: string;
  repoDir: string;
}): Result.ResultAsync<
  NodesAndFilesPayload,
  DiskGetNodesAndFilesPayloadRecursiveError
> {
  return Result.try({
    try: async (): Promise<NodesAndFilesPayload> => {
      let files: DiskCatalogFile[] = [];

      let nodes: DiskCatalogNode[] = [];

      let folderNodes: DiskCatalogNode[] = [];
      let otherNodes: DiskCatalogNode[] = [];

      let dirents: Dirent[] = <Dirent[]>await fse.readdir(item.dir, {
        withFileTypes: true
      });

      await forEachSeries(dirents, async dirent => {
        if (dirent.isSymbolicLink() === true) {
          return;
        }

        if (!dirent.name.match(MyRegex.IGNORED_FILE_NAMES())) {
          let fileAbsolutePath: string = item.dir + '/' + dirent.name;

          let nodeId: string =
            item.projectId + fileAbsolutePath.substring(item.repoDirPathLength);

          if (dirent.isDirectory() === true) {
            let itemDir: NodesAndFilesPayload = await Result.unwrap(
              getNodesAndFilesPayloadRecursive({
                dir: fileAbsolutePath,
                projectId: item.projectId,
                repoId: item.repoId,
                repoDirPathLength: item.repoDirPathLength,
                readFiles: item.readFiles,
                mproveDir: item.mproveDir,
                repoDir: item.repoDir
              })
            );

            files = [...files, ...itemDir.files];

            let node: DiskCatalogNode = {
              id: nodeId,
              name: dirent.name,
              isFolder: true,
              children: itemDir.nodes
            };

            folderNodes.push(node);
          } else {
            let fileRelativePath: string = fileAbsolutePath.substring(
              item.repoDirPathLength + 1
            );
            let fileId: string = encodeFilePath({ filePath: fileRelativePath });

            let node: DiskCatalogNode = {
              id: nodeId,
              name: dirent.name,
              isFolder: false,
              fileId: fileId
            };

            let reg: RegExp = MyRegex.CAPTURE_EXT();
            let r: RegExpExecArray | null = reg.exec(dirent.name.toLowerCase());

            let ext: any = r ? r[1] : '';

            switch (ext) {
              default:
                otherNodes.push(node);
            }

            let mproveDirRelative =
              isDefined(item.mproveDir) && item.mproveDir !== item.repoDir
                ? item.mproveDir.substr(item.repoDir.length + 1)
                : undefined;

            let isPass: boolean =
              nodeId === `${item.projectId}/${MPROVE_CONFIG_FILENAME}`
                ? true
                : isDefined(item.mproveDir)
                  ? item.mproveDir === item.repoDir
                    ? true
                    : nodeId.startsWith(
                        `${item.projectId}/${mproveDirRelative}/`
                      )
                  : false;

            if (item.readFiles === true && isPass === true) {
              let path: string = JSON.stringify(nodeId.split('/'));

              let { content } = await Result.unwrap(
                readFileCheckSize({
                  filePath: fileAbsolutePath,
                  getStat: false
                })
              );

              let file: DiskCatalogFile = {
                projectId: item.projectId,
                repoId: item.repoId,
                fileId: fileId,
                pathString: path,
                fileNodeId: nodeId,
                name: dirent.name,
                content: content
              };

              files.push(file);
            }
          }
        }
      });

      const sortNodes = (elements: DiskCatalogNode[]): DiskCatalogNode[] =>
        elements.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

      nodes = [...sortNodes(folderNodes), ...sortNodes(otherNodes)];

      let nodesAndFilesPayload: NodesAndFilesPayload = {
        nodes: nodes,
        files: files
      };

      return nodesAndFilesPayload;
    },
    catch: (error: unknown): FileIsSymlinkError | FileSizeIsTooBigError => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error.code === 'FILE_IS_SYMLINK' ||
          error.code === 'FILE_SIZE_IS_TOO_BIG')
      ) {
        return error as FileIsSymlinkError | FileSizeIsTooBigError;
      }

      throw error;
    }
  });
}
