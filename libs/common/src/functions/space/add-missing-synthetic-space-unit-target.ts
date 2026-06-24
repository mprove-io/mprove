import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import type { SpaceUnitTarget } from './make-space-unit-target';
import { makeSyntheticSpaceFolder } from './make-synthetic-space-folder';
import { sortSpaceNodes } from './sort-space-nodes';

export function addMissingSyntheticSpaceUnitTarget(item: {
  nodes: SpaceNode[];
  target: SpaceUnitTarget;
  spaceUnit: SpaceUnit;
}): SpaceNode[] {
  let { nodes, target, spaceUnit } = item;

  if (target.space === target.rootSpace) {
    return sortSpaceNodes({
      nodes: [
        makeSyntheticSpaceFolder({
          id: target.rootSpace,
          title: target.rootTitle,
          children: sortSpaceNodes({ nodes: [spaceUnit] })
        }),
        ...nodes
      ]
    });
  }

  let childNode = makeSyntheticSpaceFolder({
    id: target.space,
    title: target.childTitle ?? '',
    children: sortSpaceNodes({ nodes: [spaceUnit] })
  });

  let rootNode = nodes.find(
    node => node.type === 'spaceFolder' && node.space === target.rootSpace
  );
  let nextNodes = nodes.map(node => {
    if (node.type === 'spaceFolder' && node.space === target.rootSpace) {
      return {
        ...node,
        children: sortSpaceNodes({ nodes: [...node.children, childNode] })
      };
    }

    return node;
  });

  if (rootNode !== undefined) {
    return sortSpaceNodes({ nodes: nextNodes });
  }

  return sortSpaceNodes({
    nodes: [
      makeSyntheticSpaceFolder({
        id: target.rootSpace,
        title: target.rootTitle,
        children: [childNode]
      }),
      ...nodes
    ]
  });
}
