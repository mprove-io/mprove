import { sortSpaceNodesRecursive as sortSpaceNodes } from '#backend/functions/space/sort-space-nodes-recursive/sort-space-nodes-recursive';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { SpaceFolder } from '#common/types/backend/parts/space-folder';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export function addModelLevelToChartSpaceNodesRecursive(item: {
  nodes: SpaceNode[];
}): SpaceNode[] {
  let { nodes } = item;

  let chartSpaceNodes: SpaceNode[] = nodes.map(node => {
    if (node.type === 'spaceUnit') {
      return node;
    }

    let children: SpaceNode[] = addModelLevelToChartSpaceNodesRecursive({
      nodes: node.children ?? []
    });

    let folderChildren: SpaceFolder[] = children.filter(
      child => child.type === 'spaceFolder'
    );

    let unitChildren: SpaceUnit[] = children.filter(
      child => child.type === 'spaceUnit'
    ) as SpaceUnit[];

    let modelFolders: SpaceFolder[] = [];

    unitChildren.forEach(chartUnit => {
      let modelId = chartUnit.modelId ?? '';
      let modelLabel = chartUnit.modelLabel ?? modelId;
      let modelFolderId = `${node.id}/model/${modelId}`;
      let modelFolder: SpaceFolder = modelFolders.find(
        folder => folder.id === modelFolderId
      );

      if (isUndefined(modelFolder)) {
        modelFolder = {
          type: 'spaceFolder',
          id: modelFolderId,
          space: `${node.space}/model/${modelId}`,
          filePath: '',
          title: modelLabel,
          accessRoles: [],
          accessRolesCombined: [],
          isSynthetic: true,
          modelId: modelId,
          modelLabel: modelLabel,
          children: []
        };

        modelFolders.push(modelFolder);
      }

      modelFolder.children.push(chartUnit);
    });

    return {
      ...node,
      children: sortSpaceNodes({
        nodes: [...folderChildren, ...modelFolders]
      })
    };
  });

  return chartSpaceNodes;
}
