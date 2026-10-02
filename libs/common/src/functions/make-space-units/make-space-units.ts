import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export function makeSpaceUnits(item: { spaceNodes: SpaceNode[] }): SpaceUnit[] {
  let { spaceNodes } = item;

  return (spaceNodes ?? []).reduce((acc: SpaceUnit[], node) => {
    if (node.type === 'spaceUnit') {
      acc.push(node);

      return acc;
    }

    acc.push(...makeSpaceUnits({ spaceNodes: node.children ?? [] }));

    return acc;
  }, []);
}
