import type { SpaceUnit } from '#common/zod/backend/space-unit';

export function makeSpaceUnitWithSpace(item: {
  unit: SpaceUnit;
  space: string;
  displaySpace: string;
}): SpaceUnit {
  let { unit, space, displaySpace } = item;

  return {
    ...unit,
    space: space,
    displaySpace: displaySpace
  };
}
