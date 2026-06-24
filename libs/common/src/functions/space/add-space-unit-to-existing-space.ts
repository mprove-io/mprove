import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import { sortSpaceNodes } from './sort-space-nodes';

export function addSpaceUnitToExistingSpace(item: {
  nodes: SpaceNode[];
  space: string;
  spaceUnit: SpaceUnit;
}): SpaceNode[] {
  let { nodes, space, spaceUnit } = item;

  return nodes.map(node => {
    if (node.type === 'spaceUnit') {
      return node;
    }

    if (node.space === space) {
      return {
        ...node,
        children: sortSpaceNodes({ nodes: [...node.children, spaceUnit] })
      };
    }

    return {
      ...node,
      children: addSpaceUnitToExistingSpace({
        nodes: node.children,
        space: space,
        spaceUnit: spaceUnit
      })
    };
  });
}
