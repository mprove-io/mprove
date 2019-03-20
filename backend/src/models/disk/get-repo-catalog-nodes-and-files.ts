import * as fse from 'fs-extra';
import { forEach } from 'p-iteration';
import { api } from '../../barrels/api';
import { config } from '../../barrels/config';
import { constants } from '../../barrels/constants';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { generator } from '../../barrels/generator';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { MyRegex } from '../my-regex';

export async function getRepoCatalogNodesAndFiles(item: {
  project_id: string;
  repo_id: string;
}) {
  let topNode: api.CatalogNode = {
    id: item.project_id,
    name: item.project_id,
    is_folder: true,
    children: []
  };

  let repoDir = `${config.DISK_BACKEND_PROJECTS_PATH}/${item.project_id}/${item.repo_id}`;

  let repoDirPathLength = repoDir.length;

  let itemDir = <interfaces.ItemCatalog>(
    await getDirCatalogNodesAndFilesRecursive({
      dir: repoDir,
      project_id: item.project_id,
      repo_id: item.repo_id,
      repo_dir_path_length: repoDirPathLength
    }).catch(e =>
      helper.reThrow(
        e,
        enums.diskErrorsEnum.DISK_GET_DIR_CATALOG_NODES_AND_FILES_RECURSIVE
      )
    )
  );

  topNode.children = itemDir.nodes;

  let nodes = [topNode];

  let files = itemDir.files;

  return { nodes: nodes, files: files };
}

async function getDirCatalogNodesAndFilesRecursive(item: {
  // private
  dir: string;
  project_id: string;
  repo_id: string;
  repo_dir_path_length: number;
}) {
  let files: entities.FileEntity[] = [];

  let nodes: api.CatalogNode[] = [];

  let folderNodes: api.CatalogNode[] = [];
  let mdNodes: api.CatalogNode[] = [];
  let dashboardNodes: api.CatalogNode[] = [];
  let modelNodes: api.CatalogNode[] = [];
  let viewNodes: api.CatalogNode[] = [];
  let udfNodes: api.CatalogNode[] = [];
  let otherNodes: api.CatalogNode[] = [];

  let fileNames: string[] = <string[]>(
    await fse
      .readdir(item.dir)
      .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_READ_DIR))
  );

  await forEach(fileNames, async name => {
    if (!name.match(MyRegex.STARTS_WITH_DOT())) {
      let filePath = item.dir + '/' + name;

      let nodeId =
        item.project_id + filePath.substring(item.repo_dir_path_length);

      let stat = <fse.Stats>(
        await fse
          .stat(filePath)
          .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_STAT))
      );

      if (stat.isDirectory()) {
        let itemDir = <interfaces.ItemCatalog>(
          await getDirCatalogNodesAndFilesRecursive({
            dir: filePath,
            project_id: item.project_id,
            repo_id: item.repo_id,
            repo_dir_path_length: item.repo_dir_path_length
          }).catch(e =>
            helper.reThrow(
              e,
              enums.diskErrorsEnum
                .DISK_GET_DIR_CATALOG_NODES_AND_FILES_RECURSIVE
            )
          )
        );

        // add dirNodes to children

        files = [...files, ...itemDir.files];

        let node = {
          id: nodeId,
          name: name,
          is_folder: true,
          children: itemDir.nodes
        };

        folderNodes.push(node);
      } else {
        let fileId = MyRegex.replaceSlashesWithUnderscores(
          filePath.substring(item.repo_dir_path_length + 1)
        );

        let node = {
          id: nodeId,
          name: name,
          is_folder: false,
          file_id: fileId
        };

        let reg = MyRegex.CAPTURE_EXT();
        let r = reg.exec(name.toLowerCase());

        let ext: any = r ? r[1] : '';

        switch (ext) {
          case constants.EXT_MD:
            mdNodes.push(node);
            break;
          case constants.EXT_DASHBOARD:
            dashboardNodes.push(node);
            break;
          case constants.EXT_MODEL:
            modelNodes.push(node);
            break;
          case constants.EXT_VIEW:
            viewNodes.push(node);
            break;
          case constants.EXT_UDF:
            udfNodes.push(node);
            break;
          default:
            otherNodes.push(node);
        }

        let path = JSON.stringify(nodeId.split('/'));

        let content = <string>(
          await fse
            .readFile(filePath, 'utf8')
            .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_READ_FILE))
        );

        let file = generator.makeFile({
          file_absolute_id: filePath,
          file_id: fileId,
          project_id: item.project_id,
          repo_id: item.repo_id,
          path: path,
          name: name,
          content: content
        });

        files.push(file);
      }
    }
  }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

  const sortNodes = (elements: api.CatalogNode[]) =>
    elements.sort((a, b) => {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });

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
