import type { SpaceNode } from '#common/zod/backend/space-node';

export function addDisplaySpace(item: {
  spaceNodes: SpaceNode[];
  pathParts: string[];
}): SpaceNode[] {
  let { spaceNodes, pathParts } = item;

  return (spaceNodes ?? []).map(node => {
    if (node.type === 'spaceUnit') {
      return {
        ...node,
        displaySpace: pathParts.join(' - ')
      };
    }

    return {
      ...node,
      children: addDisplaySpace({
        spaceNodes: node.children ?? [],
        pathParts: [...pathParts, node.title]
      })
    };
  });
}
