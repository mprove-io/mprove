import * as fse from 'fs-extra';
import { Dirent } from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { MPROVE_CONFIG_FILENAME } from '~common/constants/top';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { DiskCatalogNode } from '~common/interfaces/disk/disk-catalog-node';
import { MyRegex } from '~common/models/my-regex';
import { ItemCatalog } from '~disk/interfaces/item-catalog';
import { getMproveDir } from '~node-common/functions/get-mprove-dir';
import { readFileCheckSize } from '~node-common/functions/read-file-check-size';

export async function getNodesAndFiles(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  readFiles: boolean;
  isRootMproveDir: boolean;
}) {
  let topNode: DiskCatalogNode = {
    id: item.projectId,
    name: item.projectId,
    isFolder: true,
    children: []
  };

  let repoDir = `${item.projectDir}/${item.repoId}`;

  let repoDirPathLength = repoDir.length;

  let configPath = repoDir + '/' + MPROVE_CONFIG_FILENAME;

  let mproveDir =
    item.isRootMproveDir === true
      ? repoDir
      : await getMproveDir({
          dir: repoDir,
          configPath: configPath
        });

  let itemDir = <ItemCatalog>await getDirCatalogNodesAndFilesRecursive({
    dir: repoDir,
    projectId: item.projectId,
    repoId: item.repoId,
    repoDirPathLength: repoDirPathLength,
    readFiles: item.readFiles,
    mproveDir: mproveDir,
    repoDir: repoDir
  });

  topNode.children = itemDir.nodes;

  let nodes = [topNode];

  let files = itemDir.files;

  return { nodes: nodes, files: files, mproveDir: mproveDir };
}

async function getDirCatalogNodesAndFilesRecursive(item: {
  dir: string;
  projectId: string;
  repoId: string;
  repoDirPathLength: number;
  readFiles: boolean;
  mproveDir: string;
  repoDir: string;
}) {
  let files: DiskCatalogFile[] = [];

  let nodes: DiskCatalogNode[] = [];

  let folderNodes: DiskCatalogNode[] = [];
  // let viewNodes: DiskCatalogNode[] = [];
  // let storeNodes: DiskCatalogNode[] = [];
  // let modelNodes: DiskCatalogNode[] = [];
  // let reportNodes: DiskCatalogNode[] = [];
  // let dashboardNodes: DiskCatalogNode[] = [];
  // let chartNodes: DiskCatalogNode[] = [];
  // let udfNodes: DiskCatalogNode[] = [];
  // let ymlNodes: DiskCatalogNode[] = [];
  // let mdNodes: DiskCatalogNode[] = [];
  let otherNodes: DiskCatalogNode[] = [];

  let dirents: Dirent[] = <Dirent[]>await fse.readdir(item.dir, {
    withFileTypes: true
  });

  await forEachSeries(dirents, async dirent => {
    if (!dirent.name.match(MyRegex.IGNORED_FILE_NAMES())) {
      let fileAbsolutePath = item.dir + '/' + dirent.name;

      let nodeId =
        item.projectId + fileAbsolutePath.substring(item.repoDirPathLength);

      if (dirent.isDirectory() === true) {
        let itemDir = <ItemCatalog>await getDirCatalogNodesAndFilesRecursive({
          dir: fileAbsolutePath,
          projectId: item.projectId,
          repoId: item.repoId,
          repoDirPathLength: item.repoDirPathLength,
          readFiles: item.readFiles,
          mproveDir: item.mproveDir,
          repoDir: item.repoDir
        });

        // add dirNodes to children

        files = [...files, ...itemDir.files];

        let node: DiskCatalogNode = {
          id: nodeId,
          name: dirent.name,
          isFolder: true,
          children: itemDir.nodes
        };

        folderNodes.push(node);
      } else {
        let fileRelativePath = fileAbsolutePath.substring(
          item.repoDirPathLength + 1
        );
        let fileId = encodeFilePath({ filePath: fileRelativePath });

        let node = {
          id: nodeId,
          name: dirent.name,
          isFolder: false,
          fileId: fileId
        };

        let reg = MyRegex.CAPTURE_EXT();
        let r = reg.exec(dirent.name.toLowerCase());

        let ext: any = r ? r[1] : '';

        switch (ext) {
          // case FileExtensionEnum.View:
          //   viewNodes.push(node);
          //   break;
          // case FileExtensionEnum.Store:
          //   storeNodes.push(node);
          //   break;
          // case FileExtensionEnum.Model:
          //   modelNodes.push(node);
          //   break;
          // case FileExtensionEnum.Report:
          //   reportNodes.push(node);
          //   break;
          // case FileExtensionEnum.Dashboard:
          //   dashboardNodes.push(node);
          //   break;
          // case FileExtensionEnum.Chart:
          //   chartNodes.push(node);
          //   break;
          // case FileExtensionEnum.Udf:
          //   udfNodes.push(node);
          //   break;
          // case FileExtensionEnum.Yml:
          //   ymlNodes.push(node);
          //   break;
          // case FileExtensionEnum.Md:
          //   mdNodes.push(node);
          //   break;
          default:
            otherNodes.push(node);
        }

        let mproveDirRelative =
          isDefined(item.mproveDir) && item.mproveDir !== item.repoDir
            ? item.mproveDir.substr(item.repoDir.length + 1)
            : undefined;

        let isPass =
          nodeId === `${item.projectId}/${MPROVE_CONFIG_FILENAME}`
            ? true
            : isDefined(item.mproveDir)
              ? item.mproveDir === item.repoDir
                ? true
                : nodeId.split(mproveDirRelative)[0] === `${item.projectId}/`
              : false;

        if (item.readFiles === true && isPass === true) {
          let path = JSON.stringify(nodeId.split('/'));

          let { content } = await readFileCheckSize({
            filePath: fileAbsolutePath,
            getStat: false
          });

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

  const sortNodes = (elements: DiskCatalogNode[]) =>
    elements.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

  nodes = [
    ...sortNodes(folderNodes),
    // ...sortNodes(viewNodes),
    // ...sortNodes(storeNodes),
    // ...sortNodes(modelNodes),
    // ...sortNodes(reportNodes),
    // ...sortNodes(dashboardNodes),
    // ...sortNodes(chartNodes),
    // ...sortNodes(udfNodes),
    // ...sortNodes(ymlNodes),
    // ...sortNodes(mdNodes),
    ...sortNodes(otherNodes)
  ];

  return { nodes: nodes, files: files };
}
