import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';

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

  let itemDir = <interfaces.ItemCatalog>(
    await getDirCatalogNodesAndFilesRecursive({
      dir: repoDir,
      projectId: item.projectId,
      repoId: item.repoId,
      repoDirPathLength: repoDirPathLength,
      readFiles: item.readFiles
    })
  );

  topNode.children = itemDir.nodes;

  let nodes = [topNode];

  let files = itemDir.files;

  return { nodes: nodes, files: files };
}

async function getDirCatalogNodesAndFilesRecursive(item: {
  // private
  dir: string;
  projectId: string;
  repoId: string;
  repoDirPathLength: number;
  readFiles: boolean;
}) {
  let files: common.DiskCatalogFile[] = [];

  let nodes: common.DiskCatalogNode[] = [];

  let folderNodes: common.DiskCatalogNode[] = [];
  let mdNodes: common.DiskCatalogNode[] = [];
  let dashboardNodes: common.DiskCatalogNode[] = [];
  let vizNodes: common.DiskCatalogNode[] = [];
  let modelNodes: common.DiskCatalogNode[] = [];
  let viewNodes: common.DiskCatalogNode[] = [];
  let udfNodes: common.DiskCatalogNode[] = [];
  let otherNodes: common.DiskCatalogNode[] = [];

  let fileNames: string[] = <string[]>await fse.readdir(item.dir);

  await forEachSeries(fileNames, async name => {
    if (!name.match(common.MyRegex.STARTS_WITH_DOT())) {
      let fileAbsolutePath = item.dir + '/' + name;

      let nodeId =
        item.projectId + fileAbsolutePath.substring(item.repoDirPathLength);

      let stat = <fse.Stats>await fse.stat(fileAbsolutePath);

      let statIsDirectory = stat.isDirectory();

      if (statIsDirectory === true) {
        let itemDir = <interfaces.ItemCatalog>(
          await getDirCatalogNodesAndFilesRecursive({
            dir: fileAbsolutePath,
            projectId: item.projectId,
            repoId: item.repoId,
            repoDirPathLength: item.repoDirPathLength,
            readFiles: item.readFiles
          })
        );

        // add dirNodes to children

        files = [...files, ...itemDir.files];

        let node = {
          id: nodeId,
          name: name,
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
          name: name,
          isFolder: false,
          fileId: fileId
        };

        let reg = common.MyRegex.CAPTURE_EXT();
        let r = reg.exec(name.toLowerCase());

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
          default:
            otherNodes.push(node);
        }

        if (item.readFiles === true) {
          let path = JSON.stringify(nodeId.split('/'));

          let content = <string>await fse.readFile(fileAbsolutePath, 'utf8');

          let file: common.DiskCatalogFile = {
            projectId: item.projectId,
            repoId: item.repoId,
            fileId: fileId,
            pathString: path,
            fileNodeId: nodeId,
            name: name,
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
