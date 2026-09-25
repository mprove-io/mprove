import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

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
