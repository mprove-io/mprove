import type { SpaceNode } from '#common/zod/backend/space-node';

export function sortSpaceNodes(item: { nodes: SpaceNode[] }): SpaceNode[] {
  let { nodes } = item;

  return nodes
    .map(node => {
      if (node.type === 'spaceFolder') {
        return {
          ...node,
          children: sortSpaceNodes({ nodes: node.children ?? [] })
        };
      }

      return node;
    })
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'spaceFolder' ? -1 : 1;
      }

      let aTitle = a.title.toLowerCase();
      let bTitle = b.title.toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });
}
