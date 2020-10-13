import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { api } from '../../barrels/api';
import { MyRegex } from '../my-regex';

export async function getRepoCatalogNodesAndFiles(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  readFiles: boolean;
}) {
  let topNode: api.CatalogNode = {
    id: item.projectId,
    name: item.projectId,
    isFolder: true,
    children: []
  };

  let repoDir = `${item.projectDir}/${item.repoId}`;

  let repoDirPathLength = repoDir.length;

  let itemDir = <api.ItemCatalog>await getDirCatalogNodesAndFilesRecursive({
    dir: repoDir,
    projectId: item.projectId,
    repoId: item.repoId,
    repoDirPathLength: repoDirPathLength,
    readFiles: item.readFiles
  });

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
  let files: api.CatalogItemFile[] = [];

  let nodes: api.CatalogNode[] = [];

  let folderNodes: api.CatalogNode[] = [];
  let mdNodes: api.CatalogNode[] = [];
  let dashboardNodes: api.CatalogNode[] = [];
  let modelNodes: api.CatalogNode[] = [];
  let viewNodes: api.CatalogNode[] = [];
  let udfNodes: api.CatalogNode[] = [];
  let otherNodes: api.CatalogNode[] = [];

  let fileNames: string[] = <string[]>await fse.readdir(item.dir);

  await forEachSeries(fileNames, async name => {
    if (!name.match(MyRegex.STARTS_WITH_DOT())) {
      let filePath = item.dir + '/' + name;

      let nodeId = item.projectId + filePath.substring(item.repoDirPathLength);

      let stat = <fse.Stats>await fse.stat(filePath);

      let statIsDirectory = stat.isDirectory();

      if (statIsDirectory === true) {
        let itemDir = <api.ItemCatalog>(
          await getDirCatalogNodesAndFilesRecursive({
            dir: filePath,
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
        let fileId = MyRegex.replaceSlashesWithUnderscores(
          filePath.substring(item.repoDirPathLength + 1)
        );

        let node = {
          id: nodeId,
          name: name,
          isFolder: false,
          fileId: fileId
        };

        let reg = MyRegex.CAPTURE_EXT();
        let r = reg.exec(name.toLowerCase());

        let ext: any = r ? r[1] : '';

        switch (ext) {
          case api.EXT_MD:
            mdNodes.push(node);
            break;
          case api.EXT_DASHBOARD:
            dashboardNodes.push(node);
            break;
          case api.EXT_MODEL:
            modelNodes.push(node);
            break;
          case api.EXT_VIEW:
            viewNodes.push(node);
            break;
          case api.EXT_UDF:
            udfNodes.push(node);
            break;
          default:
            otherNodes.push(node);
        }

        if (item.readFiles === true) {
          let path = JSON.stringify(nodeId.split('/'));

          let content = <string>await fse.readFile(filePath, 'utf8');

          let file: api.CatalogItemFile = {
            projectId: item.projectId,
            repoId: item.repoId,
            fileId: fileId,
            pathString: path,
            fileAbsoluteId: filePath,
            name: name,
            content: content
          };

          files.push(file);
        }
      }
    }
  });

  const sortNodes = (elements: api.CatalogNode[]) =>
    elements.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

  nodes = [
    ...sortNodes(folderNodes),
    ...sortNodes(mdNodes),
    ...sortNodes(dashboardNodes),
    ...sortNodes(modelNodes),
    ...sortNodes(viewNodes),
    ...sortNodes(udfNodes),
    ...sortNodes(otherNodes)
  ];

  return { nodes: nodes, files: files };
}
