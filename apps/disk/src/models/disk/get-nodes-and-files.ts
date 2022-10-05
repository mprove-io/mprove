import * as fse from 'fs-extra';
import { Dirent } from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { constants } from '~common/barrels/constants';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';
import { getMproveDirDisk } from '~disk/functions/get-mprove-dir-disk';

export async function getNodesAndFiles(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  readFiles: boolean;
}) {
  let topNode: common.DiskCatalogNode = {
    id: item.projectId,
    name: item.projectId,
    isFolder: true,
    children: []
  };

  let repoDir = `${item.projectDir}/${item.repoId}`;

  let repoDirPathLength = repoDir.length;

  let configPath = repoDir + '/' + common.MPROVE_CONFIG_FILENAME;

  let mproveDir = await getMproveDirDisk({
    dir: repoDir,
    configPath: configPath
  });

  let itemDir = <interfaces.ItemCatalog>(
    await getDirCatalogNodesAndFilesRecursive({
      dir: repoDir,
      projectId: item.projectId,
      repoId: item.repoId,
      repoDirPathLength: repoDirPathLength,
      readFiles: item.readFiles,
      mproveDir: mproveDir,
      repoDir: repoDir
    })
  );

  topNode.children = itemDir.nodes;

  let nodes = [topNode];

  let files = itemDir.files;

  return { nodes: nodes, files: files, mproveDir: mproveDir };
}

async function getDirCatalogNodesAndFilesRecursive(item: {
  // private
  dir: string;
  projectId: string;
  repoId: string;
  repoDirPathLength: number;
  readFiles: boolean;
  mproveDir: string;
  repoDir: string;
}) {
  let files: common.DiskCatalogFile[] = [];

  let nodes: common.DiskCatalogNode[] = [];

  let folderNodes: common.DiskCatalogNode[] = [];
  let ymlNodes: common.DiskCatalogNode[] = [];
  let mdNodes: common.DiskCatalogNode[] = [];
  let dashboardNodes: common.DiskCatalogNode[] = [];
  let vizNodes: common.DiskCatalogNode[] = [];
  let modelNodes: common.DiskCatalogNode[] = [];
  let viewNodes: common.DiskCatalogNode[] = [];
  let udfNodes: common.DiskCatalogNode[] = [];
  let otherNodes: common.DiskCatalogNode[] = [];

  let dirents: Dirent[] = <Dirent[]>await fse.readdir(item.dir, {
    withFileTypes: true
  });

  await forEachSeries(dirents, async dirent => {
    if (!dirent.name.match(common.MyRegex.IGNORED_FILE_NAMES())) {
      let fileAbsolutePath = item.dir + '/' + dirent.name;

      let nodeId =
        item.projectId + fileAbsolutePath.substring(item.repoDirPathLength);

      if (dirent.isDirectory() === true) {
        let itemDir = <interfaces.ItemCatalog>(
          await getDirCatalogNodesAndFilesRecursive({
            dir: fileAbsolutePath,
            projectId: item.projectId,
            repoId: item.repoId,
            repoDirPathLength: item.repoDirPathLength,
            readFiles: item.readFiles,
            mproveDir: item.mproveDir,
            repoDir: item.repoDir
          })
        );

        // add dirNodes to children

        files = [...files, ...itemDir.files];

        let node = {
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
        let fileId = common.MyRegex.replaceSlashesWithUnderscores(
          fileRelativePath
        );

        let node = {
          id: nodeId,
          name: dirent.name,
          isFolder: false,
          fileId: fileId
        };

        let reg = common.MyRegex.CAPTURE_EXT();
        let r = reg.exec(dirent.name.toLowerCase());

        let ext: any = r ? r[1] : '';

        switch (ext) {
          case common.FileExtensionEnum.View:
            viewNodes.push(node);
            break;
          case common.FileExtensionEnum.Model:
            modelNodes.push(node);
            break;
          case common.FileExtensionEnum.Dashboard:
            dashboardNodes.push(node);
            break;
          case common.FileExtensionEnum.Viz:
            vizNodes.push(node);
            break;
          case common.FileExtensionEnum.Udf:
            udfNodes.push(node);
            break;
          case common.FileExtensionEnum.Md:
            mdNodes.push(node);
            break;
          case common.FileExtensionEnum.Yml:
            ymlNodes.push(node);
            break;
          default:
            otherNodes.push(node);
        }

        let mproveDirRelative =
          common.isDefined(item.mproveDir) && item.mproveDir !== item.repoDir
            ? item.mproveDir.substr(item.repoDir.length + 1)
            : undefined;

        let isPass =
          nodeId === `${item.projectId}/${constants.MPROVE_CONFIG_FILENAME}`
            ? true
            : common.isDefined(item.mproveDir)
            ? item.mproveDir === item.repoDir
              ? true
              : nodeId.split(mproveDirRelative)[0] === `${item.projectId}/`
            : false;

        if (item.readFiles === true && isPass === true) {
          let path = JSON.stringify(nodeId.split('/'));

          let content = await disk.readFile(fileAbsolutePath);

          let file: common.DiskCatalogFile = {
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

  const sortNodes = (elements: common.DiskCatalogNode[]) =>
    elements.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

  nodes = [
    ...sortNodes(folderNodes),
    ...sortNodes(ymlNodes),
    ...sortNodes(mdNodes),
    ...sortNodes(dashboardNodes),
    ...sortNodes(vizNodes),
    ...sortNodes(modelNodes),
    ...sortNodes(viewNodes),
    ...sortNodes(udfNodes),
    ...sortNodes(otherNodes)
  ];

  return { nodes: nodes, files: files };
}
