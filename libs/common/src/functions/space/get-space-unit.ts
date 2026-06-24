import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

export function getSpaceUnit(item: {
  spaceNodes: SpaceNode[];
  unitId: string;
}): SpaceUnit {
  let { spaceNodes, unitId } = item;

  let foundSpaceUnit: SpaceUnit;

  (spaceNodes ?? []).some(node => {
    if (node.type === 'spaceUnit') {
      foundSpaceUnit = node.unitId === unitId ? node : undefined;

      return foundSpaceUnit !== undefined;
    }

    foundSpaceUnit = getSpaceUnit({
      spaceNodes: node.children ?? [],
      unitId: unitId
    });

    return foundSpaceUnit !== undefined;
  });

  return foundSpaceUnit;
}
